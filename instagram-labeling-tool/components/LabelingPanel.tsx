"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ReasonSelector } from "@/components/ReasonSelector";
import { Blogger, LabelingResult } from "@/types";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

interface LabelingPanelProps {
  blogger: Blogger | null;
  currentIndex: number;
  totalCount: number;
  existingResult: LabelingResult | undefined;
  onSave: (result: LabelingResult) => void;
  onPrevious: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function LabelingPanel({
  blogger,
  currentIndex,
  totalCount,
  existingResult,
  onSave,
  onPrevious,
  onNext,
  isFirst,
  isLast,
}: LabelingPanelProps) {
  const [matchesStyle, setMatchesStyle] = useState<string>("no");
  const [reasons, setReasons] = useState<string[]>([]);

  useEffect(() => {
    if (existingResult) {
      setMatchesStyle(existingResult.matchesSheinStyle ? "yes" : "no");
      setReasons(existingResult.reasons || []);
    } else {
      setMatchesStyle("no");
      setReasons([]);
    }
  }, [existingResult, blogger?.id]);

  if (!blogger) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>从左侧列表选择博主开始标注</p>
      </div>
    );
  }

  const handleOpenInstagram = () => {
    window.open(blogger.link, "_blank", "noopener,noreferrer");
  };

  const handleSaveAndNext = () => {
    const result: LabelingResult = {
      bloggerId: blogger.id,
      matchesSheinStyle: matchesStyle === "yes",
      reasons,
    };
    onSave(result);
    if (!isLast) {
      onNext();
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex-1 space-y-6">
        {/* Current blogger info */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            博主 {currentIndex + 1} / {totalCount}
          </p>
          <p className="text-sm font-medium break-all">{blogger.link}</p>
          <Button onClick={handleOpenInstagram} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            打开 Instagram
          </Button>
        </div>

        {/* SHEIN style selector */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            是否符合 SHEIN 风格？
          </Label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMatchesStyle("yes")}
              className={`
                flex-1 py-3 px-6 rounded-lg text-base font-medium
                border-2 transition-all
                ${matchesStyle === "yes"
                  ? "bg-green-500/20 border-green-500 text-green-600 dark:text-green-400"
                  : "bg-background hover:bg-muted border-border"
                }
              `}
            >
              ✓ 是
            </button>
            <button
              type="button"
              onClick={() => setMatchesStyle("no")}
              className={`
                flex-1 py-3 px-6 rounded-lg text-base font-medium
                border-2 transition-all
                ${matchesStyle === "no"
                  ? "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400"
                  : "bg-background hover:bg-muted border-border"
                }
              `}
            >
              ✗ 否
            </button>
          </div>
        </div>

        {/* Reason selector */}
        <div className="space-y-3">
          <Label className="text-base font-medium">原因标签</Label>
          <ReasonSelector value={reasons} onChange={setReasons} />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          上一个
        </Button>
        <Button onClick={handleSaveAndNext}>
          {isLast ? "保存" : "保存并继续"}
          {!isLast && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
