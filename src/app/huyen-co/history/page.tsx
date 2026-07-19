"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { encodeId } from "@/utils/hashId";

const BASE_URL = "https://api.calnovaai.com/glowlab";

// ảnh MinIO thường hết hạn sau 7 ngày hoặc xóa theo policy
const IMAGE_EXPIRY_DAYS = 7;

type Tab = "face" | "palm";

interface FaceRecord {
  id: number;
  faceShape: string;
  harmonyScore: number;
  resultText: string;
  annotatedImage: string;
  processedAt: string;
  createAt: string;
  physiognomyResult?: any;
}

interface PalmInterpretation {
  id: number;
  lineType: string;
  pattern: string;
  meaning: string;
  lengthPx: number;
  confidence: number;
}

interface PalmLifeAspect {
  id: number;
  aspect: string;
  content: string;
}

interface PalmRecord {
  id: number;
  summaryText: string;
  annotatedImage: string;
  palmLinesDetected: number;
  detectedLifeLine: number;
  detectedHeartLine: number;
  detectedHeadLine: number;
  detectedFateLine: number;
  createdAt: string;
  interpretations?: PalmInterpretation[];
  lifeAspects?: PalmLifeAspect[];
}

const FACE_SHAPE_VI: Record<string, string> = {
  Oval: "Trái Xoan",
  Round: "Tròn",
  Square: "Chữ Điền",
  Heart: "Trái Tim",
  Diamond: "Kim Cương",
  Triangle: "Tam Giác",
  Oblong: "Dài",
};

const BODY_PART_LABELS: Record<string, string> = {
  forehead: "Trán",
  eyebrows: "Lông Mày",
  eyebrow: "Lông Mày",
  eyes: "Đôi Mắt",
  eye: "Đôi Mắt",
  nose: "Mũi",
  mouth: "Miệng",
  lips: "Miệng",
  chin: "Cằm",
  jaw: "Cằm",
};

const LINE_TYPE_VI: Record<string, string> = {
  life: "Sinh Đạo",
  heart: "Tâm Đạo",
  head: "Trí Đạo",
  fate: "Định Mệnh",
  sun: "Thái Dương",
};

const ASPECT_EMOJI: Record<string, string> = {
  health: "❤️",
  career: "💼",
  relationships: "💞",
  personality: "👤",
};

const ASPECT_NAME_VI: Record<string, string> = {
  health: "Sức Khỏe",
  career: "Sự Nghiệp",
  relationships: "Tình Duyên",
  personality: "Tính Cách",
};

function getImageSrc(path: string) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

function isImageLikelyExpired(dateStr: string) {
  if (!dateStr) return false;
  const created = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > IMAGE_EXPIRY_DAYS;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function ExpiredImagePlaceholder({ type }: { type: "face" | "palm" }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#f0e8d8]/60 gap-2 p-3 text-center">
      <span className="text-2xl">🔒</span>
      <p className="text-[10px] text-[#8C6D53] leading-relaxed font-medium">
        Vì lý do bảo mật cho khách hàng,<br />
        ảnh sẽ tự xóa sau {IMAGE_EXPIRY_DAYS} ngày.
      </p>
      <Link
        href={type === "face" ? "/huyen-co/face-scan" : "/huyen-co/palm-scan"}
        className="text-[10px] text-amber-800 font-bold underline mt-1"
      >
        Quét lại để xem ảnh mới →
      </Link>
    </div>
  );
}

