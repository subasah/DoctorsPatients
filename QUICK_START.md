# Quick Start Guide - SOAP Notes Assistant

Welcome! This guide will help you get started with the SOAP Notes Assistant mobile app.

## What You Have

A complete React Native mobile application that:
- ✅ Records doctor-patient conversations
- ✅ Transcribes speech to text in real-time
- ✅ Automatically generates SOAP notes (Subjective, Objective, Assessment, Plan)
- ✅ Integrates with Epic EHR via FHIR API
- ✅ Stores and manages note history
- ✅ Allows editing and exporting of notes

## Project Structure

```
soap-notes-assistant/
├── src/
│   ├── App.tsx                          # Main app with navigation
│   ├── screens/                         # App screens
│   │   ├── RecordingScreen.tsx         # Record conversations
│   │   ├── NotesHistoryScreen.tsx      # View all notes
│   │   └── SettingsScreen.tsx          # Configure app
│   ├── services/                        # Business logic
│   │   ├── AudioService.ts             # Audio recording
│   │   ├── TranscriptionService.ts     # Speech-to-text
│   │   ├── SOAPGeneratorService.ts     # SOAP generation
│   │   ├── StorageService.ts           # Local storage
│   │   └── EpicIntegrationService.ts   # Epic FHIR API
│   ├── components/                      # UI components
│   │   └── SOAPNoteDetailModal.tsx     # Note viewer/editor
│   └── types/                           # TypeScript types
│       └── index.ts
├── android/                             # Android configuration
├── ios/                                 # iOS configuration
└── Documentation files
```

## Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Install Node packages
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### Step 2: Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

### Step 3: Use the App

1. **Record**: Tap the microphone button to start recording
2. **View Transcript**: Watch live transcription as you speak
3. **Stop**: Tap stop when done - SOAP note is auto-generated
4. **Review**: Go to "SOAP Notes" tab to view and edit

## Key Features Explained

### 1. Recording Screen (Tab 1)
- **Start Recording**: Red microphone button
- **Live Transcript**: Expandable section showing real-time transcription
- **Controls**: Pause, Resume, Stop, Cancel
- **Auto-Generation**: SOAP note created automatically when you stop

### 2. SOAP Notes History (Tab 2)
- **View All Notes**: Scrollable list of past recordings
- **Search**: Filter by date or patient
- **Edit**: Tap any note to view/edit details
- **Delete**: Swipe or tap delete icon
- **Export**: Share or send to Epic

### 3. Settings (Tab 3)
- **Auto Transcribe**: Enable/disable real-time transcription
- **Auto Generate SOAP**: Toggle automatic SOAP creation
- **Epic Integration**: Configure FHIR endpoint and credentials
- **Data Management**: Clear all data option

## SOAP Note Generation

The app analyzes conversations and categorizes information into:

- **Subjective (S)**: Patient complaints, symptoms, history
- **Objective (O)**: Physical findings, vital signs, test results
- **Assessment (A)**: Diagnosis, clinical impressions
- **Plan (P)**: Treatment, medications, follow-up

### How It Works

1. **Keyword Detection**: Identifies medical terms and context
2. **Categorization**: Assigns statements to SOAP sections
3. **Formatting**: Structures content into clinical notes
4. **Enhancement**: (Optional) Use AI for better accuracy

### Improving Accuracy

For production use, integrate AI services:

**Option 1: OpenAI GPT-4**
```typescript
// See AI_INTEGRATION_GUIDE.md for details
const soap = await openaiGenerator.generateSOAPNote(transcript);
```

**Option 2: Azure Health Text Analytics**
```typescript
// Extract medical entities and build SOAP
const entities = await azureAnalytics.analyzeHealthcareEntities(transcript);
```

**Option 3: AWS Comprehend Medical**
```typescript
// Medical entity extraction
const entities = await awsComprehend.detectMedicalEntities(transcript);
```

See [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md) for detailed instructions.

## Epic Integration Setup

### Prerequisites
1. Epic App Orchard account
2. FHIR API credentials (Client ID, API Key)
3. FHIR endpoint URL

### Configuration

