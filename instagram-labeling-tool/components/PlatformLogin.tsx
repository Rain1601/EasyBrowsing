"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LogIn, Check, Loader2 } from "lucide-react";
import { Platform } from "@/types";

interface PlatformStatus {
  authenticated: boolean;
  loginBrowserOpen: boolean;
}

interface PlatformLoginProps {
  onLoginComplete?: () => void;
}

export function PlatformLogin({ onLoginComplete }: PlatformLoginProps) {
  const [status, setStatus] = useState<{ [key in Platform]: PlatformStatus }>({
    instagram: { authenticated: false, loginBrowserOpen: false },
    youtube: { authenticated: false, loginBrowserOpen: false },
  });
  const [loading, setLoading] = useState<Platform | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/auth");
      const data = await response.json();
      if (data.allPlatforms) {
        setStatus(data.allPlatforms);
      }
    } catch {
      // 忽略错误
    }
  };

  useEffect(() => {
    fetchStatus();
    // 定期检查状态
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (platform: Platform) => {
    setLoading(platform);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "open-login", platform }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchStatus();
      }
    } catch {
      // 忽略错误
    } finally {
      setLoading(null);
    }
  };

  const handleCloseLogin = async (platform: Platform) => {
    setLoading(platform);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close-login", platform }),
      });
      await fetchStatus();
      onLoginComplete?.();
    } catch {
      // 忽略错误
    } finally {
      setLoading(null);
    }
  };

  const platforms: { key: Platform; name: string; icon: string }[] = [
    { key: "instagram", name: "Instagram", icon: "📷" },
    { key: "youtube", name: "YouTube", icon: "▶️" },
  ];

  const authenticatedCount = Object.values(status).filter((s) => s.authenticated).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LogIn className="w-4 h-4" />
          平台登录
          {authenticatedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
              {authenticatedCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {platforms.map((platform) => {
          const platformStatus = status[platform.key];
          const isLoading = loading === platform.key;

          return (
            <div key={platform.key}>
              <div className="px-2 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{platform.icon}</span>
                  <span className="font-medium">{platform.name}</span>
                  {platformStatus.authenticated && (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <Check className="w-3 h-3" />
                      已登录
                    </span>
                  )}
                </div>
                {platformStatus.loginBrowserOpen ? (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleCloseLogin(platform.key)}
                    disabled={isLoading}
                    className="h-7 text-xs"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "完成登录"
                    )}
                  </Button>
                ) : platformStatus.authenticated ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleLogin(platform.key)}
                    disabled={isLoading}
                    className="h-7 text-xs text-muted-foreground"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "重新登录"
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLogin(platform.key)}
                    disabled={isLoading}
                    className="h-7 text-xs"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "登录"
                    )}
                  </Button>
                )}
              </div>
              {platform.key !== "youtube" && <DropdownMenuSeparator />}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
