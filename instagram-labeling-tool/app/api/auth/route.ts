import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer-core";
import path from "path";
import fs from "fs";
import os from "os";

const AUTH_DIR = path.join(process.cwd(), ".chrome-profile");

// 获取 Chrome 路径
function getChromePath(): string {
  const platform = os.platform();

  if (platform === "darwin") {
    const paths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else if (platform === "win32") {
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else {
    const paths = ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  }

  throw new Error("Chrome not found");
}

// 清理浏览器锁文件
function cleanupBrowserLocks() {
  const lockFiles = ["SingletonLock", "SingletonSocket", "SingletonCookie"];
  for (const file of lockFiles) {
    const lockPath = path.join(AUTH_DIR, file);
    try {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
      }
    } catch {
      // 忽略错误
    }
  }
}

// 全局浏览器实例（用于登录窗口）
let loginBrowser: Browser | null = null;

// 检查是否已配置登录状态
export async function GET() {
  const hasAuth = fs.existsSync(AUTH_DIR) && fs.readdirSync(AUTH_DIR).length > 0;

  // 检查是否有 Cookies 文件（更准确的登录检测）
  const cookiesPath = path.join(AUTH_DIR, "Default", "Cookies");
  const hasCookies = fs.existsSync(cookiesPath);

  return NextResponse.json({
    authenticated: hasAuth && hasCookies,
    hasProfile: hasAuth,
    loginBrowserOpen: loginBrowser !== null && loginBrowser.connected,
  });
}

// 启动/关闭登录浏览器
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "open-login") {
      // 如果已经有登录窗口打开，返回提示
      if (loginBrowser && loginBrowser.connected) {
        return NextResponse.json({
          success: true,
          message: "登录窗口已打开，请在浏览器中完成登录",
          alreadyOpen: true,
        });
      }

      // 清理锁文件
      cleanupBrowserLocks();

      // 确保目录存在
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const chromePath = getChromePath();

      // 启动可见的浏览器
      loginBrowser = await puppeteer.launch({
        executablePath: chromePath,
        headless: false,
        userDataDir: AUTH_DIR,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--start-maximized",
        ],
        defaultViewport: null,
      });

      const page = await loginBrowser.newPage();
      await page.goto("https://www.instagram.com/accounts/login/");

      // 监听浏览器关闭
      loginBrowser.on("disconnected", () => {
        loginBrowser = null;
      });

      return NextResponse.json({
        success: true,
        message: "浏览器已打开，请登录 Instagram。登录完成后关闭浏览器窗口即可。",
      });
    }

    if (action === "close-login") {
      if (loginBrowser && loginBrowser.connected) {
        await loginBrowser.close();
        loginBrowser = null;
      }
      return NextResponse.json({ success: true, message: "登录窗口已关闭" });
    }

    if (action === "check-status") {
      return NextResponse.json({
        loginBrowserOpen: loginBrowser !== null && loginBrowser.connected,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "操作失败" },
      { status: 500 }
    );
  }
}

// 清除登录状态
export async function DELETE() {
  try {
    // 先关闭登录浏览器
    if (loginBrowser && loginBrowser.connected) {
      await loginBrowser.close();
      loginBrowser = null;
    }

    // 清理锁文件
    cleanupBrowserLocks();

    // 删除配置目录
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }

    return NextResponse.json({ success: true, message: "登录状态已清除" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "清除失败" },
      { status: 500 }
    );
  }
}
