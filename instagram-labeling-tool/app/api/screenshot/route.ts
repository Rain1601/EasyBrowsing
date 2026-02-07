import { NextRequest, NextResponse } from "next/server";
import { chromium, BrowserContext } from "playwright";
import path from "path";
import fs from "fs";

const AUTH_FILE = path.join(process.cwd(), "instagram-auth.json");
const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots");

// 确保截图目录存在
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// 全局浏览器实例（避免重复启动）
let browserContext: BrowserContext | null = null;

async function getContext(): Promise<BrowserContext> {
  if (browserContext) {
    return browserContext;
  }

  const browser = await chromium.launch({
    headless: true,
  });

  // 检查是否有保存的登录状态
  const hasAuth = fs.existsSync(AUTH_FILE);

  browserContext = await browser.newContext({
    ...(hasAuth ? { storageState: AUTH_FILE } : {}),
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  return browserContext;
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

    const context = await getContext();
    const page = await context.newPage();

    try {
      // 导航到页面
      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // 等待页面加载
      await page.waitForTimeout(2000);

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
