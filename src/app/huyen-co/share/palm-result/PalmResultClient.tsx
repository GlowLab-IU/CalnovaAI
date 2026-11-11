"use client";

import React, { useState } from "react";
import Link from "next/link";
import HuyenCoHeader from "../../components/HuyenCoHeader";
import {
  PalmReadingIcon,
  AICoachOracleIcon,
  SparkleIcon,
  ShareSealIcon,
} from "../../components/HuyenCoIcons";

interface Interpretation {
  id: number;
  lineType: string;
  pattern: string;
  meaning: string;
  lengthPx: number;
  confidence: number;
}

interface LifeAspect {
  id: number;
  aspect: string;
  content: string;
}

interface PalmAnalysisData {
  id: number;
  userId: number;
  annotatedImage: string;
  palmLinesDetected: number;
  detectedHeartLine: number;
  detectedHeadLine: number;
  detectedLifeLine: number;
  detectedFateLine: number;
  targetLines: string;
  imageHeight: number;
  imageWidth: number;
  summaryText: string;
  interpretations: Interpretation[];
  lifeAspects: LifeAspect[];
  createdAt: string;
}

interface PalmResultClientProps {
  analysis: PalmAnalysisData;
  refCode?: string;
  isScanningPage?: boolean;
  saveStatus?: "unsaved" | "saving" | "saved" | "error";
  onSave?: () => void;
  onShare?: () => void;
  onReset?: () => void;
  token?: string | null;
}

