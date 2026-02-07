"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ReasonSelector } from "@/components/ReasonSelector";
import { Blogger, LabelingResult } from "@/types";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Camera,
  Loader2,
  RefreshCw,
  ImageOff,
  LogIn,
} from "lucide-react";
import Image from "next/image";

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

// 从 URL 提取用户名
function extractUsername(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    return pathParts[0] || "unknown";
  } catch {
    return "unknown";
  }
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
  const [screenshotPath, setScreenshotPath] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [isOpeningLogin, setIsOpeningLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  // 重置状态当 blogger 改变时
  useEffect(() => {
    if (existingResult) {
      setMatchesStyle(existingResult.matchesSheinStyle ? "yes" : "no");
      setReasons(existingResult.reasons || []);
    } else {
      setMatchesStyle("no");
      setReasons([]);
    }

    // 检查是否已有截图
    if (blogger) {
      const username = extractUsername(blogger.link);
      setScreenshotPath(null);
      setScreenshotError(null);

      // 检查截图是否存在
      fetch(`/api/screenshot?username=${username}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.exists && data.path) {
            setScreenshotPath(data.path + `?t=${Date.now()}`);
          }
        })
        .catch(() => {
          // 忽略错误
        });
    }
  }, [existingResult, blogger?.id, blogger?.link, blogger]);

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

  const handleCaptureScreenshot = async () => {
    setIsCapturing(true);
    setScreenshotError(null);

    try {
      const response = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: blogger.link }),
      });

      const data = await response.json();

      if (data.success && data.path) {
        setScreenshotPath(data.path + `?t=${Date.now()}`);
      } else {
        setScreenshotError(data.error || "截图失败");
      }
    } catch (error) {
      setScreenshotError(error instanceof Error ? error.message : "截图失败");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleOpenLogin = async () => {
    setIsOpeningLogin(true);
    setLoginMessage(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "open-login" }),
      });

      const data = await response.json();

      if (data.success) {
        setLoginMessage(data.message);
        setScreenshotError(null);
      } else {
        setLoginMessage(data.error || "打开登录窗口失败");
      }
    } catch (error) {
      setLoginMessage(error instanceof Error ? error.message : "操作失败");
    } finally {
      setIsOpeningLogin(false);
    }
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
    <div className="h-full flex">
      {/* 左侧面板 - 标注表单 */}
      <div className="w-1/2 flex flex-col p-6 border-r overflow-y-auto">
        <div className="flex-1 space-y-6">
          {/* 博主信息 */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              博主 {currentIndex + 1} / {totalCount}
            </p>
            <p className="text-sm font-medium break-all">{blogger.link}</p>
            <div className="flex gap-2">
              <Button onClick={handleOpenInstagram} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                打开 Instagram
              </Button>
              <Button
                onClick={handleCaptureScreenshot}
                variant="outline"
                size="sm"
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                {isCapturing ? "截图中..." : "截取页面"}
              </Button>
            </div>
          </div>

          {/* SHEIN 风格选择 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">是否符合 SHEIN 风格？</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMatchesStyle("yes")}
                className={`
                  flex-1 py-3 px-6 rounded-lg text-base font-medium
                  border-2 transition-all
                  ${
                    matchesStyle === "yes"
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
                  ${
                    matchesStyle === "no"
                      ? "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400"
                      : "bg-background hover:bg-muted border-border"
                  }
                `}
              >
                ✗ 否
              </button>
            </div>
          </div>

          {/* 原因标签 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">原因标签</Label>
            <ReasonSelector value={reasons} onChange={setReasons} />
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            上一个
          </Button>
          <Button onClick={handleSaveAndNext}>
            {isLast ? "保存" : "保存并继续"}
            {!isLast && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>

      {/* 右侧面板 - 截图预览 */}
      <div className="w-1/2 flex flex-col bg-muted/20">
        <div className="p-3 border-b flex items-center justify-between">
          <span className="text-sm font-medium">页面预览</span>
          {screenshotPath && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCaptureScreenshot}
              disabled={isCapturing}
            >
              <RefreshCw className={`w-4 h-4 ${isCapturing ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>

        <div className="flex-1 relative overflow-auto">
          {isCapturing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">正在截取页面...</p>
            </div>
          )}

          {screenshotError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <ImageOff className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-destructive mb-2">{screenshotError}</p>
              {loginMessage ? (
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  {loginMessage}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  可能需要先登录 Instagram
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleOpenLogin}
                  variant="default"
                  disabled={isOpeningLogin}
                >
                  {isOpeningLogin ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  {isOpeningLogin ? "打开中..." : "登录 Instagram"}
                </Button>
                <Button onClick={handleOpenInstagram} variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  手动打开
                </Button>
              </div>
            </div>
          )}

          {!screenshotPath && !isCapturing && !screenshotError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <Camera className="w-12 h-12 text-muted-foreground mb-4" />
              {loginMessage ? (
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  {loginMessage}
                </p>
              ) : (
                <p className="text-muted-foreground mb-4">点击「截取页面」按钮获取截图</p>
              )}
              <div className="flex gap-2">
                <Button onClick={handleCaptureScreenshot} variant="default">
                  <Camera className="w-4 h-4 mr-2" />
                  截取页面
                </Button>
                <Button
                  onClick={handleOpenLogin}
                  variant="outline"
                  disabled={isOpeningLogin}
                >
                  {isOpeningLogin ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  登录
                </Button>
              </div>
            </div>
          )}

          {screenshotPath && !isCapturing && (
            <div className="p-4">
              <Image
                src={screenshotPath}
                alt="Instagram 页面截图"
                width={1280}
                height={800}
                className="w-full h-auto rounded-lg shadow-lg"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
