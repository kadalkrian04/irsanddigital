import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

async function canAccessInvitation(invitationId: number, auth: { id: number; role: string }) {
  if (auth.role === "admin") return true;
  const sql = getDb();
  const rows = await sql`
    SELECT id FROM invitations WHERE id = ${invitationId} AND user_id = ${auth.id} LIMIT 1
  `;
  return rows.length > 0;
}

export async function GET(req: Request) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const invitationId = Number(searchParams.get("invitationId"));
  if (!invitationId) return NextResponse.json({ error: "invitationId wajib diisi" }, { status: 400 });

  if (!(await canAccessInvitation(invitationId, auth))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT * FROM guests WHERE invitation_id = ${invitationId} ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invitationId, name, phone } = await req.json();
  if (!invitationId || !name?.trim()) {
    return NextResponse.json({ error: "Nama tamu wajib diisi" }, { status: 400 });
  }

  if (!(await canAccessInvitation(Number(invitationId), auth))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  const auth = getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const sql = getDb();
  if (auth.role === "admin") {
    await sql`DELETE FROM guests WHERE id = ${id}`;
  } else {
    await sql`
      DELETE FROM guests g
      USING invitations i
      WHERE g.id = ${id} AND g.invitation_id = i.id AND i.user_id = ${auth.id}
    `;
  }
  return NextResponse.json({ deleted: true });
}