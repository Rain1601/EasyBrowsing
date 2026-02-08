import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser } from "puppeteer-core";
import path from "path";
import fs from "fs";
import os from "os";

// 不同平台的配置
const PLATFORMS = {
  instagram: {
    authDir: path.join(process.cwd(), ".chrome-profile-instagram"),
    loginUrl: "https://www.instagram.com/accounts/login/",
    name: "Instagram",
  },
  youtube: {
    authDir: path.join(process.cwd(), ".chrome-profile-youtube"),
    loginUrl: "https://accounts.google.com/signin/v2/identifier?service=youtube",
    name: "YouTube",
  },
};

type Platform = keyof typeof PLATFORMS;

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
function cleanupBrowserLocks(platform: Platform) {
  const authDir = PLATFORMS[platform].authDir;
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

// 全局浏览器实例（用于登录窗口）- 按平台分开
const loginBrowsers: { [key: string]: Browser | null } = {
  instagram: null,
  youtube: null,
};

// 检查登录状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = (searchParams.get("platform") as Platform) || "instagram";

  const config = PLATFORMS[platform];
  if (!config) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const hasAuth = fs.existsSync(config.authDir) && fs.readdirSync(config.authDir).length > 0;
  const cookiesPath = path.join(config.authDir, "Default", "Cookies");
  const hasCookies = fs.existsSync(cookiesPath);

  // 获取所有平台的状态
  const allStatus: { [key: string]: { authenticated: boolean; loginBrowserOpen: boolean } } = {};
  for (const [key, cfg] of Object.entries(PLATFORMS)) {
    const hasAuthP = fs.existsSync(cfg.authDir) && fs.readdirSync(cfg.authDir).length > 0;
    const cookiesPathP = path.join(cfg.authDir, "Default", "Cookies");
    const hasCookiesP = fs.existsSync(cookiesPathP);
    allStatus[key] = {
      authenticated: hasAuthP && hasCookiesP,
      loginBrowserOpen: loginBrowsers[key] !== null && loginBrowsers[key]!.connected,
    };
  }

  return NextResponse.json({
    authenticated: hasAuth && hasCookies,
    hasProfile: hasAuth,
    loginBrowserOpen: loginBrowsers[platform] !== null && loginBrowsers[platform]!.connected,
    allPlatforms: allStatus,
  });
}

// 启动/关闭登录浏览器
export async function POST(request: NextRequest) {
  try {
    const { action, platform = "instagram" } = await request.json();

    const config = PLATFORMS[platform as Platform];
    if (!config) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    if (action === "open-login") {
      // 如果已经有登录窗口打开，返回提示
      if (loginBrowsers[platform] && loginBrowsers[platform]!.connected) {
        return NextResponse.json({
          success: true,
          message: `${config.name} 登录窗口已打开，请在浏览器中完成登录`,
          alreadyOpen: true,
        });
      }

      // 清理锁文件
      cleanupBrowserLocks(platform as Platform);

      // 确保目录存在
      if (!fs.existsSync(config.authDir)) {
        fs.mkdirSync(config.authDir, { recursive: true });
      }

      const chromePath = getChromePath();

      // 启动可见的浏览器
      loginBrowsers[platform] = await puppeteer.launch({
        executablePath: chromePath,
        headless: false,
        userDataDir: config.authDir,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--start-maximized",
        ],
        defaultViewport: null,
      });

      const page = await loginBrowsers[platform]!.newPage();
      await page.goto(config.loginUrl);

      // 监听浏览器关闭
      loginBrowsers[platform]!.on("disconnected", () => {
        loginBrowsers[platform] = null;
      });

      return NextResponse.json({
        success: true,
        message: `浏览器已打开，请登录 ${config.name}。登录完成后点击「完成登录」按钮。`,
        platform,
      });
    }

    if (action === "close-login") {
      if (loginBrowsers[platform] && loginBrowsers[platform]!.connected) {
        await loginBrowsers[platform]!.close();
        loginBrowsers[platform] = null;
      }
      return NextResponse.json({ success: true, message: "登录窗口已关闭", platform });
    }

    if (action === "check-status") {
      return NextResponse.json({
        loginBrowserOpen: loginBrowsers[platform] !== null && loginBrowsers[platform]!.connected,
        platform,
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
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = (searchParams.get("platform") as Platform) || "instagram";

    const config = PLATFORMS[platform];
    if (!config) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // 先关闭登录浏览器
    if (loginBrowsers[platform] && loginBrowsers[platform]!.connected) {
      await loginBrowsers[platform]!.close();
      loginBrowsers[platform] = null;
    }

    // 清理锁文件
    cleanupBrowserLocks(platform);

    // 删除配置目录
    if (fs.existsSync(config.authDir)) {
      fs.rmSync(config.authDir, { recursive: true, force: true });
    }

    return NextResponse.json({ success: true, message: `${config.name} 登录状态已清除` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "清除失败" },
      { status: 500 }
    );
  }
}
