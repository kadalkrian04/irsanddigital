"use client";

import { useState, useEffect } from "react";
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
  Lock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import type { InvitationRow, GuestRow, UserRow } from "@/lib/db";
import { THEMES } from "@/lib/themes";

// Ganti dengan nomor WhatsApp Admin kamu (format 628xxx)
const ADMIN_WA = "628988882052";

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

export default function DashboardPage() {
  // Auth state
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form Login / Register
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regWa, setRegWa] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Admin: User Management
  const [usersList, setUsersList] = useState<UserRow[]>([]);

  // Invitations & Guests
  const [clients, setClients] = useState<InvitationRow[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [selectedClient, setSelectedClient] = useState<InvitationRow | null>(null);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const loadSession = async (savedToken: string) => {
    setCheckingAuth(true);
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "x-auth-token": savedToken },
      });
      if (!res.ok) {
        localStorage.removeItem("auth_token");
        setToken(null);
        setCurrentUser(null);
        return;
      }
      const user: UserRow = await res.json();
      setToken(savedToken);
      setCurrentUser(user);

      if (user.role === "admin") {
        fetchUsers(savedToken);
        fetchClients(savedToken);
      } else if (user.has_access) {
        fetchClients(savedToken);
      }
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("auth_token");
    if (saved) {
      loadSession(saved);
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Gagal login.");
        return;
      }
      localStorage.setItem("auth_token", data.token);
      await loadSession(data.token);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          whatsapp: regWa,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Gagal mendaftar.");
        return;
      }
      localStorage.setItem("auth_token", data.token);
      await loadSession(data.token);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setCurrentUser(null);
    setClients([]);
    setUsersList([]);
    setSelectedClient(null);
  };

  const fetchUsers = async (tok: string) => {
    const res = await fetch("/api/users", { headers: { "x-auth-token": tok } });
    if (res.ok) setUsersList(await res.json());
  };

  const toggleUserAccess = async (user: UserRow) => {
    if (!token) return;
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify({ id: user.id, has_access: !user.has_access }),
    });
    if (res.ok) fetchUsers(token);
  };

  const deleteUser = async (id: number) => {
    if (!token || !confirm("Hapus akun user ini?")) return;
    await fetch(`/api/users?id=${id}`, {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });
    fetchUsers(token);
  };

  const fetchClients = async (tok: string) => {
    const res = await fetch("/api/invitations", { headers: { "x-auth-token": tok } });
    if (res.ok) setClients(await res.json());
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
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setForm(EMPTY_FORM);
        fetchClients(token);
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
    await fetch(`/api/invitations?id=${id}`, {
      method: "DELETE",
      headers: { "x-auth-token": token },
    });
    if (selectedClient?.id === id) setSelectedClient(null);
    fetchClients(token);
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
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
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
    if (!token) return;
    await fetch(`/api/guests?id=${id}`, {
      method: "DELETE",
      headers: { "x-auth-token": token },
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center text-sm text-slate-500">
        Memuat sesi...
      </div>
    );
  }

  /* ==================== HALAMAN LOGIN & REGISTER GABUNGAN ==================== */
  if (!token || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white p-7 rounded-2xl shadow-sm border border-blue-100 w-full max-w-sm space-y-5">
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-900">IrsandDigital</h1>
            <p className="text-xs text-slate-500 mt-1">Masuk atau daftar akun untuk membuat undangan</p>
          </div>

          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setAuthTab("login"); setAuthError(""); }}
              className={`py-2 rounded-lg text-xs font-semibold transition ${
                authTab === "login" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab("register"); setAuthError(""); }}
              className={`py-2 rounded-lg text-xs font-semibold transition ${
                authTab === "register" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600"
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {authError}
            </div>
          )}

          {authTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Email (atau ketik: admin)"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base"
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50"
              >
                {authLoading ? "Memproses..." : "Masuk Dashboard"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Nama Lengkap"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base"
              />
              <input
                type="email"
                required
                placeholder="Email Aktif"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base"
              />
              <input
                type="tel"
                required
                placeholder="Nomor WhatsApp (08xxx)"
                value={regWa}
                onChange={(e) => setRegWa(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password (min. 6 karakter)"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base"
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm disabled:opacity-50"
              >
                {authLoading ? "Mendaftar..." : "Daftar Sekarang"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  /* ==================== LAYAR TERKUNCI UNTUK USER BELUM BAYAR ==================== */
  if (currentUser.role !== "admin" && !currentUser.has_access) {
    const waMsg = encodeURIComponent(
      `Halo Admin IrsandDigital, saya *${currentUser.name}* (${currentUser.email}) ingin melakukan pembayaran untuk aktivasi akses pembuatan undangan digital.`
    );
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <h1 className="text-base font-bold text-blue-700">IrsandDigital</h1>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-7 text-center shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Akses Pembuatan Undangan Terkunci</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Halo <strong>{currentUser.name}</strong>, akun Anda sudah terdaftar. Untuk mulai
              membuat undangan digital, silakan lakukan pembayaran dan konfirmasi ke Admin terlebih
              dahulu.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <a
                href={`https://wa.me/${ADMIN_WA}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Hubungi Admin via WhatsApp
              </a>
              <button
                onClick={() => loadSession(token)}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Cek Status Akses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==================== DASHBOARD UTAMA (ADMIN & USER AKTIF) ==================== */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-blue-700">
              {currentUser.role === "admin" ? "Admin Undangan Digital" : "Dashboard Undangan Saya"}
            </h1>
            <p className="text-[11px] text-slate-500">
              Login sebagai: {currentUser.name} ({currentUser.email})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-8">
        {/* KHUSUS ADMIN: MANAJEMEN AKSES USER */}
        {currentUser.role === "admin" && (
          <section className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-blue-700 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Daftar Akun User ({usersList.length}) — Aktivasi Akses Setelah Bayar
            </h2>
            {usersList.length === 0 ? (
              <p className="text-xs text-slate-500">Belum ada user yang mendaftar.</p>
            ) : (
              <div className="space-y-2.5">
                {usersList.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-slate-800">{u.name}</p>
                        {u.has_access ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Belum Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {u.email} {u.whatsapp ? `• WA: ${u.whatsapp}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleUserAccess(u)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition ${
                          u.has_access
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {u.has_access ? "Cabut Akses" : "Aktifkan Akses"}
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* FORM TAMBAH / EDIT UNDANGAN */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Buat / Edit Undangan
          </h2>
          <form onSubmit={handleSaveClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Slug URL (contoh: dika-rani)</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="dika-rani"
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

            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Data Mempelai</p>
            </div>
            <input required placeholder="Panggilan Pria" value={form.groom_nickname} onChange={(e) => setForm({ ...form, groom_nickname: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input required placeholder="Nama Lengkap Pria" value={form.groom_full_name} onChange={(e) => setForm({ ...form, groom_full_name: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Orang Tua Pria" value={form.groom_parents} onChange={(e) => setForm({ ...form, groom_parents: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="URL Foto Pria (opsional)" value={form.groom_photo} onChange={(e) => setForm({ ...form, groom_photo: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />

            <input required placeholder="Panggilan Wanita" value={form.bride_nickname} onChange={(e) => setForm({ ...form, bride_nickname: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input required placeholder="Nama Lengkap Wanita" value={form.bride_full_name} onChange={(e) => setForm({ ...form, bride_full_name: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Orang Tua Wanita" value={form.bride_parents} onChange={(e) => setForm({ ...form, bride_parents: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="URL Foto Wanita (opsional)" value={form.bride_photo} onChange={(e) => setForm({ ...form, bride_photo: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />

            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Tanggal Cover & Countdown</p>
            </div>
            <input placeholder="Teks Tanggal di Cover (Minggu, 20 Des 2026)" value={form.event_date_label} onChange={(e) => setForm({ ...form, event_date_label: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="ISO Countdown (2026-12-20T08:00:00+07:00)" value={form.event_date_iso} onChange={(e) => setForm({ ...form, event_date_iso: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />

            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Detail Akad Nikah</p>
            </div>
            <input placeholder="Tanggal Akad" value={form.akad_date} onChange={(e) => setForm({ ...form, akad_date: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Jam Akad (08.00 - 10.00 WIB)" value={form.akad_time} onChange={(e) => setForm({ ...form, akad_time: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Tempat Akad" value={form.akad_venue} onChange={(e) => setForm({ ...form, akad_venue: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Alamat Akad" value={form.akad_address} onChange={(e) => setForm({ ...form, akad_address: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Link Google Maps Akad (https://maps.google.com/...)" value={form.akad_map_url} onChange={(e) => setForm({ ...form, akad_map_url: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-base" />

            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Detail Resepsi</p>
            </div>
            <input placeholder="Tanggal Resepsi" value={form.resepsi_date} onChange={(e) => setForm({ ...form, resepsi_date: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Jam Resepsi (11.00 - 14.00 WIB)" value={form.resepsi_time} onChange={(e) => setForm({ ...form, resepsi_time: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Tempat Resepsi" value={form.resepsi_venue} onChange={(e) => setForm({ ...form, resepsi_venue: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Alamat Resepsi" value={form.resepsi_address} onChange={(e) => setForm({ ...form, resepsi_address: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-300 text-base" />
            <input placeholder="Link Google Maps Resepsi (https://maps.google.com/...)" value={form.resepsi_map_url} onChange={(e) => setForm({ ...form, resepsi_map_url: e.target.value })} className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 text-base" />

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
                {saving ? "Menyimpan..." : "Simpan Undangan"}
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

        {/* DAFTAR UNDANGAN */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 mb-4">
            {currentUser.role === "admin" ? "Semua Undangan Klien" : "Undangan Saya"} ({clients.length})
          </h2>
          {clients.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada undangan. Silakan buat lewat form di atas.</p>
          ) : (
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
          )}
        </section>

        {/* KELOLA TAMU PER UNDANGAN */}
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
                <p className="text-xs text-slate-500">Belum ada tamu untuk undangan ini.</p>
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