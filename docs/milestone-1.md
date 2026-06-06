# Milestone 1: Forge CLI Overview & Architecture

Forge is a lightweight, local-first repository intelligence CLI that scans, analyzes, and indexes software projects to provide instant structural knowledge retrieval and summaries—all without needing AI, LLMs, vectors, or Ollama.

---

## 1. What Forge Can Do
- **Project Registry**: Track and register local software projects and normalize their filesystem paths.
- **codebase Scanning**: Traverse files recursively to compute file counts, identify folder structures, and perform initial technology matching while respecting standard ignore lists (e.g. `node_modules`, `.git`, `dist`).
- **Dependency Profiling**: Parse dependencies inside nested package configurations (`frontend/package.json` and `backend/package.json`) to determine project tech stack details.
- **Module Discovery**: Detect software modules by scanning folder patterns (like `src/modules`, `src/features`, `src/routes`, `src/controllers`) to map module names, files list, and relative paths.
- **Route Extraction**: Extract HTTP router methods and endpoints (`POST /login`, `GET /profile`, etc.) from module files using regex-based code parsing.
- **Database Model Discovery**: Scan Prisma schemas (`schema.prisma`) to extract all database models (e.g. `User`, `Employee`).
- **Deterministic Knowledge Querying**: Answer structural questions (e.g. location of modules, list of APIs inside a module, which table stores an entity, stack components, or module lists) without AI.
- **Project Summarization**: Generate a unified report covering stack elements, modules list, active routes, and database tables.

---

## 2. Current Architecture

Forge is built on a simple, modular Node.js/TypeScript architecture:

```
c:/Users/LENOVO/Forge/
├── data/
│   ├── analysis/       # Cached stack profiling JSONs
│   └── discovery/      # Cached project structure/models/routes indexes
├── docs/               # System documentation
├── src/
│   ├── cli/
│   │   └── index.ts    # CLI Entry point (defines shebang and Commander commands)
│   ├── commands/       # CLI Action handlers mapping commands to business logic
│   │   ├── ask.ts
│   │   ├── analyze.ts
│   │   ├── discover.ts
│   │   ├── inspect.ts
│   │   ├── list.ts
│   │   ├── register.ts
│   │   ├── scan.ts
│   │   └── summary.ts
│   └── storage/
│       └── index.ts    # Registry I/O for projects database
├── package.json        # Binary link definition and npm scripts
├── projects.json       # Project path database registry
└── tsconfig.json       # TypeScript compiler setup
```

---

## 3. Current Commands

All commands can be executed globally via the compiled binary link `forge <command>` (or in development mode via `npm run dev -- <command>`):

| Command | Arguments | Description |
|---|---|---|
| `forge register` | `<name> <path>` | Registers a project name and maps it to a normalized path. |
| `forge list` | None | Lists all registered projects in the database. |
| `forge scan` | `<name>` | Recursively counts files and runs a basic file scan. |
| `forge analyze` | `<name>` | Analyzes `package.json` files to generate a technology profile. |
| `forge discover` | `<name>` | Discovers modules, extracts active API routes, and parses Prisma models. |
| `forge ask` | `<name> "<question>"` | Performs a matching search to locate paths, list routes, list modules, or return database tables. |
| `forge inspect` | `<name> <module>` | Details files list, path, and purpose of a single module. |
| `forge summary` | `<name>` | Outputs a clean aggregated project report (Stack, Modules, APIs, Database Models). |

---

## 4. Current Storage Format

Forge uses localized JSON files for data persistence and index caching:

### A. Registry database (`projects.json` at root)
Maps registered project names to their absolute filesystem path:
```json
[
  {
    "name": "hrms",
    "path": "C:/Users/LENOVO/forge/hrms"
  }
]
```

### B. Stack Profile (`data/analysis/<project-name>.json`)
Caches the mapped stack components detected during dependency profiling:
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

### C. Discovery Index (`data/discovery/<project-name>.json`)
Caches structural components, module paths, API routes, and database tables:
```json
{
  "modules": [
    {
      "name": "auth",
      "path": "backend/src/modules/auth",
      "routes": [
        "GET /profile",
        "POST /login",
        "POST /logout"
      ]
    },
    {
      "name": "leave",
      "path": "backend/src/modules/leave",
      "routes": []
    }
  ],
  "models": [
    "Employee",
    "LeaveRequest",
    "Payroll",
    "User"
  ]
}
```
