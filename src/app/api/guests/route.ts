import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";


function isAuthorized(req: Request) {
  const pass = req.headers.get("x-admin-password");
  return pass === (process.env.ADMIN_PASSWORD || "admin123");
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const invitationId = Number(searchParams.get("invitationId"));
  if (!invitationId) return NextResponse.json({ error: "invitationId wajib diisi" }, { status: 400 });

  const sql = getDb();
  const rows = await sql`
    SELECT * FROM guests WHERE invitation_id = ${invitationId} ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { invitationId, name, phone } = await req.json();
  if (!invitationId || !name?.trim()) {
    return NextResponse.json({ error: "Nama tamu wajib diisi" }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`
    INSERT INTO guests (invitation_id, name, phone)
    VALUES (${Number(invitationId)}, ${name.trim()}, ${(phone || "").trim()})
    RETURNING *;
  `;
  return NextResponse.json(rows[0], { status: 201 });
}

export async function DELETE(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM guests WHERE id = ${id}`;
  return NextResponse.json({ deleted: true });
}