import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum diset di Environment Variables");
  return neon(url);
}

export type UserRow = {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  role: "admin" | "user";
  has_access: boolean;
  invitation_quota: number;
  used_invitations?: number;
  created_at: string;
};

export type ActivityLogRow = {
  id: number;
  user_id: number | null;
  user_name: string;
  action: string;
  detail: string;
  created_at: string;
};

export type BankAccount = {
  bank: string;
  accountNumber: string;
  accountName: string;
};

export type InvitationRow = {
  id: number;
  user_id: number | null;
  slug: string;
  theme: string;
  music_url: string;
  cover_image: string;
  groom_nickname: string;
  groom_full_name: string;
  groom_parents: string;
  groom_photo: string;
  bride_nickname: string;
  bride_full_name: string;
  bride_parents: string;
  bride_photo: string;
  event_date_iso: string;
  event_date_label: string;
  akad_date: string;
  akad_time: string;
  akad_venue: string;
  akad_address: string;
  akad_map_url: string;
  resepsi_date: string;
  resepsi_time: string;
  resepsi_venue: string;
  resepsi_address: string;
  resepsi_map_url: string;
  bank_accounts: BankAccount[];
  gallery: string[];
  created_at: string;
};

export type GuestRow = {
  id: number;
  invitation_id: number;
  name: string;
  phone: string;
  created_at: string;
};

export type WishRow = {
  id: number;
  invitation_id: number;
  guest_name: string;
  attendance: string;
  message: string;
  created_at: string;
};