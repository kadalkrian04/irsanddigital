"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Home } from "lucide-react";

const INPUT_CLASS =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition";

const STAR_BG = {
  backgroundImage:
    "radial-gradient(1.5px 1.5px at 14% 22%, #ffffff 90%, transparent), radial-gradient(2px 2px at 82% 18%, #ffffff 90%, transparent), radial-gradient(1.5px 1.5px at 28% 48%, #ffffff 90%, transparent), radial-gradient(2px 2px at 74% 42%, #ffffff 90%, transparent), radial-gradient(1.5px 1.5px at 90% 35%, #ffffff 90%, transparent), radial-gradient(1.5px 1.5px at 8% 40%, #ffffff 90%, transparent), radial-gradient(2px 2px at 60% 15%, #ffffff 90%, transparent)",
};

export default function LoginPage() {
  const router = useRouter();
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [checking, setChecking] = useState(true);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regWa, setRegWa] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Jika sudah login, langsung arahkan sesuai role
  useEffect(() => {
    const saved = localStorage.getItem("auth_token");
    if (!saved) {
      setChecking(false);
      return;
    }
    fetch("/api/auth/me", { headers: { "x-auth-token": saved } })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user?.role === "admin") router.replace("/admin");
        else if (user?.role === "user") router.replace("/dashboard");
        else {
          localStorage.removeItem("auth_token");
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal login.");
        return;
      }
      localStorage.setItem("auth_token", data.token);
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
        setError(data.error || "Gagal mendaftar.");
        return;
      }
      localStorage.setItem("auth_token", data.token);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#69B4FF] via-[#7C9BFF] to-white flex items-center justify-center text-sm font-medium text-white">
        Memuat...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#69B4FF] via-[#7C9BFF] to-white text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70" style={STAR_BG} />

      <header className="relative z-20 mx-auto max-w-2xl px-4 pt-6 sm:pt-8">
        <nav className="flex items-center justify-between gap-2 rounded-full bg-slate-900/90 px-3 py-2 text-white shadow-xl backdrop-blur-md border border-white/10">
          <Link href="/" className="flex items-center gap-2 pl-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-inner">
              <Heart className="h-4 w-4 fill-white text-white" />
            </span>
            <span className="text-sm font-bold tracking-tight">IrsandDigital</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-4 py-1.5 text-xs font-medium text-white transition"
          >
            <Home className="h-3.5 w-3.5" /> Beranda
          </Link>
        </nav>
      </header>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-12 pb-16">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/20 ring-4 ring-white/25">
          <Sparkles className="h-7 w-7" />
        </div>

        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 backdrop-blur-md p-7 sm:p-8 shadow-2xl shadow-blue-950/15 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {authTab === "login" ? "Selamat Datang Kembali" : "Buat Akun Baru"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {authTab === "login"
                ? "Masuk untuk mengelola undangan digital Anda"
                : "Daftar sekarang untuk mulai membuat undangan digital"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setAuthTab("login"); setError(""); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${
                authTab === "login" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab("register"); setError(""); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition ${
                authTab === "register" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          {authTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Username</label>
                <input
                  type="text"
                  required
                  placeholder="Email Anda (atau ketik: admin)"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 disabled:opacity-50 transition mt-2"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Aktif</label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="0812xxxxxxxx"
                  value={regWa}
                  onChange={(e) => setRegWa(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 disabled:opacity-50 transition mt-2"
              >
                {loading ? "Mendaftar..." : "Daftar Sekarang"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}