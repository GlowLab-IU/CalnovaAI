"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getSevenDayForecast,
  getPersonalBirthYearNote,
  DailyAlmanacInfo,
  ColorOrb,
} from "../utils/lunarAlmanac";
import {
  HuyenCoLogoIcon,
  SparkleIcon,
  AICoachOracleIcon,
  ShareSealIcon,
} from "./HuyenCoIcons";

// Faceted Crystal Gem SVG (giống viên đá quý đa giác lấp lánh trong mẫu)
function FacetedGemOrb({ orb, index }: { orb: ColorOrb; index: number }) {
  return (
    <div
      className="group relative inline-flex items-center justify-center"
      title={`Màu hợp: ${orb.name}`}
    >
      {index === 0 ? (
        // Octagonal smooth gem
        <div
          className="w-7 h-7 rounded-full border-2 shadow-[0_0_12px_rgba(255,255,255,0.2)] transition-transform group-hover:scale-110"
          style={{
            background: orb.gradient,
            borderColor: orb.border,
          }}
        />
      ) : (
        // Faceted diamond crystal SVG
        <svg
          width="30"
          height="30"
          viewBox="0 0 32 32"
          className="drop-shadow-[0_0_10px_rgba(255,255,255,0.25)] transition-transform group-hover:scale-110"
        >
          <polygon
            points="16,2 26,7 30,16 26,25 16,30 6,25 2,16 6,7"
            fill={orb.hex}
            stroke={orb.border}
            strokeWidth="1.2"
          />
          <polygon
            points="16,2 22,10 16,16 10,10"
            fill="rgba(255,255,255,0.45)"
          />
          <polygon
            points="30,16 22,10 16,16 22,22"
            fill="rgba(255,255,255,0.22)"
          />
          <polygon
            points="16,30 22,22 16,16 10,22"
            fill="rgba(0,0,0,0.25)"
          />
          <polygon
            points="2,16 10,22 16,16 10,10"
            fill="rgba(255,255,255,0.3)"
          />
          <circle cx="13" cy="11" r="1.5" fill="#FFFFFF" />
        </svg>
      )}
    </div>
  );
}

// Subtle Yin-Yang & Bagua Watermark Background
function YinYangWatermark() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-64 h-64 text-[#D4AF37] opacity-[0.045] pointer-events-none select-none"
      fill="currentColor"
    >
      <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 6" />
      <circle cx="100" cy="100" r="72" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M100,28 A72,72 0 0,1 100,172 A36,36 0 0,1 100,100 A36,36 0 0,0 100,28 Z" />
      <circle cx="100" cy="64" r="11" fill="#07060B" />
      <circle cx="100" cy="136" r="11" fill="currentColor" />
    </svg>
  );
}

interface AlmanacContentProps {
  user?: any | null;
  isModal?: boolean;
  onClose?: () => void;
  onShare?: () => void;
  copied?: boolean;
}

