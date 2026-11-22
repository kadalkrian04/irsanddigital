import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";


function isAuthorized(req: Request) {
  const pass = req.headers.get("x-admin-password");
  return pass === (process.env.ADMIN_PASSWORD || "admin123");
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getDb();
  const rows = await sql`SELECT * FROM invitations ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json();
    const slug = String(b.slug || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-");

    if (!slug || !b.groom_nickname || !b.bride_nickname) {
      return NextResponse.json({ error: "Slug & nama panggilan mempelai wajib diisi" }, { status: 400 });
    }

    const sql = getDb();
    const bankJson = JSON.stringify(b.bank_accounts || []);
    const galleryJson = JSON.stringify(b.gallery || []);

    const rows = await sql`
      INSERT INTO invitations (
        slug, theme, music_url, cover_image,
        groom_nickname, groom_full_name, groom_parents, groom_photo,
        bride_nickname, bride_full_name, bride_parents, bride_photo,
        event_date_iso, event_date_label,
        akad_date, akad_time, akad_venue, akad_address, akad_map_url,
        resepsi_date, resepsi_time, resepsi_venue, resepsi_address, resepsi_map_url,
        bank_accounts, gallery
      ) VALUES (
        ${slug}, ${b.theme || "classic-gold"}, ${b.music_url || ""}, ${b.cover_image || ""},
        ${b.groom_nickname}, ${b.groom_full_name || b.groom_nickname}, ${b.groom_parents || ""}, ${b.groom_photo || ""},
        ${b.bride_nickname}, ${b.bride_full_name || b.bride_nickname}, ${b.bride_parents || ""}, ${b.bride_photo || ""},
        ${b.event_date_iso || "2026-12-20T08:00:00+07:00"}, ${b.event_date_label || ""},
        ${b.akad_date || ""}, ${b.akad_time || ""}, ${b.akad_venue || ""}, ${b.akad_address || ""}, ${b.akad_map_url || "#"},
        ${b.resepsi_date || ""}, ${b.resepsi_time || ""}, ${b.resepsi_venue || ""}, ${b.resepsi_address || ""}, ${b.resepsi_map_url || "#"},
        ${bankJson}::jsonb, ${galleryJson}::jsonb
      )
      ON CONFLICT (slug) DO UPDATE SET
        theme = EXCLUDED.theme,
        music_url = EXCLUDED.music_url,
        cover_image = EXCLUDED.cover_image,
        groom_nickname = EXCLUDED.groom_nickname,
        groom_full_name = EXCLUDED.groom_full_name,
        groom_parents = EXCLUDED.groom_parents,
        groom_photo = EXCLUDED.groom_photo,
        bride_nickname = EXCLUDED.bride_nickname,
        bride_full_name = EXCLUDED.bride_full_name,
        bride_parents = EXCLUDED.bride_parents,
        bride_photo = EXCLUDED.bride_photo,
        event_date_iso = EXCLUDED.event_date_iso,
        event_date_label = EXCLUDED.event_date_label,
        akad_date = EXCLUDED.akad_date,
        akad_time = EXCLUDED.akad_time,
        akad_venue = EXCLUDED.akad_venue,
        akad_address = EXCLUDED.akad_address,
        akad_map_url = EXCLUDED.akad_map_url,
        resepsi_date = EXCLUDED.resepsi_date,
        resepsi_time = EXCLUDED.resepsi_time,
        resepsi_venue = EXCLUDED.resepsi_venue,
        resepsi_address = EXCLUDED.resepsi_address,
        resepsi_map_url = EXCLUDED.resepsi_map_url,
        bank_accounts = EXCLUDED.bank_accounts,
        gallery = EXCLUDED.gallery
      RETURNING *;
    `;

    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal menyimpan data klien" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM invitations WHERE id = ${id}`;
  return NextResponse.json({ deleted: true });
}