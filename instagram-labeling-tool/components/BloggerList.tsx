"use client";

import { Blogger, LabelingResult } from "@/types";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BloggerListProps {
  bloggers: Blogger[];
  currentIndex: number;
  results: Map<string, LabelingResult>;
  onSelect: (index: number) => void;
}

export function BloggerList({
  bloggers,
  currentIndex,
  results,
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

  return (
    <div className="h-full overflow-y-auto">
      <ul className="space-y-1 p-2">
        {bloggers.map((blogger, index) => {
          const isLabeled = results.has(blogger.id);
          const isCurrent = index === currentIndex;

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
                <span className="truncate">{getDisplayName(blogger.link)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
