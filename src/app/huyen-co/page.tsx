"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AuthModal from "./AuthModal";
import PricingModal from "./PricingModal";
import HuyenCoHeader from "./components/HuyenCoHeader";
import {
  AUTH_CHANGE_EVENT,
  clearStoredAuth,
  getStoredAuth,
  refreshAuthMe,
  saveStoredAuth,
} from "./utils/authSync";
import {
  DailyAlmanacModal,
  DailyAlmanacCompactBar,
} from "./components/DailyAlmanacWidget";
import {
  HuyenCoLogoIcon,
  FacePhysiognomyIcon,
  PalmReadingIcon,
  FolkCardsIcon,
  TuViAstrolabeIcon,
  AICoachOracleIcon,
  ScrollHistoryIcon,
  SparkleIcon,
  ShareSealIcon,
} from "./components/HuyenCoIcons";

function QueryParamsTracker({
  onRefCodeFound,
  onRedirectFound,
  onPaymentFound,
}: {
  onRefCodeFound: (code: string) => void;
  onRedirectFound: (path: string) => void;
  onPaymentFound: (payment: string, orderCode?: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams?.get("ref");
    if (ref) {
      localStorage.setItem("referredBy", ref);
      onRefCodeFound(ref);
    } else {
      const stored = localStorage.getItem("referredBy");
      if (stored) {
        onRefCodeFound(stored);
      }
    }

    const redirect = searchParams?.get("redirect");
    if (redirect) {
      onRedirectFound(redirect);
    }
    const payment = searchParams?.get("payment");
    const orderCode = searchParams?.get("orderCode");
    if (payment) {
      onPaymentFound(payment, orderCode || undefined);
    }
  }, [searchParams, onRefCodeFound, onRedirectFound, onPaymentFound]);

  return null;
}

const SAMPLE_PREVIEWS = {
  face: {
    badge: "Bản Mẫu • Diện Tướng Học Cổ Truyền & Nhân Trắc AI",
    title: "Hình Tướng Khuôn Mặt Trái Xoan — Tam Đình Cân Xứng (88%)",
    metrics: [
      { label: "Thượng Đình (Trán)", value: "Rộng sáng, Thiên Đình cao mở — Tư duy chiến lược sắc bén" },
      { label: "Trung Đình (Mũi & Mắt)", value: "Sống mũi thẳng, Chuẩn đầu đầy — Tài bạch vững vàng" },
      { label: "Hạ Đình (Miệng & Địa Các)", value: "Khóe miệng hướng thượng, cằm tròn đầy — Hậu vận viên mãn" },
    ],
    excerpt:
      "Tổng thể diện tướng toát lên sự hài hòa giữa thần khí và cốt cách. Thượng đình mở rộng kết hợp cùng ánh mắt định tĩnh báo hiệu người có quý nhân nâng đỡ sớm trong sự nghiệp; từ trung vận (sau 32 tuổi) cung Tài Bạch và Điền Trạch phát vượng rõ rệt nhờ năng lực quản trị độc lập.",
    ctaLabel: "Quét Diện Tướng Của Bạn",
    ctaPath: "/huyen-co/face-scan",
  },
  cards: {
    badge: "Bản Mẫu • Quẻ Bài Dân Gian 32 Lá (Quẻ Tam Đa)",
    title: "Ách Cơ (Bổn Mạng) • Ách Rô (Gia Đạo) • Chín Bích (Tài Lộc)",
    metrics: [
      { label: "Điểm Cát/Hung", value: "6.8 / 10 — Cát Quẻ (Có cách cục Đôi Ách song hành)" },
      { label: "Khí Sắc Âm Dương", value: "2 Đỏ (Cơ, Rô) – 1 Đen (Bích): Trong thử thách nảy sinh cơ hội lớn" },
      { label: "Phép Luận Chuyển Hóa", value: "Thế 'Cát Hóa Giải Hung' — Quý nhân gia đạo đỡ cung Tài Lộc" },
    ],
    excerpt:
      "Bộ Đôi Ách (Ách Cơ – Ách Rô) tại Bổn Mạng và Gia Đạo báo hiệu tin vui lớn về văn thư, hợp đồng hoặc sự hậu thuẫn từ gia đình. Dù lá Chín Bích tại cung Tài Lộc cho thấy bạn đang tự tạo áp lực tâm lý trước quyết định mới, cát khí từ hai lá Ách sẽ giúp tháo gỡ trọn vẹn mọi khúc mắc.",
    ctaLabel: "Gieo Quẻ Bài 32 Lá Ngay",
    ctaPath: "/huyen-co/boibai",
  },
  tuvi: {
    badge: "Bản Mẫu • Tinh Bàn Tử Vi Đẩu Số 12 Cung",
    title: "Mệnh Vũ Khúc Thiên Phủ Đồng Cung • Kim Tứ Cục",
    metrics: [
      { label: "Cung Mệnh (Thân Cư Tài)", value: "Vũ Khúc (Miếu) • Thiên Phủ (Miếu) • Lộc Tồn hội chiếu" },
      { label: "Cung Quan Lộc", value: "Tử Vi • Thiên Tướng tọa thủ — Uy tín lãnh đạo và tổ chức" },
      { label: "Cung Tài Bạch", value: "Liêm Trinh • Văn Xương — Dòng tiền bền vững, nhạy bén đầu tư" },
    ],
    excerpt:
      "Cách cục Tử Phủ Vũ Tướng hội Lộc Tồn tạo nên nền tảng bản mệnh kiên định, trọng chữ tín và có biệt tài tích lũy tài sản. Trong đại vận hiện tại, việc kết hợp giữa chuyên môn sâu và mở rộng mạng lưới đối tác sẽ giúp bạn bứt phá mạnh mẽ cả về danh vị lẫn tài chính.",
    ctaLabel: "Lập Lá Số Tử Vi Chính Chủ",
    ctaPath: "/huyen-co/laso",
  },
};

