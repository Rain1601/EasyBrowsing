import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// 加密存储的凭据
const VALID_USERNAME_HASH = "$2b$10$PwVuCjUc64DwKHKPc//L3ucIEfrBpz2yUsH.Jw1v3qxzli6rgk9GO";
const VALID_PASSWORD_HASH = "$2b$10$1RJZhLwN8j9KBY0VvgvhGeX1OAw42r859HCnDtyFfnMIwwSNfq/YK";

// 生成会话 token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// 简单的内存会话存储 (生产环境应使用 Redis 等)
const sessions = new Map<string, { username: string; expiresAt: number }>();

// 清理过期会话
function cleanupSessions() {
  const now = Date.now();
  sessions.forEach((session, token) => {
    if (session.expiresAt < now) {
      sessions.delete(token);
    }
  });
}

// 登录
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    // 验证用户名和密码
    const isValidUsername = bcrypt.compareSync(username, VALID_USERNAME_HASH);
    const isValidPassword = bcrypt.compareSync(password, VALID_PASSWORD_HASH);

    if (!isValidUsername || !isValidPassword) {
      // 故意模糊错误信息，防止用户名枚举
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 清理过期会话
    cleanupSessions();

    // 生成会话 token
    const token = generateSessionToken();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 小时有效期

    sessions.set(token, { username, expiresAt });

    // 设置 cookie
    const response = NextResponse.json({ success: true, message: "登录成功" });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 小时
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    );
  }
}

// 验证会话
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, username: session.username });
}

// 登出
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (token) {
    sessions.delete(token);
  }

  const response = NextResponse.json({ success: true, message: "已登出" });
  response.cookies.delete("auth_token");

  return response;
}
