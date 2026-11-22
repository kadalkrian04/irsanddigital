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

export default function InvitationClient({ invitation, initialWishes, guestName }: Props) {
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

  return (
    <div className={`min-h-screen ${theme.outerBg} text-slate-800 flex justify-center`}>
      {invitation.music_url && (
        <audio ref={audioRef} src={invitation.music_url} loop preload="none" />
      )}

      <main className="w-full max-w-md bg-white min-h-screen shadow-xl relative overflow-x-hidden">
        {/* COVER */}
        {!isOpen && (
          <div className={`fixed inset-0 z-50 flex justify-center ${theme.outerBg}`}>
            <div className="w-full max-w-md h-full relative flex flex-col justify-between items-center text-center p-8 bg-white overflow-hidden">
              {invitation.cover_image && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${invitation.cover_image})` }}
                />
              )}
              <div className="relative z-10 mt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">The Wedding Of</p>
                <h1 className="text-4xl font-serif font-semibold mt-3" style={{ color: accent }}>
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
                  className="mt-5 w-full py-3 px-5 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
                >
                  <MailOpen className="w-4 h-4" />
                  Buka Undangan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MUSIC BUTTON */}
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

        {/* HERO + COUNTDOWN */}
        <section className={`text-center px-6 pt-16 pb-12 ${theme.sectionAltBg} border-b ${theme.cardBorder}`}>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">We Are Getting Married</p>
          <h2 className="text-4xl font-serif font-semibold mt-3" style={{ color: accent }}>
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
                <div className="text-xl font-bold" style={{ color: accent }}>
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* AYAT */}
        <section className="px-6 py-10 text-center">
          <p className="text-sm italic text-slate-600 leading-relaxed">
            “Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan
            untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.”
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-2">— QS. Ar-Rum: 21</p>
        </section>

        {/* MEMPELAI */}
        <section className={`px-6 py-10 ${theme.sectionAltBg} text-center space-y-6`}>
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Mempelai</p>
            <h3 className="text-2xl font-serif font-semibold mt-1" style={{ color: accent }}>
              Assalamu'alaikum Wr. Wb.
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:
            </p>
          </div>

          <div className={`bg-white p-6 rounded-2xl border ${theme.cardBorder}`}>
            {invitation.bride_photo && (
              <img
                src={invitation.bride_photo}
                alt={invitation.bride_full_name}
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-slate-100"
              />
            )}
            <h4 className="text-xl font-serif font-semibold mt-4" style={{ color: accent }}>
              {invitation.bride_full_name}
            </h4>
            <p className="text-xs text-slate-500 mt-1">{invitation.bride_parents}</p>
          </div>

          <div className="flex justify-center">
            <Heart className="w-6 h-6" style={{ color: accent }} />
          </div>

          <div className={`bg-white p-6 rounded-2xl border ${theme.cardBorder}`}>
            {invitation.groom_photo && (
              <img
                src={invitation.groom_photo}
                alt={invitation.groom_full_name}
                className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-slate-100"
              />
            )}
            <h4 className="text-xl font-serif font-semibold mt-4" style={{ color: accent }}>
              {invitation.groom_full_name}
            </h4>
            <p className="text-xs text-slate-500 mt-1">{invitation.groom_parents}</p>
          </div>
        </section>

        {/* ACARA */}
        <section className="px-6 py-12 space-y-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-slate-500">Save The Date</p>
            <h3 className="text-2xl font-serif font-semibold mt-1" style={{ color: accent }}>
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
            <div key={ev.title} className={`p-6 rounded-2xl border ${theme.cardBorder} bg-white text-center space-y-3`}>
              <h4 className="text-xl font-serif font-semibold" style={{ color: accent }}>
                {ev.title}
              </h4>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
                <Calendar className="w-4 h-4 shrink-0" style={{ color: accent }} />
                <span>{ev.date}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
                <Clock className="w-4 h-4 shrink-0" style={{ color: accent }} />
                <span>{ev.time}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="font-semibold text-slate-800 text-sm">{ev.venue}</p>
                <p className="text-xs text-slate-500 mt-1">{ev.address}</p>
              </div>
              <a
                href={ev.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: accent }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-medium mt-2"
              >
                <MapPin className="w-4 h-4" />
                Buka Google Maps
              </a>
            </div>
          ))}
        </section>

        {/* GALERI */}
        {gallery.length > 0 && (
          <section className={`px-6 py-10 ${theme.sectionAltBg}`}>
            <div className="text-center mb-6">
              <p className="text-xs uppercase tracking-widest text-slate-500">Our Moments</p>
              <h3 className="text-2xl font-serif font-semibold mt-1" style={{ color: accent }}>
                Galeri Foto
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

        {/* AMPLOP DIGITAL */}
        {bankAccounts.length > 0 && (
          <section className="px-6 py-12 text-center">
            <Gift className="w-7 h-7 mx-auto mb-2" style={{ color: accent }} />
            <h3 className="text-2xl font-serif font-semibold" style={{ color: accent }}>
              Amplop Digital
            </h3>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              Doa restu Anda merupakan karunia yang sangat berarti bagi kami.
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
                    <p className="text-base font-mono font-semibold text-slate-800 mt-0.5">
                      {acc.accountNumber}
                    </p>
                    <p className="text-xs text-slate-500">a.n. {acc.accountName}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(acc.accountNumber, idx)}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium flex items-center gap-1.5 shrink-0"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        Salin
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RSVP & UCAPAN */}
        <section className={`px-6 py-12 ${theme.sectionAltBg} border-t ${theme.cardBorder}`}>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-serif font-semibold" style={{ color: accent }}>
              Ucapan & Doa
            </h3>
          </div>

          <form onSubmit={handleSubmitWish} className={`space-y-3 bg-white p-5 rounded-2xl border ${theme.cardBorder}`}>
            <input
              type="text"
              required
              placeholder="Nama Anda"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base focus:outline-none"
            />
            <select
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base bg-white focus:outline-none"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: accent }}
              className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Mengirim..." : "Kirim Ucapan"}
            </button>
          </form>

          <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
            {wishList.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-4">Belum ada ucapan.</p>
            ) : (
              wishList.map((w) => (
                <div key={w.id} className={`bg-white p-4 rounded-xl border ${theme.cardBorder}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-slate-800">{w.guest_name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${theme.badgeBg} ${theme.badgeText}`}>
                      {w.attendance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{w.message}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="px-6 py-8 text-center bg-white border-t border-slate-100">
          <p className="text-xs text-slate-500">Terima kasih atas doa dan kehadiran Anda</p>
          <p className="text-lg font-serif font-semibold mt-1" style={{ color: accent }}>
            {invitation.bride_nickname} & {invitation.groom_nickname}
          </p>
        </footer>
      </main>
    </div>
  );
}