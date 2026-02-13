# Epic SOAP Scribe (React Native / Expo)

Mobile app that captures doctor-patient conversations, converts them into a transcript, drafts a SOAP note, and sends a clinician-reviewed note into Epic via FHIR `DocumentReference`.

## What this app does

- Records encounter audio on device.
- Sends audio to a configurable transcription API.
- Sends transcript to a configurable SOAP generation API.
- Lets clinician edit Subjective / Objective / Assessment / Plan before submission.
- Builds Epic-compatible FHIR payload and posts to your Epic FHIR endpoint.
- Stores Epic integration settings in secure local storage (`expo-secure-store`).

## Architecture

- `App.tsx`: end-to-end clinical workflow UI.
- `src/services/transcriptionService.ts`: speech-to-text API integration.
- `src/services/soapService.ts`: SOAP generation API integration + fallback note draft.
- `src/services/epicService.ts`: FHIR payload builder + Epic POST call.
- `src/services/storageService.ts`: secure persistence for Epic settings.
- `src/types/clinical.ts`: domain types.

## Quick start

```bash
npm install
npm run start
```

For type safety checks:

```bash
npm run typecheck
```

## Environment configuration

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

### Variables

- `EXPO_PUBLIC_TRANSCRIPTION_API_URL`: endpoint that accepts multipart audio and returns transcript.
- `EXPO_PUBLIC_TRANSCRIPTION_API_KEY`: optional bearer token for transcription API.
- `EXPO_PUBLIC_SOAP_API_URL`: endpoint that accepts transcript and returns SOAP sections.
- `EXPO_PUBLIC_SOAP_API_KEY`: optional bearer token for SOAP API.

If API variables are omitted, the app uses fallback sample transcript/SOAP note so you can still demo the flow.

## Epic integration notes

- Use OAuth2 to obtain a valid Epic access token and paste token into app.
- Base URL should point to your Epic FHIR root (example: `https://.../FHIR/R4`).
- App posts to `{baseUrl}/DocumentReference`.
- The payload includes both:
  - clinician-reviewed SOAP note
  - transcript text

## Important compliance/security guidance

- Do not ship this app to production without a HIPAA-compliant backend and BAA coverage for all vendors.
- Avoid sending PHI directly from mobile client to third-party AI providers in production.
- Recommended production model:
  1. Mobile app -> your secure backend
  2. Backend handles transcription/LLM calls, PHI controls, audit logs, redaction, and policy checks
  3. Backend performs Epic write with managed credentials

## Next production steps

- Add authenticated user sessions and role-based access control.
- Add patient consent and explicit recording controls.
- Add encounter-level audit logging and tamper-proof event history.
- Add confidence scoring and mandatory clinician attestation before signing.
- Add retry queue and offline-safe synchronization.
