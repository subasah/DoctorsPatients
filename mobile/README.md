# Mobile app (Expo React Native)

## Setup

```bash
cd mobile
npm install
```

## Configure API base URL

Set your backend base URL (defaults to `http://localhost:8787`):

- `EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8787`

For example (Linux/macOS):

```bash
export EXPO_PUBLIC_API_BASE_URL="http://127.0.0.1:8787"
```

Then start Expo:

```bash
npm run start
```

## Flow

- Record visit audio (with consent)
- Send audio to `/api/transcribe`
- Send transcript to `/api/soap`
- Review/edit SOAP sections
- Export FHIR `Composition` JSON via `/api/fhir/composition`

