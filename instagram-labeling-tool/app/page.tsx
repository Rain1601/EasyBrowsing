"use client";

import { useState, useCallback, useEffect } from "react";
import { ExcelImporter } from "@/components/ExcelImporter";
import { ExcelExporter } from "@/components/ExcelExporter";
import { BloggerList } from "@/components/BloggerList";
import { LabelingPanel } from "@/components/LabelingPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginForm } from "@/components/LoginForm";
import { PlatformLogin } from "@/components/PlatformLogin";
import { BatchScreenshot } from "@/components/BatchScreenshot";
import { BatchLabeling } from "@/components/BatchLabeling";
import { Button } from "@/components/ui/button";
import { Blogger, LabelingResult, ScreenshotMeta } from "@/types";
import { Trash2, LogOut } from "lucide-react";

const STORAGE_KEY = "instagram-labeling-session";

interface SessionData {
  bloggers: Blogger[];
  results: [string, LabelingResult][];
  currentIndex: number;
  savedAt: string;
}

function loadSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function saveSession(data: SessionData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export default function Home() {
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Map<string, LabelingResult>>(new Map());
  const [screenshotMeta, setScreenshotMeta] = useState<ScreenshotMeta>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // 检查登录状态
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/login");
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // 加载截图元数据
  const loadScreenshotMeta = useCallback(async () => {
    try {
      const response = await fetch("/api/screenshot?all=true");
      const data = await response.json();
      if (data.screenshots) {
        setScreenshotMeta(data.screenshots);
      }
    } catch {
      // 忽略错误
    }
  }, []);

  // 加载保存的会话数据
  useEffect(() => {
    if (!isAuthenticated) return;

    const session = loadSession();
    if (session && session.bloggers.length > 0) {
      setBloggers(session.bloggers);
      setResults(new Map(session.results));
      setCurrentIndex(session.currentIndex);
    }
    setIsLoaded(true);

    // 加载截图元数据
    loadScreenshotMeta();
  }, [isAuthenticated, loadScreenshotMeta]);

  // 自动保存会话数据
  useEffect(() => {
    if (!isLoaded) return;

    const sessionData: SessionData = {
      bloggers,
      results: Array.from(results.entries()),
      currentIndex,
      savedAt: new Date().toISOString(),
    };
    saveSession(sessionData);
  }, [bloggers, results, currentIndex, isLoaded]);

  const handleImport = useCallback((importedBloggers: Blogger[]) => {
    setBloggers(importedBloggers);
    setCurrentIndex(0);
    setResults(new Map());
    // 导入新数据时清除旧缓存
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleClearSession = useCallback(() => {
    if (window.confirm("确定要清除所有数据吗？此操作不可撤销。")) {
      setBloggers([]);
      setCurrentIndex(0);
      setResults(new Map());
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/login", { method: "DELETE" });
      setIsAuthenticated(false);
    } catch {
      // 忽略错误
    }
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

  const handleScreenshotUpdate = useCallback(() => {
    // 刷新截图元数据
    loadScreenshotMeta();
  }, [loadScreenshotMeta]);

  const handleBatchLabel = useCallback((newResults: LabelingResult[]) => {
    setResults((prev) => {
      const updated = new Map(prev);
      for (const result of newResults) {
        updated.set(result.bloggerId, result);
      }
      return updated;
    });
  }, []);

  const currentBlogger = bloggers[currentIndex] || null;
  const labeledCount = results.size;

  // 加载中
  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 未登录
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Blogger Labeling Tool</h1>
          {bloggers.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {labeledCount} / {bloggers.length} labeled
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ExcelImporter onImport={handleImport} />
          <ExcelExporter bloggers={bloggers} results={results} />
          {bloggers.length > 0 && (
            <>
              <BatchLabeling
                bloggers={bloggers}
                results={results}
                onBatchLabel={handleBatchLabel}
              />
              <BatchScreenshot
                bloggers={bloggers}
                screenshotMeta={screenshotMeta}
                onComplete={handleScreenshotUpdate}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSession}
                title="清除数据"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <PlatformLogin onLoginComplete={handleScreenshotUpdate} />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="退出登录"
            className="text-muted-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
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
            screenshotMeta={screenshotMeta}
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
            onScreenshotUpdate={handleScreenshotUpdate}
          />
        </section>
      </main>
    </div>
  );
}
