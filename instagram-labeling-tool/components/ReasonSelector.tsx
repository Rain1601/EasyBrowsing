"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_REASONS } from "@/types";
import { getCustomReasons, addCustomReason, removeCustomReason, isDuplicateReason } from "@/lib/storage";
import { Plus, X } from "lucide-react";

interface ReasonSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ReasonSelector({ value, onChange }: ReasonSelectorProps) {
  const [defaultLabels] = useState(() => DEFAULT_REASONS.map(r => r.label));
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [newReason, setNewReason] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const custom = getCustomReasons();
    setCustomLabels(custom.map(r => r.label));
  }, []);

  const allLabels = [...defaultLabels, ...customLabels];

  const toggleReason = (label: string) => {
    if (value.includes(label)) {
      onChange(value.filter(v => v !== label));
    } else {
      onChange([...value, label]);
    }
  };

  const handleAddReason = () => {
    const trimmed = newReason.trim();
    if (!trimmed) return;

    if (isDuplicateReason(trimmed)) {
      return;
    }

    addCustomReason(trimmed);
    setCustomLabels(prev => [...prev, trimmed]);
    onChange([...value, trimmed]);
    setNewReason("");
    setIsAdding(false);
  };

  const handleDeleteCustom = (label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeCustomReason(label);
    setCustomLabels(prev => prev.filter(l => l !== label));
    onChange(value.filter(v => v !== label));
  };

  const isCustom = (label: string) => customLabels.includes(label);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {allLabels.map((label) => {
          const isSelected = value.includes(label);
          const custom = isCustom(label);

          return (
            <button
              key={label}
              type="button"
              onClick={() => toggleReason(label)}
              className={`
                inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm
                border transition-colors
                ${isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
                }
              `}
            >
              {label}
              {custom && (
                <X
                  className="w-3 h-3 ml-1 hover:text-destructive"
                  onClick={(e) => handleDeleteCustom(label, e)}
                />
              )}
            </button>
          );
        })}

        {isAdding ? (
          <div className="flex items-center gap-1">
            <Input
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="输入标签"
              className="h-8 w-32 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddReason();
                } else if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewReason("");
                }
              }}
              onBlur={() => {
                if (!newReason.trim()) {
                  setIsAdding(false);
                }
              }}
            />
            <Button size="sm" variant="ghost" className="h-8 px-2" onClick={handleAddReason}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-3 h-3" />
            添加
          </button>
        )}
      </div>
    </div>
  );
}
