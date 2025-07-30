# Seednote

An asynchronous AI note-taking app that helps your ideas grow.

Just drop a project idea, and your local LLM will recommend 3 different technology stack combinations.

## Features

- Automatically recommends 3 different technology stack combinations for your project ideas

- Runs entirely on your local machine (Ollama-based LLM)

- Uses Supabase for state management and data storage

## Requirements

- Node.js

- Rust + Cargo

- A Supabase project

- Ollama installed with a model downloaded

## Folder Structure

```bash
apps/
  web/     # React (Vite) frontend
  worker/    # Rust-based background LLM processor
supabase/
  schema.sql   # Database schema definition
```

## Setup

```bash
# 1. Supabase
# Create the table via Supabase console or run schema.sql manually

# 2. Frontend
cd apps/web
cp .env.example .env       # Set environment variables
npm install
npm run dev

# 3. Worker
cd apps/worker
cp .env.example .env       # Set environment variables
cargo run

# 4. Start LLM
ollama run <model>

```

## License

MIT
