import axios from 'axios';
import {SOAPNote, EpicConfig} from '../types';

/**
 * Epic FHIR Integration Service
 * Integrates with Epic's FHIR API for EHR data exchange
 * 
 * Epic App Orchard: https://appmarket.epic.com/
 * FHIR API Documentation: https://fhir.epic.com/
 */
class EpicIntegrationService {
  private config: EpicConfig | null = null;
  private accessToken: string | null = null;

  setConfig(config: EpicConfig): void {
    this.config = config;
  }

  /**
   * Authenticate with Epic OAuth 2.0
   * In production, implement proper OAuth flow with SMART on FHIR
   */
  async authenticate(): Promise<boolean> {
    if (!this.config || !this.config.enabled) {
      throw new Error('Epic configuration not set or disabled');
    }

    try {
      // In production, implement OAuth 2.0 authorization flow
      // This is a simplified placeholder
      const response = await axios.post(
        `${this.config.fhirBaseUrl}/oauth2/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.apiKey,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      return true;
    } catch (error) {
      console.error('Epic authentication failed:', error);
      return false;
    }
  }

  /**
   * Export SOAP note as FHIR DocumentReference
   * Maps SOAP note to FHIR format for Epic integration
   */
  async exportSOAPNote(note: SOAPNote): Promise<boolean> {
    if (!this.config || !this.config.enabled) {
      throw new Error('Epic integration not configured');
    }

    if (!this.accessToken) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Failed to authenticate with Epic');
      }
    }

    try {
      const fhirDocument = this.convertToFHIRDocumentReference(note);
      
      const response = await axios.post(
        `${this.config.fhirBaseUrl}/DocumentReference`,
        fhirDocument,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json',
          },
        }
      );

      return response.status === 201 || response.status === 200;
    } catch (error) {
      console.error('Failed to export SOAP note to Epic:', error);
      throw error;
    }
  }

  /**
   * Convert SOAP note to FHIR DocumentReference format
   */
  private convertToFHIRDocumentReference(note: SOAPNote): any {
    const soapContent = this.formatSOAPContent(note);
    
    return {
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
      subject: note.patientId
        ? {
            reference: `Patient/${note.patientId}`,
            display: note.patientName,
          }
        : undefined,
      date: note.date.toISOString(),
      description: 'AI-Generated SOAP Note',
      content: [
        {
          attachment: {
            contentType: 'text/plain',
            data: Buffer.from(soapContent).toString('base64'),
            title: `SOAP Note - ${note.date.toLocaleDateString()}`,
          },
        },
      ],
    };
  }

  /**
   * Format SOAP note content for export
   */
  private formatSOAPContent(note: SOAPNote): string {
    return `
SOAP NOTE
Generated: ${note.date.toLocaleString()}
Patient: ${note.patientName || 'N/A'}
Patient ID: ${note.patientId || 'N/A'}

SUBJECTIVE:
${note.subjective}

OBJECTIVE:
${note.objective}

ASSESSMENT:
${note.assessment}

PLAN:
${note.plan}

---
RAW TRANSCRIPT:
${note.rawTranscript}

---
Duration: ${Math.floor(note.duration / 60000)} minutes ${Math.floor((note.duration % 60000) / 1000)} seconds
    `.trim();
  }

  /**
   * Retrieve patient information from Epic
   */
  async getPatientInfo(patientId: string): Promise<any> {
    if (!this.config || !this.config.enabled) {
      throw new Error('Epic integration not configured');
    }

    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await axios.get(
        `${this.config.fhirBaseUrl}/Patient/${patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/fhir+json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to retrieve patient info from Epic:', error);
      throw error;
    }
  }

  /**
   * Search for patients in Epic
   */
  async searchPatients(query: string): Promise<any[]> {
    if (!this.config || !this.config.enabled) {
      throw new Error('Epic integration not configured');
    }

    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      const response = await axios.get(
        `${this.config.fhirBaseUrl}/Patient`,
        {
          params: {
            name: query,
          },
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/fhir+json',
          },
        }
      );

      return response.data.entry || [];
    } catch (error) {
      console.error('Failed to search patients in Epic:', error);
      throw error;
    }
  }

  /**
   * Validate Epic configuration
   */
  async validateConfig(config: EpicConfig): Promise<boolean> {
    try {
      this.setConfig(config);
      return await this.authenticate();
    } catch (error) {
      return false;
    }
  }
}

export default new EpicIntegrationService();
