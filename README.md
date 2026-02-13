# Clinical Conversation Notes (SOAP) — Mobile + API

This repository contains:

- `mobile/`: an **Expo React Native** app that can record a clinician–patient visit, request a transcript, and generate/edit a **SOAP note**.
- `server/`: a small **Node/Express** API that handles audio transcription, SOAP extraction, and **FHIR-friendly** export (for Epic integration via SMART on FHIR / Epic FHIR APIs).

## Important notes (privacy + safety)

- This is a developer starter kit. **Do not use in production** without HIPAA-grade controls (BAA, encryption, access controls, audit logging, retention policies, consent workflow, etc.).
- The SOAP note output is **draft documentation** and must be reviewed/edited by a clinician.

## Quick start

### 1) Start the API

Create `server/.env` (see `server/.env.example`) and set at minimum:

- `OPENAI_API_KEY=...` (or run in mock mode)

Then:

```bash
cd server
npm install
npm run dev
```

### 2) Start the mobile app

Set the API base URL for Expo:

- `EXPO_PUBLIC_API_BASE_URL=http://localhost:8787`

Then:

```bash
cd mobile
npm install
npm run start
```

## Epic integration approach (high level)

Epic integrations typically use **SMART on FHIR** to obtain an access token and then write to the FHIR server (e.g., create a `DocumentReference` and/or `Composition`). This repo generates a FHIR `Composition` payload and includes backend scaffolding to post to a configured FHIR base URL.

For real Epic deployments you will need:

- an Epic app registration, client ID, redirect URIs
- SMART on FHIR OAuth flow handled **server-side**
- patient/encounter context and correct resource linking

