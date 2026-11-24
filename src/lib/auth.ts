import crypto from "crypto";

const SECRET = process.env.ADMIN_PASSWORD || "rahasia-undangan-2026";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
};

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(hash, "hex"));
}

export function signToken(payload: SessionUser): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string | null): SessionUser | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export function getAuthUser(req: Request): SessionUser | null {
  const token = req.headers.get("x-auth-token");
  return verifyToken(token);
}