function ImageWithFallback({ src, alt, dateStr, type }: { src: string; alt: string; dateStr: string; type: "face" | "palm" }) {
  const [failed, setFailed] = useState(false);
  const likely = isImageLikelyExpired(dateStr);

  if (!src || failed || likely) {
    return <ExpiredImagePlaceholder type={type} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

/* ───── Extract face body part summaries from physiognomyResult ───── */
function extractFaceBodyParts(physiognomyResult: any): { part: string; summary: string }[] {
  if (!physiognomyResult || typeof physiognomyResult !== "object") return [];

  const parts: { part: string; summary: string }[] = [];
  const keys = ["forehead", "eyebrows", "eyebrow", "eyes", "eye", "nose", "mouth", "lips", "chin", "jaw"];

  for (const key of keys) {
    const val = physiognomyResult[key];
    if (!val) continue;

    let text = "";
    if (typeof val === "string") {
      text = val;
    } else if (typeof val === "object") {
      text = val.meaning || val.description || "";
    }

    if (text) {
      const label = BODY_PART_LABELS[key] || key;
      // Avoid duplicates (e.g. "eyes" and "eye" map to same label)
      if (!parts.find((p) => p.part === label)) {
        parts.push({ part: label, summary: text.length > 80 ? text.substring(0, 80) + "…" : text });
      }
    }
  }

  // Also check parts.* structure (template format)
  const partsObj = physiognomyResult.parts;
  if (partsObj && typeof partsObj === "object") {
    for (const key of keys) {
      const arr = partsObj[key];
      if (Array.isArray(arr) && arr.length > 0) {
        const label = BODY_PART_LABELS[key] || key;
        if (!parts.find((p) => p.part === label)) {
          const text = arr.map((x: any) => x.meaning || x.description || "").filter(Boolean).join(". ");
          if (text) {
            parts.push({ part: label, summary: text.length > 80 ? text.substring(0, 80) + "…" : text });
          }
        }
      }
    }
  }

  return parts.slice(0, 6); // Max 6 body parts
}

function extractLifePhases(physiognomyResult: any): string[] {
  if (!physiognomyResult?.life_phases) return [];
  const phases = physiognomyResult.life_phases;
  const items: string[] = [];
  if (phases.early_life) items.push(`🌅 Trước 30: ${phases.early_life.substring(0, 60)}…`);
  if (phases.mid_life) items.push(`☀️ 30-50: ${phases.mid_life.substring(0, 60)}…`);
  if (phases.late_life) items.push(`🌌 Sau 50: ${phases.late_life.substring(0, 60)}…`);
  return items;
}

function extractKeyPoints(physiognomyResult: any): string[] {
  if (!physiognomyResult?.key_points || !Array.isArray(physiognomyResult.key_points)) return [];
  return physiognomyResult.key_points.slice(0, 2);
}

export default function HistoryPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("face");
  const [faceHistory, setFaceHistory] = useState<FaceRecord[]>([]);
  const [palmHistory, setPalmHistory] = useState<PalmRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("authToken");
    const u = localStorage.getItem("authUser");
    if (!t || !u) {
      router.push("/huyen-co");
      return;
    }
    setToken(t);
    try {
      setUser(JSON.parse(u));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!token || !user?.id) return;
    const uid = user.id;

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [faceRes, palmRes] = await Promise.all([
          fetch(`${BASE_URL}/facial-analysis/user/${uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/palm-analysis/user/${uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (faceRes.ok) {
          const fj = await faceRes.json();
          // Face controller wraps with GeneralResponse: { code, data: [...] }
          const rows = fj.data ?? fj ?? [];
          setFaceHistory(Array.isArray(rows) ? rows : []);
        }

        if (palmRes.ok) {
          const pj = await palmRes.json();
          // Palm controller returns raw from service: { success, data: [...] }
          // But might also be double-wrapped if TSOA adds GeneralResponse
          let rows = pj.data ?? pj ?? [];
          // Handle double-wrapping: { data: { success: true, data: [...] } } or { success: true, data: [...] }
          if (rows && !Array.isArray(rows) && rows.data) {
            rows = rows.data;
          }
          setPalmHistory(Array.isArray(rows) ? rows : []);
        }
      } catch (e: any) {
        setError("Không thể tải lịch sử. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, user]);

  return (
    <div
      className="min-h-screen font-sans pb-20 relative"
      style={{
        backgroundImage: "url('/images/palmbg.png')",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#fbf8f3",
      }}
    >
      <div className="absolute inset-0 bg-[#fbf8f3]/10 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-[#fcf9f5]/90 backdrop-blur border-b border-[#D9C3B0] px-6 py-4 shadow-sm flex items-center justify-between max-w-5xl mx-auto rounded-b-2xl">
        <Link href="/huyen-co" className="flex items-center gap-2 text-[#5C3E21] hover:text-amber-800 transition-all">
          <span className="text-xl">←</span>
          <span className="text-xs uppercase font-bold tracking-widest">Trang chủ</span>
        </Link>
        <h1 className="text-xs sm:text-sm font-bold tracking-widest text-amber-800 uppercase font-serif">
          🗂️ Lịch Sử Phân Tích
        </h1>
        <div className="w-20" />
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-8 relative z-10">

        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-block text-4xl mb-3">📜</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5C3E21] uppercase tracking-widest">
            Lịch Sử Huyền Cơ
          </h1>
          <p className="text-[#8C6D53] text-xs mt-2 uppercase tracking-widest font-bold">
            {user?.lastName} {user?.firstName} • Tất cả kết quả đã lưu
          </p>
          <div className="w-20 h-0.5 bg-[#8C6D53]/30 mx-auto mt-3" />
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab("face")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
              activeTab === "face"
                ? "bg-amber-800 text-white border-amber-800 shadow-md"
                : "bg-white/60 text-[#5C3E21] border-[#D9C3B0] hover:bg-white/90"
            }`}
          >
            <span>👤</span> Tướng Mặt
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
              {faceHistory.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("palm")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
              activeTab === "palm"
                ? "bg-amber-800 text-white border-amber-800 shadow-md"
                : "bg-white/60 text-[#5C3E21] border-[#D9C3B0] hover:bg-white/90"
            }`}
          >
            <span>🖐️</span> Chỉ Tay
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
              {palmHistory.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-t-amber-700 border-[#D9C3B0]/30 animate-spin" />
            <p className="text-[#8C6D53] text-sm">Đang tải lịch sử của bạn...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-700 bg-red-50 rounded-2xl border border-red-200 p-6">
            <span className="text-4xl block mb-3">⚠️</span>
            <p className="font-bold text-sm">{error}</p>
          </div>
        ) : activeTab === "face" ? (
          <FaceHistoryGrid records={faceHistory} />
        ) : (
          <PalmHistoryGrid records={palmHistory} />
        )}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FACE HISTORY GRID — Enriched with body parts & life phases
   ═══════════════════════════════════════════════════════════════ */
function FaceHistoryGrid({ records }: { records: FaceRecord[] }) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon="👤"
        title="Chưa có lịch sử tướng mặt"
        desc="Bắt đầu quét khuôn mặt để nhận luận giải nhân tướng học AI."
        href="/huyen-co/face-scan"
        cta="Quét Tướng Mặt Ngay"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {records.map((rec) => {
        const dateStr = rec.createAt || rec.processedAt || "";
        const imageSrc = getImageSrc(rec.annotatedImage);
        const bodyParts = extractFaceBodyParts(rec.physiognomyResult);
        const lifePhases = extractLifePhases(rec.physiognomyResult);
        const keyPoints = extractKeyPoints(rec.physiognomyResult);

        return (
          <div
            key={rec.id}
            className="bg-[#fdfbf7]/90 border border-[#D9C3B0] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
          >
            {/* Image — fixed width on left */}
            <div className="w-full sm:w-48 sm:min-h-[280px] bg-[#eae2d5] relative overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={imageSrc}
                alt="Tướng mặt"
                dateStr={dateStr}
                type="face"
              />
              {/* Date badge */}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur">
                {formatDate(dateStr)}
              </div>
            </div>

            {/* Info — expands right */}
            <div className="p-4 flex flex-col flex-1 min-w-0">
              {/* Header: Shape + Score */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-amber-800 font-black uppercase tracking-widest bg-amber-100/60 px-2 py-0.5 rounded-full border border-amber-800/10">
                  {FACE_SHAPE_VI[rec.faceShape] || rec.faceShape || "Không rõ"}
                </span>
                <span className="text-xs font-black text-[#5C3E21]">
                  {rec.harmonyScore > 0 ? `Hài hòa: ${rec.harmonyScore}%` : "—"}
                </span>
              </div>

              {/* Summary Text */}
              <p className="text-xs text-[#6D543F] leading-relaxed line-clamp-3 mb-3">
                {rec.resultText || "Không có mô tả"}
              </p>

              {/* Body Parts Summary */}
              {bodyParts.length > 0 && (
                <div className="mb-3 border-t border-[#D9C3B0]/30 pt-2">
                  <h4 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1.5">
                    📋 Phân tích ngũ quan:
                  </h4>
                  <div className="space-y-1">
                    {bodyParts.slice(0, 4).map((bp) => (
                      <div key={bp.part} className="flex items-start gap-1.5">
                        <span className="text-[9px] font-bold text-[#5C3E21] bg-white/60 px-1.5 py-0.5 rounded border border-[#D9C3B0]/20 whitespace-nowrap flex-shrink-0">
                          {bp.part}
                        </span>
                        <p className="text-[10px] text-[#6D543F] leading-snug line-clamp-1">
                          {bp.summary}
                        </p>
                      </div>
                    ))}
                    {bodyParts.length > 4 && (
                      <p className="text-[9px] text-[#8C6D53] italic">+{bodyParts.length - 4} bộ phận khác...</p>
                    )}
                  </div>
                </div>
              )}

              {/* Key Points */}
              {keyPoints.length > 0 && (
                <div className="mb-3">
                  {keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 mb-0.5">
                      <span className="text-yellow-600 text-[10px] mt-0.5">✦</span>
                      <p className="text-[10px] text-[#5C3E21] leading-snug line-clamp-1">{point}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Life Phases (compact) */}
              {lifePhases.length > 0 && (
                <div className="mb-3 bg-[#f7f2ea]/50 rounded-lg p-2 border border-[#D9C3B0]/20">
                  <h4 className="text-[9px] font-black text-[#5C3E21] uppercase tracking-widest mb-1">
                    🌅 Giai đoạn cuộc đời:
                  </h4>
                  {lifePhases.map((phase, idx) => (
                    <p key={idx} className="text-[9px] text-[#6D543F] leading-snug line-clamp-1">{phase}</p>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#D9C3B0]/30 mt-auto">
                <span className="text-[10px] text-[#8C6D53]">{formatTime(dateStr)}</span>
                <Link
                  href={`/huyen-co/share/face-result?id=${encodeId(rec.id)}`}
                  className="text-[10px] font-black text-amber-800 uppercase tracking-wider hover:underline flex items-center gap-1"
                >
                  Xem đầy đủ →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PALM HISTORY GRID — Enriched with interpretations & aspects
   ═══════════════════════════════════════════════════════════════ */
function PalmHistoryGrid({ records }: { records: PalmRecord[] }) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon="🖐️"
        title="Chưa có lịch sử chỉ tay"
        desc="Bắt đầu quét lòng bàn tay để nhận luận giải đường sinh đạo, tâm đạo, trí đạo."
        href="/huyen-co/palm-scan"
        cta="Quét Chỉ Tay Ngay"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {records.map((rec) => {
        const dateStr = rec.createdAt || "";
        const imageSrc = getImageSrc(rec.annotatedImage);
        const detectedLines = [
          rec.detectedLifeLine ? "Sinh Đạo" : null,
          rec.detectedHeartLine ? "Tâm Đạo" : null,
          rec.detectedHeadLine ? "Trí Đạo" : null,
          rec.detectedFateLine ? "Định Mệnh" : null,
        ].filter(Boolean);

        const interps = rec.interpretations || [];
        const aspects = rec.lifeAspects || [];

        return (
          <div
            key={rec.id}
            className="bg-[#fdfbf7]/90 border border-[#D9C3B0] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
          >
            {/* Image — fixed width on left */}
            <div className="w-full sm:w-48 sm:min-h-[280px] bg-[#eae2d5] relative overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={imageSrc}
                alt="Chỉ tay"
                dateStr={dateStr}
                type="palm"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur">
                {formatDate(dateStr)}
              </div>
              {rec.palmLinesDetected !== undefined && (
                <div className="absolute top-2 right-2 bg-amber-800/80 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {rec.palmLinesDetected} đường
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1 min-w-0">
              {/* Detected lines badges */}
              {detectedLines.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {detectedLines.map((l) => (
                    <span key={l} className="text-[9px] bg-amber-100/60 text-amber-900 border border-amber-800/10 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {l}
                    </span>
                  ))}
                </div>
              )}

              {/* Summary Text */}
              <p className="text-xs text-[#6D543F] leading-relaxed line-clamp-3 mb-3">
                {rec.summaryText || "Không có mô tả"}
              </p>

              {/* Interpretations Summary */}
              {interps.length > 0 && (
                <div className="mb-3 border-t border-[#D9C3B0]/30 pt-2">
                  <h4 className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1.5">
                    🔎 Chi tiết các đường chỉ:
                  </h4>
                  <div className="space-y-1">
                    {interps.slice(0, 4).map((interp) => (
                      <div key={interp.id} className="flex items-start gap-1.5">
                        <span className="text-[9px] font-bold text-[#5C3E21] bg-white/60 px-1.5 py-0.5 rounded border border-[#D9C3B0]/20 whitespace-nowrap flex-shrink-0">
                          {LINE_TYPE_VI[interp.lineType.toLowerCase()] || interp.lineType}
                        </span>
                        <p className="text-[10px] text-[#6D543F] leading-snug line-clamp-1">
                          {interp.meaning.length > 80 ? interp.meaning.substring(0, 80) + "…" : interp.meaning}
                        </p>
                      </div>
                    ))}
                    {interps.length > 4 && (
                      <p className="text-[9px] text-[#8C6D53] italic">+{interps.length - 4} đường khác...</p>
                    )}
                  </div>
                </div>
              )}

              {/* Life Aspects Summary */}
              {aspects.length > 0 && (
                <div className="mb-3 bg-[#f7f2ea]/50 rounded-lg p-2 border border-[#D9C3B0]/20">
                  <h4 className="text-[9px] font-black text-[#5C3E21] uppercase tracking-widest mb-1">
                    🧭 Khía cạnh cuộc sống:
                  </h4>
                  <div className="space-y-0.5">
                    {aspects.slice(0, 4).map((asp) => (
                      <div key={asp.id} className="flex items-start gap-1.5">
                        <span className="text-[10px] flex-shrink-0">{ASPECT_EMOJI[asp.aspect] || "✨"}</span>
                        <p className="text-[9px] text-[#6D543F] leading-snug line-clamp-1">
                          <strong className="text-[#5C3E21]">{ASPECT_NAME_VI[asp.aspect] || asp.aspect}:</strong>{" "}
                          {asp.content.length > 70 ? asp.content.substring(0, 70) + "…" : asp.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#D9C3B0]/30 mt-auto">
                <span className="text-[10px] text-[#8C6D53]">{formatTime(dateStr)}</span>
                <Link
                  href={`/huyen-co/share/palm-result?id=${encodeId(rec.id)}`}
                  className="text-[10px] font-black text-amber-800 uppercase tracking-wider hover:underline flex items-center gap-1"
                >
                  Xem đầy đủ →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───── Empty State ───── */
function EmptyState({
  icon, title, desc, href, cta
}: { icon: string; title: string; desc: string; href: string; cta: string }) {
  return (
    <div className="text-center py-16 bg-[#fdfbf7]/70 border border-[#D9C3B0]/40 rounded-3xl p-8">
      <span className="text-5xl block mb-4">{icon}</span>
      <h3 className="text-lg font-bold text-[#5C3E21] mb-2">{title}</h3>
      <p className="text-sm text-[#8C6D53] mb-6 max-w-xs mx-auto leading-relaxed">{desc}</p>
      <Link
        href={href}
        className="px-8 py-3 bg-amber-800 text-white font-bold rounded-full text-sm uppercase tracking-widest hover:bg-amber-900 transition-all shadow-md"
      >
        {cta}
      </Link>
    </div>
  );
}
