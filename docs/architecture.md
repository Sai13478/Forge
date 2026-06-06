# Forge Architecture

## High Level Architecture

User
↓
Forge CLI
↓
Intent Processor
↓
Memory Layer
↓
Project Scanner
↓
Local LLM
↓
Response

## Components

### CLI Layer

Responsibilities:

* Accept commands
* Display results

Examples:

forge register
forge scan
forge ask

### Project Scanner

Responsibilities:

* Read folder structure
* Detect technologies
* Identify modules
* Extract metadata

### Memory Layer

Responsibilities:

* Store project information
* Store summaries
* Store relationships

Storage:

SQLite

### LLM Layer

Responsibilities:

* Summarize code
* Answer project questions
* Explain architecture

Provider:

Ollama

Model:

Qwen3 8B

## Data Flow

Register Project
↓
Scan Project
↓
Store Metadata
↓
Build Memory
↓
Answer Questions

## MVP Scope

Included:

* Project registration
* Project scanning
* Memory storage
* Question answering

Excluded:

* Voice
* Vision
* Web UI
* Mobile App
* Cloud Sync
