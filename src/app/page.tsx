import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-blue-100 rounded-2xl shadow-sm p-8 text-center space-y-5">
        <h1 className="text-2xl font-bold text-slate-900">Platform Undangan Digital</h1>
        <p className="text-sm text-slate-600">
          Kelola undangan pernikahan per klien lengkap dengan tema khusus, daftar tamu, dan RSVP otomatis.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/u/dika?to=Tamu+VIP"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            Lihat Demo Undangan (/u/dika)
          </Link>
          <Link
            href="/admin"
            className="w-full py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
          >
            Buka Panel Admin
          </Link>
        </div>
      </div>
    </main>
  );
}