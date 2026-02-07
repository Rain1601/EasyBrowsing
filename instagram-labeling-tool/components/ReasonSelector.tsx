"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReasonOption, DEFAULT_REASONS } from "@/types";
import { getCustomReasons, addCustomReason, isDuplicateReason } from "@/lib/storage";
import { Plus } from "lucide-react";

interface ReasonSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReasonSelector({ value, onChange }: ReasonSelectorProps) {
  const [reasons, setReasons] = useState<ReasonOption[]>(DEFAULT_REASONS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const customReasons = getCustomReasons();
    setReasons([...DEFAULT_REASONS, ...customReasons]);
  }, []);

  const handleAddReason = () => {
    const trimmed = newReason.trim();

    if (!trimmed) {
      setError("Please enter a reason");
      return;
    }

    if (isDuplicateReason(trimmed)) {
      setError("This reason already exists");
      return;
    }

    const updatedCustom = addCustomReason(trimmed);
    setReasons([...DEFAULT_REASONS, ...updatedCustom]);
    onChange(updatedCustom[updatedCustom.length - 1].value);
    setIsDialogOpen(false);
    setNewReason("");
    setError("");
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setNewReason("");
    setError("");
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select a reason" />
        </SelectTrigger>
        <SelectContent>
          {reasons.map((reason) => (
            <SelectItem key={reason.value} value={reason.value}>
              {reason.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus className="w-4 h-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Reason</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newReason">Reason</Label>
              <Input
                id="newReason"
                value={newReason}
                onChange={(e) => {
                  setNewReason(e.target.value);
                  setError("");
                }}
                placeholder="Enter a new reason"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddReason();
                  }
                }}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleAddReason}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
