"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  Copy,
  Check,
  Music,
  VolumeX,
  Heart,
  MailOpen,
  Send,
  Gift,
} from "lucide-react";
import type { InvitationRow, WishRow } from "@/lib/db";
import { getTheme } from "@/lib/themes";

type Props = {
  invitation: InvitationRow;
  initialWishes: WishRow[];
  guestName: string;
};

/* Ornamen Bunga Sudut Jawa Maroon (SVG ringan & tajam) */
function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Ranting utama */}
      <path
        d="M12 8 C40 42, 68 85, 86 142 C92 162, 90 185, 84 205"
        stroke="#5C6338"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M36 40 C65 44, 92 58, 114 82"
        stroke="#6E7745"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M66 96 C46 112, 34 134, 30 162"
        stroke="#6E7745"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Daun Zaitun */}
      <ellipse cx="64" cy="48" rx="14" ry="5.5" transform="rotate(24 64 48)" fill="#8C9266" opacity="0.9" />
      <ellipse cx="88" cy="64" rx="13" ry="5" transform="rotate(38 88 64)" fill="#6E7745" opacity="0.85" />
      <ellipse cx="52" cy="96" rx="15" ry="5.5" transform="rotate(-30 52 96)" fill="#8C9266" opacity="0.9" />
      <ellipse cx="98" cy="118" rx="14" ry="5" transform="rotate(25 98 118)" fill="#6E7745" opacity="0.85" />
      <ellipse cx="68" cy="156" rx="13" ry="4.5" transform="rotate(-45 68 156)" fill="#8C9266" opacity="0.85" />
      <ellipse cx="102" cy="168" rx="12" ry="4.5" transform="rotate(35 102 168)" fill="#5C6338" opacity="0.8" />

      {/* Bunga Marun Besar (Sudut Atas) */}
      <g transform="translate(34, 34)">
        <ellipse cx="0" cy="-16" rx="9" ry="15" fill="#7E2530" opacity="0.92" />
        <ellipse cx="15" cy="-5" rx="9" ry="15" transform="rotate(72 15 -5)" fill="#8F2D3A" opacity="0.9" />
        <ellipse cx="10" cy="14" rx="9" ry="15" transform="rotate(144 10 14)" fill="#7E2530" opacity="0.92" />
        <ellipse cx="-10" cy="14" rx="9" ry="15" transform="rotate(216 -10 14)" fill="#8F2D3A" opacity="0.9" />
        <ellipse cx="-15" cy="-5" rx="9" ry="15" transform="rotate(288 -15 -5)" fill="#7E2530" opacity="0.92" />
        <circle cx="0" cy="0" r="5.5" fill="#E8C58E" />
        <circle cx="0" cy="0" r="2.5" fill="#4B2C2A" />
      </g>

      {/* Bunga Merah Muda Lembut (Tengah) */}
      <g transform="translate(88, 128)">
        <ellipse cx="0" cy="-12" rx="7" ry="11" fill="#E9B4B1" opacity="0.95" />
        <ellipse cx="11" cy="-3" rx="7" ry="11" transform="rotate(72 11 -3)" fill="#F2C8C5" opacity="0.95" />
        <ellipse cx="7" cy="10" rx="7" ry="11" transform="rotate(144 7 10)" fill="#E9B4B1" opacity="0.95" />
        <ellipse cx="-7" cy="10" rx="7" ry="11" transform="rotate(216 -7 10)" fill="#F2C8C5" opacity="0.95" />
        <ellipse cx="-11" cy="-3" rx="7" ry="11" transform="rotate(288 -11 -3)" fill="#E9B4B1" opacity="0.95" />
        <circle cx="0" cy="0" r="4" fill="#7E2530" />
      </g>

      {/* Kuncup Marun Kecil */}
      <circle cx="116" cy="84" r="5" fill="#7E2530" opacity="0.85" />
      <circle cx="30" cy="166" r="4.5" fill="#8F2D3A" opacity="0.85" />
      <circle cx="84" cy="204" r="4" fill="#7E2530" opacity="0.8" />
    </svg>
  );
}

