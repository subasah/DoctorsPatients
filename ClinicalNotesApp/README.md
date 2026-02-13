# Clinical Notes - SOAP Documentation App

A React Native mobile app that listens to patient-doctor conversations and automatically generates SOAP (Subjective, Objective, Assessment, Plan) clinical notes. Designed to reduce physician burnout and documentation workload, with Epic EHR integration via FHIR.

## Features

- **Conversation Recording**: Record patient-doctor encounters with high-quality audio
- **Speech-to-Text**: Transcribe conversations using OpenAI Whisper API
- **SOAP Note Generation**: AI-powered conversion of transcripts into structured clinical notes
- **Epic FHIR Integration**: Export notes in FHIR R4 Composition format for Epic EHR
- **Demo Mode**: Try the app without API keys using sample medical conversations

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- OpenAI API key (for production use)

### Installation

```bash
cd ClinicalNotesApp
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios

# Run in web browser
npm run web
```

### Configuration

1. **Demo Mode** (default): Works out of the box with sample conversations
2. **Production Mode**: Add your OpenAI API key in Settings for:
   - Live audio transcription (Whisper)
   - AI SOAP note generation (GPT-4)

### Epic Integration

The app generates FHIR R4 Composition resources compatible with Epic's FHIR API. To integrate:

1. **Register your app** in [Epic App Orchard](https://apporchard.epic.com/)
2. **Configure OAuth 2.0** for Epic FHIR access
3. **Use the Epic FHIR base URL** in Settings (default: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`)
4. **Push notes** via the `pushToEpic()` function in `src/services/epicFhirService.ts`

## Project Structure

```
ClinicalNotesApp/
├── App.tsx                 # Main app with tab navigation
├── src/
│   ├── context/            # App state (notes, config)
│   ├── hooks/              # useRecording for audio + AI pipeline
│   ├── screens/            # Record, Notes, Settings
│   ├── services/           # Transcription, SOAP generation, Epic FHIR
│   └── types/              # TypeScript interfaces
```

## SOAP Format

- **Subjective**: Chief complaint, HPI, patient-reported symptoms
- **Objective**: Vitals, exam findings, labs
- **Assessment**: Diagnosis, clinical impression
- **Plan**: Treatment, medications, follow-up

## Security & Compliance

- Audio is processed locally or via secure API calls
- No data is stored on external servers except through configured APIs
- HIPAA compliance requires BAA with OpenAI and proper Epic OAuth setup
- API keys are stored in app state (use secure storage for production)

## License

MIT
