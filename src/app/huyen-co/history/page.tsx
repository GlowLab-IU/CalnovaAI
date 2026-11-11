"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { encodeId } from "@/utils/hashId";
import HuyenCoHeader from "../components/HuyenCoHeader";
import {
  FacePhysiognomyIcon,
  PalmReadingIcon,
  ScrollHistoryIcon,
  ShareSealIcon,
  SparkleIcon,
} from "../components/HuyenCoIcons";

const BASE_URL = "https://api.calnovaai.com/glowlab";
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
  Round: "Viên Tự (Tròn)",
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
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B0912] gap-2.5 p-4 text-center">
      <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E8C96A]">
        <ScrollHistoryIcon size={18} />
      </div>
      <p className="text-[11px] text-[#C5B386] leading-relaxed">
        Để bảo mật hình ảnh cá nhân, ảnh gốc tự động ẩn sau {IMAGE_EXPIRY_DAYS} ngày. Bản luận giải vẫn được lưu trữ trọn vẹn.
      </p>
      <Link
        href={type === "face" ? "/huyen-co/face-scan" : "/huyen-co/palm-scan"}
        className="text-[10px] text-[#E8C96A] font-bold uppercase tracking-wider hover:underline mt-1"
      >
        Quét bản mới →
      </Link>
    </div>
  );
}

function ImageWithFallback({
  src,
  alt,
  dateStr,
  type,
}: {
  src: string;
  alt: string;
  dateStr: string;
  type: "face" | "palm";
}) {
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
      if (!parts.find((p) => p.part === label)) {
        parts.push({ part: label, summary: text.length > 85 ? text.substring(0, 85) + "…" : text });
      }
    }
  }

  const partsObj = physiognomyResult.parts;
  if (partsObj && typeof partsObj === "object") {
    for (const key of keys) {
      const arr = partsObj[key];
      if (Array.isArray(arr) && arr.length > 0) {
        const label = BODY_PART_LABELS[key] || key;
        if (!parts.find((p) => p.part === label)) {
          const text = arr.map((x: any) => x.meaning || x.description || "").filter(Boolean).join(". ");
          if (text) {
            parts.push({ part: label, summary: text.length > 85 ? text.substring(0, 85) + "…" : text });
          }
        }
      }
    }
  }

  return parts.slice(0, 6);
}

