"use client";

import React, { useEffect, useState } from "react";
import {
  FacePhysiognomyIcon,
  PalmReadingIcon,
  SparkleIcon,
} from "./HuyenCoIcons";

interface ScanWaitingOverlayProps {
  mode: "face" | "palm";
  capturedUrl: string | null;
  isMirrored: boolean;
}

const FACE_TRIVIA: { question: string; answer: string; tag: string }[] = [
  {
    tag: "Mật Mã Ấn Đường",
    question: "Khoảng cách giữa hai đầu lông mày (Ấn Đường) rộng khoảng 1.5 – 2 ngón tay báo hiệu điều gì?",
    answer: "Cung Mệnh sáng sủa, tâm tính khoáng đạt, bao dung và dễ gặp quý nhân nâng đỡ khi khởi sự lớn.",
  },
  {
    tag: "Bí Ẩn Tam Đình",
    question: "Vì sao cổ nhân chia khuôn mặt thành Thượng – Trung – Hạ Đình?",
    answer: "Thượng Đình (trán) chủ tiền vận 15–30 tuổi, Trung Đình (mũi – gò má) chủ trung vận 31–50 tuổi, Hạ Đình (nhân trung – cằm) chủ hậu vận về sau.",
  },
  {
    tag: "Thần Khí Đôi Mắt",
    question: "Bộ vị nào chiếm tới 50% điểm số cát hung trong Diện Tướng Học phương Đông?",
    answer: "Đôi mắt (Giám Sát Quan). Mắt có thần, lòng đen – trắng phân minh là dấu hiệu trí tuệ minh mẫn và nghị lực vượt trội.",
  },
  {
    tag: "Chuẩn Đầu & Tài Bạch",
    question: "Chóp mũi (Chuẩn Đầu) tròn đầy, hai cánh mũi (Lan Đài – Đình Úy) cân xứng nói lên điều gì?",
    answer: "Khả năng tích lũy tài chính vững vàng, giỏi quản trị nguồn lực và có lộc về điền sản, kinh doanh.",
  },
  {
    tag: "Địa Các & Hậu Vận",
    question: "Khuôn cằm (Địa Các) đầy đặn, vững chãi mang ý nghĩa gì trong tướng pháp?",
    answer: "Biểu trưng cho phúc khí hậu vận dồi dào, gia đạo êm ấm, càng về trung và hậu vận càng an nhàn, sung túc.",
  },
];

const PALM_TRIVIA: { question: string; answer: string; tag: string }[] = [
  {
    tag: "Bí Mật Đường Trí Đạo",
    question: "Đường Trí Đạo (chính giữa lòng bàn tay) uốn cong nhẹ về phía Gò Thái Âm báo hiệu điều gì?",
    answer: "Tư duy sáng tạo phong phú, trực giác nhạy bén, kết hợp hài hòa giữa lý trí sắc sảo và nghệ thuật giao tiếp.",
  },
  {
    tag: "Đường Sinh Đạo Đôi",
    question: "Có một đường vân mảnh chạy song song bên trong đường Sinh Đạo mang ý nghĩa gì?",
    answer: "Gọi là 'Đường Quý Nhân' (Hỏa Tinh tuyến) — báo hiệu sinh lực dồi dào, gặp việc khó thường có người âm thầm trợ lực.",
  },
  {
    tag: "Gò Mộc Tinh",
    question: "Vùng thịt ngay dưới gốc ngón trỏ (Gò Mộc Tinh) nổi cao, hồng hào nói lên điều gì?",
    answer: "Tố chất lãnh đạo bẩm sinh, có chí tiến thủ mạnh mẽ, trọng danh dự và dễ đạt vị thế cao trong sự nghiệp.",
  },
  {
    tag: "Đuôi Cá Đường Tâm Đạo",
    question: "Đường Tâm Đạo phân nhánh hình đuôi cá ở cuối đường chỉ tay báo hiệu điều gì?",
    answer: "Người giàu lòng trắc ẩn, biết lắng nghe, nhân duyên tốt đẹp và thường nhận được sự yêu mến từ tập thể.",
  },
  {
    tag: "Vân Mắt Phượng",
    question: "Đốt giữa ngón tay cái khép lại tạo thành hình vòng tròn như mắt chim phượng là dấu hiệu gì?",
    answer: "Tướng 'Phượng Nhãn Văn' quý hiếm — chủ về trí tuệ sắc bén, trực giác chuẩn xác và hôn nhân, tài lộc viên mãn.",
  },
];

