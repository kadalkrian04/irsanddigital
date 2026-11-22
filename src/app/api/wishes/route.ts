import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";


export async function POST(req: Request) {
  try {
    const { invitationId, guestName, attendance, message } = await req.json();
    if (!invitationId || !guestName?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Nama dan ucapan wajib diisi" }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql`
      INSERT INTO wishes (invitation_id, guest_name, attendance, message)
      VALUES (${Number(invitationId)}, ${guestName.trim()}, ${attendance || "Hadir"}, ${message.trim()})
      RETURNING *;
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal mengirim ucapan" }, { status: 500 });
  }
}