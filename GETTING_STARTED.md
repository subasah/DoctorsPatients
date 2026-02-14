# Getting Started with Medical Transcription App

This guide will help you get the app running on your device or emulator.

## Quick Start

### Option 1: Run on iOS Simulator (Mac only)

```bash
# Install dependencies if not already done
npm install

# Start iOS app
npm run ios
```

### Option 2: Run on Android Emulator

```bash
# Install dependencies if not already done
npm install

# Start Android app (make sure Android Emulator is running)
npm run android
```

### Option 3: Run on Physical Device with Expo Go

1. Install Expo Go app on your iOS or Android device:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

## App Usage Flow

### 1. Sessions List (Home Screen)
- **View all sessions**: Browse through your previous transcription sessions
- **Search**: Use the search bar to find specific sessions by patient name or content
- **Start new session**: Tap the blue "Start new session" button at the bottom

### 2. Template Selection
When you start a new session:
- **Browse templates**: Scroll through 15+ medical templates
- **Search templates**: Use the search bar to find specific templates quickly
- **Select template**: Tap on any template (e.g., "SOAP Note", "H & P") to continue

### 3. Patient Details
After selecting a template:
- **Search existing patient**: Type in the search bar to find an existing patient
- **Create new patient**: Tap "Create new patient" or the blue text at the top
- **Enter patient info**: Format: "John Smith 35M" (Name Age Gender)
- **Save patient**: Tap the blue "Save patient" button

### 4. Recording Screen
The main transcription interface:

#### Starting Recording:
1. **Tap the microphone button** to start recording
2. You'll see animated circles indicating active recording
3. The timer starts counting

#### During Recording:
- **Pause**: Tap the "Pause" button to pause recording
- **Resume**: Tap "Resume" to continue
- **View transcription**: Watch as your speech is transcribed in real-time
- **Add context**: Add notes in the "Add context" section for better transcription

#### Recording Features:
- **Template**: Selected template name is shown (e.g., "SOAP Note")
- **Patient info**: Patient name, age, and gender displayed
- **Duration**: Real-time recording duration counter
- **Tabs**: Switch between "Transcribe" and "Dictate" modes

#### Completing Session:
1. Tap **"Complete"** when finished
2. Session is saved automatically
3. You're returned to the Sessions List

### 5. Viewing Sessions
From the Sessions List:
- **Tap any session** to view its details
- **View transcription**: See the complete transcribed text
- **Share**: Tap the share icon (↑) to share the transcription
- **Resume**: Tap "Resume" to continue recording

## Features Explained

### Simulated Transcription
Currently, the app uses **simulated transcription** for development and testing:
- When you record, it automatically generates sample medical text
- Text appears progressively every 3 seconds
- This demonstrates the UI/UX without requiring a live transcription service

### Real Transcription Integration
To integrate real speech-to-text:

1. **Choose a service**:
   - OpenAI Whisper (recommended for accuracy)
   - Google Cloud Speech-to-Text
   - AWS Transcribe
   - Azure Speech Services

2. **Update the transcription service**:
   Edit `src/utils/transcription.ts` and implement the `TranscriptionService` interface

3. **Example for Whisper**:
```typescript
export class WhisperTranscriptionService implements TranscriptionService {
  async startRecording(): Promise<void> {
    // Start audio recording
    // Send audio chunks to Whisper API
  }
  
  async stopRecording(): Promise<string> {
    // Stop recording
    // Get final transcription from Whisper
    return transcribedText;
  }
  
  async isAvailable(): Promise<boolean> {
    return true; // Check API availability
  }
}
```

## Templates Available

1. **SOAP Note** - Subjective, Objective, Assessment, Plan
2. **H & P** - History & Physical
3. **Follow-Up Note** - Patient follow-up documentation
4. **Hospital Discharge Summary** - Discharge documentation
5. **SBAR Handover** - Situation, Background, Assessment, Recommendation
6. **Glasgow Coma Scale Assessment** - GCS scoring
7. **Generic Referral Letter** - Patient referral documentation
8. **Internal Medicine Note** - Internal medicine documentation
9. **Hospitalist Progress Note** - Daily progress notes
10. And 5+ more...

## Permissions

### iOS:
- **Microphone**: Required for recording
- The app will request permission on first use

### Android:
- **Microphone**: Required for recording
- **Storage**: For saving recordings (if implementing audio file storage)
- Permissions requested automatically on first use

## Data Storage

### Local Storage:
- All data stored locally on device using **AsyncStorage**
- Sessions persist across app restarts
- Patient data saved automatically
- No internet required for basic functionality

### Data Location:
- iOS: App sandbox
- Android: App private storage
- Cleared only when app is uninstalled

## Troubleshooting

### App won't start:
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
```

### iOS build issues:
```bash
cd ios
pod install
cd ..
npm run ios
```

### Android build issues:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Microphone not working:
1. Check device permissions in Settings
2. Ensure app has microphone access
3. Try restarting the app
4. Check for the error message on the recording screen

### Transcription not appearing:
- Currently using simulated transcription
- Wait a few seconds after starting recording
- Sample text should appear progressively
- For real transcription, integrate a speech-to-text service

## Building for Production

### iOS:
```bash
# Create production build
expo build:ios
```

### Android:
```bash
# Create production build
expo build:android
```

### App Store Submission:
See Expo documentation: https://docs.expo.dev/distribution/app-stores/

## Development Tips

### Hot Reload:
- Changes to code automatically refresh the app
- Shake device to open developer menu
- Enable "Fast Refresh" for instant updates

### Debugging:
- Use React Native Debugger
- Enable Debug JS Remotely from dev menu
- Use console.log() for debugging (visible in terminal)

### Testing on Device:
1. Connect device via USB
2. Enable USB debugging (Android) or trust computer (iOS)
3. Run `npm run ios` or `npm run android`

## Next Steps

### Customize Templates:
Edit `src/data/templates.ts` to add your own templates:
```typescript
{
  id: 'custom-template',
  name: 'My Custom Template',
  sections: ['Section 1', 'Section 2']
}
```

### Integrate Real Transcription:
1. Sign up for a transcription service (Whisper, Google, etc.)
2. Get API credentials
3. Implement service in `src/utils/transcription.ts`
4. Update `getTranscriptionService()` factory function

### Add Cloud Sync:
1. Set up a backend (Firebase, AWS, custom API)
2. Add authentication
3. Sync sessions and patients to cloud
4. Enable multi-device access

### Export Functionality:
- Add PDF export for sessions
- Email transcriptions
- Export to EHR systems
- Print functionality

## Support

For issues or questions:
- Check the README.md for detailed documentation
- Review the code comments in source files
- Open an issue on the repository

## License

This project is for educational and development purposes.

---

**Happy transcribing! 🎤📝**