const BLESSINGS = [
  "✦ Thần Khí Tinh Anh",
  "✦ Quý Nhân Tương Trợ",
  "✦ Tài Lộc Hanh Thông",
  "✦ Tâm An Trí Sáng",
  "✦ Phúc Trạch Viên Mãn",
  "✦ Vạn Sự Cát Tường",
];

export default function ScanWaitingOverlay({
  mode,
  capturedUrl,
  isMirrored,
}: ScanWaitingOverlayProps) {
  const isFace = mode === "face";
  const triviaList = isFace ? FACE_TRIVIA : PALM_TRIVIA;

  const stages = isFace
    ? [
        { pct: 22, label: "Định vị 68 điểm mốc Ngũ Quan & Tam Đình" },
        { pct: 52, label: "Đo tỷ lệ vàng Thượng • Trung • Hạ Đình" },
        { pct: 78, label: "Đối chiếu cổ thư Ma Y Thần Tướng & Thủy Kính Tập" },
        { pct: 94, label: "Tổng hợp luận giải Nhân Tướng & lời khuyên..." },
      ]
    : [
        { pct: 24, label: "Tách nền bàn tay & định vị 21 khớp xương" },
        { pct: 54, label: "Trích xuất Sinh Đạo • Trí Đạo • Tâm Đạo • Định Mệnh" },
        { pct: 80, label: "Đối chiếu cổ thư Thủ Tướng Học Đông Phương" },
        { pct: 94, label: "Tổng hợp luận giải Chưởng Pháp & vận mệnh..." },
      ];

  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(12);
  const [cardIdx, setCardIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [qiCount, setQiCount] = useState(0);
  const [activeBlessing, setActiveBlessing] = useState<string | null>(null);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const step = prev < 50 ? 4 : prev < 80 ? 2.5 : 1;
        return Math.min(95, Math.round((prev + step) * 10) / 10);
      });
    }, 260);

    const stageTimer = setInterval(() => {
      setStageIdx((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stageTimer);
    };
  }, [stages.length]);

  const currentTrivia = triviaList[cardIdx % triviaList.length];

  const handleNextCard = () => {
    setIsRevealed(false);
    setCardIdx((prev) => (prev + 1) % triviaList.length);
  };

  const handleTapQi = () => {
    const next = qiCount + 1;
    setQiCount(next);
    setActiveBlessing(BLESSINGS[next % BLESSINGS.length]);
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4 animate-in fade-in duration-300">
      <style>{`
        @keyframes hc-scan-laser {
          0% { top: 4%; opacity: 0.35; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 94%; opacity: 0.35; }
        }
        .hc-laser-line {
          position: absolute;
          left: 6%;
          right: 6%;
          height: 2.5px;
          background: linear-gradient(90deg, transparent, #FFF3C4, #D4AF37, #FFF3C4, transparent);
          box-shadow: 0 0 16px #D4AF37, 0 0 6px #FFF3C4;
          animation: hc-scan-laser 2.4s ease-in-out infinite alternate;
          z-index: 20;
        }
      `}</style>

      {/* Compact Scanner Frame + Progress Bar */}
      <div className="w-full hc-card rounded-3xl p-4 space-y-3.5 border border-[#D4AF37]/35 shadow-[0_20px_50px_rgba(0,0,0,0.75)]">
        <div className="flex items-center gap-3.5">
          {/* Thumbnail / Mini Live Scanner */}
          <div
            className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden border border-[#D4AF37]/45 relative shrink-0 bg-[#0B0912] flex items-center justify-center"
            style={
              !isFace
                ? {
                    backgroundImage: "url('/images/palmbg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {capturedUrl && (
              <img
                src={capturedUrl}
                alt="Ảnh đang phân tích"
                className={`w-full h-full object-cover ${
                  isMirrored ? "scale-x-[-1]" : ""
                } ${!isFace ? "mix-blend-luminosity opacity-90" : "opacity-90"}`}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07060B]/70 via-transparent to-[#07060B]/40" />
            <div className="hc-laser-line" />

            {/* Floating Blessing Badge on Photo */}
            {activeBlessing && (
              <div
                key={qiCount}
                className="absolute bottom-1.5 inset-x-1 text-center z-30 animate-bounce"
              >
                <span className="inline-block px-2 py-0.5 rounded-full bg-[#07060B]/90 border border-[#D4AF37]/50 text-[9px] font-bold text-[#FFF3C4] shadow">
                  {activeBlessing}
                </span>
              </div>
            )}
          </div>

          {/* Real-time Step & Progress */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8C96A]">
                {isFace ? (
                  <FacePhysiognomyIcon size={16} />
                ) : (
                  <PalmReadingIcon size={16} />
                )}
                <span>{isFace ? "Soi Diện Tướng" : "Soi Thủ Tướng"}</span>
              </span>
              <span className="text-xs font-mono font-bold text-[#FFF3C4]">
                {Math.round(progress)}%
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-serif font-bold text-white leading-snug">
              {stages[stageIdx].label}
            </h3>

            {/* Smooth Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#07060B] border border-[#D4AF37]/25 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#AA8220] via-[#D4AF37] to-[#FFF3C4] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step Dots */}
            <div className="flex items-center justify-between pt-0.5">
              {stages.map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${
                    i <= stageIdx ? "text-[#E8C96A]" : "text-[#C5B386]/40"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === stageIdx
                        ? "bg-[#FFF3C4] animate-ping"
                        : i < stageIdx
                        ? "bg-[#D4AF37]"
                        : "bg-[#C5B386]/30"
                    }`}
                  />
                  <span>Bước {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Waiting Card: Flip Physiognomy / Palmistry Secret */}
      <div className="w-full hc-card rounded-3xl p-5 border border-[#D4AF37]/30 relative overflow-hidden space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B0912] border border-[#D4AF37]/30 text-[10px] font-bold uppercase tracking-[0.15em] text-[#E8C96A]">
            <SparkleIcon size={11} />
            <span>{currentTrivia.tag} • Giải Khuây Khi Chờ</span>
          </div>
          <span className="text-[10px] text-[#C5B386] font-mono">
            Thẻ {(cardIdx % triviaList.length) + 1}/{triviaList.length}
          </span>
        </div>

        <div
          onClick={() => setIsRevealed((prev) => !prev)}
          className="p-4 rounded-2xl bg-[#0B0912]/90 border border-[#D4AF37]/25 hover:border-[#D4AF37]/55 transition-all cursor-pointer select-none space-y-2.5"
        >
          <p className="text-xs sm:text-sm font-serif font-bold text-[#FFF3C4] leading-relaxed">
            “{currentTrivia.question}”
          </p>

          {isRevealed ? (
            <div className="pt-2 border-t border-[#D4AF37]/20 text-xs text-[#EFECE6] leading-relaxed animate-in fade-in duration-200">
              <span className="text-[#D4AF37] font-bold">✦ Cổ thư giải đáp: </span>
              {currentTrivia.answer}
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1 text-[11px] text-[#E8C96A] font-semibold">
              <span>👆 Chạm vào thẻ để lật xem giải đáp cổ thư</span>
              <span className="underline">Lật thẻ</span>
            </div>
          )}
        </div>

        {/* Interactive Bottom Actions */}
        <div className="flex items-center justify-between gap-2.5 pt-0.5">
          <button
            type="button"
            onClick={handleTapQi}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B0912] hover:bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[11px] font-bold text-[#FFF3C4] transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <SparkleIcon size={12} className="text-[#D4AF37]" />
            <span>
              Tích Tụ Cát Khí {qiCount > 0 ? `(+${qiCount})` : ""}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNextCard}
            className="py-2.5 px-4 rounded-xl hc-gold-btn text-[11px] font-bold uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
          >
            Bí Quyết Tiếp →
          </button>
        </div>
      </div>
    </div>
  );
}
