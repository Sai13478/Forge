# Forge 🔥

Forge is a lightweight developer intelligence tool that analyzes software projects, extracts structured knowledge, and allows developers to query project information without manually searching through codebases.

## Vision

Forge aims to become a personal developer assistant that understands project structure, technologies, modules, APIs, and database models before introducing AI-powered reasoning.

Unlike traditional AI assistants that rely solely on prompts, Forge first builds a knowledge layer from the codebase and then uses that knowledge to answer questions accurately.

---

## Features (v0.1)

### Project Registration

Register projects for analysis.

```bash
forge register hrms E:\Projects\HRMS
```

### List Registered Projects

```bash
forge list
```

### Project Scanning

Analyze project structure and discover top-level folders.

```bash
forge scan hrms
```

### Technology Detection

Detect technologies used within the project.

```bash
forge analyze hrms
```

Example output:

```json
{
  "project": "hrms",
  "frontend": "React",
  "backend": "Express",
  "language": "TypeScript",
  "orm": "Prisma",
  "bundler": "Vite"
}
```

### Module Discovery

Identify project modules.

```bash
forge discover hrms
```

Example output:

```json
{
  "modules": [
    "auth",
    "employees",
    "leave",
    "payroll"
  ]
}
```

### Knowledge Retrieval

Query project information.

```bash
forge ask hrms "Where is auth?"
```

Output:

```text
Auth Module

Path:
backend/src/modules/auth
```

### API Discovery

```bash
forge ask hrms "What auth APIs exist?"
```

Output:

```text
Auth APIs

- GET /profile
- POST /login
- POST /logout
```

### Database Model Discovery

```bash
forge ask hrms "Which table stores employees?"
```

Output:

```text
Employee Table
```

### Project Summary

Generate a complete project overview.

```bash
forge summary hrms
```

Example output:

```text
Project: HRMS

Stack:
- React
- Express
- TypeScript
- Prisma
- Vite

Modules:
- Auth
- Employees
- Leave
- Payroll

Auth APIs:
- GET /profile
- POST /login
- POST /logout

Database Models:
- Employee
- LeaveRequest
- Payroll
- User
```

---

## Architecture

```text
Project
   ↓
Scanner
   ↓
Knowledge Extraction
   ↓
Structured Metadata
   ↓
Query Engine
   ↓
Developer
```

Forge follows a Knowledge-First architecture:

1. Extract facts from the project.
2. Store structured knowledge.
3. Answer questions using project knowledge.
4. Introduce AI only after sufficient context exists.

---

## Current Capabilities

* Project registration
* Project scanning
* Technology detection
* Module discovery
* API discovery
* Database model discovery
* Knowledge retrieval
* Project summarization

---

## Planned Features

### v0.2

* Ollama integration
* Local LLM support
* Context-aware explanations
* Module inspection

### v0.3

* Dependency graph generation
* Route-to-controller mapping
* Service relationship discovery
* Architecture visualization

### v1.0

* Multi-project knowledge graph
* AI-assisted codebase exploration
* Infrastructure awareness
* Developer workflow automation

---

## Tech Stack

* Node.js
* TypeScript
* Commander.js
* JSON-based storage (v0.1)

Future:

* Ollama
* SQLite
* Tree-sitter
* Knowledge Graph Engine

---

## Example Workflow

```bash
forge register hrms E:\Projects\HRMS

forge scan hrms

forge analyze hrms

forge discover hrms

forge summary hrms

forge ask hrms "Where is auth?"
```

---

## Project Status

Current Version: **v0.1**

Status: **Knowledge Extraction Engine Complete**
