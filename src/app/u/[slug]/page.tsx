import { notFound } from "next/navigation";
import { getDb, type InvitationRow, type WishRow } from "@/lib/db";
import InvitationClient from "@/components/InvitationClient";
import type { Metadata } from "next";

export const instant = false;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sql = getDb();
  const rows = (await sql`SELECT * FROM invitations WHERE slug = ${slug} LIMIT 1`) as InvitationRow[];
  const inv = rows[0];
  if (!inv) return { title: "Undangan Tidak Ditemukan" };

  return {
    title: `The Wedding of ${inv.bride_nickname} & ${inv.groom_nickname}`,
    description: `Undangan pernikahan ${inv.bride_full_name} & ${inv.groom_full_name} - ${inv.event_date_label}`,
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { to } = await searchParams;

  const sql = getDb();
  const rows = (await sql`SELECT * FROM invitations WHERE slug = ${slug} LIMIT 1`) as InvitationRow[];
  const invitation = rows[0];

  if (!invitation) notFound();

  const initialWishes = (await sql`
    SELECT * FROM wishes WHERE invitation_id = ${invitation.id} ORDER BY created_at DESC
  `) as WishRow[];

  return (
    <InvitationClient
      invitation={invitation}
      initialWishes={initialWishes}
      guestName={to || "Tamu Undangan"}
    />
  );
}