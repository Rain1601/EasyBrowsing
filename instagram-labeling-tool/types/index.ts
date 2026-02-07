export interface Blogger {
  id: string;
  link: string;
}

export interface LabelingResult {
  bloggerId: string;
  matchesSheinStyle: boolean;
  reason: string;
}

export interface ReasonOption {
  value: string;
  label: string;
  isDefault: boolean;
}

export const DEFAULT_REASONS: ReasonOption[] = [
  { value: "style-mismatch", label: "Style mismatch", isDefault: true },
  { value: "low-engagement", label: "Low engagement", isDefault: true },
  { value: "content-quality", label: "Content quality", isDefault: true },
  { value: "other", label: "Other", isDefault: true },
];
