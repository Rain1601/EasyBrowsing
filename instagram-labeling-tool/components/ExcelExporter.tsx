"use client";

import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/excel";
import { Blogger, LabelingResult } from "@/types";
import { Download } from "lucide-react";

interface ExcelExporterProps {
  bloggers: Blogger[];
  results: Map<string, LabelingResult>;
}

export function ExcelExporter({ bloggers, results }: ExcelExporterProps) {
  const labeledCount = results.size;

  const handleExport = () => {
    exportToExcel(bloggers, results);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={bloggers.length === 0}
      variant="outline"
    >
      <Download className="w-4 h-4 mr-2" />
      Export ({labeledCount} labeled)
    </Button>
  );
}
