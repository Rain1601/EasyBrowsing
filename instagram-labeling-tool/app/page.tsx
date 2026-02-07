"use client";

import { useState, useCallback } from "react";
import { ExcelImporter } from "@/components/ExcelImporter";
import { ExcelExporter } from "@/components/ExcelExporter";
import { BloggerList } from "@/components/BloggerList";
import { LabelingPanel } from "@/components/LabelingPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Blogger, LabelingResult } from "@/types";

export default function Home() {
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Map<string, LabelingResult>>(new Map());

  const handleImport = useCallback((importedBloggers: Blogger[]) => {
    setBloggers(importedBloggers);
    setCurrentIndex(0);
    setResults(new Map());
  }, []);

  const handleSelectBlogger = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleSaveResult = useCallback((result: LabelingResult) => {
    setResults((prev) => {
      const newResults = new Map(prev);
      newResults.set(result.bloggerId, result);
      return newResults;
    });
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(bloggers.length - 1, prev + 1));
  }, [bloggers.length]);

  const currentBlogger = bloggers[currentIndex] || null;
  const labeledCount = results.size;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Instagram Blogger Labeling</h1>
          {bloggers.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {labeledCount} / {bloggers.length} labeled
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ExcelImporter onImport={handleImport} />
          <ExcelExporter bloggers={bloggers} results={results} />
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left panel - Blogger list */}
        <aside className="w-80 border-r bg-muted/30 overflow-hidden">
          <BloggerList
            bloggers={bloggers}
            currentIndex={currentIndex}
            results={results}
            onSelect={handleSelectBlogger}
          />
        </aside>

        {/* Right panel - Labeling panel */}
        <section className="flex-1 overflow-hidden">
          <LabelingPanel
            blogger={currentBlogger}
            currentIndex={currentIndex}
            totalCount={bloggers.length}
            existingResult={currentBlogger ? results.get(currentBlogger.id) : undefined}
            onSave={handleSaveResult}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isFirst={currentIndex === 0}
            isLast={currentIndex === bloggers.length - 1}
          />
        </section>
      </main>
    </div>
  );
}
