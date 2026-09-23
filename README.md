# Escucha

An Expo MVP for training Spanish listening and shadowing. The five-step lesson flow is implemented in the mobile app; OpenAI calls happen only in the companion server.

## Architecture

```text
apps/mobile  ->  POST /v1/lessons, POST /v1/evaluations
                   |
apps/api     ->  OpenAI Responses, Speech, and Transcriptions APIs
                   |
                local generated-audio cache (MVP)
```

The mobile bundle receives lesson data and audio URLs but never receives `OPENAI_API_KEY`. For production, add authentication, rate limits, persistent object storage, and a database before exposing the API publicly.

## Run locally

1. Install packages: `npm install`
2. Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.
3. Start the API: `npm run api`
4. In another terminal, start Expo: `npm run mobile`

For a physical phone, set `EXPO_PUBLIC_API_URL` to `http://YOUR_COMPUTER_LAN_IP:8787` before starting Expo. Microphone permission is requested only when the learner taps Record.

## MVP API

- `GET /health` — server status
- `POST /v1/lessons` — generate a short lesson and sentence-level Spanish audio
- `GET /audio/:file` — serve cached lesson audio
- `POST /v1/evaluations` — transcribe a recording and compare it with the target sentence

The evaluation score is a learning aid, not a clinical pronunciation assessment.
