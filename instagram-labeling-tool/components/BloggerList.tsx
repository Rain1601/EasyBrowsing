"use client";

import { Blogger, LabelingResult, ScreenshotMeta } from "@/types";
import { CheckCircle2, Circle, Camera, CameraOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface BloggerListProps {
  bloggers: Blogger[];
  currentIndex: number;
  results: Map<string, LabelingResult>;
  screenshotMeta: ScreenshotMeta;
  onSelect: (index: number) => void;
}

export function BloggerList({
  bloggers,
  currentIndex,
  results,
  screenshotMeta,
  onSelect,
}: BloggerListProps) {
  if (bloggers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Import an Excel file to start labeling</p>
      </div>
    );
  }

  const getDisplayName = (link: string) => {
    try {
      const url = new URL(link);
      const pathname = url.pathname.replace(/\/$/, "");
      return pathname.split("/").pop() || link;
    } catch {
      return link;
    }
  };

  const getUsername = (link: string) => {
    try {
      const url = new URL(link);
      const pathParts = url.pathname.split("/").filter(Boolean);
      return pathParts[0] || "unknown";
    } catch {
      return "unknown";
    }
  };

  const hasScreenshot = (link: string) => {
    const username = getUsername(link);
    return !!screenshotMeta[username];
  };

  // 统计
  const labeledCount = bloggers.filter((b) => results.has(b.id)).length;
  const screenshotCount = bloggers.filter((b) => hasScreenshot(b.link)).length;

  return (
    <div className="h-full flex flex-col">
      {/* 统计信息 */}
      <div className="p-2 border-b text-xs text-muted-foreground flex gap-3">
        <span>已标注: {labeledCount}/{bloggers.length}</span>
        <span>已截图: {screenshotCount}/{bloggers.length}</span>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2">
          {bloggers.map((blogger, index) => {
            const isLabeled = results.has(blogger.id);
            const isCurrent = index === currentIndex;
            const hasShot = hasScreenshot(blogger.link);

            return (
              <li key={blogger.id}>
                <button
                  onClick={() => onSelect(index)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {isLabeled ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground flex-shrink-0">
                    {index + 1}.
                  </span>
                  <span className="truncate flex-1">{getDisplayName(blogger.link)}</span>
                  {/* 截图状态标签 */}
                  {hasShot ? (
                    <span className={cn(
                      "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded",
                      isCurrent
                        ? "bg-green-500/30 text-green-200"
                        : "bg-green-500/20 text-green-600 dark:text-green-400"
                    )}>
                      <Camera className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className={cn(
                      "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded",
                      isCurrent
                        ? "bg-muted-foreground/30 text-muted"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <CameraOff className="w-3 h-3" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
