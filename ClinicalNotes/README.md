# Clinical Notes AI

**AI-Powered Clinical Conversation SOAP Note Generator with Epic EHR Integration**

A React Native mobile application that listens to doctor-patient conversations and automatically generates structured SOAP (Subjective, Objective, Assessment, Plan) notes. Designed to reduce physician documentation burden, decrease burnout, and seamlessly integrate with Epic EHR systems via HL7 FHIR R4.

---

## Features

### Core Functionality
- **Audio Recording**: High-quality clinical conversation recording with pause/resume support
- **AI Transcription**: Automatic speech-to-text using OpenAI Whisper API
- **SOAP Note Generation**: AI-powered structured clinical note generation using GPT-4
- **Note Editor**: Full SOAP note editor with collapsible sections for each category
- **Note Management**: Browse, search, filter, and manage clinical notes

### SOAP Note Structure
- **Subjective**: Chief complaint, HPI, ROS, past medical history, medications, allergies, social/family history
- **Objective**: Vital signs, physical examination, laboratory data, imaging results
- **Assessment**: Primary diagnosis (with ICD-10), differential diagnoses, clinical impression
- **Plan**: Treatment, medications, procedures, referrals, follow-up, patient education

### Epic EHR Integration
- **FHIR R4 Compliant**: Full HL7 FHIR R4 standard support
- **SMART on FHIR**: OAuth2 authentication with Epic
- **Document Upload**: Upload finalized SOAP notes as FHIR DocumentReference resources
- **Patient Search**: Search and link patients from Epic
- **Encounter Sync**: Associate notes with active encounters
- **Connection Testing**: Built-in Epic FHIR connectivity testing

### User Experience
- **Modern Medical UI**: Clean, professional interface designed for clinical workflows
- **Demo Mode**: Try the app without API keys using realistic sample conversations
- **Clipboard Export**: Copy formatted SOAP notes to clipboard
- **Status Workflow**: Draft -> Reviewed -> Finalized -> Synced to Epic
- **Search & Filter**: Find notes by patient name, chief complaint, or diagnosis

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator, or Expo Go app on a physical device

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ClinicalNotes

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web

# Expo Go (scan QR code)
npx expo start
```

---

## Configuration

### OpenAI API Key (for AI features)

1. Go to [platform.openai.com](https://platform.openai.com) and create an API key
2. In the app, navigate to **Settings** > **AI Configuration**
3. Enter your API key in the "OpenAI API Key" field
4. Save settings

Without an API key, the app runs in **demo mode** with sample clinical conversations and pre-generated SOAP notes.

### Epic FHIR Integration

To enable Epic EHR integration:

1. Register your application at [open.epic.com](https://open.epic.com) (Epic App Orchard)
2. Obtain your **Client ID** and **Client Secret**
3. Get the **FHIR Base URL** from your Epic administrator
4. In the app, navigate to **Settings** > **Epic FHIR Integration**
5. Enter:
   - FHIR Base URL (e.g., `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`)
   - Client ID
   - Client Secret
   - Redirect URI (e.g., `clinicalnotes://callback`)

#### Epic Sandbox Testing

For development, use the Epic FHIR sandbox:
- Base URL: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`
- Register at open.epic.com for sandbox credentials

---

## Architecture

```
ClinicalNotes/
├── App.tsx                    # Root component
├── src/
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # SOAPNote, AppSettings, FHIR types
│   ├── theme/                 # Design system
│   │   └── index.ts           # Colors, spacing, typography, shadows
│   ├── utils/                 # Utility functions
│   │   └── helpers.ts         # Date formatting, SOAP text export
│   ├── services/              # Business logic & API integrations
│   │   ├── storage.ts         # AsyncStorage CRUD for notes & settings
│   │   ├── audioRecording.ts  # Expo AV recording service
│   │   ├── speechToText.ts    # OpenAI Whisper transcription
│   │   ├── soapGenerator.ts   # GPT-4 SOAP note generation
│   │   └── epicFhir.ts        # Epic FHIR R4 integration
│   ├── context/               # State management
│   │   └── AppContext.tsx      # React Context with useReducer
│   ├── components/            # Reusable UI components
│   │   ├── SOAPSectionCard.tsx # Collapsible SOAP section editor
│   │   ├── NoteCard.tsx       # Note list item card
│   │   ├── RecordingWave.tsx  # Animated audio waveform
│   │   ├── StatusBadge.tsx    # Note status indicator
│   │   └── EmptyState.tsx     # Empty state placeholder
│   ├── screens/               # App screens
│   │   ├── HomeScreen.tsx     # Dashboard with stats
│   │   ├── RecordingScreen.tsx # Audio recording interface
│   │   ├── NoteEditorScreen.tsx # SOAP note viewer/editor
│   │   ├── NotesListScreen.tsx # Browse & search notes
│   │   ├── EpicSyncScreen.tsx # Epic integration management
│   │   └── SettingsScreen.tsx # App configuration
│   └── navigation/            # Navigation configuration
│       └── AppNavigator.tsx   # Stack + Tab navigation
```

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript |
| Navigation | React Navigation 7 |
| State | React Context + useReducer |
| Storage | AsyncStorage |
| Audio | Expo AV |
| AI/ML | OpenAI GPT-4 + Whisper |
| EHR Integration | HL7 FHIR R4 / Epic |
| Icons | @expo/vector-icons (MaterialIcons) |

---

## FHIR Integration Details

### Supported FHIR Resources

| Resource | Operations | Purpose |
|----------|-----------|---------|
| DocumentReference | Create, Read | Upload/retrieve SOAP notes |
| Patient | Search | Patient lookup and matching |
| Encounter | Read | Associate notes with visits |
| Practitioner | Read | Author identification |

### LOINC Codes Used
- `11488-4` - Consultation note (for SOAP notes)

---

## Privacy & Security Considerations

- Audio recordings are processed locally or via encrypted API calls
- No patient data is stored on external servers beyond API processing
- Audio files can be deleted immediately after transcription
- All Epic FHIR communication uses OAuth2 + TLS
- The app supports HIPAA compliance requirements when properly configured
- API keys are stored locally on device via AsyncStorage

---

## License

This project is for educational and demonstration purposes. For production clinical use, ensure compliance with HIPAA, local healthcare regulations, and Epic's App Orchard requirements.
