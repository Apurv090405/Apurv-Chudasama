---
title: "The AI Engineer's Guide to Token Economics: Optimize Costs Without Sacrificing Quality"
description: "Learn how to manage LLM token costs at scale — model routing, prompt caching, semantic caching, batching, and practical strategies to cut AI API bills by 60-80%."
date: 2026-03-16 09:00:00 +0530
categories: [AI Engineering]
tags: [token optimization, llm cost, prompt caching, model routing, ai cost reduction]
image:
  path: /commons/llm-token-economics-cost-optimization-hero.png
  alt: Dashboard showing LLM API cost reduction through optimization techniques
---

The most common complaint from AI teams that have shipped to production: "we didn't realize how expensive this would be." At scale, naive LLM usage can cost thousands of dollars per month on API calls that could have been reduced by 70% with basic optimization. 

Token economics is a real engineering discipline, and understanding it separates engineers who build hobby projects from engineers who build sustainable products.

## Understanding the Cost Structure

Before optimizing, you need to understand how you're being charged. Most LLM APIs charge for:

- **Input tokens** — every token sent to the model (prompt + context + history)
- **Output tokens** — every token the model generates (usually 2-4× more expensive than input)
- **Cached tokens** — a discounted rate for tokens that match a previously cached prefix

For reference, approximate prices for major models in 2026:

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|---|---|---|
| GPT-4o | $2.50 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Claude 3 Haiku | $0.25 | $1.25 |
| Gemini 1.5 Flash | $0.075 | $0.30 |

The price spread between frontier models and smaller models is 10-40×. This means **model routing** is your single biggest cost lever.

## Optimization 1: Model Routing

Don't use GPT-4o when GPT-4o-mini will do. Route queries to the appropriate model based on task complexity:

```python
from enum import Enum
from anthropic import Anthropic

class ComplexityTier(Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"

def estimate_complexity(query: str, context: dict) -> ComplexityTier:
    """Route queries to appropriate model tier."""
    query_lower = query.lower()
    
    # Simple: classification, extraction, yes/no questions
    simple_indicators = [
        len(query.split()) < 15,
        any(kw in query_lower for kw in ["classify", "extract", "summarize briefly", "yes or no"]),
        context.get("task_type") in ["classification", "extraction"]
    ]
    
    # Complex: code generation, multi-step reasoning, analysis
    complex_indicators = [
        len(query.split()) > 100,
        any(kw in query_lower for kw in ["code", "implement", "analyze", "compare", "explain in detail"]),
        context.get("requires_code", False)
    ]
    
    if sum(complex_indicators) >= 2:
        return ComplexityTier.COMPLEX
    elif sum(simple_indicators) >= 2:
        return ComplexityTier.SIMPLE
    return ComplexityTier.MEDIUM

MODEL_MAP = {
    ComplexityTier.SIMPLE: "gpt-4o-mini",
    ComplexityTier.MEDIUM: "gpt-4o-mini",
    ComplexityTier.COMPLEX: "gpt-4o"
}

def routed_completion(query: str, context: dict = {}) -> str:
    tier = estimate_complexity(query, context)
    model = MODEL_MAP[tier]
    # Make your API call with the selected model
    return call_llm(query, model=model)
```

On typical production workloads, 60-80% of queries can be handled by cheaper models — often without users noticing any quality difference.

## Optimization 2: Prompt Caching

Both OpenAI and Anthropic offer prompt caching — a discount for reusing the same prefix in subsequent requests. This is particularly powerful when you have a large system prompt or context that doesn't change between requests.

```python
import anthropic

client = anthropic.Anthropic()

# Large system prompt — cache this
LARGE_SYSTEM_PROMPT = """
You are an AI assistant for Acme Corp. Here is our complete product documentation:

[... thousands of tokens of product docs ...]
"""

def cached_query(user_message: str) -> str:
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": LARGE_SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"}  # Cache this prefix
            }
        ],
        messages=[{"role": "user", "content": user_message}]
    )
    
    # Check cache performance
    usage = response.usage
    cache_hit = usage.cache_read_input_tokens > 0
    print(f"Cache {'HIT' if cache_hit else 'MISS'}: {usage.cache_read_input_tokens} cached tokens")
    
    return response.content[0].text
```

