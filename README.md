# AI Chatbot

A full-stack AI chatbot with persistent multi-session history.

## Live Demo

- Live App: https://ai-chatbot-js.onrender.com

## Why I Built This

I built this project to demonstrate cross-language versatility and production-style web engineering: REST APIs, persistent storage, client/server integration, and deployment-ready app structure.

## Features

- Multi-session chat with create/rename/delete flows
- Persistent history using local JSON storage
- Express backend API + browser frontend
- Demo-mode assistant optimized for reliable public showcase usage
- Unit tests with Node's built-in test runner

## Tech Stack

- JavaScript (Node.js + browser)
- Express
- File-based JSON persistence

## Local Setup

```bash
cd ai-chatbot-js
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env` (optional):

```bash
PORT=3000
CHAT_DB_PATH=chat.json
```

## Run Tests

```bash
npm test
```

## Publish For Showcase (Render)

This repo includes `render.yaml` for quick deployment.

1. Go to https://render.com and sign in with GitHub.
2. Click `New` -> `Blueprint`.
3. Select this repository: `miles-price/ai-chatbot`.
4. Confirm service name `ai-chatbot-js` and deploy.
5. Open the generated Render URL.

## Security Notes

- Never commit `.env` or API keys.
- Use demo credentials/data in public deployments.
- This is a portfolio project and not a production customer-support system.
