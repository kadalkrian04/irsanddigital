"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Users,
  ExternalLink,
  Copy,
  Check,
  Send,
  LogOut,
  Edit3,
  CheckCircle2,
  XCircle,
  Heart,
  KeyRound,
  Activity,
  RefreshCw,
} from "lucide-react";
import type { InvitationRow, GuestRow, UserRow, ActivityLogRow } from "@/lib/db";
import { THEMES } from "@/lib/themes";

const INPUT_CLASS =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";

const STAR_BG = {
  backgroundImage:
    "radial-gradient(1.5px 1.5px at 14% 22%, #ffffff 90%, transparent), radial-gradient(2px 2px at 82% 18%, #ffffff 90%, transparent), radial-gradient(1.5px 1.5px at 28% 48%, #ffffff 90%, transparent), radial-gradient(2px 2px at 74% 42%, #ffffff 90%, transparent), radial-gradient(1.5px 1.5px at 90% 35%, #ffffff 90%, transparent), radial-gradient(1.5px 1.5px at 8% 40%, #ffffff 90%, transparent), radial-gradient(2px 2px at 60% 15%, #ffffff 90%, transparent)",
};

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [usersList, setUsersList] = useState<UserRow[]>([]);
  const [activities, setActivities] = useState<ActivityLogRow[]>([]);
  const [clients, setClients] = useState<InvitationRow[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [selectedClient, setSelectedClient] = useState<InvitationRow | null>(null);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("auth_token");
    if (!saved) {
      router.replace("/login");
      return;
    }
    fetch("/api/auth/me", { headers: { "x-auth-token": saved } })
      .then((res) => (res.ok ? res.json() : null))
      .then((u: UserRow | null) => {
        if (!u) {
          localStorage.removeItem("auth_token");
          router.replace("/login");
          return;
        }
        if (u.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
        setToken(saved);
        fetchUsers(saved);
        fetchActivities(saved);
        fetchClients(saved);
        setLoading(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  const fetchUsers = async (tok: string) => {
    const res = await fetch("/api/users", { headers: { "x-auth-token": tok } });
    if (res.ok) setUsersList(await res.json());
  };

  const fetchActivities = async (tok: string) => {
    const res = await fetch("/api/activity", { headers: { "x-auth-token": tok } });
    if (res.ok) setActivities(await res.json());
  };

  const fetchClients = async (tok: string) => {
    const res = await fetch("/api/invitations", { headers: { "x-auth-token": tok } });
    if (res.ok) setClients(await res.json());
  };

  const toggleUserAccess = async (user: UserRow) => {
    if (!token) return;
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify({ id: user.id, has_access: !user.has_access }),
    });
    if (res.ok) fetchUsers(token);
  };

  const updateUserQuota = async (user: UserRow, newQuota: number) => {
    if (!token) return;
    const safeQuota = Math.max(0, newQuota);
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify({ id: user.id, invitation_quota: safeQuota }),
    });
    if (res.ok) fetchUsers(token);
  };

  const changeUserPassword = async (user: UserRow) => {
    if (!token) return;
    const newPass = prompt(`Masukkan password baru untuk ${user.name} (min. 6 karakter):`);
    if (!newPass) return;
    if (newPass.trim().length < 6) {
      alert("Password minimal 6 karakter!");
      return;
    }
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify({ id: user.id, new_password: newPass.trim() }),
    });
    if (res.ok) {
      alert(`Password ${user.name} berhasil diubah!`);
    } else {
      const err = await res.json();
      alert(err.error || "Gagal mengubah password");
    }
  };

  const deleteUser = async (id: number) => {
    if (!token || !confirm("Hapus akun user ini?")) return;
    await fetch(`/api/users?id=${id}`, { method: "DELETE", headers: { "x-auth-token": token } });
    fetchUsers(token);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
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
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setForm(EMPTY_FORM);
        fetchClients(token);
        fetchActivities(token);
        alert("Undangan berhasil disimpan!");
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
    if (!token || !confirm("Hapus undangan ini beserta semua tamu & ucapannya?")) return;
    await fetch(`/api/invitations?id=${id}`, { method: "DELETE", headers: { "x-auth-token": token } });
    if (selectedClient?.id === id) setSelectedClient(null);
    fetchClients(token);
    fetchUsers(token);
  };

  const openGuestManager = async (client: InvitationRow) => {
    if (!token) return;
    setSelectedClient(client);
    const res = await fetch(`/api/guests?invitationId=${client.id}`, {
      headers: { "x-auth-token": token },
    });
    if (res.ok) setGuests(await res.json());
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClient || !guestName.trim()) return;
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify({ invitationId: selectedClient.id, name: guestName, phone: guestPhone }),
    });
    if (res.ok) {
      const added: GuestRow = await res.json();
      setGuests([added, ...guests]);
      setGuestName("");
      setGuestPhone("");
      fetchActivities(token);
    }
  };

  const handleDeleteGuest = async (id: number) => {
    if (!token) return;
    await fetch(`/api/guests?id=${id}`, { method: "DELETE", headers: { "x-auth-token": token } });
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

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  if (loading || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#69B4FF] via-[#7C9BFF] to-white flex items-center justify-center text-sm font-medium text-white">
        Memuat panel admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <div className="relative overflow-hidden bg-gradient-to-b from-[#69B4FF] via-[#7C9BFF] to-slate-50 pt-6 pb-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={STAR_BG} />
        <header className="relative z-20 mx-auto max-w-5xl px-4">
          <nav className="flex items-center justify-between gap-2 rounded-full bg-slate-900/90 px-3 py-2 text-white shadow-xl backdrop-blur-md border border-white/10">
            <Link href="/" className="flex items-center gap-2 pl-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600">
                <Heart className="h-4 w-4 fill-white text-white" />
              </span>
              <span className="text-sm font-bold tracking-tight">IrsandDigital</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-blue-300 font-semibold pr-2">Administrator</span>
              <button
                onClick={handleLogout}
                className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Keluar
              </button>
            </div>
          </nav>
        </header>

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-xs">
            Panel Super Admin
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-1">
            Aktivasi akses, atur kuota undangan, ubah password, pantau aktivitas user, dan kelola klien.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-2 space-y-8 relative z-10">
        {/* 1. MANAJEMEN USER (AKSES, KUOTA, PASSWORD, HAPUS) */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Manajemen Akun User ({usersList.length})
            </h2>
            <button
              onClick={() => fetchUsers(token)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {usersList.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada user yang mendaftar.</p>
          ) : (
            <div className="space-y-3">
              {usersList.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-sm text-slate-900">{u.name}</p>
                      {u.has_access ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Belum Aktif
                        </span>
                      )}
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        Kuota: {u.used_invitations ?? 0} / {u.invitation_quota ?? 1} Undangan
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {u.email} {u.whatsapp ? `• WA: ${u.whatsapp}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Kontrol Kuota */}
                    <div className="inline-flex items-center rounded-full border border-slate-300 bg-white overflow-hidden">
                      <button
                        onClick={() => updateUserQuota(u, (u.invitation_quota ?? 1) - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                        title="Kurangi Kuota"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-semibold text-slate-800 border-x border-slate-200">
                        Kuota: {u.invitation_quota ?? 1}
                      </span>
                      <button
                        onClick={() => updateUserQuota(u, (u.invitation_quota ?? 1) + 1)}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50"
                        title="Tambah Kuota"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => toggleUserAccess(u)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold text-white transition ${
                        u.has_access ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {u.has_access ? "Cabut Akses" : "Aktifkan Akses"}
                    </button>

                    <button
                      onClick={() => changeUserPassword(u)}
                      className="px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Password
                    </button>

                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-2 rounded-full text-red-600 hover:bg-red-50"
                      title="Hapus User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. LOG AKTIVITAS USER */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Aktivitas User Terbaru ({activities.length})
            </h2>
            <button
              onClick={() => fetchActivities(token)}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[10px]">
                      {a.action}
                    </span>
                    <span className="font-bold text-slate-900">{a.user_name}</span>
                    <span className="text-slate-600">— {a.detail}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{formatTime(a.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. SEMUA UNDANGAN KLIEN */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Semua Undangan Klien ({clients.length})</h2>
          {clients.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada undangan.</p>
          ) : (
            <div className="space-y-3">
              {clients.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-900">
                      {c.bride_nickname} & {c.groom_nickname}{" "}
                      <span className="text-xs font-mono text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full ml-1">/u/{c.slug}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">Tema: {THEMES[c.theme]?.name || c.theme} • {c.event_date_label}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => openGuestManager(c)} className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition">
                      <Users className="w-3.5 h-3.5" /> Tamu
                    </button>
                    <button onClick={() => handleEditClient(c)} className="px-3.5 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <a href={`/u/${c.slug}?to=Tamu+Undangan`} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition">
                      <ExternalLink className="w-3.5 h-3.5" /> Lihat
                    </a>
                    <button onClick={() => handleDeleteClient(c.id)} className="p-2 rounded-full text-red-600 hover:bg-red-50 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. KELOLA TAMU PER UNDANGAN */}
        {selectedClient && (
          <section className="bg-white rounded-3xl border-2 border-blue-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-blue-700 mb-4">
              Database Tamu: {selectedClient.bride_nickname} & {selectedClient.groom_nickname} (/u/{selectedClient.slug})
            </h2>
            <form onSubmit={handleAddGuest} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <input required placeholder="Nama Tamu" value={guestName} onChange={(e) => setGuestName(e.target.value)} className={INPUT_CLASS} />
              <input placeholder="No. WA (opsional, 0812xxx)" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={INPUT_CLASS} />
              <button type="submit" className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition">
                + Tambah Tamu
              </button>
            </form>
            <div className="space-y-2">
              {guests.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada tamu.</p>
              ) : (
                guests.map((g) => (
                  <div key={g.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{g.name}</p>
                      {g.phone && <p className="text-xs text-slate-600">{g.phone}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyGuestLink(g)} className="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 text-xs font-semibold flex items-center gap-1">
                        {copiedId === g.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === g.id ? "Tersalin" : "Copy Link"}
                      </button>
                      <button onClick={() => sendWhatsApp(g)} className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" /> Kirim WA
                      </button>
                      <button onClick={() => handleDeleteGuest(g.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* 5. FORM BUAT / EDIT UNDANGAN OLEH ADMIN */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Buat / Edit Undangan Klien
          </h2>
          <form onSubmit={handleSaveClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL (contoh: dika-rani)</label>
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="dika-rani" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tema Undangan</label>
              <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} className={INPUT_CLASS}>
                {Object.values(THEMES).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Data Mempelai</p>
            </div>
            <input required placeholder="Panggilan Pria" value={form.groom_nickname} onChange={(e) => setForm({ ...form, groom_nickname: e.target.value })} className={INPUT_CLASS} />
            <input required placeholder="Nama Lengkap Pria" value={form.groom_full_name} onChange={(e) => setForm({ ...form, groom_full_name: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Orang Tua Pria" value={form.groom_parents} onChange={(e) => setForm({ ...form, groom_parents: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="URL Foto Pria (opsional)" value={form.groom_photo} onChange={(e) => setForm({ ...form, groom_photo: e.target.value })} className={INPUT_CLASS} />

            <input required placeholder="Panggilan Wanita" value={form.bride_nickname} onChange={(e) => setForm({ ...form, bride_nickname: e.target.value })} className={INPUT_CLASS} />
            <input required placeholder="Nama Lengkap Wanita" value={form.bride_full_name} onChange={(e) => setForm({ ...form, bride_full_name: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Orang Tua Wanita" value={form.bride_parents} onChange={(e) => setForm({ ...form, bride_parents: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="URL Foto Wanita (opsional)" value={form.bride_photo} onChange={(e) => setForm({ ...form, bride_photo: e.target.value })} className={INPUT_CLASS} />

            <div className="md:col-span-2 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Tanggal Cover & Countdown</p>
            </div>
            <input placeholder="Teks Tanggal di Cover (Minggu, 20 Desember 2026)" value={form.event_date_label} onChange={(e) => setForm({ ...form, event_date_label: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Format Countdown ISO (2026-12-20T08:00:00+07:00)" value={form.event_date_iso} onChange={(e) => setForm({ ...form, event_date_iso: e.target.value })} className={INPUT_CLASS} />

            <div className="md:col-span-2 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Detail Akad Nikah</p>
            </div>
            <input placeholder="Tanggal Akad" value={form.akad_date} onChange={(e) => setForm({ ...form, akad_date: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Jam Akad (08.00 - 10.00 WIB)" value={form.akad_time} onChange={(e) => setForm({ ...form, akad_time: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Tempat Akad" value={form.akad_venue} onChange={(e) => setForm({ ...form, akad_venue: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Alamat Lengkap Akad" value={form.akad_address} onChange={(e) => setForm({ ...form, akad_address: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Link Google Maps Akad (https://maps.google.com/...)" value={form.akad_map_url} onChange={(e) => setForm({ ...form, akad_map_url: e.target.value })} className={`md:col-span-2 ${INPUT_CLASS}`} />

            <div className="md:col-span-2 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Detail Resepsi</p>
            </div>
            <input placeholder="Tanggal Resepsi" value={form.resepsi_date} onChange={(e) => setForm({ ...form, resepsi_date: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Jam Resepsi (11.00 - 14.00 WIB)" value={form.resepsi_time} onChange={(e) => setForm({ ...form, resepsi_time: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Tempat Resepsi" value={form.resepsi_venue} onChange={(e) => setForm({ ...form, resepsi_venue: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Alamat Lengkap Resepsi" value={form.resepsi_address} onChange={(e) => setForm({ ...form, resepsi_address: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Link Google Maps Resepsi (https://maps.google.com/...)" value={form.resepsi_map_url} onChange={(e) => setForm({ ...form, resepsi_map_url: e.target.value })} className={`md:col-span-2 ${INPUT_CLASS}`} />

            <div className="md:col-span-2 pt-3 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Amplop Digital & Musik</p>
            </div>
            <input placeholder="Nama Bank (BCA / BRI / Mandiri)" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Nomor Rekening" value={form.bank_number} onChange={(e) => setForm({ ...form, bank_number: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="Atas Nama Rekening" value={form.bank_holder} onChange={(e) => setForm({ ...form, bank_holder: e.target.value })} className={INPUT_CLASS} />
            <input placeholder="URL Musik MP3 (opsional)" value={form.music_url} onChange={(e) => setForm({ ...form, music_url: e.target.value })} className={INPUT_CLASS} />

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-7 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md disabled:opacity-50 transition">
                {saving ? "Menyimpan..." : "Simpan Undangan"}
              </button>
              <button type="button" onClick={() => setForm(EMPTY_FORM)} className="px-5 py-2.5 rounded-full border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                Reset Form
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}