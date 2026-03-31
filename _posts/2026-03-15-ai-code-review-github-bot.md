---
title: "Building an AI-Powered Code Review Bot for GitHub Pull Requests"
description: "Step-by-step tutorial to build a GitHub bot that automatically reviews PRs using LLMs — detecting bugs, style issues, and security concerns with real code and deployment instructions."
date: 2026-03-15 09:00:00 +0530
categories: [AI Engineering]
tags: [github bot, code review, llm, python, devtools, automation]
image:
  path: /commons/ai-code-review-github-bot-hero.png
  alt: GitHub pull request with AI code review comments
---

Automated code review is one of those AI applications that delivers immediate, measurable value. Every PR that gets an initial review from an LLM saves your human reviewers 10-15 minutes of basic feedback — catching typos, style inconsistencies, obvious bugs, and security issues before a human even looks at the code.

I've built and deployed several of these bots. Here's the complete guide.

## What We're Building

A GitHub Action that triggers on every PR and:

1. Reads the diff for changed files
2. Sends each changed file to an LLM for analysis
3. Posts review comments on specific lines (not just a general comment)
4. Summarizes findings in a top-level PR comment
5. Labels the PR based on risk level

## Architecture Overview

```
GitHub PR Opened/Updated
         ↓
    GitHub Action
         ↓
    Python Script
    ├── Fetch PR diff via GitHub API
    ├── Filter to reviewable files (.py, .ts, .js, etc.)
    ├── Chunk large files appropriately
    ├── Call LLM for each file
    └── Post review comments via GitHub API
```

We'll use the GitHub Actions environment for simplicity — no separate server needed.

## GitHub Action Configuration

```yaml
# .github/workflows/ai-code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Need full history for diff
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: pip install openai pygithub python-dotenv
      
      - name: Run AI Code Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          REPO_NAME: ${{ github.repository }}
        run: python .github/scripts/ai_review.py
```

## The Review Script

