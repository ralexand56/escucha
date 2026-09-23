# Escucha MVP delivery

The project is implemented in the workspace root as an npm monorepo:

- `apps/mobile` — Expo Router mobile app with the five-step lesson flow
- `apps/api` — secure Node API for lesson generation, TTS, transcription, and evaluation
- `README.md` — setup, architecture, API surface, and production-hardening notes
- `.env.example` — environment variable template

## Verification

- Backend unit tests: passing (2/2)
- Backend JavaScript syntax checks: passing
- Secret scan: no embedded API key
- Mobile dependency installation and device launch remain to be run in a network-enabled environment

## Start

```sh
npm install
cp .env.example .env
# Add OPENAI_API_KEY to .env
npm run api
# In another terminal
npm run mobile
```
