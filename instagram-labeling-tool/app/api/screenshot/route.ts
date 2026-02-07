import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer-core";
import path from "path";
import fs from "fs";
import os from "os";

const AUTH_DIR = path.join(process.cwd(), ".chrome-profile");
const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots");

// 确保目录存在
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

// 获取 Chrome 可执行路径
function getChromePath(): string {
  const platform = os.platform();

  if (platform === "darwin") {
    // macOS
    const paths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else if (platform === "win32") {
    // Windows
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  } else {
    // Linux
    const paths = [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
  }

  throw new Error("Chrome not found. Please install Google Chrome.");
}

// 全局浏览器实例
let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser && browser.connected) {
    return browser;
  }

  const chromePath = getChromePath();

  browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    userDataDir: AUTH_DIR, // 使用持久化配置目录保存登录状态
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  return browser;
}

// 从 URL 提取用户名作为文件名
function extractUsername(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    return pathParts[0] || "unknown";
  } catch {
    return `screenshot-${Date.now()}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    try {
      // 设置视口大小
      await page.setViewport({ width: 1280, height: 800 });

      // 设置 User-Agent
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // 导航到页面
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // 等待页面加载
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 生成文件名
      const username = extractUsername(url);
      const filename = `${username}.png`;
      const filepath = path.join(SCREENSHOTS_DIR, filename);

      // 截图
      await page.screenshot({
        path: filepath,
        fullPage: false,
      });

      await page.close();

      return NextResponse.json({
        success: true,
        path: `/screenshots/${filename}`,
        username,
      });
    } catch (pageError) {
      await page.close();
      throw pageError;
    }
  } catch (error) {
    console.error("Screenshot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Screenshot failed" },
      { status: 500 }
    );
  }
}

// 获取截图状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (username) {
    const filepath = path.join(SCREENSHOTS_DIR, `${username}.png`);
    const exists = fs.existsSync(filepath);

    return NextResponse.json({
      exists,
      path: exists ? `/screenshots/${username}.png` : null,
    });
  }

  // 返回所有截图
  const files = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith(".png"));
  return NextResponse.json({ screenshots: files });
}