export function DailyAlmanacCardContent({
  user,
  isModal = false,
  onClose,
  onShare,
  copied = false,
}: AlmanacContentProps) {
  const router = useRouter();
  const forecast = useMemo(() => getSevenDayForecast(new Date()), []);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const activeDay: DailyAlmanacInfo = forecast[selectedIdx] || forecast[0];
  const personalNote = useMemo(
    () => getPersonalBirthYearNote(user?.dateOfBirth || user?.birthDate, activeDay),
    [user, activeDay]
  );

  const userDisplayName = user
    ? `${user.lastName || ""} ${user.firstName || ""}`.trim() || user.username || "Quý Hữu"
    : null;

  const handleAskAI = () => {
    if (onClose) onClose();
    const prompt = `Hôm nay là ${activeDay.solarDateStr} (Âm lịch: ${activeDay.lunarDateStr} - ngày ${activeDay.dayCanChi}, ${activeDay.trucName}). Xin Cố Vấn phân tích chi tiết vận khí hôm nay cho bản mệnh của tôi và gợi ý cách nắm bắt cát khí tốt nhất.`;
    router.push(`/huyen-co/chat?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto text-[#F5EFE6] select-none">
      {/* 1. TOP GREETING BAR ("XIN CHÀO! Hôm nay bạn thế nào?") */}
      <div className="hc-card rounded-3xl px-5 py-4 mb-3.5 flex items-center justify-between border border-[#D4AF37]/30 shadow-[0_10px_35px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-3.5">
          {/* Golden Avatar Coin with notification badge */}
          <div className="relative shrink-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#FFF3C4] via-[#D4AF37] to-[#8A6615] p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.35)]">
              <div className="w-full h-full rounded-full bg-[#120F1D] flex items-center justify-center text-[#E8C96A]">
                <HuyenCoLogoIcon size={32} />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-red-600 border-2 border-[#07060B] text-[10px] font-black text-white flex items-center justify-center shadow">
              1
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-serif font-bold tracking-wider uppercase hc-gold-gradient-text">
                XIN CHÀO{userDisplayName ? `, ${userDisplayName}` : "!"}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#C5B386] mt-0.5">
              {selectedMood
                ? `Tâm thế hôm nay: ${selectedMood} • Đã đồng bộ thiên cơ`
                : "Hôm nay bạn thế nào?"}
            </p>
            {/* Quick mood pills */}
            {!selectedMood && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[
                  { label: "✨ Hứng khởi", val: "Hứng khởi" },
                  { label: "🌿 Bình an", val: "Bình an" },
                  { label: "💭 Trăn trở", val: "Đang trăn trở" },
                ].map((m) => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setSelectedMood(m.val)}
                    className="px-2.5 py-0.5 rounded-full bg-[#07060B]/80 border border-[#D4AF37]/25 hover:border-[#D4AF37] text-[11px] text-[#E8C96A] transition-all cursor-pointer"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Share & Close Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              title={copied ? "Đã sao chép liên kết" : "Chia sẻ lịch vận khí hôm nay"}
              className="w-9 h-9 rounded-full bg-[#07060B]/70 border border-[#D4AF37]/25 hover:border-[#D4AF37] flex items-center justify-center text-[#C5B386] hover:text-[#FFF3C4] transition-all cursor-pointer"
            >
              <ShareSealIcon size={16} />
            </button>
          )}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Đóng"
              className="w-10 h-10 rounded-full bg-[#07060B]/80 border border-[#D4AF37]/30 hover:border-[#D4AF37] flex items-center justify-center text-[#C5B386] hover:text-white text-base transition-all cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. CENTRAL ALMANAC CARD */}
      <div className="hc-card rounded-3xl p-5 sm:p-7 border border-[#D4AF37]/35 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        {/* Subtle Yin-Yang Watermark in center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <YinYangWatermark />
        </div>

        {/* Top Solar & Lunar Date Header */}
        <div className="relative z-10 text-center pb-5 border-b border-[#D4AF37]/15">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[10px] font-bold uppercase tracking-[0.18em] text-[#E8C96A] mb-2">
            <span
              className={`w-2 h-2 rounded-full ${
                activeDay.luckLevel === "good"
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : activeDay.luckLevel === "neutral"
                  ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]"
                  : "bg-rose-400 shadow-[0_0_8px_#fb7185]"
              }`}
            />
            <span>{activeDay.luckLabel}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FFFDF9] tracking-wide">
            {activeDay.solarDateStr}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-[#E8C96A] mt-1 tracking-wide">
            {activeDay.lunarDateStr} • Ngày {activeDay.dayCanChi}
          </p>
          {personalNote && (
            <p className="mt-2 inline-block px-3 py-1 rounded-xl bg-[#07060B]/70 border border-[#D4AF37]/25 text-[11px] text-[#C5B386]">
              ✦ {personalNote}
            </p>
          )}
        </div>

        {/* Giờ Tốt (Auspicious Hours) */}
        <div className="relative z-10 py-5 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#C5B386] font-semibold mb-3">
            Giờ tốt (Hoàng Đạo)
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {activeDay.primeHours.map((h) => (
              <div
                key={h.chi}
                className="px-3.5 py-1.5 rounded-xl bg-[#07060B]/85 border border-[#D4AF37]/30 text-xs sm:text-sm font-bold text-[#FFFDF9] shadow-inner tracking-wide"
              >
                {h.range}
              </div>
            ))}
          </div>
        </div>

        {/* 2x3 Grid: Tuổi hợp | Màu hợp | Xuất hành | Số may mắn | Nên làm | Cần tránh */}
        <div className="relative z-10 grid grid-cols-2 gap-y-5 gap-x-4 py-2 text-center">
          {/* 1. Tuổi hợp */}
          <div className="px-2">
            <span className="text-xs text-[#9E9482] block mb-1">Tuổi hợp</span>
            <span className="text-sm sm:text-base font-bold text-[#FFFDF9] leading-snug block">
              {activeDay.compatibleAges}
            </span>
          </div>

          {/* 2. Màu hợp */}
          <div className="px-2">
            <span className="text-xs text-[#9E9482] block mb-1.5">Màu hợp</span>
            <div className="flex items-center justify-center gap-2.5">
              {activeDay.luckyColors.map((orb, idx) => (
                <FacetedGemOrb key={orb.name} orb={orb} index={idx} />
              ))}
            </div>
          </div>

          {/* 3. Xuất hành */}
          <div className="px-2">
            <span className="text-xs text-[#9E9482] block mb-1">Xuất hành</span>
            <span className="text-sm sm:text-base font-bold text-[#FFFDF9] block">
              {activeDay.travelDirection}
            </span>
          </div>

          {/* 4. Số may mắn */}
          <div className="px-2">
            <span className="text-xs text-[#9E9482] block mb-1">Số may mắn</span>
            <span className="text-base sm:text-lg font-black text-[#E8C96A] block">
              {activeDay.luckyNumber}
            </span>
          </div>

          {/* 5. Nên làm */}
          <div className="px-2">
            <span className="text-xs text-[#9E9482] block mb-1">Nên làm</span>
            <span className="text-sm sm:text-base font-bold text-emerald-300 block">
              {activeDay.shouldDo}
            </span>
          </div>

          {/* 6. Cần tránh */}
          <div className="px-2">
            <span className="text-xs text-[#9E9482] block mb-1">Cần tránh</span>
            <span className="text-sm sm:text-base font-bold text-rose-300 block">
              {activeDay.shouldAvoid}
            </span>
          </div>
        </div>

        {/* Expandable Detail Drawer when clicking "Xem chi tiết" */}
        {showDetail && (
          <div className="relative z-10 mt-5 pt-5 border-t border-[#D4AF37]/20 space-y-4 text-left animate-fadeIn">
            <div className="p-3.5 rounded-2xl bg-[#07060B]/80 border border-[#D4AF37]/25">
              <div className="flex items-center justify-between text-[11px] text-[#E8C96A] font-bold uppercase tracking-wider mb-1.5">
                <span>✦ Lời Khuyên Thiên Cơ Trong Ngày</span>
                <span>Điểm vận khí: {activeDay.luckScore}/100</span>
              </div>
              <p className="text-xs text-[#E5DEC9] leading-relaxed">
                {activeDay.dailyAdvice}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#07060B]/60 border border-[#D4AF37]/15">
                <span className="text-[10px] uppercase tracking-wider text-[#C5B386] font-bold block mb-1">
                  Toàn bộ 6 Giờ Hoàng Đạo
                </span>
                <div className="space-y-1 text-[#F5EFE6]">
                  {activeDay.allGoodHours.map((h) => (
                    <div key={h.chi} className="flex justify-between">
                      <span className="text-[#E8C96A] font-semibold">Giờ {h.chi} ({h.star}):</span>
                      <span>{h.range}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#07060B]/60 border border-[#D4AF37]/15 space-y-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#C5B386] font-bold block">
                    Tam Hợp & Lục Hợp Độ Mạng
                  </span>
                  <p className="text-[#F5EFE6] font-medium mt-0.5">
                    {activeDay.compatibleAgesFull.join(" • ")}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-rose-300/80 font-bold block">
                    Tuổi Xung Ngày (Cần cẩn trọng)
                  </span>
                  <p className="text-rose-200 font-medium mt-0.5">
                    {activeDay.conflictingAges}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#C5B386] font-bold block">
                    Hướng Xuất Hành Đại Cát
                  </span>
                  <p className="text-[#F5EFE6] mt-0.5">
                    Tài Thần: <strong className="text-[#E8C96A]">{activeDay.wealthDirection}</strong> • Hỷ Thần:{" "}
                    <strong className="text-[#E8C96A]">{activeDay.joyDirection}</strong>
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAskAI}
              className="w-full py-3 px-4 rounded-2xl hc-gold-btn font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <AICoachOracleIcon size={16} />
              <span>Hỏi Cố Vấn AI: Ngày Này Với Tuổi Của Tôi Tốt Hay Xấu?</span>
            </button>
          </div>
        )}

        {/* "Xem chi tiết" Button */}
        <div className="relative z-10 mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShowDetail(!showDetail)}
            className="px-8 py-2.5 rounded-full bg-[#07060B]/90 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/45 text-xs sm:text-sm font-semibold text-[#FFF3C4] transition-all shadow-[0_0_20px_rgba(212,175,55,0.15)] cursor-pointer"
          >
            {showDetail ? "Thu gọn chi tiết ↑" : "Xem chi tiết"}
          </button>
        </div>
      </div>

      {/* 3. CHỈ SỐ MAY MẮN 7 NGÀY TỚI (7-Day Luck Forecast) */}
      <div className="mt-5 text-center">
        <h4 className="text-base sm:text-lg font-serif font-bold text-[#FFFDF9] tracking-wide">
          Chỉ số may mắn 7 ngày tới
        </h4>

        {/* Legend: Ngày đẹp • Ngày trung bình • Ngày xấu */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2.5 mb-3.5 text-xs text-[#C5B386]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>Ngày đẹp</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            <span>Ngày trung bình</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_#fb7185]" />
            <span>Ngày xấu</span>
          </span>
        </div>

        {/* Interactive 7-Day Strip */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {forecast.map((day, idx) => {
            const isSelected = idx === selectedIdx;
            const dotColor =
              day.luckLevel === "good"
                ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                : day.luckLevel === "neutral"
                ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]"
                : "bg-rose-400 shadow-[0_0_8px_#fb7185]";

            return (
              <button
                key={day.shortSolarStr}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] scale-[1.03]"
                    : "bg-[#120F1D]/85 border-[#D4AF37]/15 hover:border-[#D4AF37]/40"
                }`}
              >
                <span className="text-[10px] font-bold uppercase text-[#C5B386]">
                  {idx === 0 ? "H.Nay" : day.weekdayShort}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#FFFDF9]">
                  {day.shortSolarStr}
                </span>
                <span className="text-[10px] text-[#9E9482]">
                  {day.lunarDay}/{day.lunarMonth} ÂL
                </span>
                <span className={`w-2.5 h-2.5 rounded-full mt-0.5 ${dotColor}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Compact Quick-Glance Bar for the Homepage (nhanh gọn, 1 dòng thông minh)
export function DailyAlmanacCompactBar({
  onOpenModal,
}: {
  onOpenModal: () => void;
}) {
  const today = useMemo(() => getSevenDayForecast(new Date())[0], []);

  return (
    <div
      onClick={onOpenModal}
      className="max-w-5xl mx-auto hc-card hc-card-hover rounded-2xl px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 cursor-pointer transition-all"
    >
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3.5 text-xs">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#E8C96A] font-bold uppercase tracking-wider text-[10px]">
          <span
            className={`w-2 h-2 rounded-full ${
              today.luckLevel === "good"
                ? "bg-emerald-400"
                : today.luckLevel === "neutral"
                ? "bg-sky-400"
                : "bg-rose-400"
            }`}
          />
          Thiên Cơ Hôm Nay
        </span>
        <span className="font-serif font-bold text-sm text-[#FFFDF9]">
          {today.solarDateStr}
        </span>
        <span className="text-[#E8C96A] font-semibold">
          ({today.lunarDateStr})
        </span>
        <span className="hidden sm:inline text-[#D4AF37]/30">|</span>
        <span className="text-[#C5B386]">
          Giờ tốt: <strong className="text-[#FFFDF9]">{today.primeHours[0]?.range}</strong>
        </span>
        <span className="hidden lg:inline text-[#D4AF37]/30">|</span>
        <span className="hidden lg:inline text-[#C5B386]">
          Tuổi hợp: <strong className="text-[#FFFDF9]">{today.compatibleAges}</strong>
        </span>
      </div>

      <button
        type="button"
        className="shrink-0 px-4 py-1.5 rounded-full bg-[#07060B] border border-[#D4AF37]/40 text-[11px] font-bold text-[#E8C96A] hover:bg-[#D4AF37] hover:text-[#07060B] transition-all uppercase tracking-wider"
      >
        Xem Vận Khí & 7 Ngày Tới →
      </button>
    </div>
  );
}

// Popup Modal that greets the user immediately when entering /huyen-co
export function DailyAlmanacModal({
  isOpen,
  onClose,
  user,
  onShare,
  copied,
}: {
  isOpen: boolean;
  onClose: () => void;
  user?: any | null;
  onShare?: () => void;
  copied?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg my-auto max-h-[94dvh] overflow-y-auto no-scrollbar py-2">
        <DailyAlmanacCardContent
          user={user}
          isModal={true}
          onClose={onClose}
          onShare={onShare}
          copied={copied}
        />
      </div>
    </div>
  );
}