export default function PalmResultClient({
  analysis,
  refCode = "",
  isScanningPage = false,
  saveStatus = "unsaved",
  onSave,
  onShare,
  onReset,
  token = null,
}: PalmResultClientProps) {
  const [activeMainTab, setActiveMainTab] = useState<"overview" | "lines" | "aspects">("overview");
  const [activeLineType, setActiveLineType] = useState<string>("");

  React.useEffect(() => {
    if (analysis.interpretations && analysis.interpretations.length > 0) {
      setActiveLineType(analysis.interpretations[0].lineType);
    }
  }, [analysis.interpretations]);

  const getLineName = (type: string) => {
    switch ((type || "").toLowerCase()) {
      case "life":
        return "Đường Sinh Đạo (Sinh Lực & Căn Cơ)";
      case "head":
        return "Đường Trí Đạo (Tư Duy & Định Hướng)";
      case "heart":
        return "Đường Tâm Đạo (Tình Cảm & Nội Tâm)";
      case "fate":
        return "Đường Định Mệnh (Sự Nghiệp & Thiên Thời)";
      case "sun":
        return "Đường Thái Dương (Danh Vọng & Quý Nhân)";
      default:
        return "Đường Chỉ Tay";
    }
  };

  const getAspectName = (type: string) => {
    switch ((type || "").toLowerCase()) {
      case "health":
        return "Sinh Lực & Sức Khỏe";
      case "career":
        return "Công Danh & Sự Nghiệp";
      case "relationships":
        return "Nhân Duyên & Tình Cảm";
      case "personality":
        return "Bản Tính & Nội Tâm";
      default:
        return "Phương Diện Đời Sống";
    }
  };

  const activeInterpretation = analysis.interpretations?.find(
    (item) => (item.lineType || "").toLowerCase() === (activeLineType || "").toLowerCase()
  );

  const aiConsultPrompt = encodeURIComponent(
    `Tôi vừa xem Thủ Tướng Học (Chỉ Tay) trên Huyền Cơ. Tóm tắt bàn tay: "${(
      analysis.summaryText || ""
    ).slice(
      0,
      240
    )}". Xin Cố vấn phân tích sâu hơn sự liên kết giữa tướng tay này với vận trình Sự nghiệp, Tài lộc và Tình duyên của tôi.`
  );

  return (
    <div className="min-h-screen bg-[#07060B] text-[#EFECE6] font-sans pb-24 relative overflow-x-hidden">
      {/* Subtle Oriental Celestial Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70vw] h-[50vw] bg-[#D4AF37]/[0.05] rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#D4AF37_0.75px,transparent_0.75px)] [background-size:48px_48px]" />
      </div>

      {/* Unified Header */}
      <HuyenCoHeader subtitle="Bản Đồ Thủ Tướng Học & Sinh Trắc AI" />

      {/* Shared Referral Banner */}
      {!isScanningPage && (
        <div className="max-w-5xl mx-auto px-4 pt-4 relative z-20">
          <div className="hc-card rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#EFECE6]">
              <SparkleIcon size={16} className="text-[#D4AF37] shrink-0" />
              <span>
                Bạn được chia sẻ bản đồ thủ tướng từ bạn bè. Đăng ký ngay để nhận{" "}
                <strong className="text-[#E8C96A]">+20 Tín Chỉ</strong> miễn phí!
              </span>
            </div>
            <Link
              href={`/huyen-co?ref=${refCode}`}
              className="w-full sm:w-auto px-5 py-2 hc-gold-btn font-bold rounded-full text-xs text-center uppercase tracking-wider shrink-0"
            >
              Quét Chỉ Tay Ngay
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#120F1D] border border-[#D4AF37]/30 mb-3">
            <PalmReadingIcon size={42} />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#D4AF37] mb-1">
            Luận Giải Thủ Tướng Học Đông Phương
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
            Sơ Đồ Tam Đạo & Chưởng Pháp
          </h1>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex justify-center gap-2 mb-8 bg-[#120F1D] p-1.5 rounded-2xl border border-[#D4AF37]/25 max-w-xl mx-auto">
          {[
            { id: "overview", label: "Tổng Quan Mệnh Lý" },
            { id: "lines", label: "Đường Chỉ Chính" },
            { id: "aspects", label: "4 Phương Diện" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveMainTab(t.id as any)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === t.id
                  ? "hc-gold-btn"
                  : "text-[#C5B386] hover:text-white hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Column: Visual Analysis */}
          <div className="lg:col-span-5 hc-card rounded-3xl p-5 sm:p-6">
            <h2 className="text-xs font-bold uppercase text-[#E8C96A] tracking-[0.18em] mb-4 flex items-center gap-2 border-b border-[#D4AF37]/15 pb-3">
              <SparkleIcon size={14} />
              <span>Sơ Đồ Chỉ Tay Định Vị</span>
            </h2>

            <div
              className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-[#D4AF37]/45 shadow-[0_12px_40px_rgba(0,0,0,0.65)] mb-4 flex items-center justify-center p-4"
              style={{
                backgroundImage: "url('/images/palmbg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "#EFE6D5",
              }}
            >
              {analysis.annotatedImage ? (
                <img
                  src={
                    analysis.annotatedImage.startsWith("data:") ||
                    analysis.annotatedImage.startsWith("http")
                      ? analysis.annotatedImage
                      : `https://api.calnovaai.com/glowlab${analysis.annotatedImage}`
                  }
                  alt="Bản đồ chỉ tay"
                  className="w-[88%] h-[88%] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)] relative z-10"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#5C3E21] font-semibold text-sm relative z-10">
                  Không có ảnh phân tích
                </div>
              )}
            </div>

            <div className="bg-[#0B0912]/90 p-3.5 rounded-2xl border border-[#D4AF37]/20 text-center">
              <span className="text-[11px] text-[#C5B386]">
                Hệ thống đã định vị{" "}
                <strong className="text-[#FFF3C4]">
                  {analysis.palmLinesDetected || analysis.interpretations?.length || 3} đường chỉ chính
                </strong>{" "}
                trên lòng bàn tay của bạn.
              </span>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-7 hc-card rounded-3xl p-6 sm:p-8 min-h-[440px] flex flex-col justify-between">
            <div>
              {/* 1. TỔNG QUAN */}
              {activeMainTab === "overview" && (
                <div className="space-y-6">
                  <div className="border-b border-[#D4AF37]/15 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37] block mb-1">
                      Tổng Hợp Khí Sắc & Chưởng Tướng
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      Tổng Quan Thủ Tướng Học
                    </h2>
                  </div>

                  <div className="text-[#EFECE6] text-sm sm:text-base leading-8 whitespace-pre-line bg-[#0B0912]/85 p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/15">
                    {analysis.summaryText}
                  </div>
                </div>
              )}

              {/* 2. ĐƯỜNG CHỈ TAY */}
              {activeMainTab === "lines" && (
                <div className="space-y-6">
                  <div className="border-b border-[#D4AF37]/15 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37] block mb-1">
                      Phân Tích Tam Đạo & Phụ Tuyến
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      Chi Tiết Từng Đường Chỉ Tay
                    </h2>
                  </div>

                  {analysis.interpretations && analysis.interpretations.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-2 p-1.5 bg-[#0B0912] rounded-2xl border border-[#D4AF37]/20">
                        {analysis.interpretations.map((item) => (
                          <button
                            key={item.id || item.lineType}
                            onClick={() => setActiveLineType(item.lineType)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              (activeLineType || "").toLowerCase() === (item.lineType || "").toLowerCase()
                                ? "hc-gold-btn"
                                : "text-[#C5B386] hover:text-white"
                            }`}
                          >
                            {getLineName(item.lineType).split(" (")[0]}
                          </button>
                        ))}
                      </div>

                      {activeInterpretation ? (
                        <div className="space-y-4 mt-4">
                          <div className="flex flex-wrap justify-between items-center gap-2 bg-[#0B0912]/90 px-4 py-3 rounded-2xl border border-[#D4AF37]/20">
                            <h3 className="font-serif font-bold text-base sm:text-lg text-[#FFF3C4]">
                              {getLineName(activeInterpretation.lineType)}
                            </h3>
                            <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#E8C96A] border border-[#D4AF37]/30">
                              Độ rõ nét vân tay: {Math.round((activeInterpretation.confidence || 0.9) * 100)}%
                            </span>
                          </div>

                          {activeInterpretation.pattern && (
                            <div className="p-4 bg-[#0B0912]/80 rounded-2xl border border-[#D4AF37]/15">
                              <h4 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-1">
                                Hình Thái Đường Chỉ:
                              </h4>
                              <p className="text-xs sm:text-sm text-[#EFECE6] font-medium">
                                {activeInterpretation.pattern}
                              </p>
                            </div>
                          )}

                          <div className="bg-[#0B0912]/90 p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/20">
                            <h4 className="text-xs font-bold text-[#E8C96A] uppercase tracking-widest mb-3">
                              Luận Giải Mệnh Lý:
                            </h4>
                            <p className="text-[#EFECE6] text-sm sm:text-base leading-8 whitespace-pre-line">
                              {activeInterpretation.meaning}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-center text-[#C5B386] italic">
                          Chọn một đường chỉ tay ở trên để xem chi tiết.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-center text-[#C5B386] italic">
                      Không tìm thấy phân tích đường chỉ tay riêng lẻ.
                    </p>
                  )}
                </div>
              )}

              {/* 3. KHÍA CẠNH CUỘC SỐNG */}
              {activeMainTab === "aspects" && (
                <div className="space-y-6">
                  <div className="border-b border-[#D4AF37]/15 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37] block mb-1">
                      Ứng Dụng Thủ Tướng Vào Đời Sống
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                      4 Phương Diện Vận Mệnh
                    </h2>
                  </div>

                  {analysis.lifeAspects && analysis.lifeAspects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.lifeAspects.map((aspect, idx) => (
                        <div
                          key={aspect.id || idx}
                          className="bg-[#0B0912]/90 border border-[#D4AF37]/20 rounded-2xl p-5"
                        >
                          <h3 className="text-xs font-bold text-[#E8C96A] uppercase tracking-widest mb-2.5 border-b border-[#D4AF37]/15 pb-2">
                            ✦ {getAspectName(aspect.aspect)}
                          </h3>
                          <p className="text-[#EFECE6] text-xs sm:text-sm leading-7">
                            {aspect.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center text-[#C5B386] italic">
                      Không tìm thấy luận giải khía cạnh cuộc sống.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions: Consult AI Coach + Save/Share/Reset */}
            <div className="mt-8 pt-5 border-t border-[#D4AF37]/15 space-y-3">
              <Link
                href={`/huyen-co/chat?q=${aiConsultPrompt}`}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#1A1429] hover:bg-[#231B38] border border-[#D4AF37]/40 flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <AICoachOracleIcon size={32} />
                  <div className="text-left">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#FFF3C4]">
                      Tham Vấn Cố Vấn Mệnh Lý AI Về Chỉ Tay Này
                    </div>
                    <div className="text-[11px] text-[#C5B386]">
                      Đối chiếu Tam Đạo chỉ tay với lá số Tử Vi để hỏi sâu về Sự nghiệp & Tình duyên
                    </div>
                  </div>
                </div>
                <span className="text-[#E8C96A] font-bold group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>

              {isScanningPage && (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  {saveStatus === "unsaved" && (
                    <button
                      onClick={onSave}
                      className="flex-1 py-3 hc-gold-btn font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer"
                    >
                      {token ? "Lưu Kết Quả Vào Sớ Lụa" : "Đăng Nhập Để Lưu Kết Quả"}
                    </button>
                  )}
                  {saveStatus === "saving" && (
                    <button
                      disabled
                      className="flex-1 py-3 bg-[#D4AF37]/20 text-[#E8C96A] text-xs font-bold uppercase tracking-widest rounded-xl cursor-wait"
                    >
                      Đang lưu trữ...
                    </button>
                  )}
                  {saveStatus === "saved" && (
                    <button
                      onClick={onShare}
                      className="flex-1 py-3 hc-gold-btn font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShareSealIcon size={15} />
                      <span>Chia Sẻ Kết Quả (Nhận Thưởng Tín Chỉ)</span>
                    </button>
                  )}
                  {saveStatus === "error" && (
                    <button
                      onClick={onSave}
                      className="flex-1 py-3 bg-red-950 border border-red-500/50 text-red-200 font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer"
                    >
                      Thử Lưu Lại
                    </button>
                  )}
                  {onReset && (
                    <button
                      onClick={onReset}
                      className="px-6 py-3 bg-[#0B0912] hover:bg-white/10 border border-[#D4AF37]/30 text-[#E8C96A] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Quét Lại Bàn Tay
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
