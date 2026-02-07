"use client";

import { useRef, useState } from "react";
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
import { parseExcelFile, extractLinksFromColumn, isValidExcelFile, ParsedExcel } from "@/lib/excel";
import { Blogger } from "@/types";
import { Upload } from "lucide-react";

interface ExcelImporterProps {
  onImport: (bloggers: Blogger[]) => void;
}

export function ExcelImporter({ onImport }: ExcelImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedExcel | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidExcelFile(file)) {
      setError("Please select a valid Excel file (.xlsx or .xls)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const parsed = await parseExcelFile(file);
      setParsedData(parsed);
      setSelectedColumn("");
      setIsDialogOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirm = () => {
    if (!parsedData || selectedColumn === "") return;

    const columnIndex = parseInt(selectedColumn, 10);
    const bloggers = extractLinksFromColumn(parsedData.data, columnIndex);

    if (bloggers.length === 0) {
      setError("No valid links found in the selected column");
      return;
    }

    onImport(bloggers);
    setIsDialogOpen(false);
    setParsedData(null);
    setSelectedColumn("");
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setParsedData(null);
    setSelectedColumn("");
    setError("");
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        variant="outline"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isLoading ? "Loading..." : "Import"}
      </Button>

      {error && !isDialogOpen && (
        <span className="text-red-500 text-sm ml-2">{error}</span>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Link Column</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select the column that contains Instagram profile links:
            </p>

            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {parsedData?.headers.map((header, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {header || `Column ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}

            {selectedColumn !== "" && parsedData && (
              <p className="text-sm text-muted-foreground mt-4">
                Found {extractLinksFromColumn(parsedData.data, parseInt(selectedColumn, 10)).length} links
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={selectedColumn === ""}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
