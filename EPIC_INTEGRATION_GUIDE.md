# Epic FHIR Integration Guide

This guide provides detailed instructions for integrating the SOAP Notes Assistant with Epic's FHIR API.

## Overview

Epic's FHIR (Fast Healthcare Interoperability Resources) API enables standards-based integration with Epic EHR systems. This app uses FHIR R4 to export SOAP notes as DocumentReference resources.

## Prerequisites

1. **Epic Account**: You need access to Epic's App Orchard
2. **FHIR API Access**: Request API access through Epic
3. **Development Environment**: Epic provides sandbox environments for testing

## Registration Process

### Step 1: Create Epic App Orchard Account

1. Visit [Epic App Orchard](https://appmarket.epic.com/)
2. Click "Join" to create an account
3. Complete your organization profile
4. Verify your email address

### Step 2: Register Your Application

1. Log in to App Orchard
2. Navigate to "Build Apps" → "Create New App"
3. Fill in application details:
   - **App Name**: SOAP Notes Assistant
   - **App Type**: Backend System
   - **FHIR Version**: R4
   - **Requested Scopes**:
     - `DocumentReference.write` - Create SOAP notes
     - `DocumentReference.read` - Read existing documents
     - `Patient.read` - Read patient information
     - `Patient.search` - Search for patients

4. Submit application for review

### Step 3: Obtain Credentials

Once approved, you'll receive:
- **Client ID**: Unique identifier for your app
- **Client Secret**: Secret key for authentication
- **FHIR Base URL**: API endpoint (varies by Epic instance)

## Authentication

### OAuth 2.0 Backend Services Flow

Epic uses OAuth 2.0 for API authentication. For backend applications:

#### 1. JWT Assertion Creation

```typescript
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Load your private key
const privateKey = fs.readFileSync('path/to/privatekey.pem');

// Create JWT
const token = jwt.sign(
  {
    iss: 'your-client-id',
    sub: 'your-client-id',
    aud: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    jti: generateUniqueId(),
    exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
  },
  privateKey,
  { algorithm: 'RS384' }
);
```

#### 2. Token Exchange

```typescript
const response = await fetch(
  'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: token,
    }),
  }
);

const { access_token } = await response.json();
```

### SMART on FHIR (EHR Launch)

For apps launched from within Epic:

```typescript
// Authorization endpoint
const authUrl = `https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize?` +
  `response_type=code&` +
  `client_id=${clientId}&` +
  `redirect_uri=${redirectUri}&` +
  `scope=launch patient/DocumentReference.write patient/Patient.read&` +
  `state=${state}&` +
  `aud=${fhirBaseUrl}`;

// Redirect user to authUrl
// After authorization, Epic redirects to your redirect_uri with a code

// Exchange code for token
const tokenResponse = await fetch(
  'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: redirectUri,
      client_id: clientId,
    }),
  }
);
```

## FHIR API Usage

### Creating a SOAP Note (DocumentReference)

```typescript
const documentReference = {
  resourceType: 'DocumentReference',
  status: 'current',
  type: {
    coding: [
      {
        system: 'http://loinc.org',
        code: '34133-9',
        display: 'Summary of episode note',
      },
    ],
  },
  category: [
    {
      coding: [
        {
          system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-documentreference-category',
          code: 'clinical-note',
          display: 'Clinical Note',
        },
      ],
    },
  ],
  subject: {
    reference: 'Patient/eM0R4JfXztLnf7f6JPLCwMQ3',
    display: 'John Doe',
  },
  date: '2024-02-13T10:30:00Z',
  author: [
    {
      reference: 'Practitioner/eHBBPWbOSdOLHAC3kOLmwMQ3',
      display: 'Dr. Jane Smith',
    },
  ],
  description: 'AI-Generated SOAP Note',
  content: [
    {
      attachment: {
        contentType: 'text/plain',
        data: base64EncodedSOAPNote,
        title: 'SOAP Note - 2024-02-13',
      },
    },
  ],
};

// Post to Epic
const response = await fetch(
  `${fhirBaseUrl}/DocumentReference`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
    },
    body: JSON.stringify(documentReference),
  }
);
```

### Searching for Patients

```typescript
// Search by name
const response = await fetch(
  `${fhirBaseUrl}/Patient?name=Smith&_count=10`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/fhir+json',
    },
  }
);

const bundle = await response.json();
const patients = bundle.entry?.map(entry => entry.resource) || [];
```

### Retrieving Patient Information

```typescript
const response = await fetch(
  `${fhirBaseUrl}/Patient/eM0R4JfXztLnf7f6JPLCwMQ3`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/fhir+json',
    },
  }
);

const patient = await response.json();
```

## Testing with Epic Sandbox

### 1. Access Sandbox Environment

Epic provides a sandbox for testing:
- **Sandbox URL**: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`
- Use test credentials provided by Epic
- Test patients are available in the sandbox

### 2. Test Patient IDs

Epic provides test patients for development:
- Test Patient 1: `eM0R4JfXztLnf7f6JPLCwMQ3`
- Test Patient 2: `erXuFYUfU8VhXaK9cN2EiOg3`

### 3. Verification Steps

1. Authenticate with sandbox credentials
2. Create a test DocumentReference
3. Verify document appears in Epic test environment
4. Test patient search functionality
5. Validate error handling

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Unauthorized | Refresh access token |
| 403 | Forbidden | Check API permissions/scopes |
| 404 | Not Found | Verify resource ID |
| 422 | Unprocessable Entity | Validate FHIR resource structure |
| 429 | Too Many Requests | Implement rate limiting/backoff |
| 500 | Server Error | Retry with exponential backoff |

### Error Response Example

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "details": {
        "text": "Invalid resource format"
      },
      "diagnostics": "DocumentReference.status is required"
    }
  ]
}
```

## Best Practices

### 1. Token Management

```typescript
class TokenManager {
  private token: string | null = null;
  private expiresAt: number = 0;

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt) {
      return this.token;
    }
    
    // Refresh token
    const response = await this.authenticate();
    this.token = response.access_token;
    this.expiresAt = Date.now() + (response.expires_in * 1000) - 60000; // 1 min buffer
    
    return this.token;
  }
}
```

### 2. Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];
  private maxRequests = 100;
  private timeWindow = 60000; // 1 minute

  async throttle(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}
```

### 3. Retry Logic

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const waitTime = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 4. Data Validation

```typescript
function validateDocumentReference(doc: any): boolean {
  return (
    doc.resourceType === 'DocumentReference' &&
    doc.status &&
    doc.type?.coding?.length > 0 &&
    doc.content?.length > 0
  );
}
```

## Security Considerations

1. **Store Credentials Securely**:
   - Use device keychain/keystore
   - Never hardcode credentials
   - Rotate secrets regularly

2. **Encrypt Data in Transit**:
   - Always use HTTPS
   - Implement certificate pinning
   - Validate SSL certificates

3. **Audit Logging**:
   - Log all API calls
   - Track data access
   - Monitor for anomalies

4. **Data Minimization**:
   - Only request necessary scopes
   - Limit data retention
   - Implement auto-deletion policies

## Production Deployment

### 1. Epic Production Credentials

- Request production credentials from Epic
- Complete security review
- Sign Business Associate Agreement (BAA)

### 2. App Submission

- Submit app for Epic App Orchard marketplace
- Complete Epic's certification process
- Provide documentation and support contacts

### 3. Go-Live Checklist

- [ ] Production credentials configured
- [ ] Security audit completed
- [ ] HIPAA compliance verified
- [ ] Error monitoring implemented
- [ ] Support process established
- [ ] User training materials prepared

## Resources

- [Epic FHIR Documentation](https://fhir.epic.com/)
- [SMART on FHIR Specification](http://hl7.org/fhir/smart-app-launch/)
- [FHIR R4 Specification](http://hl7.org/fhir/R4/)
- [Epic App Orchard](https://appmarket.epic.com/)
- [Epic Community Library](https://galaxy.epic.com/)

## Support

For Epic-specific integration questions:
- Email: fhir@epic.com
- Epic Community Forums
- App Orchard Support Portal

---

**Last Updated**: February 2026
