"use client";

import React, { useState } from "react";
import Link from "next/link";
import MysticalPolygon from "./MysticalPolygon";

interface FacialAnalysisData {
  id: number;
  userId: number;
  resultText: string;
  faceShape: string;
  harmonyScore: number;
  probabilities: Record<string, number> | any;
  harmonyDetails: Record<string, any> | any;
  metrics: Record<string, any> | any;
  annotatedImage: string;
  processedAt: string;
  createAt: string;
  physiognomyResult?: any;
}

interface FaceResultClientProps {
  analysis: FacialAnalysisData;
  refCode?: string;
  isScanningPage?: boolean;
  saveStatus?: "unsaved" | "saving" | "saved" | "error";
  onSave?: () => void;
  onShare?: () => void;
  onReset?: () => void;
  token?: string | null;
}

export default function FaceResultClient({ 
  analysis, 
  refCode = "",
  isScanningPage = false,
  saveStatus = "unsaved",
  onSave,
  onShare,
  onReset,
  token = null
}: FaceResultClientProps) {
  const [activeTabId, setActiveTabId] = useState<string>("intro");

  // Format face shape name in Vietnamese
  const getFaceShapeNameVi = (shape: string) => {
    const shapes: Record<string, string> = {
      oval: "Khuôn Mặt Trái Xoan (Oval)",
      round: "Khuôn Mặt Tròn (Round)",
      square: "Khuôn Mặt Chữ Điền (Square)",
      heart: "Khuôn Mặt Trái Tim (Heart)",
      oblong: "Khuôn Mặt Dài (Oblong)",
      diamond: "Khuôn Mặt Kim Cương (Diamond)",
      triangle: "Khuôn Mặt Tam Giác (Triangle)",
    };
    return shapes[shape.toLowerCase()] || shape;
  };

  const extractFeatures = (result: any) => {
    const physiognomyResult = result.physiognomyResult || {};
    const parts = physiognomyResult?.parts || {};
    const summary = physiognomyResult?.summary || result.resultText || "";

    // Helper: tìm nội dung cho từng bộ phận từ nhiều nguồn dữ liệu khác nhau của API
    const getBodyPartContent = (
      keys: string[],        // tên key trong physiognomyResult (GPT format)
      partKeys: string[],    // tên key trong parts (template format)
      keywords: string[]     // từ khoá tìm trong resultText khi fallback
    ): { content: string; description: string } => {
      // === Ưu tiên 1: GPT format (physiognomyResult.forehead.meaning / description) ===
      for (const k of keys) {
        const d = physiognomyResult[k];
        if (d && typeof d === 'object') {
          const content = d.meaning || d.description || "";
          if (content) return { content, description: d.description || "" };
        }
        if (typeof d === 'string' && d) return { content: d, description: "" };
      }

      // === Ưu tiên 2: Template format (parts.forehead[].meaning) ===
      for (const pk of partKeys) {
        const arr = parts[pk];
        if (arr && Array.isArray(arr) && arr.length > 0) {
          const content = arr.map((x: any) => x.meaning || x.description || "").filter(Boolean).join("\n\n");
          if (content) return { content, description: "" };
        }
        // object format
        const obj = physiognomyResult[pk];
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          const content = obj.meaning || obj.description || "";
          if (content) return { content, description: obj.description || "" };
        }
      }

      // === Ưu tiên 3: Tìm trong resultText bằng keyword matching ===
      if (summary) {
        const sentences = summary.split(/(?<=[.!?。])\s+/).filter((s: string) => s.trim().length > 15);
        const matched = sentences.filter((s: string) =>
          keywords.some(kw => s.toLowerCase().includes(kw.toLowerCase()))
        );
        if (matched.length > 0) return { content: matched.join(" "), description: "" };
      }

      return { content: "", description: "" };
    };

    // === 6 BỘ PHẬN KHUÔN MẶT CỐ ĐỊNH (luôn hiển thị trong Bát Quái) ===
    const BODY_PARTS = [
      {
        id: "forehead", rawKey: "forehead", title: "Trán",
        keys: ["forehead"], partKeys: ["forehead"],
        keywords: ["trán", "thiên đình", "thượng đình", "forehead", "quan lộc", "đỉnh đầu"],
      },
      {
        id: "eyebrows", rawKey: "eyebrows", title: "Lông Mày",
        keys: ["eyebrow", "eyebrows"], partKeys: ["eyebrows"],
        keywords: ["lông mày", "mi", "huynh đệ", "eyebrow"],
      },
      {
        id: "eyes", rawKey: "eyes", title: "Đôi Mắt",
        keys: ["eye", "eyes"], partKeys: ["eyes"],
        keywords: ["mắt", "mát", "nhãn", "điền trạch", "eye"],
      },
      {
        id: "nose", rawKey: "nose", title: "Mũi",
        keys: ["nose"], partKeys: ["nose"],
        keywords: ["mũi", "tài bạch", "trung đình", "nose"],
      },
      {
        id: "mouth", rawKey: "mouth", title: "Miệng",
        keys: ["mouth", "lips"], partKeys: ["mouth", "lips"],
        keywords: ["miệng", "môi", "nô bộc", "hạ đình", "mouth", "lip"],
      },
      {
        id: "chin", rawKey: "chin", title: "Cằm",
        keys: ["chin", "jaw"], partKeys: ["chin", "jaw", "lower_face"],
        keywords: ["cằm", "địa các", "hàm", "chin", "jaw"],
      },
    ];

    const list: any[] = [];

    // Tổng Quan – nút trung tâm
    list.push({
      id: "intro",
      title: "Tổng Quan",
      content: summary,
      rawKey: "intro",
    });

    // 6 bộ phận – các nút vệ tinh
    BODY_PARTS.forEach(({ id, rawKey, title, keys, partKeys, keywords }) => {
      const { content, description } = getBodyPartContent(keys, partKeys, keywords);
      list.push({
        id,
        rawKey,
        title,
        content: content || `Chưa có dữ liệu phân tích cho ${title}. Hãy thử quét lại với ảnh rõ nét hơn.`,
        description,
      });
    });

    return list;
  };


  const features = extractFeatures(analysis);
  const activeFeature = features.find((f) => f.id === activeTabId) || features[0];

  const physiognomyResult = analysis.physiognomyResult || {};

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
      {/* Decorative Warm Paper Border Filter */}
      <div className="absolute inset-0 bg-[#fbf8f3]/10 pointer-events-none" />

      {/* Header back to home for Scanning page */}
      {isScanningPage && (
        <header className="sticky top-0 z-50 w-full bg-[#fcf9f5]/90 backdrop-blur border-b border-[#D9C3B0] px-6 py-4 shadow-sm flex items-center justify-between max-w-5xl mx-auto rounded-b-2xl">
          <Link href="/huyen-co" className="flex items-center gap-2 text-[#5C3E21] hover:text-amber-800 transition-all">
            <span className="text-xl">←</span>
            <span className="text-xs uppercase font-bold tracking-widest">Trang chủ</span>
          </Link>
          <h1 className="text-xs sm:text-sm font-bold tracking-widest text-amber-800 uppercase font-serif">
            AI Face Profiler • Xem Tướng Mặt
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
            KẾT QUẢ LUẬN GIẢI NHÂN TƯỚNG HỌC
          </h1>
          <p className="text-[#8C6D53] text-xs sm:text-sm mt-2 uppercase tracking-widest font-bold">
            Huyền Cơ AI • Face Physiognomy
          </p>
          <div className="w-24 h-0.5 bg-[#8C6D53]/30 mx-auto mt-4" />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visual Analysis */}
          <div className="lg:col-span-5 bg-[#fdfbf7]/80 border border-[#D9C3B0] rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <h2 className="text-xs font-black uppercase text-[#5C3E21] tracking-widest mb-4 flex items-center gap-2 border-b border-[#D9C3B0]/40 pb-2">
              <span>👤</span> Bản Đồ Nhân Trắc Diện Mạo
            </h2>
            
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-xl overflow-hidden border border-[#D9C3B0] bg-[#eae2d5] shadow-inner mb-4">
              {analysis.annotatedImage ? (
                <img 
                  src={analysis.annotatedImage.startsWith("data:") || analysis.annotatedImage.startsWith("http")
                    ? analysis.annotatedImage 
                    : (typeof window !== "undefined" && window.location.hostname.includes("calnovaai.com")
                        ? `https://api.calnovaai.com/glowlab${analysis.annotatedImage}`
                        : `https://api.calnovaai.com/glowlab${analysis.annotatedImage}`)
                  } 
                  alt="Bản đồ khuôn mặt"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#8C6D53] text-sm">
                  Không có ảnh phân tích
                </div>
              )}
            </div>
            
            {/* Harmony score info inside left panel */}
            <div className="flex items-center justify-between bg-white/50 p-4 rounded-xl border border-[#D9C3B0]/30 mt-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#8C6D53] tracking-widest">
                  Tỷ Lệ Hài Hòa
                </span>
                <div className="text-lg font-black text-[#5C3E21]">{analysis.harmonyScore}%</div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#8C6D53] tracking-widest">
                  Dáng Khuôn Mặt
                </span>
                <div className="text-sm font-bold text-[#5C3E21] capitalize">
                  {physiognomyResult?.face_shape?.shape ? getFaceShapeNameVi(physiognomyResult.face_shape.shape) : getFaceShapeNameVi(analysis.faceShape)}
                </div>
              </div>
            </div>

            {/* Interactive Mystical Polygon Menu (Bát Quái) */}
            <div className="mt-8 border-t border-[#D9C3B0]/30 pt-6">
              <MysticalPolygon 
                items={features} 
                onSelect={setActiveTabId} 
                activeId={activeTabId} 
              />
            </div>
          </div>

          {/* Right Column: Tab Content Details */}
          <div className="lg:col-span-7 bg-[#fdfbf7]/80 border border-[#D9C3B0] rounded-2xl p-6 sm:p-8 shadow-lg min-h-[480px]">
            
            {/* 1. TỔNG QUAN TAB */}
            {activeTabId === "intro" ? (
              <div className="space-y-6">
                <div className="border-b border-[#D9C3B0]/40 pb-4">
                  <h2 className="text-xl font-bold text-[#5C3E21] flex items-center gap-2 mb-2">
                    <span>✨</span> Luận Giải Tổng Quan
                  </h2>
                  <p className="text-xs text-[#8C6D53] uppercase tracking-wider font-bold">
                    Tổng hợp bản đồ ngũ quan sinh học
                  </p>
                </div>

                <div className="text-[#5C3E21] text-sm sm:text-base leading-8 whitespace-pre-line bg-white/40 p-4 rounded-xl border border-[#D9C3B0]/20">
                  {analysis.resultText}
                </div>

                {/* Giai Đoạn Cuộc Đời Timeline */}
                {physiognomyResult?.life_phases && (
                  <div className="mt-6 bg-[#f7f2ea]/60 rounded-2xl border border-[#D9C3B0]/40 p-5">
                    <h3 className="text-[#5C3E21] font-bold text-sm uppercase tracking-wider mb-4 border-b border-[#D9C3B0]/30 pb-2">
                      🌅 Tiến Trình Sinh Học & Động Lực
                    </h3>

                    <div className="space-y-5">
                      {/* Tiền vận */}
                      {physiognomyResult.life_phases.early_life && (
                        <div className="flex">
                          <div className="flex flex-col items-center mr-3.5">
                            <div className="w-8 h-8 rounded-full bg-white border border-[#D9C3B0] flex items-center justify-center text-sm shadow-sm">
                              🌅
                            </div>
                            <div className="w-[1px] flex-1 bg-[#D9C3B0] my-1" />
                          </div>
                          <div className="flex-1 pb-3 border-b border-[#D9C3B0]/20">
                            <h4 className="text-[#5C3E21] font-bold text-sm">Giai đoạn Tích lũy (Trước 30 tuổi)</h4>
                            <p className="text-[#6D543F] text-xs sm:text-sm mt-1 leading-6">
                              {physiognomyResult.life_phases.early_life}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Trung vận */}
                      {physiognomyResult.life_phases.mid_life && (
                        <div className="flex">
                          <div className="flex flex-col items-center mr-3.5">
                            <div className="w-8 h-8 rounded-full bg-white border border-[#D9C3B0] flex items-center justify-center text-sm shadow-sm">
                              ☀️
                            </div>
                            <div className="w-[1px] flex-1 bg-[#D9C3B0] my-1" />
                          </div>
                          <div className="flex-1 pb-3 border-b border-[#D9C3B0]/20">
                            <h4 className="text-[#5C3E21] font-bold text-sm">Giai đoạn Kiến thiết (30 - 50 tuổi)</h4>
                            <p className="text-[#6D543F] text-xs sm:text-sm mt-1 leading-6">
                              {physiognomyResult.life_phases.mid_life}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Hậu vận */}
                      {physiognomyResult.life_phases.late_life && (
                        <div className="flex">
                          <div className="flex flex-col items-center mr-3.5">
                            <div className="w-8 h-8 rounded-full bg-white border border-[#D9C3B0] flex items-center justify-center text-sm shadow-sm">
                              🌌
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-[#5C3E21] font-bold text-sm">Giai đoạn Thu hoạch & Tĩnh tại (Sau 50 tuổi)</h4>
                            <p className="text-[#6D543F] text-xs sm:text-sm mt-1 leading-6">
                              {physiognomyResult.life_phases.late_life}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Key Points Highlights */}
                {physiognomyResult?.key_points && Array.isArray(physiognomyResult.key_points) && physiognomyResult.key_points.length > 0 && (
                  <div className="mt-6 bg-[#f7f2ea]/60 rounded-2xl border border-[#D9C3B0]/40 p-5">
                    <h3 className="text-[#5C3E21] font-bold text-sm uppercase tracking-wider mb-4 border-b border-[#D9C3B0]/30 pb-2">
                      ✨ Điểm Nhấn Sinh Trắc Học
                    </h3>
                    <div className="space-y-3">
                      {physiognomyResult.key_points.map((point: string, idx: number) => (
                        <div key={`kp-${idx}`} className="flex items-start gap-2.5">
                          <span className="text-yellow-600 mt-0.5">✦</span>
                          <p className="text-[#5C3E21] text-xs sm:text-sm leading-6">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 2. CHƠI TAB BỘ PHẬN CHI TIẾT (Forehead, Eyes, Nose, etc.) */
              <div className="space-y-6">
                <div className="border-b border-[#D9C3B0]/40 pb-4">
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-widest bg-amber-100/60 px-3 py-1 rounded-full border border-amber-800/10">
                    Phân Tích Chi Tiết
                  </span>
                  <h2 className="text-2xl font-black text-[#5C3E21] mt-2">
                    {activeFeature.title}
                  </h2>
                </div>

                {activeFeature.description && (
                  <div className="p-4 bg-white/60 rounded-xl border border-[#D9C3B0]/30">
                    <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1.5">
                      Đặc điểm nhận diện diện mạo:
                    </h3>
                    <p className="text-[#5C3E21] text-sm leading-7">
                      {activeFeature.description}
                    </p>
                  </div>
                )}

                <div className="bg-[#f7f2ea]/40 p-5 rounded-2xl border border-[#D9C3B0]/30">
                  <h3 className="text-xs font-bold text-[#5C3E21] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span>📖</span> Luận giải nhân tướng:
                  </h3>
                  <p className="text-[#5C3E21] text-sm sm:text-base leading-8 whitespace-pre-line">
                    {activeFeature.content}
                  </p>
                </div>
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
            Khám phá trọn vẹn bản đồ nhân tướng học cá nhân bằng Trí tuệ Nhân tạo. Tải ứng dụng hoặc quét ngay trên web để nhận luận giải miễn phí!
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