function extractLifePhases(physiognomyResult: any): string[] {
  if (!physiognomyResult?.life_phases) return [];
  const phases = physiognomyResult.life_phases;
  const items: string[] = [];
  if (phases.early_life) items.push(`Tiền vận: ${phases.early_life.substring(0, 65)}…`);
  if (phases.mid_life) items.push(`Trung vận: ${phases.mid_life.substring(0, 65)}…`);
  if (phases.late_life) items.push(`Hậu vận: ${phases.late_life.substring(0, 65)}…`);
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
    const t =
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");
    const u = localStorage.getItem("authUser");
    if (!t) {
      router.push("/huyen-co");
      return;
    }
    setToken(t);
    if (u && u !== "undefined" && u !== "null") {
      try {
        setUser(JSON.parse(u));
      } catch {
        /* ignore */
      }
    } else {
      fetch("https://api.calnovaai.com/glowlab/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => r.json())
        .then((me) => {
          if ((me.code === 0 || me.code === "OPERATION_SUCCESS") && me.data) {
            localStorage.setItem("authToken", t);
            localStorage.setItem("authUser", JSON.stringify(me.data));
            setUser(me.data);
          } else {
            router.push("/huyen-co");
          }
        })
        .catch(() => router.push("/huyen-co"));
    }
  }, [router]);

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
          const rows = fj.data ?? fj ?? [];
          setFaceHistory(Array.isArray(rows) ? rows : []);
        }

        if (palmRes.ok) {
          const pj = await palmRes.json();
          let rows = pj.data ?? pj ?? [];
          if (rows && !Array.isArray(rows) && rows.data) {
            rows = rows.data;
          }
          setPalmHistory(Array.isArray(rows) ? rows : []);
        }
      } catch {
        setError("Không thể tải sớ lụa lịch sử. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, user]);

  return (
    <div className="min-h-screen bg-[#07060B] text-[#EFECE6] font-sans pb-20 relative overflow-x-hidden">
      {/* Subtle Oriental Celestial Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70vw] h-[50vw] bg-[#D4AF37]/[0.05] rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#D4AF37_0.75px,transparent_0.75px)] [background-size:48px_48px]" />
      </div>

      {/* Unified Header */}
      <HuyenCoHeader user={user} subtitle="Sớ Lụa Lưu Trữ Bản Đồ Nhân Tướng" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 relative z-10">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#120F1D] border border-[#D4AF37]/30 mb-3 text-[#E8C96A]">
            <ScrollHistoryIcon size={28} />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#D4AF37] mb-1">
            Tàng Thư Cá Nhân • {user?.lastName} {user?.firstName}
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
            Sớ Lụa Lịch Sử Chiêm Nghiệm
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-3 mb-9">
          <button
            onClick={() => setActiveTab("face")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
              activeTab === "face"
                ? "hc-gold-btn border-transparent"
                : "bg-[#120F1D] text-[#C5B386] border-[#D4AF37]/25 hover:text-white hover:border-[#D4AF37]/50"
            }`}
          >
            <span>Diện Tướng Học</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === "face" ? "bg-black/20 text-black" : "bg-white/10 text-[#E8C96A]"
              }`}
            >
              {faceHistory.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("palm")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
              activeTab === "palm"
                ? "hc-gold-btn border-transparent"
                : "bg-[#120F1D] text-[#C5B386] border-[#D4AF37]/25 hover:text-white hover:border-[#D4AF37]/50"
            }`}
          >
            <span>Thủ Tướng Học</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === "palm" ? "bg-black/20 text-black" : "bg-white/10 text-[#E8C96A]"
              }`}
            >
              {palmHistory.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-t-[#D4AF37] border-[#D4AF37]/20 animate-spin" />
            <p className="text-[#C5B386] text-xs uppercase tracking-widest">
              Đang mở sớ lụa lưu trữ...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-14 text-red-200 bg-red-950/30 rounded-3xl border border-red-500/30 p-6">
            <p className="font-semibold text-sm">{error}</p>
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

function FaceHistoryGrid({ records }: { records: FaceRecord[] }) {
  if (records.length === 0) {
    return (
      <EmptyState
        type="face"
        title="Chưa Có Bản Lưu Diện Tướng"
        desc="Quét khuôn mặt để nhận luận giải chi tiết Tam Đình, Ngũ Quan và lưu vào sớ lụa cá nhân."
        href="/huyen-co/face-scan"
        cta="Khai Mở Diện Tướng Ngay"
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
            className="hc-card hc-card-hover rounded-3xl overflow-hidden flex flex-col sm:flex-row"
          >
            {/* Image */}
            <div className="w-full sm:w-48 sm:min-h-[280px] bg-[#0B0912] relative overflow-hidden flex-shrink-0 border-b sm:border-b-0 sm:border-r border-[#D4AF37]/15">
              <ImageWithFallback src={imageSrc} alt="Tướng mặt" dateStr={dateStr} type="face" />
              <div className="absolute top-2.5 left-2.5 bg-black/75 border border-[#D4AF37]/30 text-[#FFF3C4] text-[10px] px-2.5 py-0.5 rounded-full font-semibold backdrop-blur">
                {formatDate(dateStr)}
              </div>
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] text-[#FFF3C4] font-bold uppercase tracking-wider bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                  {FACE_SHAPE_VI[rec.faceShape] || rec.faceShape || "Cân Đối"}
                </span>
                <span className="text-xs font-serif font-bold text-[#E8C96A]">
                  {rec.harmonyScore > 0 ? `Hài hòa: ${rec.harmonyScore}%` : "—"}
                </span>
              </div>

              <p className="text-xs text-[#C5B386] leading-relaxed line-clamp-3 mb-3">
                {rec.resultText || "Không có mô tả"}
              </p>

              {bodyParts.length > 0 && (
                <div className="mb-3 border-t border-[#D4AF37]/15 pt-2.5">
                  <h4 className="text-[10px] font-bold text-[#E8C96A] uppercase tracking-wider mb-1.5">
                    Ngũ Quan Trọng Điểm:
                  </h4>
                  <div className="space-y-1">
                    {bodyParts.slice(0, 3).map((bp) => (
                      <div key={bp.part} className="flex items-start gap-1.5">
                        <span className="text-[9px] font-bold text-[#FFF3C4] bg-[#0B0912] px-1.5 py-0.5 rounded border border-[#D4AF37]/20 whitespace-nowrap flex-shrink-0">
                          {bp.part}
                        </span>
                        <p className="text-[11px] text-[#C5B386] leading-snug line-clamp-1">
                          {bp.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {keyPoints.length > 0 && (
                <div className="mb-3">
                  {keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 mb-0.5">
                      <span className="text-[#D4AF37] text-[10px] mt-0.5">✦</span>
                      <p className="text-[11px] text-[#EFECE6] leading-snug line-clamp-1">{point}</p>
                    </div>
                  ))}
                </div>
              )}

              {lifePhases.length > 0 && (
                <div className="mb-3 bg-[#0B0912]/80 rounded-xl p-2.5 border border-[#D4AF37]/15">
                  {lifePhases.slice(0, 2).map((phase, idx) => (
                    <p key={idx} className="text-[10px] text-[#C5B386] leading-snug line-clamp-1">
                      • {phase}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/15 mt-auto gap-2">
                <span className="text-[10px] text-[#C5B386]/70">{formatTime(dateStr)}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      const hashed = encodeId(rec.id);
                      const shareUrl = `${window.location.origin}/huyen-co/share/face-result?id=${hashed}`;
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                      } catch {}
                      let msg = "Đã sao chép liên kết chia sẻ vào Clipboard!";
                      try {
                        const token = localStorage.getItem("authToken");
                        const rawUser = localStorage.getItem("authUser");
                        const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                        const oldCredits = Number(parsedUser?.credits ?? 0);
                        await fetch(`${BASE_URL}/facial-analysis/shared/${rec.id}`);
                        if (token) {
                          const meRes = await fetch(`${BASE_URL}/auth/me`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          const meData = await meRes.json();
                          if (meData?.data) {
                            const newCredits = Number(meData.data.credits ?? oldCredits);
                            localStorage.setItem("authUser", JSON.stringify(meData.data));
                            if (newCredits > oldCredits) {
                              msg = `Đã sao chép liên kết chia sẻ! Bạn nhận được +${
                                newCredits - oldCredits
                              } Tín Chỉ thưởng chia sẻ!`;
                            }
                          }
                        }
                      } catch {}
                      alert(msg);
                    }}
                    className="text-[11px] font-bold text-[#C5B386] hover:text-[#FFF3C4] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <ShareSealIcon size={13} />
                    <span>Chia sẻ</span>
                  </button>
                  <Link
                    href={`/huyen-co/share/face-result?id=${encodeId(rec.id)}`}
                    className="text-[11px] font-bold text-[#E8C96A] uppercase tracking-wider hover:underline flex items-center gap-1"
                  >
                    Xem luận giải →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PalmHistoryGrid({ records }: { records: PalmRecord[] }) {
  if (records.length === 0) {
    return (
      <EmptyState
        type="palm"
        title="Chưa Có Bản Lưu Thủ Tướng"
        desc="Quét lòng bàn tay để nhận luận giải Sinh Đạo, Trí Đạo, Tâm Đạo và lưu vào sớ lụa cá nhân."
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
            className="hc-card hc-card-hover rounded-3xl overflow-hidden flex flex-col sm:flex-row"
          >
            {/* Image */}
            <div className="w-full sm:w-48 sm:min-h-[280px] bg-[#0B0912] relative overflow-hidden flex-shrink-0 border-b sm:border-b-0 sm:border-r border-[#D4AF37]/15">
              <ImageWithFallback src={imageSrc} alt="Chỉ tay" dateStr={dateStr} type="palm" />
              <div className="absolute top-2.5 left-2.5 bg-black/75 border border-[#D4AF37]/30 text-[#FFF3C4] text-[10px] px-2.5 py-0.5 rounded-full font-semibold backdrop-blur">
                {formatDate(dateStr)}
              </div>
              {rec.palmLinesDetected !== undefined && (
                <div className="absolute top-2.5 right-2.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFF3C4] text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur">
                  {rec.palmLinesDetected} đường
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-1 min-w-0">
              {detectedLines.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {detectedLines.map((l) => (
                    <span
                      key={l}
                      className="text-[10px] bg-[#D4AF37]/15 text-[#FFF3C4] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#C5B386] leading-relaxed line-clamp-3 mb-3">
                {rec.summaryText || "Không có mô tả"}
              </p>

              {interps.length > 0 && (
                <div className="mb-3 border-t border-[#D4AF37]/15 pt-2.5">
                  <h4 className="text-[10px] font-bold text-[#E8C96A] uppercase tracking-wider mb-1.5">
                    Đường Chỉ Chính:
                  </h4>
                  <div className="space-y-1">
                    {interps.slice(0, 3).map((interp) => (
                      <div key={interp.id} className="flex items-start gap-1.5">
                        <span className="text-[9px] font-bold text-[#FFF3C4] bg-[#0B0912] px-1.5 py-0.5 rounded border border-[#D4AF37]/20 whitespace-nowrap flex-shrink-0">
                          {LINE_TYPE_VI[interp.lineType.toLowerCase()] || interp.lineType}
                        </span>
                        <p className="text-[11px] text-[#C5B386] leading-snug line-clamp-1">
                          {interp.meaning.length > 80 ? interp.meaning.substring(0, 80) + "…" : interp.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aspects.length > 0 && (
                <div className="mb-3 bg-[#0B0912]/80 rounded-xl p-2.5 border border-[#D4AF37]/15 space-y-1">
                  {aspects.slice(0, 2).map((asp) => (
                    <div key={asp.id} className="flex items-start gap-1.5">
                      <SparkleIcon size={11} className="text-[#D4AF37] mt-0.5 shrink-0" />
                      <p className="text-[10px] text-[#C5B386] leading-snug line-clamp-1">
                        <strong className="text-[#EFECE6]">{ASPECT_NAME_VI[asp.aspect] || asp.aspect}:</strong>{" "}
                        {asp.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/15 mt-auto gap-2">
                <span className="text-[10px] text-[#C5B386]/70">{formatTime(dateStr)}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      const hashed = encodeId(rec.id);
                      const shareUrl = `${window.location.origin}/huyen-co/share/palm-result?id=${hashed}`;
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                      } catch {}
                      let msg = "Đã sao chép liên kết chia sẻ vào Clipboard!";
                      try {
                        const token = localStorage.getItem("authToken");
                        const rawUser = localStorage.getItem("authUser");
                        const parsedUser = rawUser ? JSON.parse(rawUser) : null;
                        const oldCredits = Number(parsedUser?.credits ?? 0);
                        await fetch(`${BASE_URL}/palm-analysis/shared/${rec.id}`);
                        if (token) {
                          const meRes = await fetch(`${BASE_URL}/auth/me`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          const meData = await meRes.json();
                          if (meData?.data) {
                            const newCredits = Number(meData.data.credits ?? oldCredits);
                            localStorage.setItem("authUser", JSON.stringify(meData.data));
                            if (newCredits > oldCredits) {
                              msg = `Đã sao chép liên kết chia sẻ! Bạn nhận được +${
                                newCredits - oldCredits
                              } Tín Chỉ thưởng chia sẻ!`;
                            }
                          }
                        }
                      } catch {}
                      alert(msg);
                    }}
                    className="text-[11px] font-bold text-[#C5B386] hover:text-[#FFF3C4] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <ShareSealIcon size={13} />
                    <span>Chia sẻ</span>
                  </button>
                  <Link
                    href={`/huyen-co/share/palm-result?id=${encodeId(rec.id)}`}
                    className="text-[11px] font-bold text-[#E8C96A] uppercase tracking-wider hover:underline flex items-center gap-1"
                  >
                    Xem luận giải →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({
  type,
  title,
  desc,
  href,
  cta,
}: {
  type: "face" | "palm";
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="text-center py-16 hc-card rounded-3xl p-8 max-w-lg mx-auto">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0B0912] border border-[#D4AF37]/30 mb-4">
        {type === "face" ? <FacePhysiognomyIcon size={44} /> : <PalmReadingIcon size={44} />}
      </div>
      <h3 className="text-xl font-serif font-bold text-white mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-[#C5B386] mb-6 max-w-sm mx-auto leading-relaxed">{desc}</p>
      <Link
        href={href}
        className="inline-block px-8 py-3.5 hc-gold-btn font-bold rounded-full text-xs uppercase tracking-widest"
      >
        {cta}
      </Link>
    </div>
  );
}
