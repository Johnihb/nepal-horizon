# Project Context

> **Read `AGENTS.md` first.** It carries the build commands, the backend rules that will break your build, the frontend route map and the design contract. This file is only about the knowledge graph.

This project has a pre-built knowledge graph. **Always use it before reading source files.**

## Graphify Knowledge Graph

- **Location:** `graphify-out/graph.json`
- **Stats:** 138 nodes, 184 edges, 11 communities
- **Built:** 2026-08-29 (AST extraction, no API cost)
- **Vault:** `graphify-out/obsidian/` (149 Obsidian notes)

## Workflow Rule

**Before answering ANY codebase question:**

1. Check if `graphify-out/graph.json` exists
2. Use `/graphify query "<question>"` or `/graphify explain "<node>"` first
3. Only read source files if the graph answer is incomplete

**Why:** The graph is 5-10x faster and contains structural dependencies already extracted.

## Quick Commands

```bash
# Query the graph
/graphify query "how does deleteImage work?"

# Explain a node
/graphify explain "deleteImage"

# Find path between two nodes
/graphify path "AuthModule" "Database"

# Re-build graph after changes
/graphify update .
```

## When NOT to use graphify

- Writing new code (regular implementation)
- Debugging runtime errors (need live stack traces)
- Running tests or builds