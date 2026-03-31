---
title: "How I Built a Production AI Assistant in 48 Hours: Architecture Deep-Dive"
description: "A detailed walkthrough of building a production-ready AI assistant with FastAPI, LangChain, Postgres, and streaming — from zero to deployed in a weekend."
date: 2026-03-07 09:00:00 +0530
categories: [AI Engineering]
tags: [ai assistant, fastapi, langchain, production ai, llm architecture, python]
image:
  path: /commons/production-ai-assistant-architecture-hero.png
  alt: Architecture diagram of a production AI assistant system
---

Last weekend I set myself a challenge: build a production-ready AI assistant from scratch and deploy it in 48 hours. Not a toy demo — something with proper error handling, streaming responses, conversation history, and a real architecture that could scale.

Here's exactly what I built, why I made each architectural decision, and what I'd do differently.

## The Requirements

Before writing a line of code, I defined what "production-ready" meant:

- Streaming responses (no waiting for complete responses)
- Conversation history persistence
- Source citations for factual claims (RAG)
- Rate limiting per user
- Proper error handling and fallbacks
- Observability (logging, tracing)
- Deployable with a single command

This ruled out the "glue some LangChain code together" approach. I needed real architecture.

## The Technology Stack

After considering options, I settled on:

- **FastAPI** — async Python backend, excellent streaming support
- **LangChain** — orchestration layer, well-tested patterns
- **PostgreSQL + pgvector** — conversation history + vector search in one database
- **Redis** — rate limiting and response caching
- **Claude 3.5 Sonnet** — primary reasoning model (Haiku as fallback)
- **LangSmith** — tracing and observability
- **Docker + Railway** — deployment

The key constraint was using PostgreSQL for both relational data (users, conversations) and vector search (document retrieval). One database, not three.

## The Core Architecture

```
Client → FastAPI → LangChain Chain → Claude API
                        ↕
              PostgreSQL (history + vectors)
                        ↕
                      Redis (cache + rate limit)
                        ↕
                    LangSmith (tracing)
```

Simple on paper. The complexity lives in the implementation details.

## Building the Conversation Memory

The most important component was conversation memory. LLMs are stateless — they don't remember previous turns. You have to inject that context manually.

```python
from langchain_postgres import PostgresChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# Store conversation history in Postgres
def get_session_history(session_id: str):
    return PostgresChatMessageHistory(
        connection_string=DATABASE_URL,
        session_id=session_id,
        table_name="chat_history"
    )

# Wrap chain with history management
chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history"
)
```

This gives every conversation a persistent history stored in Postgres — no Redis dependency for state, and history survives server restarts.

## Implementing Streaming

Streaming is non-negotiable for good UX. A 3-second delay before any response feels broken. Streaming lets users see tokens appear immediately.

```python
from fastapi.responses import StreamingResponse

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    async def generate():
        async for chunk in chain_with_history.astream(
            {"input": request.message},
            config={"configurable": {"session_id": request.session_id}}
        ):
            if chunk:
                yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no"}
    )
```

Server-sent events (SSE) is the simplest approach for streaming. WebSockets offer more flexibility but add complexity you usually don't need.

## The RAG Layer

For factual queries, I added a simple RAG pipeline using pgvector:

```python
from langchain_postgres.vectorstores import PGVector

vectorstore = PGVector(
    connection=DATABASE_URL,
    embeddings=OpenAIEmbeddings(),
    collection_name="documents"
)

retriever = vectorstore.as_retriever(
    search_type="mmr",  # Maximum Marginal Relevance for diversity
    search_kwargs={"k": 5, "fetch_k": 20}
)
```

MMR retrieval is important — pure similarity search often returns near-duplicate chunks. MMR balances relevance with diversity for better coverage.

## Rate Limiting

Rate limiting protects you from both abuse and runaway costs:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/chat/stream")
@limiter.limit("20/minute")
async def chat_stream(request: Request, chat_request: ChatRequest):
    ...
```

I set limits at three levels: per-minute (burst protection), per-hour (sustained usage), and per-day (cost ceiling).

## What Took the Most Time

Honest breakdown of where 48 hours actually went:

- **Setting up pgvector and migrations**: 4 hours (the Postgres setup is fiddly)
- **Getting streaming to work correctly**: 3 hours (buffering issues, SSE edge cases)
- **Error handling and fallbacks**: 4 hours (what happens when Claude API is down?)
- **Testing and debugging**: 8 hours (always more than expected)
- **Deployment and environment variables**: 3 hours (Docker, Railway, secrets)

The actual "AI" code — the LangChain chain, the prompts — took maybe 4 hours. The infrastructure and reliability work took most of the time. This is always the pattern.

## What I'd Do Differently

- **Start with Qdrant instead of pgvector** — pgvector was convenient but slower than I needed
- **Add an evaluation harness from day one** — I'm now retrofitting evals
- **Better prompt versioning** — prompts changed frequently and I lost track of what worked

The assistant has been running in production for two weeks now. Uptime is solid, costs are predictable, and the architecture has held up well under real usage. 

Build the boring parts right. The AI part almost takes care of itself.

---

## Sources

- [FastAPI Streaming Guide](https://fastapi.tiangolo.com/advanced/server-sent-events/)
- [LangChain Postgres Memory](https://python.langchain.com/docs/integrations/memory/postgres_chat_message_history/)
- [pgvector + LangChain](https://python.langchain.com/docs/integrations/vectorstores/pgvector/)
- [SlowAPI Rate Limiting](https://slowapi.readthedocs.io/)
- [Railway Deployment](https://railway.app/docs)
