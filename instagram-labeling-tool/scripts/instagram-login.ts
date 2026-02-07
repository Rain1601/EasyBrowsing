/**
 * Instagram 登录脚本 (Puppeteer 版本)
 * 运行: npm run instagram-login
 *
 * 这个脚本会打开一个 Chrome 窗口，让你手动登录 Instagram。
 * 登录完成后，按 Enter 键关闭浏览器。
 * 登录状态会自动保存到 .chrome-profile 目录。
 */

import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";
import os from "os";
import readline from "readline";

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

  throw new Error("Chrome not found. Please install Google Chrome.");
}

async function main() {
  console.log("🚀 启动 Chrome 浏览器...");

  // 确保配置目录存在
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const chromePath = getChromePath();
  console.log(`📍 Chrome 路径: ${chromePath}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false, // 显示浏览器窗口
    userDataDir: AUTH_DIR, // 持久化配置目录
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("📱 打开 Instagram 登录页面...");
  await page.goto("https://www.instagram.com/accounts/login/");

  console.log("\n" + "=".repeat(50));
  console.log("👉 请在浏览器窗口中登录 Instagram");
  console.log("👉 登录成功后，回到这里按 Enter 键关闭浏览器");
  console.log("👉 登录状态会自动保存到 .chrome-profile 目录");
  console.log("=".repeat(50) + "\n");

  // 等待用户按 Enter
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await new Promise<void>((resolve) => {
    rl.question("按 Enter 键关闭浏览器并保存登录状态...", () => {
      rl.close();
      resolve();
    });
  });

  await browser.close();

  console.log(`✅ 登录状态已保存到: ${AUTH_DIR}`);
  console.log("🎉 完成！现在可以运行截图功能了。");
}

main().catch(console.error);
