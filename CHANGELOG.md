# Changelog

All notable changes to the SOAP Notes Assistant will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-13

### Added
- Initial release of SOAP Notes Assistant
- Real-time audio recording of doctor-patient conversations
- Live speech-to-text transcription
- AI-powered SOAP note generation
  - Subjective section extraction
  - Objective findings identification
  - Assessment and diagnosis parsing
  - Treatment plan organization
- SOAP note history and management
  - View all recorded notes
  - Edit and update notes
  - Delete notes
  - Search and filter capabilities
- Epic EHR integration via FHIR R4 API
  - Export SOAP notes as DocumentReference
  - Patient search functionality
  - OAuth 2.0 authentication
- Settings and configuration
  - Auto-transcribe toggle
  - Auto-generate SOAP toggle
  - Raw audio saving option
  - Epic FHIR configuration
- Modern, intuitive mobile UI
  - Recording controls
  - Live transcript preview
  - SOAP note detail view
  - Tab-based navigation
- Cross-platform support (iOS and Android)
- Local data persistence
- Share functionality for SOAP notes

### Security
- Encrypted local storage
- Secure API communication
- Permission handling for microphone and storage
- HIPAA-compliant architecture support

### Documentation
- Comprehensive README with setup instructions
- Epic FHIR integration guide
- AI integration guide for enhanced SOAP generation
- Contributing guidelines
- MIT License with medical disclaimer

## [Unreleased]

### Planned Features
- Multi-language support
- Offline mode with sync
- Voice commands
- Custom SOAP templates by medical specialty
- Integration with additional EHR systems (Cerner, Allscripts)
- Advanced AI models for medical entity extraction
- Clinical decision support integration
- ICD-10 and CPT code suggestions
- Multi-provider conversation tracking
- PDF export functionality
- Cloud backup and sync
- Analytics and insights dashboard

### Known Issues
- Speech recognition requires internet connection
- Epic integration requires manual configuration
- AI SOAP generation uses basic keyword matching (enhanced AI integration available via guides)

---

For upgrade instructions and migration guides, see [README.md](./README.md)
