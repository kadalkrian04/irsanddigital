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

/* Pembatas Gelombang Kertas Sobek antar Section */
function PaperWave({ fill }: { fill: string }) {
  return (
    <div className="w-full overflow-hidden leading-none -mt-px" aria-hidden="true">
      <svg viewBox="0 0 400 18" preserveAspectRatio="none" className="w-full h-4 block">
        <path
          d="M0,18 L0,9 Q16,2 32,10 T64,8 T96,11 T128,7 T160,10 T192,8 T224,11 T256,7 T288,10 T320,8 T352,11 T384,7 L400,10 L400,18 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/* 3 Garis Miring Marun di Pojok Kartu Kertas */
function MaroonStripes({ position = "right" }: { position?: "left" | "right" }) {
  return (
    <div
      className={`absolute top-3 ${position === "right" ? "right-3" : "left-3"} flex flex-col gap-1 pointer-events-none`}
      aria-hidden="true"
    >
      <span className="w-4 h-[3px] bg-[#7E2530] -rotate-45 rounded-full block" />
      <span className="w-4 h-[3px] bg-[#7E2530] -rotate-45 rounded-full block" />
      <span className="w-4 h-[3px] bg-[#7E2530] -rotate-45 rounded-full block" />
    </div>
  );
}

const IMG = "/templates/jawa-maroon";

/* Ornamen Sudut Atas Kiri-Kanan pakai gambar asli corner-l.webp */
function SectionCorners() {
  return (
    <>
      <img
        src={`${IMG}/corner-l.webp`}
        alt=""
        draggable={false}
        className="absolute -left-4 -top-2 w-24 pointer-events-none select-none opacity-90 animate-jm-sway origin-top-left"
      />
      <img
        src={`${IMG}/corner-l.webp`}
        alt=""
        draggable={false}
        className="absolute -right-4 -top-2 w-24 pointer-events-none select-none opacity-90 -scale-x-100 animate-jm-sway-slow origin-top-left"
      />
    </>
  );
}

export default function InvitationClient({ invitation, initialWishes, guestName }: Props) {
  const isJawa = invitation.theme === "jawa-maroon";
  const theme = getTheme(invitation.theme);
  const accent = theme.accentHex;

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: false });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [wishList, setWishList] = useState<WishRow[]>(initialWishes);
  const [senderName, setSenderName] = useState(guestName !== "Tamu Undangan" ? guestName : "");
  const [attendance, setAttendance] = useState("Hadir");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Parse tanggal untuk Kalender Gantung
  const eventDateObj = new Date(invitation.event_date_iso);
  const isValidDate = !isNaN(eventDateObj.getTime());
  const calMonthYear = isValidDate
    ? eventDateObj.toLocaleDateString("id-ID", { month: "long", year: "numeric" }).toUpperCase()
    : "NOVEMBER 2026";
  const calDayName = isValidDate
    ? eventDateObj.toLocaleDateString("id-ID", { weekday: "long" }).toUpperCase()
    : "JUMAT";
  const calDayNum = isValidDate ? String(eventDateObj.getDate()) : "20";

  // Link Google Calendar
  const gcalUrl = (() => {
    const title = encodeURIComponent(`Pernikahan ${invitation.bride_nickname} & ${invitation.groom_nickname}`);
    const location = encodeURIComponent(`${invitation.akad_venue}, ${invitation.akad_address}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}`;
  })();

  useEffect(() => {
    const target = new Date(invitation.event_date_iso).getTime();
    const updateTimer = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        passed: false,
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

  const scriptStyle = { fontFamily: "var(--font-script), cursive" };
  const serifStyle = { fontFamily: "var(--font-serif), serif" };

  /* ==================== RENDER KHUSUS TEMA JAWA MAROON ==================== */
  if (isJawa) {
    return (
      <div className="min-h-screen bg-[#E5DEC9] text-[#4B2C2A] flex justify-center">
        {invitation.music_url && <audio ref={audioRef} src={invitation.music_url} loop preload="none" />}

        <main className="w-full max-w-md bg-[#F4EADB] min-h-screen shadow-2xl relative overflow-x-hidden">
          {/* TOMBOL MUSIK POJOK KANAN ATAS */}
          {invitation.music_url && (
            <button
              onClick={toggleMusic}
              aria-label="Toggle Music"
              className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-[#4B2C2A]/75 hover:bg-[#4B2C2A] text-white shadow-lg flex items-center justify-center border border-white/25 backdrop-blur-sm transition"
            >
              {isPlaying ? <Music className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* 1. COVER PEMBUKA */}
          {!isOpen && (
            <div className="fixed inset-0 z-50 flex justify-center bg-[#E5DEC9]">
              <div className="w-full max-w-md h-full relative flex flex-col justify-center items-center text-center px-6 py-7 bg-[#F4EADB] overflow-hidden">
                {/* Ornamen 4 Sudut + Melati pakai Aset Asli */}
                <img
                  src={`${IMG}/corner-l.webp`}
                  alt=""
                  draggable={false}
                  className="absolute -left-4 -top-2 w-32 pointer-events-none select-none opacity-95 animate-jm-sway origin-top-left"
                />
                <img
                  src={`${IMG}/corner-l.webp`}
                  alt=""
                  draggable={false}
                  className="absolute -right-4 -top-2 w-32 pointer-events-none select-none opacity-95 -scale-x-100 animate-jm-sway-slow origin-top-left"
                />
                <img
                  src={`${IMG}/cat.webp`}
                  alt=""
                  draggable={false}
                  className="absolute -left-2 bottom-2 w-28 pointer-events-none select-none animate-jm-bob"
                />
                <img
                  src={`${IMG}/corner-r.webp`}
                  alt=""
                  draggable={false}
                  className="absolute -right-10 -bottom-8 w-32 pointer-events-none select-none opacity-90 rotate-180 animate-jm-sway"
                />
                <img
                  src={`${IMG}/melati.webp`}
                  alt=""
                  draggable={false}
                  className="absolute right-4 top-[47%] w-8 pointer-events-none select-none opacity-95 -rotate-12 animate-jm-bob"
                />

                {/* Pendopo samar di bagian bawah */}
                <img
                  src={`${IMG}/pendopo.webp`}
                  alt=""
                  draggable={false}
                  className="absolute bottom-14 inset-x-0 w-full opacity-20 pointer-events-none select-none"
                />

                <div className="relative z-10 flex flex-col items-center w-full max-w-xs">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#5C6338]">
                    The Wedding Of
                  </p>

                  {/* Gambar Pasangan Pengantin Jawa Maroon */}
                  <div className="mt-3 w-44 flex items-center justify-center">
                    <img
                      src={`${IMG}/couple.webp`}
                      alt="Mempelai"
                      draggable={false}
                      className="w-full h-auto object-contain drop-shadow-[0_8px_10px_rgba(75,44,42,0.18)]"
                    />
                  </div>

                  {/* Nama Mempelai */}
                  <div className="mt-2 leading-none">
                    <h1 className="text-[54px] leading-[1.02] text-[#7E2530]" style={scriptStyle}>
                      {invitation.bride_nickname}
                    </h1>
                    <p className="text-[32px] leading-none text-[#5C6338] my-1.5" style={scriptStyle}>
                      &
                    </p>
                    <h1 className="text-[54px] leading-[1.02] text-[#7E2530]" style={scriptStyle}>
                      {invitation.groom_nickname}
                    </h1>
                  </div>

                  {/* Tanggal */}
                  <div className="mt-2.5 flex items-center justify-center gap-3">
                    <span className="w-7 h-[2.5px] rounded-full bg-[#8C9266]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4B2C2A]">
                      {invitation.event_date_label}
                    </p>
                    <span className="w-7 h-[2.5px] rounded-full bg-[#8C9266]" />
                  </div>

                  {/* Bingkai Nama Tamu pakai note-panel.webp */}
                  <div className="relative w-[256px] max-w-full aspect-[900/257] mt-3 flex items-center justify-center">
                    <img
                      src={`${IMG}/note-panel.webp`}
                      alt=""
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    />
                    <div className="relative z-10 px-8 text-center">
                      <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#6A4A45]">
                        Kepada Yth:
                      </p>
                      <p className="text-base font-semibold text-[#4B2C2A] mt-0.5 leading-tight break-words">
                        {guestName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenInvitation}
                    className="mt-3.5 inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#7E2530] hover:bg-[#661D26] text-[#FBF1E8] text-sm font-semibold tracking-wide shadow-[0_7px_16px_rgba(75,44,42,0.24)] active:scale-95 transition cursor-pointer"
                  >
                    Buka Undangan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. HERO SECTION (KREM) */}
          <section className="relative bg-[#F4EADB] text-center px-6 pt-12 pb-14 overflow-hidden">
            <SectionCorners />
            <div className="relative z-10 flex flex-col items-center">
              <img src={`${IMG}/pendopo.webp`} alt="Pendopo Joglo" className="w-64 h-auto mx-auto" />

              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5C6338] mt-3">
                The Wedding Of
              </p>

              <div className="mt-2 leading-none">
                <h2 className="text-5xl text-[#7E2530]" style={scriptStyle}>
                  {invitation.bride_nickname}
                </h2>
                <p className="text-3xl text-[#5C6338] my-1" style={scriptStyle}>
                  &
                </p>
                <h2 className="text-5xl text-[#7E2530]" style={scriptStyle}>
                  {invitation.groom_nickname}
                </h2>
              </div>

              <img src={`${IMG}/divider.webp`} alt="" className="w-48 h-auto mx-auto my-5" />

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4B2C2A]">
                {invitation.event_date_label}
              </p>
              <p className="text-sm mt-3 text-[#4B2C2A] font-medium" style={serifStyle}>
                {invitation.akad_address}
              </p>
            </div>
          </section>

          <PaperWave fill="#F2E2DE" />

          {/* 3. AYAT SUCI (PINK LEMBUT) */}
          <section className="relative bg-[#F2E2DE] px-6 py-14 text-center overflow-hidden">
            <SectionCorners />
            <div className="relative z-10 max-w-sm mx-auto">
              <img src={`${IMG}/lovebirds.webp`} alt="" className="w-44 h-auto mx-auto -mb-3 relative z-20" />
              <div className="relative bg-[#FAF6F0] px-6 py-8 rounded-sm shadow-md border border-[#E6D6C8]">
                <MaroonStripes position="right" />
                <p className="text-sm italic leading-relaxed text-[#4B2C2A]" style={serifStyle}>
                  “Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan
                  dari jenismu sendiri, agar kamu merasa tenteram kepadanya, dan dijadikan-Nya di antaramu
                  rasa kasih dan sayang.”
                </p>
                <p className="text-2xl text-[#7E2530] mt-5" style={scriptStyle}>
                  QS. Ar-Rum: 21
                </p>
              </div>
            </div>
          </section>

          <PaperWave fill="#F4EADB" />

          {/* 4. MEMPELAI BERBAHAGIA (KREM) */}
          <section className="relative bg-[#F4EADB] px-6 py-14 text-center overflow-hidden">
            <SectionCorners />
            <div className="relative z-10">
              <h3 className="text-4xl text-[#7E2530]" style={scriptStyle}>
                Mempelai Berbahagia
              </h3>
              <img src={`${IMG}/divider.webp`} alt="" className="w-44 h-auto mx-auto my-3" />
              <p className="text-sm leading-relaxed text-[#6A4A45] max-w-xs mx-auto" style={serifStyle}>
                Dengan memohon rahmat Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i
                untuk hadir dan memberi restu pada hari bahagia kami.
              </p>

              {/* Mempelai Wanita */}
              <div className="mt-10 flex flex-col items-center">
                <img
                  src={`${IMG}/bride.webp`}
                  alt={invitation.bride_full_name}
                  className="h-64 w-auto object-contain drop-shadow-md"
                />
                <h4 className="text-4xl text-[#7E2530] mt-4" style={scriptStyle}>
                  {invitation.bride_nickname}
                </h4>
                <p className="text-2xl text-[#4B2C2A] mt-1" style={scriptStyle}>
                  {invitation.bride_full_name}
                </p>
                <p className="text-xs text-[#6A4A45] mt-2 whitespace-pre-line leading-relaxed">
                  {invitation.bride_parents}
                </p>
              </div>

              <img src={`${IMG}/divider.webp`} alt="" className="w-44 h-auto mx-auto my-10" />

              {/* Mempelai Pria */}
              <div className="flex flex-col items-center">
                <img
                  src={`${IMG}/groom.webp`}
                  alt={invitation.groom_full_name}
                  className="h-64 w-auto object-contain drop-shadow-md"
                />
                <h4 className="text-4xl text-[#7E2530] mt-4" style={scriptStyle}>
                  {invitation.groom_nickname}
                </h4>
                <p className="text-2xl text-[#4B2C2A] mt-1" style={scriptStyle}>
                  {invitation.groom_full_name}
                </p>
                <p className="text-xs text-[#6A4A45] mt-2 whitespace-pre-line leading-relaxed">
                  {invitation.groom_parents}
                </p>
              </div>
            </div>
          </section>

          <PaperWave fill="#F2E2DE" />

          {/* 5. MENUJU HARI BAHAGIA / KALENDER (PINK LEMBUT) */}
          <section className="relative bg-[#F2E2DE] px-6 py-14 text-center overflow-hidden">
            <SectionCorners />
            <div className="relative z-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5C6338]">
                Simpan Tanggalnya
              </p>
              <h3 className="text-4xl text-[#7E2530] mt-1" style={scriptStyle}>
                Menuju Hari Bahagia
              </h3>
              <img src={`${IMG}/divider.webp`} alt="" className="w-44 h-auto mx-auto my-3" />

              {/* Kalender Gantung - Posisi Presisi */}
              <div className="relative w-72 mx-auto mt-4 select-none">
                <img src={`${IMG}/calendar.webp`} alt="Kalender" className="w-full h-auto block" />

                {/* Bulan & Tahun: tepat di tengah pita marun */}
                <div className="absolute top-[15.2%] left-[12%] right-[12%] h-[9%] flex items-center justify-center">
                  <span className="text-[11px] font-bold tracking-[0.22em] text-[#FAF6F0]">
                    {calMonthYear}
                  </span>
                </div>

                {/* Hari & Tanggal: tepat di bawah hiasan belah ketupat */}
                <div className="absolute top-[48.5%] left-[14%] right-[14%] flex flex-col items-center justify-center">
                  <span className="text-[11px] font-bold tracking-[0.26em] text-[#5C6338]">
                    {calDayName}
                  </span>
                  <span
                    className="text-[64px] italic font-semibold text-[#7E2530] leading-none mt-1"
                    style={serifStyle}
                  >
                    {calDayNum}
                  </span>
                </div>
              </div>

              {/* Countdown */}
              {timeLeft.passed ? (
                <p className="text-sm italic text-[#6A4A45] mt-4" style={serifStyle}>
                  Hari bahagia sudah berlangsung. Terima kasih!
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto mt-5">
                  {[
                    { label: "Hari", value: timeLeft.days },
                    { label: "Jam", value: timeLeft.hours },
                    { label: "Menit", value: timeLeft.minutes },
                    { label: "Detik", value: timeLeft.seconds },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#FAF6F0] border border-[#DFC9BE] rounded-xl py-2.5 shadow-xs">
                      <div className="text-lg font-bold text-[#7E2530]">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] text-[#6A4A45]">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm italic text-[#6A4A45] mt-5 max-w-xs mx-auto" style={serifStyle}>
                Merupakan kehormatan bagi kami apabila Bapak/Ibu berkenan hadir.
              </p>

              <a
                href={gcalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block px-8 py-2.5 rounded-full border border-[#7E2530] text-[#7E2530] hover:bg-[#7E2530] hover:text-white text-xs font-semibold transition"
              >
                Simpan ke Kalender
              </a>
            </div>
          </section>

          <PaperWave fill="#F4EADB" />

          {/* 6. RANGKAIAN ACARA (KREM) */}
          <section className="relative bg-[#F4EADB] px-6 pt-14 pb-6 text-center overflow-hidden">
            <SectionCorners />
            <div className="relative z-10 space-y-8">
              <div>
                <h3 className="text-4xl text-[#7E2530]" style={scriptStyle}>
                  Rangkaian Acara
                </h3>
                <img src={`${IMG}/divider.webp`} alt="" className="w-44 h-auto mx-auto my-3" />
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
                  title: "Resepsi",
                  date: invitation.resepsi_date,
                  time: invitation.resepsi_time,
                  venue: invitation.resepsi_venue,
                  address: invitation.resepsi_address,
                  mapUrl: invitation.resepsi_map_url,
                },
              ].map((ev) => (
                <div
                  key={ev.title}
                  className="relative px-6 py-8 rounded-3xl border-[1.5px] border-[#7E2530]/60 bg-[#FAF6F0]/60 shadow-xs space-y-3"
                >
                  <img src={`${IMG}/tea-set.webp`} alt="" className="w-48 h-auto mx-auto" />
                  <h4 className="text-4xl text-[#7E2530]" style={scriptStyle}>
                    {ev.title}
                  </h4>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C6338]">
                    {ev.date}
                  </p>
                  <p className="text-sm font-medium text-[#4B2C2A]">{ev.time}</p>
                  <img src={`${IMG}/divider.webp`} alt="" className="w-36 h-auto mx-auto my-2" />
                  <div>
                    <p className="font-bold text-sm text-[#4B2C2A]">{ev.venue}</p>
                    <p className="text-xs text-[#6A4A45] mt-1 leading-relaxed">{ev.address}</p>
                  </div>
                  <div className="pt-2">
                    <a
                      href={ev.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full bg-[#7E2530] hover:bg-[#661D26] text-[#FBF1E8] text-xs font-semibold shadow-md transition"
                    >
                      Lihat Lokasi
                    </a>
                  </div>
                </div>
              ))}

              <img src={`${IMG}/gate.webp`} alt="Gapura Jawa" className="w-full h-auto mx-auto pt-4" />
            </div>
          </section>

          <PaperWave fill="#F2E2DE" />

          {/* 7. KELUARGA KAMI (PINK LEMBUT) */}
          <section className="relative bg-[#F2E2DE] px-6 py-14 text-center overflow-hidden">
            <SectionCorners />
            <div className="relative z-10">
              <h3 className="text-4xl text-[#7E2530]" style={scriptStyle}>
                Keluarga Kami
              </h3>
              <img src={`${IMG}/divider.webp`} alt="" className="w-44 h-auto mx-auto my-3" />

              <div className="relative bg-[#FAF6F0] px-6 py-8 rounded-sm shadow-md border border-[#E6D6C8] mt-5 space-y-5">
                <MaroonStripes position="right" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#5C6338]">
                    Orang Tua Mempelai Wanita
                  </p>
                  <p className="text-base font-medium text-[#4B2C2A] mt-1 whitespace-pre-line" style={serifStyle}>
                    {invitation.bride_parents}
                  </p>
                </div>
                <img src={`${IMG}/divider.webp`} alt="" className="w-32 h-auto mx-auto" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#5C6338]">
                    Orang Tua Mempelai Pria
                  </p>
                  <p className="text-base font-medium text-[#4B2C2A] mt-1 whitespace-pre-line" style={serifStyle}>
                    {invitation.groom_parents}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <PaperWave fill="#F4EADB" />

          {/* 8. TANDA KASIH / AMPLOP DIGITAL (KREM) */}
          {bankAccounts.length > 0 && (
            <>
              <section className="relative bg-[#F4EADB] px-6 py-14 text-center overflow-hidden">
                <SectionCorners />
                <div className="relative z-10">
                  <img src={`${IMG}/gift.webp`} alt="Tanda Kasih" className="w-44 h-auto mx-auto mb-2" />
                  <h3 className="text-4xl text-[#7E2530]" style={scriptStyle}>
                    Tanda Kasih
                  </h3>
                  <img src={`${IMG}/divider.webp`} alt="" className="w-44 h-auto mx-auto my-3" />
                  <p className="text-xs leading-relaxed text-[#6A4A45] max-w-xs mx-auto mb-7">
                    Doa dan kehadiran Bapak/Ibu sudah lebih dari cukup bagi kami. Bila berkenan memberi
                    tanda kasih, kami sediakan pilihan berikut.
                  </p>

                  <div className="space-y-4">
                    {bankAccounts.map((acc, idx) => (
                      <div
                        key={idx}
                        className="relative bg-[#FAF6F0] px-6 py-6 rounded-sm shadow-md border border-[#E6D6C8] text-center space-y-2"
                      >
                        <MaroonStripes position={idx % 2 === 0 ? "right" : "left"} />
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5C6338]">
                          {acc.bank}
                        </p>
                        <p className="text-lg font-mono font-semibold tracking-wider text-[#4B2C2A]">
                          {acc.accountNumber}
                        </p>
                        <p className="text-sm text-[#6A4A45]" style={serifStyle}>
                          {acc.accountName}
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => handleCopy(acc.accountNumber, idx)}
                            className="px-7 py-2 rounded-full border border-[#7E2530] text-[#7E2530] hover:bg-[#7E2530] hover:text-white text-xs font-semibold transition inline-flex items-center gap-1.5"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Nomor Tersalin
                              </>
                            ) : (
                              "Salin Nomor"
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <PaperWave fill="#F2E2DE" />
            </>
          )}

          {/* 9. RSVP & UCAPAN (PINK LEMBUT) */}
          <section className="relative bg-[#F2E2DE] px-6 py-14 text-center overflow-hidden">
            <SectionCorners />
            <div className="relative z-10">
              <img src={`${IMG}/envelope.webp`} alt="RSVP" className="w-40 h-auto mx-auto mb-2" />
              <h3 className="text-4xl text-[#7E2530]" style={scriptStyle}>
                RSVP & Ucapan
              </h3>
              <img src={`${IMG}/divider.webp`} alt="" className="w-44 h-auto mx-auto my-3" />
              <p className="text-xs leading-relaxed text-[#6A4A45] max-w-xs mx-auto mb-7">
                Tinggalkan pesan untuk kami. Setiap doa yang Bapak/Ibu tuliskan akan kami baca.
              </p>

              <div className="relative bg-[#FAF6F0] px-5 pt-8 pb-6 rounded-sm shadow-md border border-[#E6D6C8] text-left">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#7E2530]/90 -rotate-2 shadow-xs pointer-events-none" />
                <MaroonStripes position="right" />

                <form onSubmit={handleSubmitWish} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C5B0] bg-white text-base text-[#4B2C2A] focus:outline-none"
                  />
                  <select
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C5B0] bg-white text-base text-[#4B2C2A] focus:outline-none"
                  >
                    <option value="Hadir">InsyaAllah Hadir</option>
                    <option value="Tidak Hadir">Maaf, Tidak Bisa Hadir</option>
                    <option value="Masih Ragu">Masih Ragu</option>
                  </select>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ucapan & doa"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8C5B0] bg-white text-base text-[#4B2C2A] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-full bg-[#7E2530] hover:bg-[#661D26] text-[#FBF1E8] font-semibold text-sm shadow-md disabled:opacity-50 transition"
                  >
                    {submitting ? "Mengirim..." : "Kirim Ucapan"}
                  </button>
                </form>
              </div>

              <div className="mt-6 space-y-3 max-h-96 overflow-y-auto text-left">
                {wishList.length === 0 ? (
                  <p className="text-center text-xs text-[#6A4A45] py-4">
                    Belum ada ucapan. Jadilah yang pertama mengirim doa!
                  </p>
                ) : (
                  wishList.map((w) => (
                    <div key={w.id} className="bg-[#FAF6F0] px-5 py-4 rounded-sm shadow-sm border border-[#E6D6C8]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-2xl text-[#7E2530]" style={scriptStyle}>
                          {w.guest_name}
                        </p>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#7E2530]/10 text-[#7E2530] font-semibold">
                          {w.attendance}
                        </span>
                      </div>
                      <p className="text-xs text-[#4B2C2A] mt-1 leading-relaxed">{w.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <PaperWave fill="#F4EADB" />

          {/* 10. FOOTER / TERIMA KASIH (KREM) */}
          <footer className="relative bg-[#F4EADB] px-6 pt-14 pb-0 text-center overflow-hidden">
            <SectionCorners />
            <div className="relative z-10 flex flex-col items-center">
              <img src={`${IMG}/couple.webp`} alt="Mempelai" className="w-44 h-auto mx-auto" />

              <h3 className="text-4xl text-[#7E2530] mt-5" style={scriptStyle}>
                Terima Kasih
              </h3>
              <p className="text-xs leading-relaxed text-[#6A4A45] max-w-xs mx-auto mt-3">
                Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami sekeluarga mengucapkan terima
                kasih yang sebesar-besarnya.
              </p>

              <div className="mt-6 leading-none">
                <p className="text-5xl text-[#7E2530]" style={scriptStyle}>
                  {invitation.bride_nickname}
                </p>
                <p className="text-3xl text-[#5C6338] my-1" style={scriptStyle}>
                  &
                </p>
                <p className="text-5xl text-[#7E2530]" style={scriptStyle}>
                  {invitation.groom_nickname}
                </p>
              </div>

              <img src={`${IMG}/divider.webp`} alt="" className="w-44 h-auto mx-auto my-5" />

              <p className="text-2xl text-[#5C6338]" style={scriptStyle}>
                #{invitation.bride_nickname}{invitation.groom_nickname}Berjodoh
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4B2C2A] mt-1 mb-6">
                {invitation.event_date_label}
              </p>
            </div>

            <img src={`${IMG}/footer.webp`} alt="" className="w-full h-auto block" />
          </footer>
        </main>
      </div>
    );
  }

  /* ==================== RENDER TEMA LAINNYA (Classic Gold, Royal Blue, Sage) ==================== */
  return (
    <div className={`min-h-screen ${theme.outerBg} text-slate-800 flex justify-center`}>
      {invitation.music_url && <audio ref={audioRef} src={invitation.music_url} loop preload="none" />}
      <main className="w-full max-w-md bg-white min-h-screen shadow-xl relative overflow-x-hidden">
        {!isOpen && (
          <div className={`fixed inset-0 z-50 flex justify-center ${theme.outerBg}`}>
            <div className="w-full max-w-md h-full relative flex flex-col justify-between items-center text-center p-8 bg-white overflow-hidden">
              {invitation.cover_image && (
                <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${invitation.cover_image})` }} />
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
                  className="mt-5 w-full py-3 px-5 rounded-full text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <MailOpen className="w-4 h-4" /> Buka Undangan
                </button>
              </div>
            </div>
          </div>
        )}

        {isOpen && invitation.music_url && (
          <button
            onClick={toggleMusic}
            aria-label="Toggle Music"
            style={{ backgroundColor: accent }}
            className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full text-white shadow-lg flex items-center justify-center"
          >
            {isPlaying ? <Music className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          </button>
        )}

        <section className={`text-center px-6 pt-16 pb-12 ${theme.sectionAltBg} border-b ${theme.cardBorder}`}>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">We Are Getting Married</p>
          <h2 className="text-5xl mt-3" style={{ ...scriptStyle, color: accent }}>
            {invitation.bride_nickname} & {invitation.groom_nickname}
          </h2>
          <p className="text-sm text-slate-600 mt-2">{invitation.event_date_label}</p>
          <div className="grid grid-cols-4 gap-2 mt-8">
            {[
              { label: "Hari", value: timeLeft.days },
              { label: "Jam", value: timeLeft.hours },
              { label: "Menit", value: timeLeft.minutes },
              { label: "Detik", value: timeLeft.seconds },
            ].map((item) => (
              <div key={item.label} className={`bg-white border ${theme.cardBorder} rounded-xl py-3`}>
                <div className="text-xl font-bold" style={{ color: accent }}>{String(item.value).padStart(2, "0")}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={`px-6 py-10 ${theme.sectionAltBg} text-center space-y-6`}>
          <div className={`bg-white p-6 rounded-2xl border ${theme.cardBorder}`}>
            <h4 className="text-2xl font-serif font-semibold" style={{ color: accent }}>{invitation.bride_full_name}</h4>
            <p className="text-xs text-slate-500 mt-1">{invitation.bride_parents}</p>
          </div>
          <div className="flex justify-center"><Heart className="w-6 h-6" style={{ color: accent }} /></div>
          <div className={`bg-white p-6 rounded-2xl border ${theme.cardBorder}`}>
            <h4 className="text-2xl font-serif font-semibold" style={{ color: accent }}>{invitation.groom_full_name}</h4>
            <p className="text-xs text-slate-500 mt-1">{invitation.groom_parents}</p>
          </div>
        </section>

        <section className="px-6 py-12 space-y-6">
          {[
            { title: "Akad Nikah", date: invitation.akad_date, time: invitation.akad_time, venue: invitation.akad_venue, address: invitation.akad_address, mapUrl: invitation.akad_map_url },
            { title: "Resepsi", date: invitation.resepsi_date, time: invitation.resepsi_time, venue: invitation.resepsi_venue, address: invitation.resepsi_address, mapUrl: invitation.resepsi_map_url },
          ].map((ev) => (
            <div key={ev.title} className={`p-6 rounded-2xl border ${theme.cardBorder} bg-white text-center space-y-2`}>
              <h4 className="text-xl font-serif font-semibold" style={{ color: accent }}>{ev.title}</h4>
              <p className="text-sm flex items-center justify-center gap-2"><Calendar className="w-4 h-4" />{ev.date}</p>
              <p className="text-sm flex items-center justify-center gap-2"><Clock className="w-4 h-4" />{ev.time}</p>
              <p className="font-semibold text-sm pt-2">{ev.venue}</p>
              <p className="text-xs text-slate-500">{ev.address}</p>
              <a href={ev.mapUrl} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: accent }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-xs mt-2">
                <MapPin className="w-4 h-4" /> Lihat Lokasi
              </a>
            </div>
          ))}
        </section>

        {gallery.length > 0 && (
          <section className={`px-6 py-10 ${theme.sectionAltBg}`}>
            <div className="grid grid-cols-2 gap-3">
              {gallery.map((imgUrl, idx) => (
                <img key={idx} src={imgUrl} alt={`Galeri ${idx + 1}`} className="w-full h-44 object-cover rounded-xl" />
              ))}
            </div>
          </section>
        )}

        {bankAccounts.length > 0 && (
          <section className="px-6 py-12 text-center">
            <Gift className="w-7 h-7 mx-auto mb-2" style={{ color: accent }} />
            <div className="space-y-3 mt-4">
              {bankAccounts.map((acc, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border ${theme.cardBorder} ${theme.sectionAltBg} text-left flex items-center justify-between`}>
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: accent }}>{acc.bank}</p>
                    <p className="text-base font-mono font-semibold">{acc.accountNumber}</p>
                    <p className="text-xs text-slate-500">a.n. {acc.accountName}</p>
                  </div>
                  <button onClick={() => handleCopy(acc.accountNumber, idx)} className="px-3 py-2 rounded-lg bg-white border text-xs flex items-center gap-1">
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIndex === idx ? "Tersalin" : "Salin"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={`px-6 py-12 ${theme.sectionAltBg} border-t ${theme.cardBorder}`}>
          <form onSubmit={handleSubmitWish} className="space-y-3 bg-white p-5 rounded-2xl border">
            <input type="text" required placeholder="Nama Anda" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-base" />
            <select value={attendance} onChange={(e) => setAttendance(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-base bg-white">
              <option value="Hadir">InsyaAllah Hadir</option>
              <option value="Tidak Hadir">Maaf, Tidak Bisa Hadir</option>
              <option value="Masih Ragu">Masih Ragu</option>
            </select>
            <textarea required rows={3} placeholder="Tulis ucapan..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border text-base" />
            <button type="submit" disabled={submitting} style={{ backgroundColor: accent }} className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> {submitting ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}