import * as SecureStore from "expo-secure-store";

import type { EpicIntegrationConfig } from "../types/clinical";

const EPIC_CONFIG_KEY = "epic-integration-config-v1";

export async function loadEpicConfig(): Promise<EpicIntegrationConfig | null> {
  const rawValue = await SecureStore.getItemAsync(EPIC_CONFIG_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<EpicIntegrationConfig>;
    return {
      baseUrl: parsed.baseUrl ?? "",
      accessToken: parsed.accessToken ?? "",
      patientId: parsed.patientId ?? "",
      encounterId: parsed.encounterId ?? "",
      practitionerId: parsed.practitionerId ?? "",
    };
  } catch (error) {
    console.warn("Could not parse saved Epic configuration.", error);
    return null;
  }
}

export async function saveEpicConfig(config: EpicIntegrationConfig): Promise<void> {
  await SecureStore.setItemAsync(EPIC_CONFIG_KEY, JSON.stringify(config));
}
