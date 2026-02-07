"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
        <p>Select a blogger from the list to start labeling</p>
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
            Blogger {currentIndex + 1} of {totalCount}
          </p>
          <p className="text-sm font-medium break-all">{blogger.link}</p>
          <Button onClick={handleOpenInstagram} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Instagram
          </Button>
        </div>

        {/* SHEIN style selector */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Does this blogger match SHEIN style?
          </Label>
          <RadioGroup value={matchesStyle} onValueChange={setMatchesStyle}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes" className="font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no" className="font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Reason selector */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Reason</Label>
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
          Previous
        </Button>
        <Button onClick={handleSaveAndNext}>
          {isLast ? "Save" : "Save & Next"}
          {!isLast && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
