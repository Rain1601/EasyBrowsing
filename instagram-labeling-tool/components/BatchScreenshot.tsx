"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { Blogger, ScreenshotMeta } from "@/types";
import { toast } from "sonner";

interface BatchScreenshotProps {
  bloggers: Blogger[];
  screenshotMeta: ScreenshotMeta;
  onComplete: () => void;
}

export function BatchScreenshot({
  bloggers,
  screenshotMeta,
  onComplete,
}: BatchScreenshotProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, username: "" });
  const abortRef = useRef(false);

  const getUsername = (link: string) => {
    try {
      const url = new URL(link);
      const pathParts = url.pathname.split("/").filter(Boolean);
      return pathParts[0] || "unknown";
    } catch {
      return "unknown";
    }
  };

  // 筛选出未截图的博主
  const unscreenedBloggers = bloggers.filter((b) => {
    const username = getUsername(b.link);
    return !screenshotMeta[username];
  });

  const handleStop = () => {
    abortRef.current = true;
    toast.info("正在停止批量截图...");
  };

  const handleBatchScreenshot = async () => {
    if (unscreenedBloggers.length === 0) {
      toast.info("没有需要截图的博主");
      return;
    }

    setIsRunning(true);
    abortRef.current = false;
    const total = unscreenedBloggers.length;
    let successCount = 0;
    let failCount = 0;

    // 显示开始通知
    toast.info(`开始批量截图 (${total} 个博主)`, {
      description: "截图将在后台进行，完成后会通知您",
    });

    // 逐个截图（避免并发导致的问题）
    for (let i = 0; i < total; i++) {
      if (abortRef.current) {
        break;
      }

      const blogger = unscreenedBloggers[i];
      const username = getUsername(blogger.link);
      setProgress({ current: i + 1, total, username });

      try {
        const response = await fetch("/api/screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: blogger.link }),
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      // 小延迟，避免请求过快
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    setProgress({ current: 0, total: 0, username: "" });
    onComplete();

    // 显示完成通知
    if (abortRef.current) {
      toast.warning("批量截图已停止", {
        description: `已完成 ${successCount} 个，失败 ${failCount} 个`,
      });
    } else if (failCount === 0) {
      toast.success("批量截图完成", {
        description: `成功截取 ${successCount} 个博主页面`,
      });
    } else {
      toast.warning("批量截图完成", {
        description: `成功 ${successCount} 个，失败 ${failCount} 个`,
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isRunning ? (
        <>
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Loader2 className="w-4 h-4 animate-spin" />
            {progress.current}/{progress.total}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleStop}>
            <X className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleBatchScreenshot}
          disabled={unscreenedBloggers.length === 0}
        >
          <Camera className="w-4 h-4" />
          批量截图
          {unscreenedBloggers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400">
              {unscreenedBloggers.length}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