With caching, the first request pays full price, but subsequent requests with the same prefix pay 90% less for those input tokens. For applications with large, stable system prompts (RAG context, company documentation), this can cut input token costs by 80%.

## Optimization 3: Semantic Response Caching

Cache responses to semantically similar queries — not just exact matches:

```python
import redis
import numpy as np
from openai import OpenAI

client = OpenAI()
redis_client = redis.Redis(host='localhost', port=6379)

def get_embedding(text: str) -> list[float]:
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"  # Cheap: $0.02/1M tokens
    )
    return response.data[0].embedding

def semantic_cache_lookup(query: str, threshold: float = 0.95) -> str | None:
    """Return cached response if a similar query was asked before."""
    query_embedding = get_embedding(query)
    
    # Check recent cached queries
    cached_keys = redis_client.keys("query:*")
    
    for key in cached_keys:
        cached_data = json.loads(redis_client.get(key))
        cached_embedding = cached_data["embedding"]
        
        similarity = np.dot(query_embedding, cached_embedding) / (
            np.linalg.norm(query_embedding) * np.linalg.norm(cached_embedding)
        )
        
        if similarity >= threshold:
            return cached_data["response"]
    
    return None

def semantic_cached_query(query: str) -> str:
    # Check cache first
    cached = semantic_cache_lookup(query)
    if cached:
        return cached
    
    # Generate and cache new response
    response = generate_llm_response(query)
    
    query_embedding = get_embedding(query)
    cache_key = f"query:{hash(query)}"
    redis_client.setex(
        cache_key,
        86400,  # 24 hour TTL
        json.dumps({"embedding": query_embedding, "response": response})
    )
    
    return response
```

For applications with repetitive queries (support bots, FAQ systems), semantic caching can reduce LLM calls by 30-50%.

## Optimization 4: Output Length Control

Output tokens are expensive. Be explicit about length:

```python
# Bad: open-ended output
"Explain machine learning"

# Good: length-constrained
"Explain machine learning in 3 sentences maximum. Be concise."

# Better: structured and bounded
"""
Explain machine learning. Respond in this JSON format:
{"definition": "one sentence", "example": "one sentence", "use_case": "one sentence"}
"""
```

Adding explicit length constraints to your prompts consistently reduces output tokens by 30-60% without quality loss for most use cases.

## Optimization 5: Batching Requests

For non-real-time workloads, use the batch API:

```python
from openai import OpenAI
import jsonl

client = OpenAI()

# Prepare batch request
requests = [
    {"custom_id": f"req-{i}", "method": "POST", "url": "/v1/chat/completions",
     "body": {"model": "gpt-4o-mini", "messages": [{"role": "user", "content": query}]}}
    for i, query in enumerate(queries)
]

# Create batch file and submit
batch_file = client.files.create(
    file=format_as_jsonl(requests),
    purpose="batch"
)

batch = client.batches.create(
    input_file_id=batch_file.id,
    endpoint="/v1/chat/completions",
    completion_window="24h"  # Async — 50% cheaper than synchronous
)
```

The OpenAI Batch API is 50% cheaper than synchronous calls. For any workload that doesn't need real-time responses (data processing, content generation, offline analysis), batching is essentially free money.

## Building a Cost Dashboard

Track your actual costs with usage metadata:

```python
def tracked_completion(query: str, model: str, **kwargs) -> dict:
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": query}],
        **kwargs
    )
    
    # Log token usage for cost tracking
    usage = response.usage
    cost = calculate_cost(model, usage.prompt_tokens, usage.completion_tokens)
    
    logger.info(f"model={model} prompt_tokens={usage.prompt_tokens} "
                f"completion_tokens={usage.completion_tokens} cost_usd={cost:.6f}")
    
    return {"response": response.choices[0].message.content, "cost": cost}
```

Feed this data into Grafana or your observability stack. Knowing your actual cost per query is the foundation of all other optimization work.

---

## Sources

- [OpenAI Pricing Page](https://openai.com/pricing)
- [Anthropic Prompt Caching Docs](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [OpenAI Batch API](https://platform.openai.com/docs/guides/batch)
- [Gemini Pricing](https://ai.google.dev/pricing)
