---
title: "LangGraph Tutorial: Building Stateful AI Agents with Conditional Logic"
description: "A practical guide to LangGraph — how to build stateful, multi-step AI agents with branching logic, human-in-the-loop, and error recovery in Python."
date: 2026-03-11 09:00:00 +0530
categories: [AI Engineering]
tags: [langgraph, ai agents, langchain, stateful agents, python, agentic workflow]
image:
  path: /commons/langgraph-stateful-agents-tutorial-hero.png
  alt: LangGraph state machine diagram showing agent workflow with conditional nodes
---

If you've tried building AI agents with simple LangChain chains, you've probably hit a wall: chains are great for linear workflows, but real agents need to loop, branch, recover from errors, and maintain state across multiple steps. This is exactly what LangGraph was built to solve.

LangGraph lets you express agent workflows as graphs — nodes are processing steps, edges define the flow between them, and a shared state object holds data across the entire execution. It's become my go-to tool for any agent more complex than a single LLM call.

## Why LangGraph Instead of Simple Chains?

Simple LangChain chains work well for:
- Linear pipelines (input → LLM → output)
- Simple RAG (retrieve → generate)

But they break down when you need:
- **Loops** — an agent that keeps trying until success
- **Conditional routing** — different paths based on intermediate results
- **Error recovery** — retry logic, fallback strategies
- **Human-in-the-loop** — pause for human approval before continuing
- **Parallel execution** — multiple nodes running simultaneously

LangGraph handles all of these elegantly.

## Core Concepts

Before building, understand three concepts:

1. **State** — a TypedDict that flows through all nodes, accumulating data
2. **Nodes** — Python functions that take state as input and return state updates
3. **Edges** — connections between nodes (can be conditional)

```python
from typing import TypedDict, Annotated, List
from langgraph.graph import StateGraph, END
import operator

# Define your shared state
class AgentState(TypedDict):
    messages: Annotated[List[str], operator.add]  # Accumulates messages
    task: str
    result: str
    error: str | None
    attempts: int
```

The `Annotated[List[str], operator.add]` syntax tells LangGraph how to merge state updates — in this case, by concatenating lists rather than replacing them.

## Building a Research Agent

Let's build a practical example: a research agent that searches for information, evaluates quality, and retries if the results are insufficient.

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Node 1: Search for information
def search_node(state: AgentState) -> dict:
    task = state["task"]
    # Simulate search (replace with real search tool)
    search_result = perform_web_search(task)
    return {
        "messages": [f"Search completed: {len(search_result)} chars"],
        "result": search_result,
        "attempts": state.get("attempts", 0) + 1
    }

# Node 2: Evaluate result quality
def evaluate_node(state: AgentState) -> dict:
    result = state["result"]
    task = state["task"]
    
    evaluation = llm.invoke([
        SystemMessage(content="Evaluate if the research result adequately answers the task. Respond ONLY with 'SUFFICIENT' or 'INSUFFICIENT'."),
        HumanMessage(content=f"Task: {task}\n\nResult: {result}")
    ])
    
    quality = evaluation.content.strip()
    return {"messages": [f"Evaluation: {quality}"]}

# Node 3: Synthesize final answer
def synthesize_node(state: AgentState) -> dict:
    result = llm.invoke([
        SystemMessage(content="Synthesize the research into a clear, concise answer."),
        HumanMessage(content=f"Task: {state['task']}\n\nResearch: {state['result']}")
    ])
    return {"result": result.content}

# Conditional routing logic
def should_retry(state: AgentState) -> str:
    messages = state.get("messages", [])
    last_eval = next((m for m in reversed(messages) if "Evaluation:" in m), "")
    
    if "INSUFFICIENT" in last_eval and state.get("attempts", 0) < 3:
        return "retry"
    return "synthesize"

# Build the graph
workflow = StateGraph(AgentState)

workflow.add_node("search", search_node)
workflow.add_node("evaluate", evaluate_node)
workflow.add_node("synthesize", synthesize_node)

workflow.set_entry_point("search")
workflow.add_edge("search", "evaluate")

# Conditional edge — route based on evaluation
workflow.add_conditional_edges(
    "evaluate",
    should_retry,
    {
        "retry": "search",     # Loop back for retry
        "synthesize": "synthesize"  # Proceed to final answer
    }
)
workflow.add_edge("synthesize", END)

# Compile and run
app = workflow.compile()
result = app.invoke({"task": "What are the latest developments in quantum computing?"})
```

## Adding Human-in-the-Loop

One of LangGraph's most powerful features is the ability to pause execution and wait for human input. This is essential for high-stakes actions:

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt

# Node that requires human approval
def approval_node(state: AgentState) -> dict:
    proposed_action = state.get("proposed_action", "")
    
    # This pauses execution and waits for human input
    human_response = interrupt({
        "message": f"Proposed action: {proposed_action}. Approve? (yes/no)",
        "proposed_action": proposed_action
    })
    
    if human_response.lower() == "yes":
        return {"messages": ["Action approved by human"]}
    else:
        return {"messages": ["Action rejected by human"], "error": "Human rejected action"}

# Use MemorySaver to persist state across interrupts
checkpointer = MemorySaver()
app = workflow.compile(checkpointer=checkpointer, interrupt_before=["approval"])
```

With a checkpointer, LangGraph saves the full state when it hits an interrupt. You can resume execution later after getting human approval — even if hours have passed.

## Parallel Execution

For tasks that can run concurrently, add parallel branches:

```python
# Fan out to multiple parallel nodes
workflow.add_edge("start", ["research_node_1", "research_node_2", "research_node_3"])
# LangGraph waits for all three to complete before proceeding
workflow.add_edge(["research_node_1", "research_node_2", "research_node_3"], "synthesis_node")
```

This is dramatically faster for independent subtasks.

## Debugging with LangSmith

LangGraph integrates natively with LangSmith, giving you full trace visualization for every graph execution — which nodes ran, what state looked like at each step, and where errors occurred. Essential for debugging complex workflows.

LangGraph has become the default orchestration framework for serious agent work. Once you've used it, going back to linear chains feels limiting. Start with a simple two-node graph and build from there.

---

## Sources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Tutorials](https://langchain-ai.github.io/langgraph/tutorials/)
- [Human-in-the-Loop Guide](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/)
- [LangSmith Integration](https://smith.langchain.com/)