export default function HuyenCoPortal() {
  const router = useRouter();
  const [refCode, setRefCode] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [sampleTab, setSampleTab] = useState<"face" | "cards" | "tuvi">("face");

  // Auth states
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [isAlmanacModalOpen, setIsAlmanacModalOpen] = useState<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const handleRedirectFound = React.useCallback(
    (path: string) => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        router.push(path);
      } else {
        setRedirectPath(path);
        setIsAuthModalOpen(true);
      }
    },
    [router]
  );

  const handlePaymentFound = React.useCallback(
    async (payment: string, orderCode?: string) => {
      setPaymentStatus(payment);

      if (payment === "success" && orderCode) {
        try {
          const baseUrl = "https://api.calnovaai.com/glowlab";

          const res = await fetch(`${baseUrl}/payment/vietqr/verify?orderCode=${orderCode}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
            },
          });

          const data = await res.json();
          if ((data.code === 0 || data.code === "OPERATION_SUCCESS") && data.data && data.data.success) {
            const storedToken = localStorage.getItem("authToken");
            if (storedToken) {
              const meUrl = "https://api.calnovaai.com/glowlab/auth/me";

              const meRes = await fetch(meUrl, {
                headers: { Authorization: `Bearer ${storedToken}` },
              });
              const userData = await meRes.json();
              if (userData?.data) {
                localStorage.setItem("authUser", JSON.stringify(userData.data));
                setUser(userData.data);
              }
            }
          }
        } catch (err) {
          console.error("Failed to verify orderCode:", err);
        }
      }

      router.replace("/huyen-co");
    },
    [router]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Auto-show Daily Almanac greeting once per session on entry
    const hasSeenAlmanac = sessionStorage.getItem("hc_daily_almanac_seen");
    if (!hasSeenAlmanac) {
      setIsAlmanacModalOpen(true);
      sessionStorage.setItem("hc_daily_almanac_seen", "1");
    }

    const { token: storedToken, user: storedUser } = getStoredAuth();

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(storedUser);
      }
      refreshAuthMe(storedToken).then((freshUser) => {
        if (freshUser) {
          setUser(freshUser);
        }
      });
    }

    const handleAuthChange = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail) {
        setToken(custom.detail.token || null);
        setUser(custom.detail.user || null);
      } else {
        const current = getStoredAuth();
        setToken(current.token);
        setUser(current.user);
      }
    };
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    saveStoredAuth(newToken, newUser);

    if (redirectPath) {
      router.push(redirectPath);
      setRedirectPath(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  };

  const handleLaunchFeature = (path: string) => {
    if (!token) {
      setRedirectPath(path);
      setIsAuthModalOpen(true);
    } else {
      router.push(path);
    }
  };

  const handleSharePortal = () => {
    const code = user?.referralCode || refCode;
    const link = `${window.location.origin}/huyen-co${code ? `?ref=${code}` : ""}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeSample = SAMPLE_PREVIEWS[sampleTab];

  return (
    <div className="min-h-screen bg-[#07060B] text-[#EFECE6] font-sans overflow-x-hidden relative">
      <Suspense fallback={null}>
        <QueryParamsTracker
          onRefCodeFound={setRefCode}
          onRedirectFound={handleRedirectFound}
          onPaymentFound={handlePaymentFound}
        />
      </Suspense>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        user={user}
        onSuccess={(updatedUser) => setUser(updatedUser)}
      />

      <DailyAlmanacModal
        isOpen={isAlmanacModalOpen}
        onClose={() => setIsAlmanacModalOpen(false)}
        user={user}
        onShare={handleSharePortal}
        copied={copied}
      />

      {/* Payment Status Toast */}
      {paymentStatus && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100]">
          <div
            className={`px-6 py-3 rounded-full backdrop-blur-md border shadow-2xl flex items-center gap-3 ${
              paymentStatus === "success"
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-300"
                : "bg-red-950/90 border-red-500/50 text-red-300"
            }`}
          >
            <SparkleIcon size={16} />
            <span className="font-semibold text-sm tracking-wide">
              {paymentStatus === "success" ? "Nạp tín chỉ thành công!" : "Giao dịch thanh toán đã dừng."}
            </span>
            <button onClick={() => setPaymentStatus(null)} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Subtle Oriental Celestial Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[75vw] h-[55vw] max-w-[900px] bg-[#D4AF37]/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] bg-[#B93829]/[0.04] rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#D4AF37_0.75px,transparent_0.75px)] [background-size:48px_48px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#07060B]/70 to-[#07060B]" />
      </div>

      {/* Unified Navigation Header */}
      <HuyenCoHeader
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="relative z-10">
        {/* ============================================================== */}
        {/* 1. HERO SECTION — Định vị rõ ràng trong 3 giây đầu tiên        */}
        {/* ============================================================== */}
        <section className="max-w-5xl mx-auto px-6 pt-14 sm:pt-20 pb-12 text-center">
          {refCode && !user && (
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/35 rounded-full text-xs text-[#E8C96A] font-medium mb-6 backdrop-blur-md">
              <SparkleIcon size={14} />
              <span>Bạn được bạn bè giới thiệu — Đăng ký tài khoản nhận ngay +20 Tín Chỉ miễn phí</span>
            </div>
          )}

          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#120F1D] border border-[#D4AF37]/25 text-[11px] uppercase tracking-[0.22em] text-[#C5B386] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>Hệ Sinh Thái Huyền Học Đông Phương & Sinh Trắc Học AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-wide leading-[1.12] text-[#FFFDF9] mb-6">
            Soi Chiếu <span className="hc-gold-gradient-text">Hình Tướng</span>
            <br />
            Thấu Suốt <span className="hc-gold-gradient-text">Thiên Cơ</span>
          </h1>

          <p className="text-[#C5B386] text-sm sm:text-base lg:text-lg leading-relaxed mb-9 max-w-2xl mx-auto font-normal">
            Kết hợp tinh hoa <strong className="text-[#EFECE6] font-medium">Nhân Tướng Học, Tử Vi Đẩu Số, Quẻ Bài Dân Gian 32 Lá</strong> cùng công nghệ nhận diện sinh trắc học chuẩn xác — giúp bạn định vị bản mệnh và đưa ra quyết định sáng suốt.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5">
            <a
              href="#phap-mon"
              className="w-full sm:w-auto px-8 py-4 hc-gold-btn rounded-full font-bold text-xs uppercase tracking-[0.16em] text-center flex items-center justify-center gap-2"
            >
              <SparkleIcon size={15} />
              <span>Chọn Pháp Môn Khai Mở</span>
            </a>
            <button
              type="button"
              onClick={() => setIsAlmanacModalOpen(true)}
              className="w-full sm:w-auto px-7 py-4 bg-[#120F1D] hover:bg-[#1A1528] border border-[#D4AF37]/35 hover:border-[#D4AF37] rounded-full font-semibold text-xs uppercase tracking-[0.15em] text-[#FFF3C4] transition-all text-center cursor-pointer"
            >
              ✦ Lịch Vận Khí Hôm Nay
            </button>
            <button
              onClick={handleSharePortal}
              className="w-full sm:w-auto px-6 py-4 bg-white/[0.03] border border-white/10 hover:border-[#D4AF37]/30 rounded-full font-medium text-xs uppercase tracking-[0.14em] text-[#C5B386] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShareSealIcon size={15} />
              <span>{copied ? "Đã Sao Chép Liên Kết!" : "Chia Sẻ Nhận Tín Chỉ"}</span>
            </button>
          </div>

          {/* Thanh Tóm Tắt Thiên Cơ Hôm Nay (Nhanh gọn, 0 API call) */}
          <div className="mt-10 text-left">
            <DailyAlmanacCompactBar onOpenModal={() => setIsAlmanacModalOpen(true)} />
          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. LỘ TRÌNH 3 BƯỚC DẪN DẮT (Giúp người dùng mới biết dùng ngay) */}
        {/* ============================================================== */}
        <section className="max-w-6xl mx-auto px-6 pb-12">
          <div className="hc-card rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#D4AF37]/15">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37] block mb-1">
                  Chỉ Dẫn Cho Người Mới
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Bắt Đầu Khai Mở Vận Mệnh Như Thế Nào?
                </h2>
              </div>
              {!user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs font-semibold text-[#FFF3C4] hover:bg-[#D4AF37]/25 transition-all cursor-pointer"
                >
                  Đăng ký tài khoản miễn phí →
                </button>
              ) : (
                <div className="flex items-center gap-3 text-xs text-[#C5B386]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>
                    Xin chào <strong className="text-white">{user.lastName} {user.firstName}</strong> • Bạn đang có{" "}
                    <strong className="text-[#E8C96A]">{user.credits ?? 0} Tín Chỉ</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => handleLaunchFeature("/huyen-co/laso")}
                className="group p-5 rounded-2xl bg-[#0B0912]/80 border border-[#D4AF37]/12 hover:border-[#D4AF37]/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25">
                    Bước 01 • Gốc Bản Mệnh
                  </span>
                  <span className="text-xs text-[#C5B386] group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <h3 className="text-base font-serif font-bold text-white mb-1.5 group-hover:text-[#E8C96A] transition-colors">
                  An Tinh Bàn Tử Vi Hoặc Quét Tướng
                </h3>
                <p className="text-xs text-[#C5B386] leading-relaxed">
                  Nhập ngày giờ sinh để lập <strong className="text-slate-200">Lá Số Tử Vi 12 Cung</strong> hoặc dùng Camera quét <strong className="text-slate-200">Diện Tướng / Chỉ Tay</strong> trong 30 giây.
                </p>
              </div>

              <div
                onClick={() => handleLaunchFeature("/huyen-co/boibai")}
                className="group p-5 rounded-2xl bg-[#0B0912]/80 border border-[#D4AF37]/12 hover:border-[#D4AF37]/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25">
                    Bước 02 • Giải Mã Sự Việc
                  </span>
                  <span className="text-xs text-[#C5B386] group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <h3 className="text-base font-serif font-bold text-white mb-1.5 group-hover:text-[#E8C96A] transition-colors">
                  Nhận Luận Giải Cổ Thư Đa Chiều
                </h3>
                <p className="text-xs text-[#C5B386] leading-relaxed">
                  Hệ thống đối chiếu trực tiếp tỷ lệ Tam Đình, Ngũ Quan hoặc <strong className="text-slate-200">Quẻ Bài Dân Gian 32 Lá</strong> với tàng thư cổ học để đưa ra bản luận giải chi tiết.
                </p>
              </div>

              <div
                onClick={() => handleLaunchFeature("/huyen-co/chat")}
                className="group p-5 rounded-2xl bg-[#0B0912]/80 border border-[#D4AF37]/12 hover:border-[#D4AF37]/40 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25">
                    Bước 03 • Vấn Đáp Sâu
                  </span>
                  <span className="text-xs text-[#C5B386] group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <h3 className="text-base font-serif font-bold text-white mb-1.5 group-hover:text-[#E8C96A] transition-colors">
                  Tham Vấn Cố Vấn Mệnh Lý 1-1
                </h3>
                <p className="text-xs text-[#C5B386] leading-relaxed">
                  Trò chuyện trực tiếp với <strong className="text-slate-200">Cố Vấn Mệnh Lý AI</strong> đã nắm rõ lá số của bạn để hỏi sâu về Tình duyên, Sự nghiệp, Tài lộc.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. BENTO GRID 5 PHÁP MÔN HUYỀN CƠ (Cân đối, Sang trọng)        */}
        {/* ============================================================== */}
        <section id="phap-mon" className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="text-[11px] font-bold uppercase text-[#D4AF37] tracking-[0.28em] mb-3 flex items-center justify-center gap-3">
              <span className="w-10 h-px bg-[#D4AF37]/35" />
              <span>Ngũ Đại Pháp Môn</span>
              <span className="w-10 h-px bg-[#D4AF37]/35" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Chọn Pháp Môn Chiêm Nghiệm
            </h2>
            <p className="text-xs sm:text-sm text-[#C5B386] mt-2 max-w-xl mx-auto">
              Mỗi pháp môn là một lăng kính soi chiếu vận mệnh độc lập, đồng thời liên thông chặt chẽ với nhau qua Hồ sơ Bản Mệnh của bạn.
            </p>
          </div>

          {/* Hàng 1: 2 Pháp Môn Sinh Trắc Chủ Lực (2 cột lớn cân xứng) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 1. Diện Tướng Học */}
            <div
              onClick={() => handleLaunchFeature("/huyen-co/face-scan")}
              className="hc-card hc-card-hover rounded-3xl p-7 sm:p-8 cursor-pointer flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#D4AF37]/[0.05] rounded-full blur-2xl pointer-events-none group-hover:bg-[#D4AF37]/[0.12] transition-all" />

              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#0A0812] border border-[#D4AF37]/30 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.6)] group-hover:border-[#D4AF37]/70 transition-all shrink-0">
                    <FacePhysiognomyIcon size={58} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[10px] font-bold uppercase tracking-widest text-[#FFF3C4]">
                      Nhân Tướng Học AI
                    </span>
                    <span className="text-[11px] text-[#C5B386]">⏱ Kết quả trong ~20 giây</span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white group-hover:text-[#E8C96A] transition-colors mb-2.5">
                  Diện Tướng Học (Xem Tướng Mặt)
                </h3>
                <p className="text-sm text-[#C5B386] leading-relaxed mb-5">
                  Đo đạc chính xác tỷ lệ <strong className="text-slate-200">Tam Đình (Thượng – Trung – Hạ)</strong> và <strong className="text-slate-200">Ngũ Quan (Trán, Mắt, Mũi, Miệng, Cằm)</strong> qua ảnh chụp hoặc tải lên, luận giải tính cách, tài vận và 3 giai đoạn Tiền – Trung – Hậu vận.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Tỷ lệ Tam Đình", "Ngũ Quan Lục Phủ", "Tiền • Trung • Hậu Vận", "Đồ hình Bát Quái"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#0A0812]/90 border border-[#D4AF37]/15 text-[11px] text-[#C5B386]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#D4AF37]/15 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#E8C96A] group-hover:underline">
                    Khai Mở Diện Tướng
                  </span>
                  <span className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#FFF3C4] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                    →
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Thủ Tướng Học */}
            <div
              onClick={() => handleLaunchFeature("/huyen-co/palm-scan")}
              className="hc-card hc-card-hover rounded-3xl p-7 sm:p-8 cursor-pointer flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute -right-10 -top-10 w-44 h-44 bg-[#D4AF37]/[0.05] rounded-full blur-2xl pointer-events-none group-hover:bg-[#D4AF37]/[0.12] transition-all" />

              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#0A0812] border border-[#D4AF37]/30 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.6)] group-hover:border-[#D4AF37]/70 transition-all shrink-0">
                    <PalmReadingIcon size={58} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[10px] font-bold uppercase tracking-widest text-[#FFF3C4]">
                      Thủ Tướng Học AI
                    </span>
                    <span className="text-[11px] text-[#C5B386]">⏱ Nam Tả • Nữ Hữu</span>
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white group-hover:text-[#E8C96A] transition-colors mb-2.5">
                  Thủ Tướng Học (Xem Chỉ Tay)
                </h3>
                <p className="text-sm text-[#C5B386] leading-relaxed mb-5">
                  Nhận diện và vẽ sơ đồ trực quan các đường chỉ chính trên lòng bàn tay: <strong className="text-slate-200">Sinh Đạo, Trí Đạo, Tâm Đạo, Định Mệnh</strong>; giải mã chuyên sâu 4 phương diện Sức khỏe, Sự nghiệp, Tình duyên và Nội tâm.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Sinh Đạo • Trí Đạo • Tâm Đạo", "Đường Định Mệnh", "4 Phương Diện Đời Sống", "Vẽ Sơ Đồ Vân Tay"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-[#0A0812]/90 border border-[#D4AF37]/15 text-[11px] text-[#C5B386]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#D4AF37]/15 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#E8C96A] group-hover:underline">
                    Quét Lòng Bàn Tay
                  </span>
                  <span className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#FFF3C4] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                    →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hàng 2: 3 Pháp Môn Tinh Bàn, Quẻ Bài & Cố Vấn Mệnh Lý */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 3. Lá Số Tử Vi 12 Cung */}
            <div
              onClick={() => handleLaunchFeature("/huyen-co/laso")}
              className="hc-card hc-card-hover rounded-3xl p-7 cursor-pointer flex flex-col justify-between relative overflow-hidden group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#0A0812] border border-[#D4AF37]/30 flex items-center justify-center shadow-lg group-hover:border-[#D4AF37]/70 transition-all">
                    <TuViAstrolabeIcon size={48} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[10px] font-bold uppercase tracking-wider text-[#E8C96A]">
                    12 Cung Vị
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#E8C96A] transition-colors mb-2">
                  Lập Lá Số Tử Vi
                </h3>
                <p className="text-xs sm:text-sm text-[#C5B386] leading-relaxed mb-5">
                  An sao lập lá số chuẩn Âm Dương Ngũ Hành, bình giải chi tiết Chính tinh – Phụ tinh tại 12 cung (Mệnh, Thân, Quan, Tài, Phu Thê...) và Đại hạn.
                </p>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/15 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E8C96A]">
                  An Sao Lập Lá Số
                </span>
                <span className="text-[#E8C96A] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* 4. Bói Bài Dân Gian 32 Lá */}
            <div
              onClick={() => handleLaunchFeature("/huyen-co/boibai")}
              className="hc-card hc-card-hover rounded-3xl p-7 cursor-pointer flex flex-col justify-between relative overflow-hidden group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#0A0812] border border-[#D4AF37]/30 flex items-center justify-center shadow-lg group-hover:border-[#D4AF37]/70 transition-all">
                    <FolkCardsIcon size={48} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[10px] font-bold uppercase tracking-wider text-[#E8C96A]">
                    32 Lá Cổ Truyền
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#E8C96A] transition-colors mb-2">
                  Bói Bài Dân Gian 32 Lá
                </h3>
                <p className="text-xs sm:text-sm text-[#C5B386] leading-relaxed mb-5">
                  Gieo quẻ <strong className="text-slate-200">Tam Đa (3 lá), Thất Tinh (7 lá), Thời Vận (12 lá)</strong> bằng thao tác chạm hoặc cử chỉ tay AR, tự động nhận diện cách cục & đối chiếu Tử Vi.
                </p>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/15 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E8C96A]">
                  Gieo Quẻ Bài Ngay
                </span>
                <span className="text-[#E8C96A] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            {/* 5. Cố Vấn Mệnh Lý AI */}
            <div
              onClick={() => handleLaunchFeature("/huyen-co/chat")}
              className="hc-card hc-card-hover rounded-3xl p-7 cursor-pointer flex flex-col justify-between relative overflow-hidden group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#0A0812] border border-[#D4AF37]/30 flex items-center justify-center shadow-lg group-hover:border-[#D4AF37]/70 transition-all">
                    <AICoachOracleIcon size={48} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Trực Tuyến 24/7
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#E8C96A] transition-colors mb-2">
                  Cố Vấn Mệnh Lý AI
                </h3>
                <p className="text-xs sm:text-sm text-[#C5B386] leading-relaxed mb-5">
                  Đối thoại sâu sắc cùng Bậc Thầy Minh Triết Phương Đông. Tự động kết nối lá số Tử Vi chính chủ để giải đáp cụ thể từng trăn trở của bạn.
                </p>
              </div>

              <div className="pt-4 border-t border-[#D4AF37]/15 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E8C96A]">
                  Khai Vấn Cùng Cố Vấn
                </span>
                <span className="text-[#E8C96A] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>

          {/* Thanh truy cập nhanh Lịch Sử (Nếu đã đăng nhập) */}
          {user && (
            <div
              onClick={() => router.push("/huyen-co/history")}
              className="mt-6 hc-card hc-card-hover rounded-2xl p-5 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A0812] border border-[#D4AF37]/30 flex items-center justify-center text-[#E8C96A]">
                  <ScrollHistoryIcon size={24} />
                </div>
                <div>
                  <h4 className="text-base font-serif font-bold text-white">
                    Sớ Lụa Lịch Sử Chiêm Nghiệm Của Bạn
                  </h4>
                  <p className="text-xs text-[#C5B386]">
                    Xem lại toàn bộ bản đồ Diện Tướng và Thủ Tướng đã lưu trữ và chia sẻ nhận thưởng Tín chỉ.
                  </p>
                </div>
              </div>
              <span className="px-5 py-2 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-xs font-semibold text-[#FFF3C4] whitespace-nowrap">
                Mở Sớ Lụa Lịch Sử →
              </span>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* 4. KHU VỰC XEM TRƯỚC BẢN LUẬN GIẢI MẪU (Tạo niềm tin tức thì)  */}
        {/* ============================================================== */}
        <section id="sample-preview" className="max-w-6xl mx-auto px-6 py-12">
          <div className="hc-card rounded-3xl p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#D4AF37]/15">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2">
                  Minh Bạch Chất Lượng Luận Giải
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  Xem Trước Kết Quả Thực Tế Từ Huyền Cơ
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 bg-[#090710] p-1.5 rounded-2xl border border-[#D4AF37]/20">
                {[
                  { id: "face", label: "Diện Tướng Học" },
                  { id: "cards", label: "Quẻ Bài Tam Đa" },
                  { id: "tuvi", label: "Tinh Bàn Tử Vi" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSampleTab(t.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      sampleTab === t.id
                        ? "hc-gold-btn font-bold"
                        : "text-[#C5B386] hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-3">
                <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[10px] font-bold uppercase tracking-wider text-[#E8C96A]">
                  {activeSample.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
                  {activeSample.title}
                </h3>
                <div className="space-y-2.5 pt-2">
                  {activeSample.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#0A0812]/90 border border-[#D4AF37]/15"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mb-0.5">
                        {m.label}
                      </div>
                      <div className="text-xs text-[#EFECE6] font-medium">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 bg-[#0A0812]/95 border border-[#D4AF37]/25 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8C96A] mb-4 pb-3 border-b border-[#D4AF37]/15">
                    <SparkleIcon size={15} />
                    <span>Trích Đoạn Bản Luận Giải Chuyên Sâu</span>
                  </div>
                  <p className="text-sm sm:text-base text-[#EFECE6] leading-8 font-serif italic mb-6">
                    &ldquo;{activeSample.excerpt}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D4AF37]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs text-[#C5B386]">
                    Luận giải cá nhân hóa 100% theo dữ liệu thực của bạn
                  </span>
                  <button
                    onClick={() => handleLaunchFeature(activeSample.ctaPath)}
                    className="px-6 py-3 hc-gold-btn rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {activeSample.ctaLabel} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 5. FOOTER ĐÔNG PHƯƠNG TRANG TRỌNG                              */}
        {/* ============================================================== */}
        <footer className="max-w-6xl mx-auto px-6 py-10 mt-8 border-t border-[#D4AF37]/15 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <HuyenCoLogoIcon size={28} />
            <div>
              <span className="text-xs font-serif font-bold tracking-[0.18em] uppercase text-[#E8C96A] block">
                Huyền Cơ Các • Calnova AI
              </span>
              <span className="text-[10px] text-[#C5B386]/70">
                Tinh hoa Nhân Tướng Học, Tử Vi Đẩu Số & Trí Tuệ Nhân Tạo
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs text-[#C5B386]">
            <Link href="/huyen-co/face-scan" className="hover:text-[#E8C96A] transition-colors">
              Diện Tướng
            </Link>
            <Link href="/huyen-co/palm-scan" className="hover:text-[#E8C96A] transition-colors">
              Thủ Tướng
            </Link>
            <Link href="/huyen-co/laso" className="hover:text-[#E8C96A] transition-colors">
              Tử Vi
            </Link>
            <Link href="/huyen-co/boibai" className="hover:text-[#E8C96A] transition-colors">
              Bói Bài
            </Link>
            <Link href="/huyen-co/chat" className="hover:text-[#E8C96A] transition-colors">
              Cố Vấn AI
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
