import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, whatsapp, password } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!name?.trim() || !cleanEmail || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Nama, email, dan password (minimal 6 karakter) wajib diisi." },
        { status: 400 }
      );
    }

    if (cleanEmail === "admin") {
      return NextResponse.json({ error: "Email ini tidak bisa digunakan." }, { status: 400 });
    }

    const sql = getDb();
    const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar. Silakan login." }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const rows = await sql`
      INSERT INTO users (name, email, whatsapp, password_hash, role, has_access)
      VALUES (${name.trim()}, ${cleanEmail}, ${(whatsapp || "").trim()}, ${passwordHash}, 'user', false)
      RETURNING id, name, email, whatsapp, role, has_access;
    `;

    const user = rows[0];
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "user",
    });

    return NextResponse.json({ token, user }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mendaftar akun." }, { status: 500 });
  }
}