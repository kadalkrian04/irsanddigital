"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Users, ExternalLink, Copy, Check, Send, LogOut, Edit3 } from "lucide-react";
import type { InvitationRow, GuestRow } from "@/lib/db";
import { THEMES } from "@/lib/themes";

const EMPTY_FORM = {
  slug: "",
  theme: "jawa-maroon",
  music_url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
  cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  groom_nickname: "",
  groom_full_name: "",
  groom_parents: "",
  groom_photo: "",
  bride_nickname: "",
  bride_full_name: "",
  bride_parents: "",
  bride_photo: "",
  event_date_iso: "2026-12-20T08:00:00+07:00",
  event_date_label: "Minggu, 20 Desember 2026",
  akad_date: "Minggu, 20 Desember 2026",
  akad_time: "08.00 - 10.00 WIB",
  akad_venue: "",
  akad_address: "",
  akad_map_url: "",
  resepsi_date: "Minggu, 20 Desember 2026",
  resepsi_time: "11.00 - 14.00 WIB",
  resepsi_venue: "",
  resepsi_address: "",
  resepsi_map_url: "",
  bank_name: "BCA",
  bank_number: "",
  bank_holder: "",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authPass, setAuthPass] = useState<string | null>(null);
  const [loginError, setLoginError] = useState("");

  const [clients, setClients] = useState<InvitationRow[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [selectedClient, setSelectedClient] = useState<InvitationRow | null>(null);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pass");
    if (saved) {
      setAuthPass(saved);
      fetchClients(saved);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Password admin salah.");
      return;
    }
    sessionStorage.setItem("admin_pass", password);
    setAuthPass(password);
    fetchClients(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_pass");
    setAuthPass(null);
    setPassword("");
  };

  const fetchClients = async (pass: string) => {
    const res = await fetch("/api/invitations", {
      headers: { "x-admin-password": pass },
    });
    if (res.ok) {
      const data = await res.json();
      setClients(data);
    }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPass) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        akad_map_url: form.akad_map_url || "https://maps.google.com",
        resepsi_map_url: form.resepsi_map_url || "https://maps.google.com",
        bank_accounts: form.bank_number
          ? [{ bank: form.bank_name, accountNumber: form.bank_number, accountName: form.bank_holder }]
          : [],
        gallery: [],
      };
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": authPass,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setForm(EMPTY_FORM);
        fetchClients(authPass);
        alert("Data klien berhasil disimpan!");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditClient = (c: InvitationRow) => {
    const firstBank = Array.isArray(c.bank_accounts) && c.bank_accounts[0] ? c.bank_accounts[0] : null;
    setForm({
      slug: c.slug,
      theme: c.theme,
      music_url: c.music_url || "",
      cover_image: c.cover_image || "",
      groom_nickname: c.groom_nickname,
      groom_full_name: c.groom_full_name,
      groom_parents: c.groom_parents,
      groom_photo: c.groom_photo || "",
      bride_nickname: c.bride_nickname,
      bride_full_name: c.bride_full_name,
      bride_parents: c.bride_parents,
      bride_photo: c.bride_photo || "",
      event_date_iso: c.event_date_iso,
      event_date_label: c.event_date_label,
      akad_date: c.akad_date,
      akad_time: c.akad_time,
      akad_venue: c.akad_venue,
      akad_address: c.akad_address,
      akad_map_url: c.akad_map_url || "",
      resepsi_date: c.resepsi_date,
      resepsi_time: c.resepsi_time,
      resepsi_venue: c.resepsi_venue,
      resepsi_address: c.resepsi_address,
      resepsi_map_url: c.resepsi_map_url || "",
      bank_name: firstBank?.bank || "BCA",
      bank_number: firstBank?.accountNumber || "",
      bank_holder: firstBank?.accountName || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClient = async (id: number) => {
    if (!authPass || !confirm("Hapus klien ini beserta semua tamu & ucapannya?")) return;
    await fetch(`/api/invitations?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": authPass },
    });
    if (selectedClient?.id === id) setSelectedClient(null);
    fetchClients(authPass);
  };

  const openGuestManager = async (client: InvitationRow) => {
    if (!authPass) return;
    setSelectedClient(client);
    const res = await fetch(`/api/guests?invitationId=${client.id}`, {
      headers: { "x-admin-password": authPass },
    });
    if (res.ok) setGuests(await res.json());
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPass || !selectedClient || !guestName.trim()) return;
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": authPass,
      },
      body: JSON.stringify({
        invitationId: selectedClient.id,
        name: guestName,
        phone: guestPhone,
      }),
    });
    if (res.ok) {
      const added: GuestRow = await res.json();
      setGuests([added, ...guests]);
      setGuestName("");
      setGuestPhone("");
    }
  };

  const handleDeleteGuest = async (id: number) => {
    if (!authPass) return;
    await fetch(`/api/guests?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": authPass },
    });
    setGuests(guests.filter((g) => g.id !== id));
  };

  const buildInviteLink = (slug: string, name: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/u/${slug}?to=${encodeURIComponent(name)}`;
  };

  const copyGuestLink = (guest: GuestRow) => {
    if (!selectedClient) return;
    navigator.clipboard.writeText(buildInviteLink(selectedClient.slug, guest.name));
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendWhatsApp = (guest: GuestRow) => {
    if (!selectedClient) return;
    const link = buildInviteLink(selectedClient.slug, guest.name);
    const text = `Assalamu'alaikum Wr. Wb.\nKepada Yth. *${guest.name}*,\n\nTanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan *${selectedClient.bride_nickname} & ${selectedClient.groom_nickname}*.\n\nBuka undangan digital:\n${link}\n\nTerima kasih atas doa restunya.`;
    const phone = guest.phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!authPass) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-7 rounded-2xl shadow-sm border border-blue-100 w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-800">Login Admin Undangan</h1>
          {loginError && <p className="text-xs text-red-600">{loginError}</p>}
          <input
            type="password"
            required
            placeholder="Password Admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
          >
            Masuk Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-700">Admin Undangan Digital</h1>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-8">
        {/* FORM TAMBAH / EDIT KLIEN */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Buat / Edit Undangan Klien
          </h2>
          <form onSubmit={handleSaveClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Slug URL (contoh: dika)</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="dika"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-base"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Tema Undangan</label>
              <select
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-base bg-white"
              >
                {Object.values(THEMES).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* DATA MEMPELAI */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Data Mempelai</p>
            </div>
            <input required placeholder="Panggilan Pria (contoh: Dika)" value={form.groom_nickname} onChange={(e) => setForm({ ...form, groom_nickname: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input required placeholder="Nama Lengkap Pria" value={form.groom_full_name} onChange={(e) => setForm({ ...form, groom_full_name: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Orang Tua Pria" value={form.groom_parents} onChange={(e) => setForm({ ...form, groom_parents: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="URL Foto Pria (opsional)" value={form.groom_photo} onChange={(e) => setForm({ ...form, groom_photo: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />

            <input required placeholder="Panggilan Wanita (contoh: Rani)" value={form.bride_nickname} onChange={(e) => setForm({ ...form, bride_nickname: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input required placeholder="Nama Lengkap Wanita" value={form.bride_full_name} onChange={(e) => setForm({ ...form, bride_full_name: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Orang Tua Wanita" value={form.bride_parents} onChange={(e) => setForm({ ...form, bride_parents: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="URL Foto Wanita (opsional)" value={form.bride_photo} onChange={(e) => setForm({ ...form, bride_photo: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />

            {/* TANGGAL UTAMA COVER & COUNTDOWN */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Tanggal Cover & Countdown</p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Teks Tanggal di Cover</label>
              <input placeholder="Minggu, 20 Desember 2026" value={form.event_date_label} onChange={(e) => setForm({ ...form, event_date_label: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-base" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Format Countdown & Kalender (ISO)</label>
              <input placeholder="2026-12-20T08:00:00+07:00" value={form.event_date_iso} onChange={(e) => setForm({ ...form, event_date_iso: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-300 text-base" />
            </div>

            {/* DETAIL AKAD NIKAH */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Detail Akad Nikah</p>
            </div>
            <input placeholder="Tanggal Akad (contoh: Minggu, 20 Desember 2026)" value={form.akad_date} onChange={(e) => setForm({ ...form, akad_date: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Jam Akad (contoh: 08.00 - 10.00 WIB)" value={form.akad_time} onChange={(e) => setForm({ ...form, akad_time: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Tempat Akad (contoh: Rumah Mempelai Wanita)" value={form.akad_venue} onChange={(e) => setForm({ ...form, akad_venue: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Alamat Lengkap Akad" value={form.akad_address} onChange={(e) => setForm({ ...form, akad_address: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Link Google Maps Akad (https://maps.google.com/...)" value={form.akad_map_url} onChange={(e) => setForm({ ...form, akad_map_url: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-base" />

            {/* DETAIL RESEPSI */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Detail Resepsi</p>
            </div>
            <input placeholder="Tanggal Resepsi (contoh: Minggu, 20 Desember 2026)" value={form.resepsi_date} onChange={(e) => setForm({ ...form, resepsi_date: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Jam Resepsi (contoh: 11.00 - 14.00 WIB)" value={form.resepsi_time} onChange={(e) => setForm({ ...form, resepsi_time: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Tempat Resepsi (contoh: Rumah Mempelai Wanita)" value={form.resepsi_venue} onChange={(e) => setForm({ ...form, resepsi_venue: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Alamat Lengkap Resepsi" value={form.resepsi_address} onChange={(e) => setForm({ ...form, resepsi_address: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Link Google Maps Resepsi (https://maps.google.com/...)" value={form.resepsi_map_url} onChange={(e) => setForm({ ...form, resepsi_map_url: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-base" />

            {/* AMPLOP DIGITAL & MUSIK */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Amplop Digital & Musik</p>
            </div>
            <input placeholder="Nama Bank (BCA / BRI / Mandiri)" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Nomor Rekening" value={form.bank_number} onChange={(e) => setForm({ ...form, bank_number: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Atas Nama Rekening" value={form.bank_holder} onChange={(e) => setForm({ ...form, bank_holder: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="URL Musik MP3 (opsional)" value={form.music_url} onChange={(e) => setForm({ ...form, music_url: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Undangan Klien"}
              </button>
              <button
                type="button"
                onClick={() => setForm(EMPTY_FORM)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-600 hover:bg-slate-50"
              >
                Reset Form
              </button>
            </div>
          </form>
        </section>

        {/* DAFTAR KLIEN */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 mb-4">Daftar Klien ({clients.length})</h2>
          <div className="space-y-3">
            {clients.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">
                    {c.bride_nickname} & {c.groom_nickname}{" "}
                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md ml-1">
                      /u/{c.slug}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tema: {THEMES[c.theme]?.name || c.theme} • {c.event_date_label}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openGuestManager(c)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" /> Tamu
                  </button>
                  <button
                    onClick={() => handleEditClient(c)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <a
                    href={`/u/${c.slug}?to=Tamu+Undangan`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Lihat
                  </a>
                  <button
                    onClick={() => handleDeleteClient(c.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KELOLA TAMU PER KLIEN */}
        {selectedClient && (
          <section className="bg-white rounded-2xl border-2 border-blue-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-blue-700 mb-4">
              Database Tamu Undangan: {selectedClient.bride_nickname} & {selectedClient.groom_nickname} (/u/{selectedClient.slug})
            </h2>

            <form onSubmit={handleAddGuest} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <input
                required
                placeholder="Nama Tamu (contoh: Budi Santoso)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-base"
              />
              <input
                placeholder="No. WA (opsional, 0812xxx)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-base"
              />
              <button
                type="submit"
                className="py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                + Tambah Tamu
              </button>
            </form>

            <div className="space-y-2">
              {guests.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada tamu untuk klien ini.</p>
              ) : (
                guests.map((g) => (
                  <div key={g.id} className="p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{g.name}</p>
                      {g.phone && <p className="text-xs text-slate-500">{g.phone}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyGuestLink(g)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs flex items-center gap-1"
                      >
                        {copiedId === g.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === g.id ? "Tersalin" : "Copy Link"}
                      </button>
                      <button
                        onClick={() => sendWhatsApp(g)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Kirim WA
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(g.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}