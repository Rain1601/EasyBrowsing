import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer-core";
import path from "path";
import fs from "fs";
import os from "os";

// 不同平台的认证目录
const AUTH_DIRS = {
  instagram: path.join(process.cwd(), ".chrome-profile-instagram"),
  youtube: path.join(process.cwd(), ".chrome-profile-youtube"),
};
const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots");
const SCREENSHOT_META_FILE = path.join(process.cwd(), "screenshot-meta.json");

// 确保目录存在
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}
Object.values(AUTH_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 截图元数据管理
interface ScreenshotMeta {
  [username: string]: {
    timestamp: number;
    path: string;
    platform: string;
  };
}

function loadScreenshotMeta(): ScreenshotMeta {
  try {
    if (fs.existsSync(SCREENSHOT_META_FILE)) {
      return JSON.parse(fs.readFileSync(SCREENSHOT_META_FILE, "utf-8"));
    }
  } catch {
    // 忽略错误
  }
  return {};
}

function saveScreenshotMeta(meta: ScreenshotMeta) {
  fs.writeFileSync(SCREENSHOT_META_FILE, JSON.stringify(meta, null, 2));
}

// 清理浏览器锁文件
function cleanupBrowserLocks(platform: "instagram" | "youtube" = "instagram") {
  const authDir = AUTH_DIRS[platform];
  const lockFiles = ["SingletonLock", "SingletonSocket", "SingletonCookie"];
  for (const file of lockFiles) {
    const lockPath = path.join(authDir, file);
    try {
      if (fs.existsSync(lockPath)) {
        fs.unlinkSync(lockPath);
      }
    } catch {
      // 忽略错误
    }
  }
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

// 全局浏览器实例 - 按平台分开
const browsers: { [key: string]: Browser | null } = {
  instagram: null,
  youtube: null,
};

async function getBrowser(platform: "instagram" | "youtube" = "instagram"): Promise<Browser> {
  if (browsers[platform] && browsers[platform]!.connected) {
    return browsers[platform]!;
  }

  // 清理可能存在的锁文件
  cleanupBrowserLocks(platform);

  const chromePath = getChromePath();

  browsers[platform] = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    userDataDir: AUTH_DIRS[platform],
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1280,3000",
    ],
  });

  return browsers[platform]!;
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

// 检测 URL 平台
function detectPlatform(url: string): "instagram" | "youtube" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  return "instagram";
}

export async function POST(request: NextRequest) {
  try {
    const { url, batch } = await request.json();

    // 批量截图模式
    if (batch && Array.isArray(batch)) {
      const results = [];
      for (const item of batch) {
        try {
          const result = await takeScreenshot(item.url);
          results.push({ ...result, id: item.id });
        } catch (error) {
          results.push({
            id: item.id,
            success: false,
            error: error instanceof Error ? error.message : "Failed",
          });
        }
      }
      return NextResponse.json({ success: true, results });
    }

    // 单个截图
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await takeScreenshot(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Screenshot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Screenshot failed" },
      { status: 500 }
    );
  }
}

