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
    SELECT id, user_id, user_name, action, detail, created_at
    FROM activity_logs
    ORDER BY created_at DESC
    LIMIT 60;
  `;
  return NextResponse.json(rows);
}