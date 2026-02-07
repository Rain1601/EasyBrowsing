import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const AUTH_FILE = path.join(process.cwd(), "instagram-auth.json");

// 检查是否已登录
export async function GET() {
  const hasAuth = fs.existsSync(AUTH_FILE);

  if (hasAuth) {
    const stat = fs.statSync(AUTH_FILE);
    return NextResponse.json({
      authenticated: true,
      savedAt: stat.mtime.toISOString(),
    });
  }

  return NextResponse.json({ authenticated: false });
}

// 启动登录流程（打开浏览器让用户手动登录）
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "login") {
      // 启动可见的浏览器让用户登录
      const browser = await chromium.launch({
        headless: false, // 显示浏览器窗口
      });

      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
      });

      const page = await context.newPage();
      await page.goto("https://www.instagram.com/accounts/login/");

      // 返回消息告诉用户去浏览器登录
      // 注意：这里实际上需要在登录后保存状态
      // 由于是异步的，我们需要另一种方式来检测登录完成

      return NextResponse.json({
        success: true,
        message: "浏览器已打开，请在浏览器中登录 Instagram。登录完成后点击保存按钮。",
      });
    }

    if (action === "clear") {
      if (fs.existsSync(AUTH_FILE)) {
        fs.unlinkSync(AUTH_FILE);
      }
      return NextResponse.json({ success: true, message: "登录状态已清除" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Auth failed" },
      { status: 500 }
    );
  }
}
