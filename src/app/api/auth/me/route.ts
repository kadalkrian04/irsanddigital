import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = getAuthUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role === "admin") {
    return NextResponse.json({
      id: 0,
      name: "Administrator",
      email: "admin",
      whatsapp: "",
      role: "admin",
      has_access: true,
      invitation_quota: 9999,
      used_invitations: 0,
    });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT
      u.id, u.name, u.email, u.whatsapp, u.role, u.has_access, u.invitation_quota,
      (SELECT COUNT(*)::int FROM invitations i WHERE i.user_id = u.id) AS used_invitations
    FROM users u
    WHERE u.id = ${auth.id}
    LIMIT 1;
  `;

  if (!rows[0]) {
    return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 401 });
  }

  return NextResponse.json(rows[0]);
}