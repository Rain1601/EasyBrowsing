export interface Blogger {
  id: string;
  link: string;
  hasScreenshot?: boolean;
  screenshotPath?: string;
  screenshotTimestamp?: number;
}

export interface ScreenshotMeta {
  [username: string]: {
    timestamp: number;
    path: string;
    platform: string;
  };
}

export type Platform = "instagram" | "youtube";

export interface LabelingResult {
  bloggerId: string;
  matchesSheinStyle: boolean;
  reasons: string[];  // 支持多选，存储标签文本
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
