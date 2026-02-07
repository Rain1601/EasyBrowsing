import { ReasonOption, DEFAULT_REASONS } from "@/types";

const CUSTOM_REASONS_KEY = "instagram-labeling-custom-reasons";

export function getCustomReasons(): ReasonOption[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(CUSTOM_REASONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

export function saveCustomReasons(reasons: ReasonOption[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(CUSTOM_REASONS_KEY, JSON.stringify(reasons));
  } catch {
    // Ignore storage errors
  }
}

export function getAllReasons(): ReasonOption[] {
  return [...DEFAULT_REASONS, ...getCustomReasons()];
}

export function addCustomReason(label: string): ReasonOption[] {
  const customReasons = getCustomReasons();
  const newReason: ReasonOption = {
    value: `custom-${Date.now()}`,
    label,
    isDefault: false,
  };
  const updated = [...customReasons, newReason];
  saveCustomReasons(updated);
  return updated;
}

export function isDuplicateReason(label: string): boolean {
  const allReasons = getAllReasons();
  return allReasons.some(
    (r) => r.label.toLowerCase() === label.toLowerCase()
  );
}

export function removeCustomReason(label: string): void {
  const customReasons = getCustomReasons();
  const updated = customReasons.filter(r => r.label !== label);
  saveCustomReasons(updated);
}
