import * as XLSX from "xlsx";
import { Blogger, LabelingResult } from "@/types";

export interface ParsedExcel {
  headers: string[];
  data: string[][];
}

export function parseExcelFile(file: File): Promise<ParsedExcel> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        const workbook = XLSX.read(fileData, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(firstSheet, {
          header: 1,
        });

        if (jsonData.length === 0) {
          reject(new Error("Excel file is empty"));
          return;
        }

        const headers = jsonData[0].map((h) => String(h || ""));
        const rows = jsonData.slice(1).map((row) =>
          row.map((cell) => String(cell || ""))
        );

        resolve({ headers, data: rows });
      } catch {
        reject(new Error("Failed to parse Excel file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });
}

export function extractLinksFromColumn(
  data: string[][],
  columnIndex: number
): Blogger[] {
  const bloggers: Blogger[] = [];

  data.forEach((row, index) => {
    const link = row[columnIndex]?.trim();
    if (link && link.length > 0) {
      bloggers.push({
        id: `blogger-${index}`,
        link,
      });
    }
  });

  return bloggers;
}

export function exportToExcel(
  bloggers: Blogger[],
  results: Map<string, LabelingResult>
): void {
  const data = bloggers.map((blogger) => {
    const result = results.get(blogger.id);
    return {
      "Blogger Link": blogger.link,
      "Matches SHEIN Style": result ? (result.matchesSheinStyle ? "Yes" : "No") : "",
      Reason: result?.reasons?.join(", ") || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Labeling Results");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  XLSX.writeFile(workbook, `labeling-results-${timestamp}.xlsx`);
}

export function isValidExcelFile(file: File): boolean {
  const validExtensions = [".xlsx", ".xls"];
  const fileName = file.name.toLowerCase();
  return validExtensions.some((ext) => fileName.endsWith(ext));
}
