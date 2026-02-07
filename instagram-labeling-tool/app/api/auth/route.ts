import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const AUTH_DIR = path.join(process.cwd(), ".chrome-profile");

// 检查是否已配置登录状态
export async function GET() {
  const hasAuth = fs.existsSync(AUTH_DIR) && fs.readdirSync(AUTH_DIR).length > 0;

  if (hasAuth) {
    const stat = fs.statSync(AUTH_DIR);
    return NextResponse.json({
      authenticated: true,
      savedAt: stat.mtime.toISOString(),
    });
  }

  return NextResponse.json({ authenticated: false });
}

// 清除登录状态
export async function DELETE() {
  try {
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
