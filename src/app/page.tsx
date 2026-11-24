import Link from "next/link";
import {
  Sparkles,
  Heart,
  ExternalLink,
  ShieldCheck,
  Send,
  Palette,
  Users,
  MessageSquareHeart,
  Check,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* ================= HERO SECTION (GRADASI BIRU LANGIT KE PUTIH) ================= */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#69B4FF] via-[#7C9BFF] to-white pb-16 pt-6 sm:pt-8">
        {/* Bintik Bintang Halus */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 14% 22%, #ffffff 90%, transparent), radial-gradient(2px 2px at 82% 18%, #ffffff 90%, transparent), radial-gradient(1.5px 1.5px at 28% 48%, #ffffff 90%, transparent), radial-gradient(2px 2px at 74% 42%, #ffffff 90%, transparent), radial-gradient(1.5px 1.5px at 90% 35%, #ffffff 90%, transparent), radial-gradient(1.5px 1.5px at 8% 40%, #ffffff 90%, transparent), radial-gradient(2px 2px at 60% 15%, #ffffff 90%, transparent)",
          }}
        />

        {/* FLOATING PILL NAVBAR */}
        <header className="relative z-20 mx-auto max-w-2xl px-4">
          <nav className="flex items-center justify-between gap-2 rounded-full bg-slate-900/90 px-3 py-2 text-white shadow-xl backdrop-blur-md border border-white/10">
            <Link href="/" className="flex items-center gap-2 pl-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-inner">
                <Heart className="h-4 w-4 fill-white text-white" />
              </span>
              <span className="text-sm font-bold tracking-tight hidden sm:inline">
                IrsandDigital
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300">
              <a href="#fitur" className="hover:text-white transition">
                Fitur
              </a>
              <a href="#tema" className="hover:text-white transition">
                Tema
              </a>
              <Link href="/u/dika?to=Tamu+VIP" className="hover:text-white transition">
                Demo
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="rounded-full bg-white/10 hover:bg-white/20 px-3.5 py-1.5 text-xs font-medium text-white transition"
              >
                Admin
              </Link>
              <Link
                href="/u/dika?to=Tamu+VIP"
                className="rounded-full bg-white hover:bg-blue-50 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-xs transition"
              >
                Lihat Demo
              </Link>
            </div>
          </nav>
        </header>

        {/* HERO TEXT & CTA */}
        <section className="relative z-10 mx-auto max-w-3xl px-6 pt-12 text-center sm:pt-16">
          {/* App Icon Badge */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-900/20 ring-4 ring-white/25">
            <Sparkles className="h-7 w-7" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-xs sm:text-5xl md:text-6xl leading-[1.12]">
            Undangan digital,{" "}
            <span className="font-mono font-normal tracking-wider text-white/95 underline decoration-white/40 decoration-dotted underline-offset-8">
              siap
            </span>
            <br />
            untuk dibagikan.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm font-medium text-white/90 sm:text-base">
            Platform undangan pernikahan modern dengan pilihan tema elegan, manajemen daftar tamu,
            amplop digital, dan buku ucapan otomatis.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/u/dika?to=Tamu+VIP"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-blue-950/15 hover:bg-blue-50 active:scale-95 transition"
              >
                <ExternalLink className="h-4 w-4 text-blue-600" />
                Lihat Demo Undangan
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 hover:bg-slate-900 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm border border-white/15 active:scale-95 transition"
              >
                <ShieldCheck className="h-4 w-4 text-blue-300" />
                Panel Admin
              </Link>
            </div>
            <p className="text-[11px] font-medium text-white/80">
              Aktif instan • Nama tamu otomatis • Kirim WhatsApp 1-klik
            </p>
          </div>
        </section>

        {/* MOCKUP WINDOW PREVIEW (MIRIP TAMPILAN EDITOR DI REFERENSI) */}
        <section id="tema" className="relative z-10 mx-auto mt-12 max-w-4xl px-4 sm:mt-14">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-blue-950/15">
            {/* Top Bar macOS Style */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="rounded-md bg-white px-3 py-1 text-[11px] font-medium text-slate-500 border border-slate-200/70">
                irsanddigital.vercel.app/u/dika
              </div>
              <Link
                href="/u/dika?to=Tamu+VIP"
                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 transition"
              >
                <Send className="h-3 w-3" /> Buka
              </Link>
            </div>

            {/* Body Mockup: Kiri Preview Undangan, Kanan Panel Kontrol Tema */}
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Kiri: Preview Visual Undangan */}
              <div className="md:col-span-8 bg-gradient-to-br from-[#78B7FF]/25 via-indigo-50 to-slate-50 p-5 sm:p-8 flex items-center justify-center">
                <div className="w-full max-w-[240px] rounded-2xl border border-[#D8C5B0] bg-[#F4EADB] p-5 text-center shadow-xl">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5C6338]">
                    The Wedding Of
                  </p>
                  <img
                    src="/templates/jawa-maroon/couple.webp"
                    alt="Preview Tema Jawa Maroon"
                    className="mx-auto my-2.5 h-32 w-auto object-contain drop-shadow-sm"
                  />
                  <p
                    className="text-2xl font-bold text-[#7E2530] leading-tight"
                    style={{ fontFamily: "var(--font-script), cursive" }}
                  >
                    Diah & Isal
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-[#6A4A45]">
                    20 November 2026
                  </p>
                  <div className="mt-3 rounded-full bg-[#7E2530] py-1.5 text-[11px] font-semibold text-[#FBF1E8]">
                    Buka Undangan
                  </div>
                </div>
              </div>

              {/* Kanan: Sidebar Pilihan Tema & Status */}
              <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 bg-white p-5 flex flex-col justify-between gap-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Pilihan Tema
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      { name: "Jawa Maroon", color: "bg-[#7E2530]", active: true },
                      { name: "Royal Blue", color: "bg-blue-600", active: false },
                      { name: "Classic Gold", color: "bg-[#8B6F47]", active: false },
                      { name: "Sage Minimal", color: "bg-[#4D7C5D]", active: false },
                    ].map((t) => (
                      <div
                        key={t.name}
                        className={`rounded-xl border p-2.5 text-left ${
                          t.active
                            ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                            : "border-slate-200 bg-slate-50/50"
                        }`}
                      >
                        <span className={`block h-4 w-4 rounded-full ${t.color}`} />
                        <p className="mt-2 text-[11px] font-semibold text-slate-700">{t.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  {[
                    "Link nama tamu otomatis",
                    "Musik & Countdown aktif",
                    "Amplop digital + Salin",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= BOTTOM SECTION (WHITE CLEAN) ================= */}
      <section id="fitur" className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Dirancang agar setiap momen berkesan.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
          Kelola banyak klien sekaligus dalam satu dashboard. Ganti tema, tambah daftar tamu, dan
          sebar undangan ke WhatsApp dalam hitungan detik.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">Tema Per Klien</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Setiap pasangan bisa memakai tema berbeda seperti Jawa Maroon, Royal Blue, hingga Sage
              Minimalist.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">Database Tamu & WA</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Daftar tamu tersimpan rapi per klien lengkap dengan tombol copy link dan kirim langsung
              ke WhatsApp.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <MessageSquareHeart className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">RSVP & Ucapan Real-time</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Tamu bisa langsung mengirim doa dan konfirmasi kehadiran yang otomatis tersimpan di
              database.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        © 2026 IrsandDigital • Platform Undangan Digital
      </footer>
    </div>
  );
}