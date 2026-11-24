import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser, hashPassword } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = getAuthUser(req);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT
      u.id, u.name, u.email, u.whatsapp, u.role, u.has_access, u.invitation_quota, u.created_at,
      (SELECT COUNT(*)::int FROM invitations i WHERE i.user_id = u.id) AS used_invitations
    FROM users u
    ORDER BY u.created_at DESC;
  `;
  return NextResponse.json(rows);
}

export async function PATCH(req: Request) {
  const auth = getAuthUser(req);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "ID user tidak valid" }, { status: 400 });

  const sql = getDb();

  // Ubah Password User
  if (typeof body.new_password === "string" && body.new_password.trim().length > 0) {
    if (body.new_password.trim().length < 6) {
      return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
    }
    const newHash = hashPassword(body.new_password.trim());
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${id}`;
  }

  // Ubah Status Akses
  if (typeof body.has_access === "boolean") {
    await sql`UPDATE users SET has_access = ${body.has_access} WHERE id = ${id}`;
  }

  // Ubah Kuota Undangan
  if (body.invitation_quota !== undefined) {
    const quota = Math.max(0, Number(body.invitation_quota) || 0);
    await sql`UPDATE users SET invitation_quota = ${quota} WHERE id = ${id}`;
  }

  const rows = await sql`
    SELECT
      u.id, u.name, u.email, u.whatsapp, u.role, u.has_access, u.invitation_quota, u.created_at,
      (SELECT COUNT(*)::int FROM invitations i WHERE i.user_id = u.id) AS used_invitations
    FROM users u
    WHERE u.id = ${id}
    LIMIT 1;
  `;

  return NextResponse.json(rows[0]);
}

export async function DELETE(req: Request) {
  const auth = getAuthUser(req);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM users WHERE id = ${id}`;
  return NextResponse.json({ deleted: true });
}