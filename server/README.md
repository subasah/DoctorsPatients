# API server (transcribe → SOAP → FHIR)

This is a minimal Express API intended to be called by the Expo mobile app in `../mobile`.

## Setup

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Set `OPENAI_API_KEY` in `server/.env` to enable transcription + SOAP generation.

## Endpoints

- `GET /health`
- `POST /api/transcribe` (multipart form-data)
  - field: `audio` (file)
  - returns: `{ transcript: string }`
- `POST /api/soap` (JSON)
  - body: `{ transcript: string, context?: { clinicianName?, patientName?, visitReason? } }`
  - returns: `{ soap: { subjective, objective, assessment, plan, ... } }`
- `POST /api/fhir/composition` (JSON)
  - body: `{ soap, patient?, encounter?, author?, title? }`
  - returns: `{ composition }`

## Epic (SMART on FHIR) integration note

In production, the **mobile app should not** directly hold client secrets or write to Epic.
Use this server to handle SMART on FHIR OAuth, obtain an access token, and then write the
FHIR `Composition` (and/or `DocumentReference`) to the Epic FHIR endpoint.