async function takeScreenshot(url: string) {
  const platform = detectPlatform(url);
  const browserInstance = await getBrowser(platform);
  const page = await browserInstance.newPage();

  try {
    // 设置视口大小 - 使用更大的尺寸
    await page.setViewport({ width: 1280, height: 2400 });

    // 设置 User-Agent
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // 导航到页面
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // 等待页面完全渲染
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 尝试关闭 Instagram 的登录弹窗（如果出现）
    try {
      // 方法1: 点击关闭按钮 (X)
      const closeButton = await page.$('svg[aria-label="关闭"], svg[aria-label="Close"], button[aria-label="关闭"], button[aria-label="Close"], div[role="dialog"] button');
      if (closeButton) {
        await closeButton.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch {
      // 忽略错误
    }

    // 尝试点击 "Not Now" 或 "以后再说" 按钮
    try {
      const notNowButton = await page.$('button:has-text("Not Now"), button:has-text("以后再说"), button:has-text("稍后再说")');
      if (notNowButton) {
        await notNowButton.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch {
      // 忽略错误
    }

    // 按 Escape 键关闭任何弹窗
    await page.keyboard.press('Escape');
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 模拟人类滑动行为 - 多次平滑滚动，滚动更多内容
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // 平滑滚动函数
      const smoothScroll = async (targetY: number, duration: number) => {
        const startY = window.scrollY;
        const distance = targetY - startY;
        const steps = 20;
        const stepDuration = duration / steps;

        for (let i = 1; i <= steps; i++) {
          const progress = i / steps;
          const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          window.scrollTo(0, startY + distance * easeProgress);
          await delay(stepDuration);
        }
      };

      // 多次向下滚动触发懒加载 - 滚动到更深的位置
      await smoothScroll(500, 600);
      await delay(400 + Math.random() * 200);

      await smoothScroll(1200, 500);
      await delay(300 + Math.random() * 200);

      await smoothScroll(2000, 500);
      await delay(400 + Math.random() * 200);

      await smoothScroll(3000, 500);
      await delay(400 + Math.random() * 200);

      await smoothScroll(4000, 500);
      await delay(500 + Math.random() * 300);

      // 滚动回顶部
      await smoothScroll(0, 400);
      await delay(300);
    });

    // 额外等待图片加载
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 滚动后再次尝试关闭登录弹窗
    try {
      const closeButton = await page.$('svg[aria-label="关闭"], svg[aria-label="Close"], button[aria-label="关闭"], button[aria-label="Close"], div[role="dialog"] button');
      if (closeButton) {
        await closeButton.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch {
      // 忽略错误
    }

    try {
      const notNowButton = await page.$('button:has-text("Not Now"), button:has-text("以后再说"), button:has-text("稍后再说")');
      if (notNowButton) {
        await notNowButton.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch {
      // 忽略错误
    }

    await page.keyboard.press('Escape');
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 生成文件名
    const username = extractUsername(url);
    const filename = `${username}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    // 全页截图
    await page.screenshot({
      path: filepath,
      fullPage: true,
    });

    await page.close();

    // 保存元数据
    const meta = loadScreenshotMeta();
    meta[username] = {
      timestamp: Date.now(),
      path: `/screenshots/${filename}`,
      platform,
    };
    saveScreenshotMeta(meta);

    return {
      success: true,
      path: `/screenshots/${filename}`,
      username,
      platform,
      timestamp: Date.now(),
    };
  } catch (pageError) {
    await page.close();
    throw pageError;
  }
}

// 获取截图状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const all = searchParams.get("all");

  // 返回所有截图元数据
  if (all === "true") {
    const meta = loadScreenshotMeta();
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

    // 过滤出24小时内的截图
    const validMeta: ScreenshotMeta = {};
    for (const [key, value] of Object.entries(meta)) {
      if (now - value.timestamp < CACHE_DURATION) {
        // 检查文件是否存在
        const filepath = path.join(SCREENSHOTS_DIR, `${key}.png`);
        if (fs.existsSync(filepath)) {
          validMeta[key] = value;
        }
      }
    }

    return NextResponse.json({ screenshots: validMeta });
  }

  if (username) {
    const filepath = path.join(SCREENSHOTS_DIR, `${username}.png`);
    const exists = fs.existsSync(filepath);
    const meta = loadScreenshotMeta();
    const info = meta[username];

    // 检查是否在24小时内
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    const isValid = info && (now - info.timestamp < CACHE_DURATION);

    return NextResponse.json({
      exists: exists && isValid,
      path: exists && isValid ? `/screenshots/${username}.png` : null,
      timestamp: info?.timestamp,
    });
  }

  // 返回所有截图文件名
  const files = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith(".png"));
  return NextResponse.json({ screenshots: files });
}
