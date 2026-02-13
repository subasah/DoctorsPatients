import type { VisitDraft } from './types';

export type RootStackParamList = {
  Record: undefined;
  Note: { visit: VisitDraft };
  Export: { visit: VisitDraft };
};

