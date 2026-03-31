---
title: "Deploying LLM Applications with Docker and FastAPI: A Production Guide"
description: "End-to-end guide to containerizing and deploying LLM applications — Dockerfile optimization, environment management, health checks, and scaling strategies for AI services."
date: 2026-03-13 09:00:00 +0530
categories: [AI Engineering]
tags: [docker, fastapi, deployment, mlops, containerization, production ai]
image:
  path: /commons/deploying-llm-apps-docker-fastapi-hero.png
  alt: Docker containers running FastAPI LLM application in production
---

Getting an LLM application to work locally is the easy part. Deploying it reliably — with proper containerization, environment management, health checks, and scaling — is where most AI projects struggle. After deploying half a dozen LLM applications in production, I've built a template that I return to every time.

Here's the full guide.

## The Baseline Architecture

Before anything else, understand what you're deploying:

```
[Load Balancer / Nginx]
        ↓
[FastAPI App (Docker Container)]
    ├── LLM API calls (OpenAI/Anthropic)
    ├── Vector DB connection (Qdrant/Pinecone)
    └── Database connection (Postgres)
[Redis] ← Rate limiting, caching
[Postgres] ← State, conversation history
```

Each component runs in a separate container, orchestrated with Docker Compose (local/staging) or Kubernetes (production at scale).

## Project Structure

```
my-llm-app/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application
│   ├── routers/         # Route handlers
│   ├── services/        # Business logic (LLM calls)
│   ├── models/          # Pydantic models
│   └── config.py        # Settings from environment
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── requirements.txt
└── .env.example
```

## Writing a Production Dockerfile

The Dockerfile is where most AI applications get sloppy. Here's a properly optimized multi-stage build:

```dockerfile
# Stage 1: Build dependencies
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements separately for layer caching
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production image
FROM python:3.11-slim as production

WORKDIR /app

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy installed packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY app/ ./app/

# Set ownership
RUN chown -R appuser:appuser /app
USER appuser

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/home/appuser/.local/bin:$PATH

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health', timeout=5)"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

Key decisions:
- **Multi-stage build** — keeps final image small (no build tools in production)
- **Non-root user** — security best practice
- **Layer caching** — requirements.txt before application code so code changes don't reinstall packages
- **Health check** — enables orchestrators to route around unhealthy instances

## FastAPI Application Structure

```python
# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize connections
    logger.info("Starting up...")
    await initialize_vector_db()
    await initialize_redis()
    yield
    # Shutdown: close connections gracefully
    logger.info("Shutting down...")
    await close_connections()

app = FastAPI(
    title="LLM API",
    lifespan=lifespan,
    docs_url="/docs" if settings.env != "production" else None  # Hide docs in prod
)

# Health check endpoint — critical for load balancers
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.version,
        "model": settings.llm_model
    }
```

## Docker Compose for Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: production
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./app:/app/app  # Hot reload in development

  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

volumes:
  postgres_data:
```

## Environment Management

Never hardcode secrets. Use a proper config management approach:

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # LLM Configuration
    openai_api_key: str
    anthropic_api_key: str = ""
    llm_model: str = "gpt-4o"
    fallback_model: str = "gpt-4o-mini"
    
    # Database
    database_url: str
    redis_url: str
    
    # Application
    env: str = "development"
    version: str = "1.0.0"
    max_requests_per_minute: int = 20
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## Scaling Strategies

For higher traffic:

- **Horizontal scaling** — run multiple app containers behind a load balancer
- **Async workers** — FastAPI with uvicorn workers handles concurrent LLM calls well
- **Request queuing** — add Celery + Redis for async job processing
- **Response caching** — cache identical queries in Redis with a TTL

For cost optimization under load:

```python
# Model routing based on query complexity
async def route_to_model(query: str) -> str:
    if estimate_complexity(query) == "simple":
        return settings.fallback_model  # Cheaper model
    return settings.llm_model  # Frontier model
```

## Monitoring in Production

Essential metrics to track:

- **API latency** (p50, p95, p99)
- **LLM call success rate**
- **Token usage per request** (cost proxy)
- **Queue depth** if using async workers
- **Error rates by endpoint**

Prometheus + Grafana is the standard stack. Add the `prometheus-fastapi-instrumentator` package for automatic FastAPI metrics.

The deployment story for AI applications has matured significantly. These patterns work at scale — I've run this configuration under thousands of requests per day without issues.

---

## Sources

- [FastAPI Production Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Pydantic Settings Management](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [prometheus-fastapi-instrumentator](https://github.com/trallnag/prometheus-fastapi-instrumentator)
