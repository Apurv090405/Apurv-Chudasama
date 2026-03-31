---
title: "LLM Evaluation: How to Measure What Actually Matters"
description: "A practical framework for evaluating LLM applications beyond vibes — covering metrics, automated evals, LLM-as-judge, and building eval pipelines that scale."
date: 2026-03-05 09:00:00 +0530
categories: [AI Engineering]
tags: [llm evaluation, ai metrics, llm testing, braintrust, evals, ai quality]
image:
  path: /commons/llm-evaluation-framework-hero.png
  alt: Dashboard showing LLM evaluation metrics and quality scores
---

Every AI engineer has been there. You've built something that *feels* good. The demo impresses stakeholders. Your test prompts return excellent responses. You ship it. And then, two weeks into production, users are screaming because the model is doing something baffling that none of your manual testing caught.

The culprit, almost always, is the absence of systematic LLM evaluation. Not testing — *evaluation*. There's a crucial difference.

## Why LLM Evaluation Is Uniquely Hard

Software testing in traditional applications is binary: a function either returns the right value or it doesn't. LLM output is probabilistic, open-ended, and context-dependent. There's no clean pass/fail for "is this a good response?"

This creates real problems:

- **You can't test all inputs** — the input space is infinite
- **Quality is multidimensional** — correctness, tone, safety, format adherence, helpfulness are separate axes
- **Regressions are subtle** — a prompt change that improves average quality might tank quality for edge cases
- **Ground truth is expensive** — human labeling is slow and costly

Good LLM evaluation acknowledges these constraints and builds practical systems that approximate quality at scale.

## The Evaluation Hierarchy

Think of LLM evaluation in three tiers:

### Tier 1: Deterministic Tests

The fastest and cheapest evaluations. Check for things that should always be true:

- Does the response contain valid JSON when JSON is required?
- Is the response length within acceptable bounds?
- Does the response include required fields or keywords?
- Did the model refuse a clearly harmful request?

These run in milliseconds and catch obvious failures. Every LLM application should have a suite of these.

```python
def test_response_is_valid_json(response: str) -> bool:
    try:
        json.loads(response)
        return True
    except json.JSONDecodeError:
        return False

def test_response_length(response: str, min_words: int, max_words: int) -> bool:
    word_count = len(response.split())
    return min_words <= word_count <= max_words
```

### Tier 2: Model-Based Evaluation (LLM-as-Judge)

For subjective quality — helpfulness, accuracy, tone — you need a different approach. **LLM-as-judge** uses a powerful model (typically GPT-4o) to evaluate the outputs of your production model.

```python
def evaluate_with_llm(question: str, response: str) -> dict:
    judge_prompt = f"""
    Evaluate this AI response on a scale of 1-5 for each criterion.
    
    User Question: {question}
    AI Response: {response}
    
    Criteria:
    - Accuracy (1-5): Is the information correct?
    - Helpfulness (1-5): Does it actually help the user?
    - Conciseness (1-5): Is it appropriately concise?
    
    Return JSON only: {{"accuracy": X, "helpfulness": X, "conciseness": X, "reasoning": "..."}}
    """
    # Call your judge LLM here
```

LLM-as-judge has real limitations — it can be biased toward verbose answers, prefer its own style, and miss domain-specific errors. But it scales infinitely and catches quality issues that deterministic tests miss.

### Tier 3: Human Evaluation

The gold standard and the most expensive. Use human evaluation strategically:

- **Calibration** — periodically compare human scores to your automated evals to ensure they correlate
- **Edge case review** — manually inspect low-scoring outputs to understand failure modes
- **Preference data** — A/B test responses to gather relative quality judgments

Even a small amount of human evaluation (100–200 examples per month) dramatically improves the reliability of your automated evaluation systems.

## Building an Eval Pipeline

A production eval pipeline looks like this:

1. **Golden dataset** — curate 50–500 input/expected-output pairs covering your key use cases and edge cases
2. **Automated test runner** — run every build against your golden dataset
3. **Metric dashboards** — track scores over time, not just point-in-time
4. **Regression alerts** — alert when metrics drop below threshold
5. **Continuous additions** — add new cases when failures are discovered in production

### Tooling Options

- **PromptFoo** — open-source, YAML-based eval runner, excellent for rapid iteration
- **Braintrust** — cloud platform with experiment tracking, scoring, and dataset management
- **Langfuse** — open-source LLM observability with eval scoring support
- **Ragas** — specialized for RAG evaluation (faithfulness, answer relevancy, context precision)

## RAG-Specific Metrics

If you're building RAG applications, you need additional metrics beyond response quality:

- **Faithfulness** — does the response stick to the retrieved context? (catches hallucinations)
- **Answer Relevancy** — does the answer address the actual question?
- **Context Recall** — were the right documents retrieved?
- **Context Precision** — what fraction of retrieved documents were actually useful?

The Ragas library automates all four of these metrics.

## The Eval Mindset

The most important shift isn't technical — it's philosophical. Treat your LLM application like a product with quantifiable quality metrics, not a demo that "generally works."

Concretely, this means:

- Define your success metrics before writing your first prompt
- Build your eval dataset before you build your feature
- Never ship prompt changes without running evals
- Treat eval scores the same way you'd treat application error rates

Teams that build this discipline early ship dramatically better AI products. Teams that skip it spend months chasing mysterious quality regressions.

---

## Sources

- [PromptFoo Documentation](https://promptfoo.dev/docs/intro)
- [Ragas RAG Evaluation](https://docs.ragas.io/en/stable/)
- [Braintrust Eval Platform](https://braintrust.dev/docs)
- [Langfuse Evaluation](https://langfuse.com/docs/scores/overview)
- [OpenAI Evals Framework](https://github.com/openai/evals)
