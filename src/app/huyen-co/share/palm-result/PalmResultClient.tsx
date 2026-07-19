"use client";

import React, { useState } from "react";
import Link from "next/link";

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
  token = null
}: PalmResultClientProps) {
  const [activeMainTab, setActiveMainTab] = useState<"overview" | "lines" | "aspects">("overview");
  const [activeLineType, setActiveLineType] = useState<string>("");

  // Setup initial active line type if interpretations exist
  React.useEffect(() => {
    if (analysis.interpretations && analysis.interpretations.length > 0) {
      setActiveLineType(analysis.interpretations[0].lineType);
    }
  }, [analysis.interpretations]);

  const getLineName = (type: string) => {
    switch (type.toLowerCase()) {
      case "life": return "Đường Sinh Đạo (Life Line)";
      case "head": return "Đường Trí Đạo (Head Line)";
      case "heart": return "Đường Tâm Đạo (Heart Line)";
      case "fate": return "Đường Định Mệnh (Fate Line)";
      case "sun": return "Đường Thái Dương (Sun Line)";
      default: return "Đường Chỉ Tay";
    }
  };

  const getAspectName = (type: string) => {
    switch (type.toLowerCase()) {
      case "health": return "❤️ Sức Khỏe";
      case "career": return "💼 Sự Nghiệp";
      case "relationships": return "💞 Tình Duyên";
      case "personality": return "👤 Tính Cách";
      default: return "✨ Khía Cạnh";
    }
  };

  const activeInterpretation = analysis.interpretations?.find(
    (item) => item.lineType.toLowerCase() === activeLineType.toLowerCase()
  );

  return (
    <div 
      className="min-h-screen font-sans selection:bg-[#8b5cf6]/30 pb-24 relative"
      style={{
        backgroundImage: "url('/images/palmbg.png')",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#fbf8f3",
      }}
    >
      <div className="absolute inset-0 bg-[#fbf8f3]/10 pointer-events-none" />

      {/* Header back to home for Scanning page */}
      {isScanningPage && (
        <header className="sticky top-0 z-50 w-full bg-[#fcf9f5]/90 backdrop-blur border-b border-[#D9C3B0] px-6 py-4 shadow-sm flex items-center justify-between max-w-5xl mx-auto rounded-b-2xl">
          <Link href="/huyen-co" className="flex items-center gap-2 text-[#5C3E21] hover:text-amber-800 transition-all">
            <span className="text-xl">←</span>
            <span className="text-xs uppercase font-bold tracking-widest">Trang chủ</span>
          </Link>
          <h1 className="text-xs sm:text-sm font-bold tracking-widest text-amber-800 uppercase font-serif">
            AI Biometric Palmistry • Xem Chỉ Tay
          </h1>
          <div className="w-12" />
        </header>
      )}

      {/* Floating Referral Badge */}
      {!isScanningPage && (
        <div className="sticky top-0 z-50 w-full bg-[#fcf9f5]/90 backdrop-blur border-b border-[#D9C3B0] px-4 py-3.5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 max-w-5xl mx-auto rounded-b-2xl">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤝</span>
            <p className="text-xs sm:text-sm text-[#5C3E21] font-semibold">
              Bạn được chia sẻ kết quả sinh trắc bởi bạn bè. Đăng ký ngay để nhận <strong className="text-amber-800">+20 Tín Chỉ</strong> miễn phí!
            </p>
          </div>
          <Link 
            href={`/huyen-co?ref=${refCode}`}
            className="w-full sm:w-auto px-6 py-2 bg-amber-800 text-white font-bold rounded-full text-xs text-center uppercase tracking-wider hover:bg-amber-900 transition-all shadow-lg"
          >
            Thử Quét Ngay
          </Link>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-10 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block text-4xl mb-3">🔮</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#5C3E21] uppercase tracking-widest">
            BẢN ĐỒ SINH HỌC LÒNG BÀN TAY
          </h1>
          <p className="text-[#8C6D53] text-xs sm:text-sm mt-2 uppercase tracking-widest font-bold">
            Huyền Cơ AI • Biometric Palmistry
          </p>
          <div className="w-24 h-0.5 bg-[#8C6D53]/30 mx-auto mt-4" />
        </div>

        {/* Main Tab Navigation */}
        <div className="flex justify-center gap-2 mb-8 bg-[#fdfbf7]/60 p-2.5 rounded-2xl border border-[#D9C3B0]/60 max-w-xl mx-auto">
          <button
            onClick={() => setActiveMainTab("overview")}
            className={`flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMainTab === "overview"
                ? "bg-amber-800 text-white shadow-md"
                : "bg-white/40 text-[#5C3E21] hover:bg-white/80 border border-[#D9C3B0]/30"
            }`}
          >
            Tổng Quan
          </button>
          <button
            onClick={() => setActiveMainTab("lines")}
            className={`flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMainTab === "lines"
                ? "bg-amber-800 text-white shadow-md"
                : "bg-white/40 text-[#5C3E21] hover:bg-white/80 border border-[#D9C3B0]/30"
            }`}
          >
            Đường Chỉ Tay
          </button>
          <button
            onClick={() => setActiveMainTab("aspects")}
            className={`flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeMainTab === "aspects"
                ? "bg-amber-800 text-white shadow-md"
                : "bg-white/40 text-[#5C3E21] hover:bg-white/80 border border-[#D9C3B0]/30"
            }`}
          >
            Khía Cạnh Cuộc Sống
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visual Analysis */}
          <div className="lg:col-span-5 bg-[#fdfbf7]/80 border border-[#D9C3B0] rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <h2 className="text-xs font-black uppercase text-[#5C3E21] tracking-widest mb-4 flex items-center gap-2 border-b border-[#D9C3B0]/40 pb-2">
              <span>🖐️</span> Sơ Đồ Chỉ Tay Sinh Trắc
            </h2>
            
            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-[#D9C3B0] bg-[#eae2d5] shadow-inner mb-4">
              {analysis.annotatedImage ? (
                <img 
                  src={analysis.annotatedImage.startsWith("data:") || analysis.annotatedImage.startsWith("http")
                    ? analysis.annotatedImage 
                    : (typeof window !== "undefined" && window.location.hostname.includes("calnovaai.com")
                        ? `https://api.calnovaai.com/glowlab${analysis.annotatedImage}`
                        : `https://api.calnovaai.com/glowlab${analysis.annotatedImage}`)
                  } 
                  alt="Bản đồ chỉ tay"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8C6D53] text-sm">
                  Không có ảnh phân tích
                </div>
              )}
            </div>
            
            <p className="text-[10px] text-center text-[#8C6D53] italic">
              Ảnh chụp lòng bàn tay đã được AI định vị các đường chỉ chính.
            </p>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-7 bg-[#fdfbf7]/80 border border-[#D9C3B0] rounded-2xl p-6 sm:p-8 shadow-lg min-h-[420px]">
            
            {/* 1. TỔNG QUAN */}
            {activeMainTab === "overview" && (
              <div className="space-y-6">
                <div className="border-b border-[#D9C3B0]/40 pb-4">
                  <h2 className="text-xl font-bold text-[#5C3E21] flex items-center gap-2 mb-2">
                    <span>✨</span> Tổng Quan Mệnh Lý
                  </h2>
                  <p className="text-xs text-[#8C6D53] uppercase tracking-wider font-bold">
                    Luận giải tổng hợp sinh trắc học chỉ tay
                  </p>
                </div>

                <div className="text-[#5C3E21] text-sm sm:text-base leading-8 whitespace-pre-line bg-white/40 p-5 rounded-xl border border-[#D9C3B0]/20">
                  {analysis.summaryText}
                </div>
              </div>
            )}

            {/* 2. ĐƯỜNG CHỈ TAY */}
            {activeMainTab === "lines" && (
              <div className="space-y-6">
                <div className="border-b border-[#D9C3B0]/40 pb-4">
                  <h2 className="text-xl font-bold text-[#5C3E21] mb-2">
                    🔎 Chi Tiết Các Đường Chỉ
                  </h2>
                  <p className="text-xs text-[#8C6D53] uppercase tracking-wider font-bold">
                    Chọn từng đường chỉ để xem phân tích chi tiết
                  </p>
                </div>

                {/* Sub-tabs for interpretations */}
                {analysis.interpretations && analysis.interpretations.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-1.5 p-1 bg-[#f7f2ea]/60 rounded-xl border border-[#D9C3B0]/30">
                      {analysis.interpretations.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveLineType(item.lineType)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeLineType.toLowerCase() === item.lineType.toLowerCase()
                              ? "bg-amber-800 text-white"
                              : "text-[#5C3E21] hover:bg-white/50"
                          }`}
                        >
                          {getLineName(item.lineType).split(" (")[0]}
                        </button>
                      ))}
                    </div>

                    {activeInterpretation ? (
                      <div className="space-y-5 mt-4">
                        <div className="flex justify-between items-center bg-white/50 px-4 py-2.5 rounded-xl border border-[#D9C3B0]/20">
                          <h3 className="font-extrabold text-sm sm:text-base text-[#5C3E21]">
                            {getLineName(activeInterpretation.lineType)}
                          </h3>
                          <span className="text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-800/10">
                            Độ rõ nét: {(activeInterpretation.confidence * 100).toFixed(0)}%
                          </span>
                        </div>

                        {activeInterpretation.pattern && (
                          <div className="p-3.5 bg-white/60 rounded-xl border border-[#D9C3B0]/30">
                            <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">
                              Cấu trúc nhận dạng:
                            </h4>
                            <p className="text-xs text-[#5C3E21] font-semibold italic">
                              {activeInterpretation.pattern}
                            </p>
                          </div>
                        )}

                        <div className="bg-[#f7f2ea]/40 p-5 rounded-2xl border border-[#D9C3B0]/30">
                          <h4 className="text-xs font-bold text-[#5C3E21] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <span>📖</span> Luận giải chi tiết:
                          </h4>
                          <p className="text-[#5C3E21] text-sm sm:text-base leading-8 whitespace-pre-line">
                            {activeInterpretation.meaning}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-center text-[#8C6D53] italic">Vui lòng chọn một đường chỉ tay.</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-center text-[#8C6D53] italic">Không tìm thấy phân tích đường chỉ tay nào.</p>
                )}
              </div>
            )}

            {/* 3. KHÍA CẠNH CUỘC SỐNG */}
            {activeMainTab === "aspects" && (
              <div className="space-y-6">
                <div className="border-b border-[#D9C3B0]/40 pb-4">
                  <h2 className="text-xl font-bold text-[#5C3E21] mb-2">
                    🧭 Xu Hướng Năng Lượng & Động Lực
                  </h2>
                  <p className="text-xs text-[#8C6D53] uppercase tracking-wider font-bold">
                    Ảnh hưởng từ đường nét chỉ tay đến các lĩnh vực cuộc sống
                  </p>
                </div>

                {analysis.lifeAspects && analysis.lifeAspects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.lifeAspects.map((aspect) => (
                      <div key={aspect.id} className="bg-white/40 border border-[#D9C3B0]/30 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-2 border-b border-[#D9C3B0]/20 pb-1.5">
                          {getAspectName(aspect.aspect)}
                        </h3>
                        <p className="text-[#5C3E21] text-xs sm:text-sm leading-6">
                          {aspect.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center text-[#8C6D53] italic">Không tìm thấy luận giải khía cạnh cuộc sống.</p>
                )}
              </div>
            )}

            {/* Action Buttons: Save & Share for Scanning Page */}
            {isScanningPage && (
              <div className="mt-8 pt-4 border-t border-[#D9C3B0]/30 flex flex-col gap-2">
                {saveStatus === "unsaved" && (
                  <button
                    onClick={onSave}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-900 hover:to-amber-950 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-amber-800/10 cursor-pointer"
                  >
                    {token ? "Lưu kết quả" : "Đăng nhập để lưu kết quả"}
                  </button>
                )}
                {saveStatus === "saving" && (
                  <button disabled className="w-full py-2.5 bg-amber-100/50 text-[#5C3E21]/60 text-xs font-bold uppercase tracking-widest rounded-xl cursor-wait">
                    Đang lưu trữ...
                  </button>
                )}
                {saveStatus === "saved" && (
                  <div className="flex gap-2">
                    <button
                      onClick={onShare}
                      className="flex-1 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-cyan-700/10 cursor-pointer"
                    >
                      Chia sẻ kết quả 🔗
                    </button>
                    <button
                      onClick={onReset}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Quét mới
                    </button>
                  </div>
                )}
                {saveStatus === "error" && (
                  <button
                    onClick={onSave}
                    className="w-full py-2.5 bg-red-950 border border-red-500 text-red-300 font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer"
                  >
                    Thử lưu lại (Gặp lỗi)
                  </button>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Viral CTA Card */}
        <div className="mt-12 bg-gradient-to-br from-[#fcfbf9] to-[#f5ebd9] border-2 border-amber-800/20 rounded-3xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,26,0.03))] pointer-events-none" />
          <span className="text-4xl mb-4 block">📱</span>
          <h2 className="text-xl sm:text-2xl font-black text-[#5C3E21] uppercase tracking-wider mb-2">
            Giải Mã Bản Thân Cùng AI
          </h2>
          <p className="text-[#6D543F] text-sm sm:text-base leading-6 max-w-md mx-auto mb-6">
            Khám phá trọn vẹn bản đồ sinh trắc học cá nhân bằng Trí tuệ Nhân tạo. Tải ứng dụng hoặc quét ngay trên web để nhận luận giải miễn phí!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link 
              href={`/huyen-co?ref=${refCode}`}
              className="px-8 py-3 bg-amber-800 text-white font-bold rounded-full text-sm uppercase tracking-widest hover:bg-amber-900 transition-all shadow-md"
            >
              Quét Thử Miễn Phí
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
