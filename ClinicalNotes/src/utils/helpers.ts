// ============================================================
// Clinical Conversation Notes - Utility Helpers
// ============================================================

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { NoteStatus } from '../types';

/** Format seconds into MM:SS or HH:MM:SS */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** Format ISO date string to display format */
export function formatDate(isoString: string): string {
  try {
    return format(parseISO(isoString), 'MMM d, yyyy');
  } catch {
    return isoString;
  }
}

/** Format ISO date string to display format with time */
export function formatDateTime(isoString: string): string {
  try {
    return format(parseISO(isoString), 'MMM d, yyyy h:mm a');
  } catch {
    return isoString;
  }
}

/** Get relative time (e.g. "2 hours ago") */
export function getRelativeTime(isoString: string): string {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
  } catch {
    return isoString;
  }
}

/** Get status display info */
export function getStatusInfo(status: NoteStatus): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  const statusMap: Record<NoteStatus, { label: string; color: string; bgColor: string; icon: string }> = {
    recording: { label: 'Recording', color: '#D32F2F', bgColor: '#FFCDD2', icon: 'mic' },
    processing: { label: 'Processing', color: '#F57F17', bgColor: '#FFF8E1', icon: 'hourglass-empty' },
    draft: { label: 'Draft', color: '#1565C0', bgColor: '#E3F2FD', icon: 'edit' },
    reviewed: { label: 'Reviewed', color: '#7B1FA2', bgColor: '#F3E5F5', icon: 'check-circle' },
    finalized: { label: 'Finalized', color: '#2E7D32', bgColor: '#E8F5E9', icon: 'verified' },
    synced: { label: 'Synced to Epic', color: '#00897B', bgColor: '#E0F2F1', icon: 'cloud-done' },
  };
  return statusMap[status] || statusMap.draft;
}

/** Truncate text with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/** Generate a summary from SOAP note for list views */
export function generateNoteSummary(note: {
  subjective: { chiefComplaint: string };
  assessment: { primaryDiagnosis: string };
}): string {
  const cc = note.subjective.chiefComplaint;
  const dx = note.assessment.primaryDiagnosis;

  if (cc && dx) {
    return `CC: ${truncateText(cc, 50)} | Dx: ${truncateText(dx, 50)}`;
  }
  if (cc) return `CC: ${truncateText(cc, 100)}`;
  if (dx) return `Dx: ${truncateText(dx, 100)}`;
  return 'No summary available';
}

/** Convert SOAP note to plain text for export */
export function soapNoteToText(note: {
  patientName: string;
  encounterDate: string;
  subjective: Record<string, string>;
  objective: Record<string, string>;
  assessment: Record<string, string>;
  plan: Record<string, string>;
}): string {
  const sections = [
    `CLINICAL NOTE - ${note.patientName}`,
    `Date: ${formatDate(note.encounterDate)}`,
    '',
    '═══════════════════════════════════════',
    'SUBJECTIVE',
    '═══════════════════════════════════════',
    ...Object.entries(note.subjective)
      .filter(([_, v]) => v.trim())
      .map(([k, v]) => `${formatFieldLabel(k)}: ${v}`),
    '',
    '═══════════════════════════════════════',
    'OBJECTIVE',
    '═══════════════════════════════════════',
    ...Object.entries(note.objective)
      .filter(([_, v]) => v.trim())
      .map(([k, v]) => `${formatFieldLabel(k)}: ${v}`),
    '',
    '═══════════════════════════════════════',
    'ASSESSMENT',
    '═══════════════════════════════════════',
    ...Object.entries(note.assessment)
      .filter(([_, v]) => v.trim())
      .map(([k, v]) => `${formatFieldLabel(k)}: ${v}`),
    '',
    '═══════════════════════════════════════',
    'PLAN',
    '═══════════════════════════════════════',
    ...Object.entries(note.plan)
      .filter(([_, v]) => v.trim())
      .map(([k, v]) => `${formatFieldLabel(k)}: ${v}`),
  ];

  return sections.join('\n');
}

/** Convert camelCase field name to readable label */
function formatFieldLabel(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