/* Siluet Pendopo Joglo Halus untuk Background Bawah Cover */
function JogloBackdrop() {
  return (
    <svg
      viewBox="0 0 420 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto opacity-[0.14] pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Atap Tajug / Joglo */}
      <path d="M210 14 L156 68 L264 68 Z" fill="#6A4A45" />
      <path d="M156 68 L84 106 L336 106 L264 68 Z" fill="#6A4A45" />
      <path d="M84 106 L34 126 L386 126 L336 106 Z" fill="#6A4A45" />
      {/* Ornamen puncak */}
      <rect x="206" y="4" width="8" height="14" rx="2" fill="#6A4A45" />
      {/* Tiang Soko Guru */}
      <rect x="76" y="126" width="8" height="58" fill="#6A4A45" />
      <rect x="148" y="126" width="9" height="58" fill="#6A4A45" />
      <rect x="263" y="126" width="9" height="58" fill="#6A4A45" />
      <rect x="336" y="126" width="8" height="58" fill="#6A4A45" />
      {/* Garis lantai */}
      <rect x="24" y="182" width="372" height="4" rx="2" fill="#6A4A45" />
    </svg>
  );
}

export default function InvitationClient({ invitation, initialWishes, guestName }: Props) {
  const isJawa = invitation.theme === "jawa-maroon";
  const theme = getTheme(invitation.theme);
  const accent = theme.accentHex;

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [wishList, setWishList] = useState<WishRow[]>(initialWishes);
  const [senderName, setSenderName] = useState(guestName !== "Tamu Undangan" ? guestName : "");
  const [attendance, setAttendance] = useState("Hadir");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const target = new Date(invitation.event_date_iso).getTime();
    const updateTimer = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [invitation.event_date_iso]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    if (audioRef.current && invitation.music_url) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: invitation.id,
          guestName: senderName,
          attendance,
          message,
        }),
      });
      if (res.ok) {
        const newWish: WishRow = await res.json();
        setWishList([newWish, ...wishList]);
        setMessage("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const bankAccounts = Array.isArray(invitation.bank_accounts) ? invitation.bank_accounts : [];
  const gallery = Array.isArray(invitation.gallery) ? invitation.gallery : [];

  const mainBgClass = isJawa ? "bg-[#FEFBF4] text-[#4B2C2A]" : "bg-white text-slate-800";
  const scriptStyle = { fontFamily: "var(--font-script), cursive" };
  const serifStyle = { fontFamily: "var(--font-serif), serif" };

  return (
    <div className={`min-h-screen ${theme.outerBg} flex justify-center`}>
      {invitation.music_url && (
        <audio ref={audioRef} src={invitation.music_url} loop preload="none" />
      )}

      <main className={`w-full max-w-md ${mainBgClass} min-h-screen shadow-2xl relative overflow-x-hidden`}>
        {/* TOMBOL MUSIK POJOK KANAN ATAS */}
        {invitation.music_url && (
          <button
            onClick={toggleMusic}
            aria-label="Toggle Music"
            className={`fixed top-4 right-4 z-[60] w-10 h-10 rounded-full text-white shadow-lg flex items-center justify-center border border-white/25 backdrop-blur-sm transition ${
              isJawa ? "bg-[#4B2C2A]/75 hover:bg-[#4B2C2A]" : "bg-black/50 hover:bg-black/70"
            }`}
          >
            {isPlaying ? <Music className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>
        )}

        {/* ================= COVER SCREEN ================= */}
        {!isOpen && (
          <div className={`fixed inset-0 z-50 flex justify-center ${theme.outerBg}`}>
            {isJawa ? (
              /* COVER KHUSUS TEMA JAWA MAROON */
              <div className="w-full max-w-md h-full relative flex flex-col justify-center items-center text-center px-6 py-8 bg-[#F4EADB] overflow-hidden">
                {/* Tekstur kertas lembut */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(#CBB89D 0.6px, transparent 0.6px), radial-gradient(#CBB89D 0.6px, #F4EADB 0.6px)",
                    backgroundSize: "24px 24px",
                    backgroundPosition: "0 0, 12px 12px",
                  }}
                />

                {/* Ornamen Bunga 4 Sudut */}
                <div className="absolute -left-3 -top-2 w-32 pointer-events-none">
                  <FloralCorner className="w-full h-auto animate-jm-sway origin-top-left" />
                </div>
                <div className="absolute -right-3 -top-2 w-32 pointer-events-none -scale-x-100">
                  <FloralCorner className="w-full h-auto animate-jm-sway-slow origin-top-left" />
                </div>
                <div className="absolute -left-4 -bottom-6 w-28 pointer-events-none -scale-y-100 opacity-85">
                  <FloralCorner className="w-full h-auto animate-jm-sway-slow origin-top-left" />
                </div>
                <div className="absolute -right-4 -bottom-6 w-32 pointer-events-none rotate-180 opacity-90">
                  <FloralCorner className="w-full h-auto animate-jm-sway origin-top-left" />
                </div>

                {/* Siluet Pendopo Joglo di belakang bawah */}
                <div className="absolute inset-x-0 bottom-8 pointer-events-none">
                  <JogloBackdrop />
                </div>

                {/* Konten Utama Cover */}
                <div className="relative z-10 flex flex-col items-center w-full max-w-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#5C6338]">
                    The Wedding Of
                  </p>

                  {/* Foto / Ilustrasi Mempelai di Cover */}
                  {invitation.cover_image && (
                    <div className="mt-4 w-40 h-44 flex items-center justify-center animate-jm-bob">
                      <img
                        src={invitation.cover_image}
                        alt="Mempelai"
                        className="max-h-44 w-auto object-contain rounded-2xl drop-shadow-[0_10px_12px_rgba(75,44,42,0.2)]"
                      />
                    </div>
                  )}

                  {/* Nama Mempelai Bertumpuk dengan Font Kaligrafi */}
                  <div className="mt-3 leading-none">
                    <h1
                      className="text-5xl text-[#7E2530]"
                      style={scriptStyle}
                    >
                      {invitation.bride_nickname}
                    </h1>
                    <p
                      className="text-3xl text-[#5C6338] my-1"
                      style={scriptStyle}
                    >
                      &
                    </p>
                    <h1
                      className="text-5xl text-[#7E2530]"
                      style={scriptStyle}
                    >
                      {invitation.groom_nickname}
                    </h1>
                  </div>

                  {/* Tanggal dengan Garis Hijau Zaitun di Kiri-Kanan */}
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <span className="w-7 h-[2px] rounded-full bg-[#8C9266]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4B2C2A]">
                      {invitation.event_date_label}
                    </p>
                    <span className="w-7 h-[2px] rounded-full bg-[#8C9266]" />
                  </div>

                  {/* Bingkai Nama Tamu */}
                  <div className="mt-5 w-full relative px-6 py-4 bg-[#FEFBF4]/80 backdrop-blur-[2px] border border-[#9E7B73] rounded-xl shadow-xs">
                    <div className="absolute inset-1 border border-[#9E7B73]/45 rounded-lg pointer-events-none" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6A4A45]">
                      Kepada Yth:
                    </p>
                    <p className="text-base font-semibold text-[#4B2C2A] mt-1 break-words">
                      {guestName}
                    </p>
                  </div>

                  {/* Tombol Buka Undangan Kapsul Marun */}
                  <button
                    onClick={handleOpenInvitation}
                    className="mt-5 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#7E2530] hover:bg-[#661D26] text-[#FBF1E8] text-sm font-semibold tracking-wide shadow-[0_7px_16px_rgba(75,44,42,0.28)] active:scale-95 transition cursor-pointer"
                  >
                    <MailOpen className="w-4 h-4" />
                    Buka Undangan
                  </button>
                </div>
              </div>
            ) : (
              /* COVER UNTUK TEMA LAINNYA (Classic Gold, Royal Blue, Sage) */
              <div className="w-full max-w-md h-full relative flex flex-col justify-between items-center text-center p-8 bg-white overflow-hidden">
                {invitation.cover_image && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${invitation.cover_image})` }}
                  />
                )}
                <div className="relative z-10 mt-10">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">The Wedding Of</p>
                  <h1 className="text-5xl mt-3" style={{ ...scriptStyle, color: accent }}>
                    {invitation.bride_nickname} & {invitation.groom_nickname}
                  </h1>
                  <p className="text-sm text-slate-600 mt-2">{invitation.event_date_label}</p>
                </div>

                <div className={`relative z-10 w-full bg-white/95 backdrop-blur-sm border ${theme.cardBorder} rounded-2xl p-6 shadow-sm mb-8`}>
                  <p className="text-xs text-slate-500">Kepada Yth. Bapak/Ibu/Saudara/i</p>
                  <p className="text-lg font-semibold text-slate-800 mt-1">{guestName}</p>
                  <button
                    onClick={handleOpenInvitation}
                    style={{ backgroundColor: accent }}
                    className="mt-5 w-full py-3 px-5 rounded-full text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
                  >
                    <MailOpen className="w-4 h-4" />
                    Buka Undangan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 1: HERO + COUNTDOWN ================= */}
        <section
          className={`relative text-center px-6 pt-16 pb-12 ${theme.sectionAltBg} border-b ${theme.cardBorder} overflow-hidden`}
        >
          {isJawa && (
            <>
              <div className="absolute -left-5 -top-4 w-24 pointer-events-none opacity-70">
                <FloralCorner className="w-full h-auto" />
              </div>
              <div className="absolute -right-5 -top-4 w-24 pointer-events-none -scale-x-100 opacity-70">
                <FloralCorner className="w-full h-auto" />
              </div>
            </>
          )}
          <div className="relative z-10">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${
                isJawa ? "text-[#5C6338]" : "text-slate-500"
              }`}
            >
              Menuju Hari Bahagia
            </p>
            <h2 className="text-5xl mt-3" style={{ ...scriptStyle, color: accent }}>
              {invitation.bride_nickname} & {invitation.groom_nickname}
            </h2>
            <p className={`text-xs uppercase tracking-[0.2em] mt-2 ${isJawa ? "text-[#6A4A45]" : "text-slate-600"}`}>
              {invitation.event_date_label}
            </p>

            <div className="grid grid-cols-4 gap-2.5 mt-8">
              {[
                { label: "Hari", value: timeLeft.days },
                { label: "Jam", value: timeLeft.hours },
                { label: "Menit", value: timeLeft.minutes },
                { label: "Detik", value: timeLeft.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`${isJawa ? "bg-[#FEFBF4]" : "bg-white"} border ${theme.cardBorder} rounded-2xl py-3 shadow-xs`}
                >
                  <div className="text-xl font-bold" style={{ color: accent }}>
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isJawa ? "text-[#6A4A45]" : "text-slate-500"}`}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: AYAT ================= */}
        <section className="px-7 py-12 text-center">
          <p className={`text-sm italic leading-relaxed ${isJawa ? "text-[#6A4A45]" : "text-slate-600"}`} style={serifStyle}>
            “Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan dari
            jenismu sendiri, agar kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu rasa
            kasih dan sayang.”
          </p>
          <p className={`text-xs font-semibold tracking-widest uppercase mt-3 ${isJawa ? "text-[#5C6338]" : "text-slate-500"}`}>
            — QS. Ar-Rum: 21 —
          </p>
        </section>

        {/* ================= SECTION 3: MEMPELAI ================= */}
        <section className={`px-6 py-12 ${theme.sectionAltBg} text-center space-y-6 border-y ${theme.cardBorder}`}>
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${isJawa ? "text-[#5C6338]" : "text-slate-500"}`}>
              Mempelai Berbahagia
            </p>
            <h3 className="text-3xl font-semibold mt-1" style={{ ...serifStyle, color: accent }}>
              Assalamu'alaikum Wr. Wb.
            </h3>
            <p className={`text-xs leading-relaxed mt-2 ${isJawa ? "text-[#6A4A45]" : "text-slate-600"}`}>
              Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:
            </p>
          </div>

          <div className={`${isJawa ? "bg-[#FEFBF4]" : "bg-white"} p-6 rounded-2xl border ${theme.cardBorder} shadow-xs`}>
            {invitation.bride_photo && (
              <img
                src={invitation.bride_photo}
                alt={invitation.bride_full_name}
                className={`w-28 h-28 rounded-full object-cover mx-auto border-4 ${
                  isJawa ? "border-[#E6DEC8]" : "border-slate-100"
                }`}
              />
            )}
            <h4 className="text-3xl mt-4" style={{ ...scriptStyle, color: accent }}>
              {invitation.bride_full_name}
            </h4>
            <p className={`text-xs mt-2 whitespace-pre-line ${isJawa ? "text-[#6A4A45]" : "text-slate-500"}`}>
              {invitation.bride_parents}
            </p>
          </div>

          <div className="flex justify-center">
            <Heart className="w-6 h-6" style={{ color: accent }} />
          </div>

          <div className={`${isJawa ? "bg-[#FEFBF4]" : "bg-white"} p-6 rounded-2xl border ${theme.cardBorder} shadow-xs`}>
            {invitation.groom_photo && (
              <img
                src={invitation.groom_photo}
                alt={invitation.groom_full_name}
                className={`w-28 h-28 rounded-full object-cover mx-auto border-4 ${
                  isJawa ? "border-[#E6DEC8]" : "border-slate-100"
                }`}
              />
            )}
            <h4 className="text-3xl mt-4" style={{ ...scriptStyle, color: accent }}>
              {invitation.groom_full_name}
            </h4>
            <p className={`text-xs mt-2 whitespace-pre-line ${isJawa ? "text-[#6A4A45]" : "text-slate-500"}`}>
              {invitation.groom_parents}
            </p>
          </div>
        </section>

        {/* ================= SECTION 4: RANGKAIAN ACARA ================= */}
        <section className="px-6 py-12 space-y-6">
          <div className="text-center">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${isJawa ? "text-[#5C6338]" : "text-slate-500"}`}>
              Save The Date
            </p>
            <h3 className="text-3xl font-semibold mt-1" style={{ ...serifStyle, color: accent }}>
              Rangkaian Acara
            </h3>
          </div>

          {[
            {
              title: "Akad Nikah",
              date: invitation.akad_date,
              time: invitation.akad_time,
              venue: invitation.akad_venue,
              address: invitation.akad_address,
              mapUrl: invitation.akad_map_url,
            },
            {
              title: "Resepsi Pernikahan",
              date: invitation.resepsi_date,
              time: invitation.resepsi_time,
              venue: invitation.resepsi_venue,
              address: invitation.resepsi_address,
              mapUrl: invitation.resepsi_map_url,
            },
          ].map((ev) => (
            <div
              key={ev.title}
              className={`p-6 rounded-2xl border ${theme.cardBorder} ${
                isJawa ? "bg-[#F4EADB]/55" : "bg-white"
              } text-center space-y-3 shadow-xs`}
            >
              <h4 className="text-3xl" style={{ ...scriptStyle, color: accent }}>
                {ev.title}
              </h4>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Calendar className="w-4 h-4 shrink-0" style={{ color: accent }} />
                <span>{ev.date}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Clock className="w-4 h-4 shrink-0" style={{ color: accent }} />
                <span>{ev.time}</span>
              </div>
              <div className={`pt-3 border-t ${theme.cardBorder}`}>
                <p className="font-semibold text-sm">{ev.venue}</p>
                <p className={`text-xs mt-1 ${isJawa ? "text-[#6A4A45]" : "text-slate-500"}`}>
                  {ev.address}
                </p>
              </div>
              <a
                href={ev.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: accent }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-semibold mt-2 shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5" />
                Lihat Lokasi
              </a>
            </div>
          ))}
        </section>

        {/* ================= SECTION 5: GALERI ================= */}
        {gallery.length > 0 && (
          <section className={`px-6 py-12 ${theme.sectionAltBg} border-t ${theme.cardBorder}`}>
            <div className="text-center mb-6">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${isJawa ? "text-[#5C6338]" : "text-slate-500"}`}>
                Our Moments
              </p>
              <h3 className="text-3xl font-semibold mt-1" style={{ ...serifStyle, color: accent }}>
                Galeri Bahagia
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {gallery.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Galeri ${idx + 1}`}
                  className={`w-full h-44 object-cover rounded-xl border ${theme.cardBorder}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* ================= SECTION 6: TANDA KASIH / AMPLOP DIGITAL ================= */}
        {bankAccounts.length > 0 && (
          <section className={`px-6 py-12 text-center border-t ${theme.cardBorder}`}>
            <Gift className="w-7 h-7 mx-auto mb-2" style={{ color: accent }} />
            <h3 className="text-3xl font-semibold" style={{ ...serifStyle, color: accent }}>
              Tanda Kasih
            </h3>
            <p className={`text-xs mt-2 mb-6 leading-relaxed ${isJawa ? "text-[#6A4A45]" : "text-slate-500"}`}>
              Doa restu Bapak/Ibu sudah lebih dari cukup bagi kami. Bila berkenan memberi tanda kasih,
              dapat melalui rekening berikut:
            </p>
            <div className="space-y-3">
              {bankAccounts.map((acc, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.sectionAltBg} text-left flex items-center justify-between gap-3`}
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
                      {acc.bank}
                    </p>
                    <p className="text-base font-mono font-semibold mt-0.5">{acc.accountNumber}</p>
                    <p className={`text-xs ${isJawa ? "text-[#6A4A45]" : "text-slate-500"}`}>
                      a.n. {acc.accountName}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(acc.accountNumber, idx)}
                    className="px-3.5 py-2 rounded-full bg-white border border-stone-300 text-xs font-medium flex items-center gap-1.5 shrink-0 text-stone-700"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= SECTION 7: RSVP & UCAPAN ================= */}
        <section className={`px-6 py-12 ${theme.sectionAltBg} border-t ${theme.cardBorder}`}>
          <div className="text-center mb-6">
            <h3 className="text-3xl font-semibold" style={{ ...serifStyle, color: accent }}>
              RSVP & Ucapan
            </h3>
            <p className={`text-xs mt-1 ${isJawa ? "text-[#6A4A45]" : "text-slate-500"}`}>
              Tinggalkan pesan dan doa terbaik untuk kami
            </p>
          </div>

          <form
            onSubmit={handleSubmitWish}
            className={`space-y-3 ${isJawa ? "bg-[#FEFBF4]" : "bg-white"} p-5 rounded-2xl border ${theme.cardBorder}`}
          >
            <input
              type="text"
              required
              placeholder="Nama Anda"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-base text-stone-800 focus:outline-none"
            />
            <select
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-base text-stone-800 focus:outline-none"
            >
              <option value="Hadir">InsyaAllah Hadir</option>
              <option value="Tidak Hadir">Maaf, Tidak Bisa Hadir</option>
              <option value="Masih Ragu">Masih Ragu</option>
            </select>
            <textarea
              required
              rows={3}
              placeholder="Tulis ucapan dan doa terbaik..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-base text-stone-800 focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: accent }}
              className="w-full py-3 rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </form>

          <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
            {wishList.length === 0 ? (
              <p className={`text-center text-xs py-4 ${isJawa ? "text-[#6A4A45]" : "text-slate-500"}`}>
                Belum ada ucapan. Jadilah yang pertama mengirim doa!
              </p>
            ) : (
              wishList.map((w) => (
                <div key={w.id} className={`${isJawa ? "bg-[#FEFBF4]" : "bg-white"} p-4 rounded-xl border ${theme.cardBorder}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{w.guest_name}</p>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${theme.badgeBg} ${theme.badgeText}`}>
                      {w.attendance}
                    </span>
                  </div>
                  <p className={`text-xs mt-1.5 leading-relaxed ${isJawa ? "text-[#6A4A45]" : "text-slate-600"}`}>
                    {w.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className={`px-6 py-10 text-center border-t ${theme.cardBorder}`}>
          <p className={`text-xs ${isJawa ? "text-[#6A4A45]" : "text-slate-500"}`}>
            Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami mengucapkan terima kasih.
          </p>
          <p className="text-4xl mt-3" style={{ ...scriptStyle, color: accent }}>
            {invitation.bride_nickname} & {invitation.groom_nickname}
          </p>
        </footer>
      </main>
    </div>
  );
}