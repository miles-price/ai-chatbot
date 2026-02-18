# AI Chatbot (JavaScript)

A full-stack JavaScript AI chatbot with persistent multi-session history.

## Why I Built This

I built this project to demonstrate cross-language versatility and production-style web engineering: REST APIs, persistent storage, client/server integration, configurable model settings, and deployment-ready app structure.

## Features

- Multi-session chat with create/rename/delete flows
- Persistent history using SQLite (`better-sqlite3`)
- Express backend API + browser frontend
- Two providers:
  - `demo` mode (works without external API keys)
  - `openai` mode (real LLM responses with `OPENAI_API_KEY`)
- Adjustable generation settings (`model`, `temperature`, `max tokens`)
- Unit tests with Node's built-in test runner

## Tech Stack

- JavaScript (Node.js + browser)
- Express
- SQLite (`better-sqlite3`)
- OpenAI SDK

## Local Setup

```bash
cd ai-chatbot-js
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env` (optional for OpenAI mode):

```bash
OPENAI_API_KEY=your_api_key_here
PORT=3000
CHAT_DB_PATH=chat.db
```

## Run Tests

```bash
npm test
```

## Deploy Options

- Render / Railway / Fly.io for the Node app
- Or Dockerize and deploy anywhere that supports Node

## Security Notes

- Never commit `.env` or API keys.
- Use demo credentials/data in public deployments.
- This is a portfolio project and not a production customer-support system.
