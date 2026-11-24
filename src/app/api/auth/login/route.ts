import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    }

    // 1. Cek Login Admin Utama
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    if (cleanEmail === "admin" && password === adminPass) {
      const adminUser = {
        id: 0,
        name: "Administrator",
        email: "admin",
        whatsapp: "",
        role: "admin" as const,
        has_access: true,
      };
      const token = signToken({
        id: 0,
        name: "Administrator",
        email: "admin",
        role: "admin",
      });
      return NextResponse.json({ token, user: adminUser });
    }

    // 2. Cek Login User Biasa dari Database Neon
    const sql = getDb();
    const rows = await sql`
      SELECT id, name, email, whatsapp, password_hash, role, has_access
      FROM users
      WHERE email = ${cleanEmail}
      LIMIT 1;
    `;

    const u = rows[0];
    if (!u || !verifyPassword(password, u.password_hash)) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    const token = signToken({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role === "admin" ? "admin" : "user",
    });

    return NextResponse.json({
      token,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        whatsapp: u.whatsapp,
        role: u.role,
        has_access: u.has_access,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal login." }, { status: 500 });
  }
}