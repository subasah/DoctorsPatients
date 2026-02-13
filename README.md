# SOAP Notes Assistant

An AI-powered React Native mobile application that listens to doctor-patient conversations and automatically generates SOAP (Subjective, Objective, Assessment, Plan) notes with Epic EHR integration capabilities.

## 🎯 Purpose

This app addresses healthcare provider burnout by:
- **Automating documentation**: Reduces time spent on manual note-taking
- **Improving accuracy**: AI-powered transcription and SOAP note generation
- **Streamlining workflow**: Direct integration with Epic EHR system
- **Enhancing patient care**: Allows doctors to focus on patient interaction instead of documentation

## ✨ Features

### Core Functionality
- **Real-time Audio Recording**: High-quality audio capture of doctor-patient conversations
- **Live Speech-to-Text**: Real-time transcription during recording
- **AI-Powered SOAP Generation**: Automatically categorizes conversation into SOAP format:
  - **Subjective**: Patient complaints, symptoms, and history
  - **Objective**: Physical examination findings and vital signs
  - **Assessment**: Diagnosis and clinical impressions
  - **Plan**: Treatment plans and follow-up instructions

### SOAP Note Management
- **View & Edit**: Review and modify generated SOAP notes
- **History**: Access all past SOAP notes
- **Export**: Share notes via any available sharing method
- **Epic Integration**: Direct export to Epic EHR via FHIR API

### Epic EHR Integration
- **FHIR R4 Compatibility**: Standards-based integration with Epic
- **DocumentReference**: SOAP notes stored as clinical documents
- **Patient Linking**: Associate notes with patient records
- **OAuth 2.0 Authentication**: Secure API access

## 🏗️ Architecture

```
src/
├── App.tsx                          # Main app component with navigation
├── types/                           # TypeScript type definitions
│   └── index.ts
├── services/                        # Business logic and integrations
│   ├── AudioService.ts             # Audio recording management
│   ├── TranscriptionService.ts     # Speech-to-text functionality
│   ├── SOAPGeneratorService.ts     # SOAP note generation logic
│   ├── StorageService.ts           # Local data persistence
│   └── EpicIntegrationService.ts   # Epic FHIR API integration
├── screens/                         # Main app screens
│   ├── RecordingScreen.tsx         # Record conversations
│   ├── NotesHistoryScreen.tsx      # View all SOAP notes
│   └── SettingsScreen.tsx          # App configuration
└── components/                      # Reusable UI components
    └── SOAPNoteDetailModal.tsx     # SOAP note viewer/editor
```

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **React Native CLI**: Latest version
- **iOS Development** (macOS only):
  - Xcode 14+
  - CocoaPods
  - iOS 13.0+
- **Android Development**:
  - Android Studio
  - Android SDK (API 23+)
  - Java Development Kit (JDK) 11+

## 🚀 Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd soap-notes-assistant

# Install dependencies
npm install

# iOS only: Install CocoaPods dependencies
cd ios && pod install && cd ..
```

### 2. Configure Permissions

The app requires microphone and storage permissions. These are already configured in:
- **Android**: `android/app/src/main/AndroidManifest.xml`
- **iOS**: `ios/SOAPNotesAssistant/Info.plist`

### 3. Run the App

#### iOS
```bash
npm run ios
# or
react-native run-ios
```

#### Android
```bash
npm run android
# or
react-native run-android
```

## 🔧 Configuration

### Epic FHIR Integration Setup

1. **Register Your App with Epic**:
   - Visit [Epic App Orchard](https://appmarket.epic.com/)
   - Create a new app registration
   - Request FHIR API access
   - Obtain your Client ID and API credentials

2. **Configure in App**:
   - Open the app and navigate to Settings
   - Enable "Epic Integration"
   - Enter the following information:
     - **FHIR Base URL**: Your Epic FHIR endpoint
       - Example: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`
     - **Client ID**: Your Epic application client ID
     - **API Key**: Your Epic API key/secret
   - Tap "Test Connection" to verify
   - Tap "Save" to store configuration

### SMART on FHIR Authentication

For production deployment, implement proper OAuth 2.0 flow:

```typescript
// In EpicIntegrationService.ts
async authenticate(): Promise<boolean> {
  // Implement OAuth 2.0 Authorization Code Flow
  // 1. Redirect to Epic authorization endpoint
  // 2. Handle callback with authorization code
  // 3. Exchange code for access token
  // 4. Store token securely
}
```

## 📱 Usage Guide

### Recording a Session

1. **Start Recording**:
   - Open the app and tap the microphone button
   - Grant microphone permission if prompted
   - The app begins recording and transcribing

2. **During Recording**:
   - View live transcript by tapping "Live Transcript"
   - Pause/Resume recording as needed
   - Duration timer shows elapsed time

3. **Stop Recording**:
   - Tap "Stop" button
   - App automatically generates SOAP note
   - Note is saved to history

### Managing SOAP Notes

1. **View Notes**:
   - Navigate to "SOAP Notes" tab
   - Tap any note to view details

