import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = getAuthUser(req);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT id, name, email, whatsapp, role, has_access, created_at
    FROM users
    ORDER BY created_at DESC;
  `;
  return NextResponse.json(rows);
}

export async function PATCH(req: Request) {
  const auth = getAuthUser(req);
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, has_access } = await req.json();
  if (!id) return NextResponse.json({ error: "ID user tidak valid" }, { status: 400 });

  const sql = getDb();
  const rows = await sql`
    UPDATE users
    SET has_access = ${Boolean(has_access)}
    WHERE id = ${Number(id)}
    RETURNING id, name, email, whatsapp, role, has_access, created_at;
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