/**
 * Instagram 登录脚本
 * 运行: npx ts-node scripts/instagram-login.ts
 *
 * 这个脚本会打开一个浏览器窗口，让你手动登录 Instagram。
 * 登录完成后，按 Enter 键保存登录状态。
 */

import { chromium } from "playwright";
import path from "path";
import readline from "readline";

const AUTH_FILE = path.join(process.cwd(), "instagram-auth.json");

async function main() {
  console.log("🚀 启动浏览器...");

  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  console.log("📱 打开 Instagram 登录页面...");
  await page.goto("https://www.instagram.com/accounts/login/");

  console.log("\n" + "=".repeat(50));
  console.log("👉 请在浏览器窗口中登录 Instagram");
  console.log("👉 登录成功后，回到这里按 Enter 键保存登录状态");
  console.log("=".repeat(50) + "\n");

  // 等待用户按 Enter
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await new Promise<void>((resolve) => {
    rl.question("按 Enter 键保存登录状态...", () => {
      rl.close();
      resolve();
    });
  });

  // 保存登录状态
  console.log("💾 保存登录状态...");
  await context.storageState({ path: AUTH_FILE });

  console.log(`✅ 登录状态已保存到: ${AUTH_FILE}`);

  await browser.close();
  console.log("🎉 完成！现在可以运行截图功能了。");
}

main().catch(console.error);