2. **Edit Notes**:
   - Open a note
   - Tap the edit icon
   - Modify any SOAP section
   - Tap "Save Changes"

3. **Export to Epic**:
   - Open a note
   - Tap "Export to Epic"
   - Note is sent to Epic as FHIR DocumentReference

4. **Share Notes**:
   - Open a note
   - Tap "Share"
   - Choose sharing method (email, messages, etc.)

### Settings Configuration

1. **General Settings**:
   - **Auto Transcribe**: Enable real-time transcription
   - **Auto Generate SOAP**: Automatically create SOAP notes after recording
   - **Save Raw Audio**: Keep original audio files

2. **Epic Integration**:
   - Enable/disable Epic export functionality
   - Configure FHIR endpoint and credentials
   - Test connection before use

## 🧠 AI Enhancement

The current implementation uses keyword-based SOAP note generation. For production use, integrate with AI services:

### Recommended AI Services

1. **OpenAI GPT-4**:
```typescript
// In SOAPGeneratorService.ts
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: 'You are a medical assistant that converts doctor-patient conversations into structured SOAP notes.'
    }, {
      role: 'user',
      content: `Convert this transcript into SOAP format:\n\n${transcript}`
    }]
  })
});
```

2. **Azure Health Bot / Cognitive Services**
3. **AWS Comprehend Medical**
4. **Custom Fine-tuned Models**

### Privacy & Security Considerations

- **HIPAA Compliance**: Ensure AI service is HIPAA-compliant
- **Data Encryption**: Encrypt audio and transcripts in transit and at rest
- **Access Controls**: Implement proper authentication and authorization
- **Audit Logging**: Track all data access and exports
- **Patient Consent**: Obtain proper consent for recording and AI processing

## 🔒 Security Best Practices

1. **Secure Storage**:
   - All data stored using encrypted AsyncStorage
   - Implement Keychain (iOS) / Keystore (Android) for sensitive credentials

2. **Network Security**:
   - Use HTTPS for all API communications
   - Implement certificate pinning for Epic API

3. **Authentication**:
   - Implement user authentication before app access
   - Use biometric authentication (Face ID, Touch ID)
   - Session timeout for inactive users

4. **Data Privacy**:
   - Clear data option in settings
   - Automatic data retention policies
   - Patient data de-identification where appropriate

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Lint code
npm run lint

# Format code
npm run format
```

## 📦 Building for Production

### iOS

```bash
# Generate release build
cd ios
xcodebuild -workspace SOAPNotesAssistant.xcworkspace \
  -scheme SOAPNotesAssistant \
  -configuration Release \
  -archivePath build/SOAPNotesAssistant.xcarchive \
  archive
```

### Android

```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate signed AAB (for Play Store)
./gradlew bundleRelease
```

## 🏥 Epic Integration Details

### FHIR Resources Used

1. **DocumentReference**: For storing SOAP notes
2. **Patient**: For patient information retrieval
3. **Practitioner**: For provider information (future enhancement)

### API Endpoints

- **Authentication**: `/oauth2/token`
- **Create Document**: `POST /DocumentReference`
- **Search Patients**: `GET /Patient?name={query}`
- **Get Patient**: `GET /Patient/{id}`

### Data Mapping

| SOAP Section | FHIR Mapping |
|-------------|--------------|
| Full SOAP Note | DocumentReference.content.attachment.data |
| Patient | DocumentReference.subject |
| Date/Time | DocumentReference.date |
| Status | DocumentReference.status |
| Type | DocumentReference.type (LOINC code) |

## 🛠️ Troubleshooting

### Common Issues

1. **Microphone Permission Denied**:
   - Go to device Settings → Apps → SOAP Notes Assistant → Permissions
   - Enable Microphone permission

2. **Recording Fails on Android**:
   - Check storage permissions
   - Ensure sufficient storage space

3. **Epic Connection Failed**:
   - Verify FHIR endpoint URL
   - Check network connectivity
   - Validate client credentials
   - Review Epic API access permissions

4. **Transcription Not Working**:
   - Verify device has speech recognition support
   - Check internet connectivity (required for some services)
   - Ensure microphone is working properly

## 🚧 Future Enhancements

- [ ] Multiple language support
- [ ] Offline mode with sync
- [ ] Voice commands for hands-free operation
- [ ] Integration with other EHR systems (Cerner, Allscripts)
- [ ] Advanced AI models for medical entity extraction
- [ ] Clinical decision support integration
- [ ] Template-based SOAP notes for different specialties
- [ ] Multi-provider conversation tracking
- [ ] Automated ICD-10 and CPT code suggestions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Disclaimer

This application is a tool to assist healthcare providers and should not be used as the sole method of clinical documentation. Always review and verify AI-generated content for accuracy and completeness. Ensure compliance with all applicable healthcare regulations, including HIPAA, in your jurisdiction.

## 📧 Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

---

**Built with ❤️ to reduce healthcare provider burnout and improve patient care**