1. Open app → Settings tab
2. Enable "Epic Integration"
3. Enter:
   - **FHIR Base URL**: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`
   - **Client ID**: Your Epic client ID
   - **API Key**: Your API secret
4. Tap "Test Connection"
5. Tap "Save"

### Exporting to Epic

1. Open any SOAP note
2. Review and edit if needed
3. Tap "Export to Epic"
4. Note is sent as FHIR DocumentReference

See [EPIC_INTEGRATION_GUIDE.md](./EPIC_INTEGRATION_GUIDE.md) for detailed setup.

## Common Tasks

### Edit a SOAP Note

1. Go to "SOAP Notes" tab
2. Tap the note you want to edit
3. Tap edit icon (✏️)
4. Modify any section
5. Tap "Save Changes"

### Share a Note

1. Open the note
2. Tap "Share" button
3. Choose sharing method (email, messages, etc.)

### Delete a Note

1. Find the note in history
2. Tap delete icon (🗑️)
3. Confirm deletion

### Clear All Data

1. Go to Settings tab
2. Scroll to bottom
3. Tap "Clear All Data"
4. Confirm (⚠️ This cannot be undone!)

## Troubleshooting

### Microphone Not Working

**iOS:**
```
Settings → Privacy & Security → Microphone → SOAP Notes Assistant → Enable
```

**Android:**
```
Settings → Apps → SOAP Notes Assistant → Permissions → Microphone → Allow
```

### Recording Fails on Android

1. Check storage permissions
2. Ensure sufficient storage space
3. Restart the app

### Transcription Not Working

1. Check internet connection (required for speech recognition)
2. Verify microphone permissions
3. Ensure device supports speech recognition
4. Try speaking more clearly

### Epic Connection Failed

1. Verify FHIR endpoint URL is correct
2. Check client ID and API key
3. Test internet connectivity
4. Review Epic API permissions
5. Contact Epic support if issues persist

## Next Steps

### For Development

1. **Enhance AI**: Integrate OpenAI, Azure, or AWS services
2. **Customize UI**: Modify screens in `src/screens/`
3. **Add Features**: Extend services in `src/services/`
4. **Testing**: Run `npm test` to ensure quality

### For Production

1. **Configure Epic**: Complete Epic App Orchard registration
2. **Security**: Implement proper authentication
3. **Compliance**: Ensure HIPAA compliance
4. **Testing**: Thorough testing on real devices
5. **Deployment**: Build and distribute via App Store/Play Store

### Building for Production

**iOS:**
```bash
cd ios
xcodebuild -workspace SOAPNotesAssistant.xcworkspace \
  -scheme SOAPNotesAssistant \
  -configuration Release \
  archive
```

**Android:**
```bash
cd android
./gradlew assembleRelease
# or for Play Store
./gradlew bundleRelease
```

## Need Help?

📖 **Documentation:**
- [README.md](./README.md) - Complete documentation
- [EPIC_INTEGRATION_GUIDE.md](./EPIC_INTEGRATION_GUIDE.md) - Epic setup
- [AI_INTEGRATION_GUIDE.md](./AI_INTEGRATION_GUIDE.md) - AI enhancement
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

🐛 **Issues:**
- Check GitHub Issues
- Search for similar problems
- Create new issue if needed

💬 **Questions:**
- GitHub Discussions
- Stack Overflow
- React Native Community

## Important Notes

### Medical Disclaimer

⚠️ This app is a documentation tool. Always:
- Review all AI-generated content
- Verify clinical accuracy
- Follow institutional policies
- Obtain patient consent
- Comply with HIPAA regulations

### Data Privacy

- All data stored locally on device
- Epic integration uses secure HTTPS
- No data sent to third parties (except configured services)
- Users control data deletion

### Performance Tips

- Close other apps while recording
- Ensure good battery level
- Use in quiet environment for best transcription
- Regular device restart recommended

## What's Next?

The app is ready to use! Key capabilities:

✅ Audio recording works out of the box
✅ Speech-to-text enabled (requires internet)
✅ Basic SOAP generation included
✅ Local storage configured
✅ Epic integration ready (needs credentials)

**To enhance:**
1. Add AI service integration (see AI_INTEGRATION_GUIDE.md)
2. Configure Epic credentials (see EPIC_INTEGRATION_GUIDE.md)
3. Customize for your specialty
4. Test with real scenarios

---

**Ready to reduce healthcare documentation burden and improve patient care!**

For questions: Check documentation or open an issue on GitHub.
