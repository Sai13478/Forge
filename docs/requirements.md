# Forge Requirements

## Vision

Forge is a personal developer assistant that understands registered projects and helps answer questions about codebases, architecture, modules, APIs, and infrastructure.

## Goals

1. Register projects.
2. Scan project structure.
3. Build project memory.
4. Answer questions about projects.
5. Work locally with minimal cost.

## MVP Features

### Project Registration

Commands:

forge register <name> <path>

Example:

forge register hrms E:\Projects\HRMS

### Project Listing

Commands:

forge list

### Project Scanning

Forge should:

* Detect tech stack
* Detect important folders
* Detect modules
* Detect APIs
* Detect database schemas

### Project Memory

Forge should store:

* Project name
* Project path
* Modules
* Important files
* Summaries

### Question Answering

Examples:

* Where is JWT implemented?
* Which module handles leave approval?
* What database tables are used for payroll?

## Non Functional Requirements

* Must work offline
* Must support Windows initially
* Must use local LLMs
* Must run on 16GB RAM systems
* Must not require paid AI subscriptions

## Future Features

* Voice interface
* AWS integration
* Git automation
* Deployment automation
* Multi-project knowledge graph