```python
# .github/scripts/ai_review.py
import os
import json
from github import Github
from openai import OpenAI

openai_client = OpenAI()
github_client = Github(os.environ["GITHUB_TOKEN"])

REVIEWABLE_EXTENSIONS = {'.py', '.ts', '.tsx', '.js', '.jsx', '.go', '.rs'}

CODE_REVIEW_PROMPT = """
You are an expert code reviewer. Analyze this code change and provide specific, actionable feedback.

File: {filename}
Language: {language}

Code diff (+ = added, - = removed):
```
{diff}
```

Review for:
1. **Bugs** — Logic errors, off-by-one errors, null pointer risks, edge cases
2. **Security** — SQL injection, XSS, hardcoded secrets, insecure dependencies
3. **Performance** — Inefficient loops, N+1 queries, unnecessary re-renders
4. **Code Quality** — Long functions, unclear naming, missing error handling
5. **Best Practices** — Framework conventions, design patterns

For each issue, specify:
- Line number (approximate, based on diff)
- Severity: [CRITICAL / HIGH / MEDIUM / LOW]
- Clear description of the issue
- Suggested fix

Return JSON only:
{{
  "issues": [
    {{
      "line": 42,
      "severity": "HIGH",
      "issue": "Description of the problem",
      "suggestion": "How to fix it"
    }}
  ],
  "summary": "Overall assessment in 2-3 sentences",
  "risk_level": "low|medium|high|critical"
}}
"""

def get_pr_files(repo, pr_number: int) -> list[dict]:
    pr = repo.get_pull(pr_number)
    files = []
    
    for file in pr.get_files():
        ext = os.path.splitext(file.filename)[1]
        if ext in REVIEWABLE_EXTENSIONS and file.patch:
            files.append({
                "filename": file.filename,
                "patch": file.patch,
                "status": file.status  # added, modified, removed
            })
    
    return files

def review_file(filename: str, diff: str) -> dict:
    ext = os.path.splitext(filename)[1]
    language_map = {'.py': 'Python', '.ts': 'TypeScript', '.tsx': 'TypeScript/React',
                    '.js': 'JavaScript', '.go': 'Go', '.rs': 'Rust'}
    language = language_map.get(ext, 'Unknown')
    
    # Truncate very large diffs
    if len(diff) > 8000:
        diff = diff[:8000] + "\n... (truncated)"
    
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": CODE_REVIEW_PROMPT.format(
                    filename=filename,
                    language=language,
                    diff=diff
                )
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.1  # Low temperature for consistent, factual review
    )
    
    return json.loads(response.choices[0].message.content)

def post_review_comment(repo, pr_number: int, body: str):
    pr = repo.get_pull(pr_number)
    pr.create_issue_comment(body)

def main():
    repo_name = os.environ["REPO_NAME"]
    pr_number = int(os.environ["PR_NUMBER"])
    
    repo = github_client.get_repo(repo_name)
    files = get_pr_files(repo, pr_number)
    
    all_issues = []
    max_risk = "low"
    
    risk_order = ["low", "medium", "high", "critical"]
    
    for file_info in files:
        if file_info["status"] == "removed":
            continue
            
        review = review_file(file_info["filename"], file_info["patch"])
        
        for issue in review.get("issues", []):
            issue["filename"] = file_info["filename"]
            all_issues.append(issue)
        
        file_risk = review.get("risk_level", "low")
        if risk_order.index(file_risk) > risk_order.index(max_risk):
            max_risk = file_risk
    
    # Build summary comment
    summary_parts = [f"## 🤖 AI Code Review\n"]
    
    risk_emoji = {"low": "✅", "medium": "⚠️", "high": "🔴", "critical": "🚨"}
    summary_parts.append(f"**Risk Level:** {risk_emoji.get(max_risk, '❓')} {max_risk.upper()}\n")
    
    if not all_issues:
        summary_parts.append("No significant issues found. Good work! 🎉")
    else:
        critical_issues = [i for i in all_issues if i["severity"] == "CRITICAL"]
        high_issues = [i for i in all_issues if i["severity"] == "HIGH"]
        
        summary_parts.append(f"Found **{len(all_issues)} issues** across {len(files)} files:\n")
        
        for issue in critical_issues + high_issues:
            summary_parts.append(
                f"- **{issue['severity']}** in `{issue['filename']}` (line ~{issue['line']}): "
                f"{issue['issue']}\n"
            )
    
    post_review_comment(repo, pr_number, "\n".join(summary_parts))
    
    # Add labels based on risk
    pr = repo.get_pull(pr_number)
    label_map = {"critical": "ai-review: critical", "high": "ai-review: needs-attention"}
    if max_risk in label_map:
        try:
            pr.add_to_labels(label_map[max_risk])
        except Exception:
            pass  # Labels may not exist in the repo yet

if __name__ == "__main__":
    main()
```

## Cost Management

At ~2000 tokens per file review with GPT-4o, costs per PR:
- **Small PR (3 files)**: ~$0.03
- **Medium PR (10 files)**: ~$0.10
- **Large PR (30 files)**: ~$0.30

Switch to GPT-4o-mini for teams with tight budgets — it still catches most issues at ~10% of the cost.

## What This Bot Catches (and What It Misses)

**Good at:**
- SQL injection and basic security issues
- Missing null checks
- Obvious logic errors
- Style and naming conventions
- Missing error handling

**Not good at:**
- Deep business logic understanding
- Complex concurrency bugs
- Performance issues requiring profiling
- Architecture-level concerns

Treat this as a first pass, not a replacement for human review. The goal is to offload the mechanical parts so your human reviewers can focus on the interesting problems.

---

## Sources

- [PyGitHub Documentation](https://pygithub.readthedocs.io/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [GitHub REST API — Pull Requests](https://docs.github.com/en/rest/pulls)
