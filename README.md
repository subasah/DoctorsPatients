# Medical Transcription App

A full-featured React Native mobile application for transcribing doctor-patient interactions based on medical templates.

## 🚀 Quick Start

```bash
# Run the app (dependencies already installed)
npm start

# Or run directly on iOS/Android
npm run ios      # iOS (Mac only)
npm run android  # Android
```

Then scan the QR code with Expo Go app on your phone, or run on an emulator.

**📖 For detailed setup instructions, see [GETTING_STARTED.md](GETTING_STARTED.md)**

## Features

### 📝 Session Management
- View all previous transcription sessions
- Search sessions by patient name, title, or content
- Track session duration and completion status
- Organized by date (Today/Earlier)

### 🏥 Medical Templates
Includes 15+ professional medical templates:
- SOAP Note
- H & P (History & Physical)
- Follow-Up Note
- Hospital Discharge Summary
- SBAR Handover
- Glasgow Coma Scale Assessment
- And many more...

### 👥 Patient Management
- Create and save patient profiles
- Quick patient search and selection
- Store patient demographics (name, age, gender)
- Patient avatar generation

### 🎤 Audio Recording & Transcription
- Real-time audio recording with visual feedback
- Pause/Resume functionality
- Microphone permission handling
- Duration tracking
- **Flexible transcription architecture** - easily swap transcription models

### 📄 Session Features
- Add context notes for better transcription
- Template-based formatting
- Share transcriptions
- Resume previous sessions
- Provide feedback on transcriptions

## Architecture

### Modular Transcription Service
The app is built with a **swappable transcription service** architecture:

```typescript
// src/utils/transcription.ts
export interface TranscriptionService {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>;
  isAvailable: () => Promise<boolean>;
}
```

This interface allows you to easily swap transcription providers:
- Currently uses simulated transcription for development
- Can integrate Whisper (OpenAI)
- Can integrate Google Cloud Speech-to-Text
- Can integrate AWS Transcribe
- Can integrate any custom speech-to-text model

### Data Persistence
Uses AsyncStorage for local data persistence:
- Sessions are automatically saved
- Patient records persist across app restarts
- No backend required (can be added later)

## Tech Stack

- **React Native** with TypeScript
- **Expo** for development and builds
- **React Navigation** for navigation
- **Expo AV** for audio recording
- **AsyncStorage** for local data storage
- **Context API** for state management

## Getting Started

### Prerequisites
- Node.js 16+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Navigate to the project directory:
```bash
cd medical-transcription
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

## Project Structure

```
medical-transcription/
├── App.tsx                    # Main app component with navigation
├── src/
│   ├── screens/              # All screen components
│   │   ├── SessionsListScreen.tsx
│   │   ├── TemplateSelectionScreen.tsx
│   │   ├── PatientDetailsScreen.tsx
│   │   ├── RecordingScreen.tsx
│   │   └── SessionDetailScreen.tsx
│   ├── contexts/             # React contexts
│   │   └── AppContext.tsx    # Main app state management
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── data/                 # Static data
│   │   └── templates.ts      # Medical templates
│   └── utils/                # Utility functions
│       └── transcription.ts  # Transcription service interface
└── package.json
```

## Swapping Transcription Models

To integrate a different transcription service:

1. Create a new class implementing `TranscriptionService`:

```typescript
export class WhisperTranscriptionService implements TranscriptionService {
  async startRecording(): Promise<void> {
    // Your Whisper integration
  }
  
  async stopRecording(): Promise<string> {
    // Return transcribed text
  }
  
  async isAvailable(): Promise<boolean> {
    // Check if Whisper is available
  }
}
```

2. Update the factory function in `src/utils/transcription.ts`:

```typescript
export const getTranscriptionService = (): TranscriptionService => {
  return new WhisperTranscriptionService();
};
```

## Customization

### Adding New Templates
Edit `src/data/templates.ts` to add new medical templates:

```typescript
{
  id: 'your-template',
  name: 'Your Template Name',
  sections: ['Section 1', 'Section 2', 'Section 3']
}
```

### Styling
All styles are defined inline using StyleSheet. Global theme colors:
- Background: `#000` (Black)
- Secondary: `#1c1c1e` (Dark Gray)
- Primary: `#8ab4f8` (Light Blue)
- Success: `#34c759` (Green)
- Text: `#fff` (White)
- Muted: `#8e8e93` (Gray)

## Features Breakdown

### SessionsListScreen
- Displays all sessions with patient info
- Real-time search functionality
- Groups sessions by date
- Shows session completion status
- Empty state for first-time users

### TemplateSelectionScreen
- Searchable list of medical templates
- Alphabetical index for quick navigation
- Clean, iOS-style interface

### PatientDetailsScreen
- Search existing patients
- Create new patients
- Parse patient info (name, age, gender)
- Switch between search and create modes

### RecordingScreen
- Real-time recording with visual feedback
- Animated microphone button
- Pause/Resume functionality
- Template selection
- Context input for better transcription
- Live transcription display
- Transcribe/Dictate mode toggle

### SessionDetailScreen
- View completed transcriptions
- Share functionality
- Resume recording option
- Feedback system
- Context display

## Known Limitations

1. **Transcription**: Currently uses simulated transcription. Integrate a real speech-to-text service for production.
2. **Audio Recording**: Uses Expo AV which requires native device capabilities. Web version has limited functionality.
3. **Offline Mode**: App works offline but needs internet for cloud-based transcription services.

## Future Enhancements

- [ ] Cloud backup and sync
- [ ] Export to PDF/DOCX
- [ ] Voice commands
- [ ] Multi-speaker detection
- [ ] Medical terminology dictionary
- [ ] HIPAA compliance features
- [ ] Team collaboration
- [ ] Analytics dashboard

## License

This project is for educational and development purposes.

## Support

For issues or questions, please open an issue on the repository.
