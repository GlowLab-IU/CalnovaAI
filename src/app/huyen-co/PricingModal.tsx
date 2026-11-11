"use client";

import React, { useEffect, useState, useRef } from "react";
import { CreditCoinIcon, ScrollHistoryIcon, ShareSealIcon, SparkleIcon } from "./components/HuyenCoIcons";
import { getStoredAuth, updateStoredUser } from "./utils/authSync";
import { buildReferralShareUrl } from "./utils/creditFlow";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess?: (updatedUser: any) => void;
  contextNote?: string;
}

interface CreditPkg {
  id: number;
  name: string;
  subtitle: string;
  hanzi: string;
  tier: "starter" | "jade" | "imperial";
  priceVnd: number;
  credits: number;
  bonusCredits: number;
  perks: string[];
  popular?: boolean;
  saveBadge?: string;
}

const DEFAULT_PACKAGES: CreditPkg[] = [
  {
    id: 1,
    name: "Khởi Đầu",
    subtitle: "Gieo duyên khai mở bản mệnh",
    hanzi: "初啟",
    tier: "starter",
    priceVnd: 30000,
    credits: 50,
    bonusCredits: 0,
    perks: [
      "50 lượt thỉnh vấn sâu cùng Cố Vấn AI",
      "Luận giải Tử Vi, Diện Tướng & Chỉ Tay",
      "Bảo lưu vĩnh viễn không giới hạn ngày",
    ],
  },
  {
    id: 2,
    name: "Linh Ngọc",
    subtitle: "Cân bằng trọn vẹn chi phí & lộc tặng",
    hanzi: "靈玉",
    tier: "jade",
    priceVnd: 50000,
    credits: 90,
    bonusCredits: 10,
    popular: true,
    saveBadge: "Tiết kiệm 17%",
    perks: [
      "90 Tín Chỉ gốc + Tặng 10 Tín Chỉ Lộc",
      "100 phiên vấn đáp & đối chiếu cổ thư",
      "Xuất Thẻ Cát Khí Hoàng Gia chất lượng cao",
    ],
  },
  {
    id: 3,
    name: "Thiên Ấn",
    subtitle: "Hành trang cát tường cho cả gia đạo",
    hanzi: "天印",
    tier: "imperial",
    priceVnd: 100000,
    credits: 200,
    bonusCredits: 30,
    saveBadge: "Tiết kiệm 28%",
    perks: [
      "200 Tín Chỉ gốc + Tặng 30 Tín Chỉ Đại Cát",
      "Luận giải thoải mái cho bản thân & người thân",
      "Ưu tiên lưu trữ trọn đời mọi lá số & hồ sơ",
    ],
  },
];

function TierArtifactEmblem({ tier }: { tier: CreditPkg["tier"] }) {
  if (tier === "starter") {
    // Đồng Tiền Cổ Khai Vận (Ancient Gold Coin)
    return (
      <svg width="46" height="46" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" fill="rgba(212,175,55,0.08)" stroke="#D4AF37" strokeOpacity="0.45" strokeWidth="1.4" />
        <circle cx="24" cy="24" r="14.5" fill="rgba(212,175,55,0.12)" stroke="#E8C96A" strokeWidth="1.6" />
        <rect x="19" y="19" width="10" height="10" rx="1.5" fill="#0B0914" stroke="#FFF3C4" strokeWidth="1.6" />
        <path d="M24 5V8M24 40V43M5 24H8M40 24H43" stroke="#D4AF37" strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (tier === "jade") {
    // Ngọc Bội Hộ Mệnh (Imperial Jade & Gold Talisman)
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="21" fill="rgba(52,211,153,0.08)" stroke="#E8C96A" strokeWidth="1.6" />
        <circle cx="24" cy="24" r="15.5" fill="rgba(16,185,129,0.14)" stroke="#6EE7B7" strokeOpacity="0.7" strokeWidth="1.5" />
        <path
          d="M24 12L27.2 20.8L36 24L27.2 27.2L24 36L20.8 27.2L12 24L20.8 20.8L24 12Z"
          fill="rgba(245,208,97,0.22)"
          stroke="#FFF3C4"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="24" r="3" fill="#6EE7B7" />
      </svg>
    );
  }

  // Kim Nguyên Bảo / Kim Ấn Thiên Tử (Imperial Gold Ingot & Seal)
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" fill="rgba(212,175,55,0.10)" stroke="#E8C96A" strokeOpacity="0.55" strokeWidth="1.5" />
      <path
        d="M11 25C11 21.5 14.2 19 17.5 21C19.2 17.5 28.8 17.5 30.5 21C33.8 19 37 21.5 37 25C35.8 31.2 31.2 34 24 34C16.8 34 12.2 31.2 11 25Z"
        fill="rgba(245,208,97,0.22)"
        stroke="#F6D87A"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M16 25.5C19 27.5 29 27.5 32 25.5" stroke="#FFF3C4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 11L25.6 14.4L29 16L25.6 17.6L24 21L22.4 17.6L19 16L22.4 14.4L24 11Z" fill="#FFF3C4" />
    </svg>
  );
}

function formatTransactionTitle(rawDesc?: string): string {
  if (!rawDesc) return "Giao dịch Tín Chỉ Huyền Cơ";
  if (rawDesc.startsWith("AI Chatbot:")) {
    const inner = rawDesc.replace(/^AI Chatbot:\s*/i, "").replace(/^"|"$/g, "");
    return `Thỉnh vấn Mệnh Lý: ${inner}`;
  }
  return rawDesc;
}

export default function PricingModal({
  isOpen,
  onClose,
  user,
  onSuccess,
  contextNote,
}: PricingModalProps) {
  const [packages, setPackages] = useState<CreditPkg[]>(DEFAULT_PACKAGES);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"packages" | "history">("packages");

  // Active VietQR Payment Session State
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<{
    creditAmount: number;
    newBalance: number;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Transaction History State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getBaseUrl = () => "https://api.calnovaai.com/glowlab";

  const effectiveUser = user || getStoredAuth().user;
  const currentCredits = Number(effectiveUser?.credits ?? 0);

  // Đồng bộ giá & số lượng tín chỉ từ DB nhưng giữ nguyên ngôn ngữ thiết kế Pháp Bảo Huyền Cơ
  useEffect(() => {
    if (!isOpen) return;
    const baseUrl = getBaseUrl();
    fetch(`${baseUrl}/credit-packages`)
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res?.data) && res.data.length > 0) {
          const tiers: CreditPkg["tier"][] = ["starter", "jade", "imperial"];
          const hanzis = ["初啟", "靈玉", "天印"];
          const displayNames = ["Khởi Đầu", "Linh Ngọc", "Thiên Ấn"];
          const subtitles = [
            "Gieo duyên khai mở bản mệnh",
            "Cân bằng trọn vẹn chi phí & lộc tặng",
            "Hành trang cát tường cho cả gia đạo",
          ];

          const mapped: CreditPkg[] = res.data.slice(0, 3).map((item: any, idx: number) => {
            const credits = Number(item.credits || DEFAULT_PACKAGES[idx]?.credits || 50);
            const bonus = Number(item.bonusCredits || 0);
            const total = credits + bonus;
            const perks =
              idx === 0
                ? [
                    `${total} lượt thỉnh vấn sâu cùng Cố Vấn AI`,
                    "Luận giải Tử Vi, Diện Tướng & Chỉ Tay",
                    "Bảo lưu vĩnh viễn không giới hạn ngày",
                  ]
                : idx === 1
                ? [
                    `${credits} Tín Chỉ gốc + Tặng ${bonus} Tín Chỉ Lộc`,
                    `${total} phiên vấn đáp & đối chiếu cổ thư`,
                    "Xuất Thẻ Cát Khí Hoàng Gia chất lượng cao",
                  ]
                : [
                    `${credits} Tín Chỉ gốc + Tặng ${bonus} Tín Chỉ Đại Cát`,
                    "Luận giải thoải mái cho bản thân & người thân",
                    "Ưu tiên lưu trữ trọn đời mọi lá số & hồ sơ",
                  ];

            return {
              id: item.id,
              name: displayNames[idx] || item.name,
              subtitle: subtitles[idx] || "Gói Tín Chỉ Huyền Cơ",
              hanzi: hanzis[idx] || "靈契",
              tier: tiers[idx] || "starter",
              priceVnd: Number(item.priceVnd),
              credits,
              bonusCredits: bonus,
              perks,
              popular: idx === 1,
              saveBadge: idx === 1 ? "Tiết kiệm 17%" : idx === 2 ? "Tiết kiệm 28%" : undefined,
            };
          });
          setPackages(mapped);
        }
      })
      .catch(() => {
        // Fallback sang DEFAULT_PACKAGES
      });
  }, [isOpen]);

  const fetchTransactions = async () => {
    const activeU = user || getStoredAuth().user;
    const userId = activeU?.id || activeU?.userId;
    const { token } = getStoredAuth();
    if (!userId || !token) return;
    setLoadingHistory(true);
    try {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/payment/transactions?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data?.data)) {
        setTransactions(data.data);
        if (data.data.some((tx: any) => tx.transactionStatus === "SUCCESS")) {
          syncUserProfile();
        }
      }
    } catch (e) {
      console.error("Failed to load transactions:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "history") {
      fetchTransactions();
    }
  }, [isOpen, activeTab]);

  // Auto-poll mỗi 3 giây khi đang mở mã VietQR
  useEffect(() => {
    if (!isOpen || !paymentData?.orderCode || paymentCompleted) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const checkStatus = async () => {
      await verifyOrder(paymentData.orderCode, true);
    };

    pollIntervalRef.current = setInterval(checkStatus, 3000);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isOpen, paymentData, paymentCompleted]);

  if (!isOpen) return null;

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyShareLink = async () => {
    try {
      const url = buildReferralShareUrl(effectiveUser);
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const syncUserProfile = async () => {
    const baseUrl = getBaseUrl();
    const { token } = getStoredAuth();
    if (!token) return null;
    try {
      const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const meJson = await meRes.json();
        if (meJson?.data) {
          updateStoredUser(meJson.data);
          onSuccess?.(meJson.data);
          return meJson.data;
        }
      }
    } catch (e) {
      console.error("Sync user profile error:", e);
    }
    return null;
  };

  const verifyOrder = async (orderCode: string | number, silent = false) => {
    if (!silent) {
      setVerifying(true);
      setError(null);
    }
    try {
      const baseUrl = getBaseUrl();
      const { token } = getStoredAuth();
      const res = await fetch(`${baseUrl}/payment/vietqr/verify?orderCode=${orderCode}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });
      const json = await res.json();
      const result = json?.data;

      if (result?.success || result?.status === "PAID") {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        const updatedUser = await syncUserProfile();
        const added = Number(result?.creditAmount || paymentData?.totalCredits || 0);
        const newBal = Number(
          updatedUser?.credits ?? result?.credits ?? currentCredits + added
        );
        setPaymentCompleted({
          creditAmount: added,
          newBalance: newBal,
        });
        return true;
      } else if (!silent) {
        if (result?.status === "CANCELLED" || result?.status === "EXPIRED") {
          setError("Giao dịch này đã hết hạn hoặc bị hủy. Vui lòng khởi tạo mã QR mới.");
        } else {
          setError(
            "Hệ thống đang chờ ngân hàng báo có. Nếu bạn vừa chuyển khoản, vui lòng đợi khoảng 5 giây rồi bấm kiểm tra lại."
          );
        }
      }
    } catch {
      if (!silent) {
        setError("Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại sau ít giây.");
      }
    } finally {
      if (!silent) setVerifying(false);
    }
    return false;
  };

  const handleSelectPackage = async (pkgId: number) => {
    const activeU = user || getStoredAuth().user;
    const userId = activeU?.id || activeU?.userId;
    const { token } = getStoredAuth();
    if (!userId || !token) {
      setError("Vui lòng đăng nhập tài khoản để nạp Tín Chỉ.");
      return;
    }
    setLoadingId(pkgId);
    setError(null);
    setPaymentCompleted(null);

    try {
      const returnUrl = `${window.location.origin}/huyen-co?payment=success`;
      const cancelUrl = `${window.location.origin}/huyen-co?payment=cancel`;
      const baseUrl = getBaseUrl();

      const res = await fetch(
        `${baseUrl}/payment/vietqr/create?packageId=${pkgId}&userId=${userId}&returnUrl=${encodeURIComponent(
          returnUrl
        )}&cancelUrl=${encodeURIComponent(cancelUrl)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if ((data.code === 0 || data.code === "OPERATION_SUCCESS") && data.data) {
        setPaymentData(data.data);
      } else {
        setError(data.message || "Chưa thể khởi tạo mã VietQR lúc này, vui lòng thử lại.");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối mạng, vui lòng thử lại.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCloseModal = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setPaymentData(null);
    setPaymentCompleted(null);
    setError(null);
    onClose();
  };

  const qrImageUrl = paymentData
    ? `https://img.vietqr.io/image/${paymentData.bin || "970422"}-${paymentData.accountNumber}-compact2.png?amount=${
        paymentData.amount
      }&addInfo=${encodeURIComponent(paymentData.description || "")}&accountName=${encodeURIComponent(
        paymentData.accountName || ""
      )}`
    : "";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-[#050409]/88 backdrop-blur-lg transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#130F20] via-[#0C0915] to-[#07060B] border border-[#D4AF37]/30 p-5 sm:p-8 text-left shadow-[0_28px_80px_rgba(0,0,0,0.88),0_0_45px_rgba(212,175,55,0.12)]">
        {/* Ánh kim tuyến mảnh trên đỉnh khung & chữ Hán chìm */}
        <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-[#F5D061]/65 to-transparent" />
        <div className="pointer-events-none select-none absolute right-8 top-5 font-serif text-5xl font-bold text-[#D4AF37]/[0.04] hidden sm:block">
          聚寶閣
        </div>

        {/* Nút đóng tinh gọn */}
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-[#161224] hover:bg-[#221C35] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 flex items-center justify-center text-[#C5B386] hover:text-[#FFF3C4] transition-all cursor-pointer z-20"
          aria-label="Đóng"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Tụ Bảo Các */}
        <div className="text-center mb-6 relative z-10">
          {/* Pill Số dư Ví Linh Khí hiện tại */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151122] border border-[#D4AF37]/30 text-[11px] text-[#C5B386] mb-3">
            <CreditCoinIcon size={15} />
            <span>Ví Linh Khí hiện có:</span>
            <strong className="text-[#F6D87A] font-semibold">{currentCredits} Tín Chỉ</strong>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-[0.14em] hc-gold-gradient-text mb-1.5">
            Tụ Bảo Các • Tín Chỉ Huyền Cơ
          </h3>
          <p className="text-[#A89B82] text-xs sm:text-[13px] max-w-xl mx-auto leading-relaxed">
            Kích hoạt tự động 24/7 qua <strong className="text-[#E8DFCE] font-medium">VietQR Napas</strong> — Tín chỉ cộng tức thì vào hồ sơ sau 3 giây chuyển khoản.
          </p>

          {contextNote && !paymentData && !paymentCompleted && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-[#F5D061]">
              <span>✦</span>
              <span>{contextNote}</span>
            </div>
          )}

          {/* Bộ chuyển Tab đồng bộ (Không dùng emoji) */}
          {!paymentData && !paymentCompleted && (
            <div className="mt-4">
              <div className="inline-flex p-1 rounded-full bg-[#0A0812] border border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => setActiveTab("packages")}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                    activeTab === "packages"
                      ? "hc-gold-btn font-bold"
                      : "text-[#A89B82] hover:text-[#FFF3C4]"
                  }`}
                >
                  <SparkleIcon size={13} />
                  <span>Chọn Gói Tín Chỉ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "hc-gold-btn font-bold"
                      : "text-[#A89B82] hover:text-[#FFF3C4]"
                  }`}
                >
                  <ScrollHistoryIcon size={14} />
                  <span>Sổ Giao Dịch</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-[#B93829]/12 border border-[#B93829]/40 rounded-2xl text-[#FCA5A5] text-xs sm:text-sm text-center">
            {error}
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW 1: HOÀN TẤT NẠP TÍN CHỈ TRANG NHÃ                           */}
        {/* ================================================================ */}
        {paymentCompleted ? (
          <div className="py-8 px-4 text-center space-y-5">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/12 border border-emerald-400/45 flex items-center justify-center shadow-[0_0_35px_rgba(52,211,153,0.2)]">
              <svg className="w-10 h-10 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300 block mb-1">
                Giao Dịch Thành Công
              </span>
              <h4 className="text-2xl font-serif font-bold text-[#FFF3C4] tracking-wide">
                Đã Khai Mở +{paymentCompleted.creditAmount} Tín Chỉ
              </h4>
            </div>
            <p className="text-[#C5B386] text-sm max-w-md mx-auto leading-relaxed">
              Linh khí đã được nạp vào tài khoản của bạn. Chúc bạn có những phiên chiêm nghiệm sáng suốt và cát lành.
            </p>
            <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-[#151122] border border-[#D4AF37]/40 text-[#F6D87A] font-semibold text-base">
              <CreditCoinIcon size={18} />
              <span>Số dư hiện tại:</span>
              <strong className="text-[#FFF3C4] text-lg">{paymentCompleted.newBalance} Tín Chỉ</strong>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-8 py-3.5 rounded-full hc-gold-btn font-bold uppercase tracking-[0.15em] text-xs cursor-pointer"
              >
                Tiếp Tục Khám Phá Thiên Cơ
              </button>
            </div>
          </div>
        ) : paymentData ? (
          /* ================================================================ */
          /* VIEW 2: QUÉT MÃ VIETQR & TỰ ĐỘNG ĐỐI SOÁT 3 GIÂY                 */
          /* ================================================================ */
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/15 pb-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentData(null);
                  setError(null);
                }}
                className="text-xs font-semibold text-[#C5B386] hover:text-[#FFF3C4] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>←</span>
                <span>Chọn gói Tín Chỉ khác</span>
              </button>
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Đang tự động xác nhận chuyển khoản (3s)...</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Cột trái: Khung Ngọc VietQR */}
              <div className="md:col-span-5 flex flex-col items-center p-4 rounded-2xl bg-gradient-to-b from-[#191429] to-[#0E0B17] border border-[#D4AF37]/35 shadow-xl">
                <div className="bg-white rounded-xl p-3 shadow-inner w-full max-w-[248px]">
                  <img
                    src={qrImageUrl}
                    alt="Mã VietQR thanh toán"
                    className="w-full h-auto rounded-lg object-contain"
                  />
                </div>
                <p className="mt-3 text-[11.5px] text-[#C5B386] text-center leading-5">
                  Mở ứng dụng <strong className="text-[#FFF3C4]">Ngân hàng bất kỳ</strong> hoặc{" "}
                  <strong className="text-[#FFF3C4]">MoMo / ZaloPay</strong> quét mã để điền sẵn chính xác nội dung.
                </p>
              </div>

              {/* Cột phải: Thông tin chuyển khoản chi tiết */}
              <div className="md:col-span-7 space-y-3 text-sm">
                <div className="p-3.5 rounded-2xl bg-[#181326] border border-[#D4AF37]/35 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#A89B82] uppercase font-bold tracking-[0.15em] block">
                      Pháp bảo đang thỉnh
                    </span>
                    <span className="text-base font-serif font-bold text-[#FFF3C4]">
                      {paymentData.packageName || "Gói Tín Chỉ Huyền Cơ"}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F6D87A] font-bold text-xs">
                    +{paymentData.totalCredits || paymentData.credits || ""} Tín Chỉ
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0D0A16] border border-[#D4AF37]/15 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wider text-[#8E8268]">Chủ tài khoản thụ hưởng</p>
                    <p className="font-semibold text-[#F5EFE6] mt-0.5">{paymentData.accountName}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0D0A16] border border-[#D4AF37]/15 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wider text-[#8E8268]">Số tài khoản (Napas 247)</p>
                    <p className="font-mono font-bold text-[#F6D87A] text-base mt-0.5">{paymentData.accountNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(paymentData.accountNumber, "acc")}
                    className="px-3 py-1.5 rounded-lg bg-[#181326] hover:bg-[#241D38] border border-[#D4AF37]/25 text-xs font-semibold text-[#E8C96A] transition-colors cursor-pointer shrink-0"
                  >
                    {copiedField === "acc" ? "✓ Đã chép" : "Sao chép"}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#0D0A16] border border-[#D4AF37]/15 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wider text-[#8E8268]">Số tiền thanh toán</p>
                    <p className="font-mono font-bold text-emerald-300 text-lg mt-0.5">
                      {Number(paymentData.amount).toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(String(paymentData.amount), "amt")}
                    className="px-3 py-1.5 rounded-lg bg-[#181326] hover:bg-[#241D38] border border-[#D4AF37]/25 text-xs font-semibold text-[#E8C96A] transition-colors cursor-pointer shrink-0"
                  >
                    {copiedField === "amt" ? "✓ Đã chép" : "Sao chép"}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#0D0A16] border border-[#D4AF37]/25 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wider text-[#C5B386]">
                      Nội dung chuyển khoản (Giữ nguyên)
                    </p>
                    <p className="font-mono font-bold text-[#FFF3C4] text-base mt-0.5">{paymentData.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(paymentData.description, "desc")}
                    className="px-3 py-1.5 rounded-lg bg-[#181326] hover:bg-[#241D38] border border-[#D4AF37]/25 text-xs font-semibold text-[#E8C96A] transition-colors cursor-pointer shrink-0"
                  >
                    {copiedField === "desc" ? "✓ Đã chép" : "Sao chép"}
                  </button>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => verifyOrder(paymentData.orderCode, false)}
                    disabled={verifying}
                    className="flex-1 py-3 px-5 rounded-full hc-gold-btn font-bold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>{verifying ? "Đang đối soát giao dịch..." : "✦ Tôi Đã Chuyển Khoản"}</span>
                  </button>
                  {paymentData.checkoutUrl && (
                    <a
                      href={paymentData.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-5 rounded-full bg-[#151122] hover:bg-[#1E1830] border border-[#D4AF37]/30 text-[#E8C96A] font-semibold text-xs uppercase tracking-wider text-center transition-all"
                    >
                      Cổng PayOS ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "history" ? (
          /* ================================================================ */
          /* VIEW 3: SỔ GIAO DỊCH TÍN CHỈ                                     */
          /* ================================================================ */
          <div className="space-y-2.5 max-h-[54vh] overflow-y-auto pr-1">
            {loadingHistory ? (
              <div className="py-12 text-center text-[#9E9482] text-sm">
                Đang tra cứu sổ giao dịch Tín Chỉ...
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-[#9E9482] text-sm">
                Chưa có biến động Tín Chỉ nào được ghi nhận.
              </div>
            ) : (
              transactions.map((tx: any) => {
                const isSuccess = tx.transactionStatus === "SUCCESS";
                const isPending = tx.transactionStatus === "PENDING";
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-[#100D1A] border border-[#D4AF37]/15 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#F5EFE6] truncate">
                        {formatTransactionTitle(tx.description)}
                      </p>
                      <p className="text-[11px] text-[#8E8268] mt-0.5">
                        {tx.createAt ? new Date(tx.createAt).toLocaleString("vi-VN") : ""}
                        {tx.paymentGatewayId ? ` • Mã đơn: #${tx.paymentGatewayId}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-bold ${
                          tx.transactionType === "IN" ? "text-emerald-300" : "text-[#E8C96A]"
                        }`}
                      >
                        <span>
                          {tx.transactionType === "IN" ? "+" : "-"}
                          {tx.creditAmount}
                        </span>
                        <CreditCoinIcon size={14} />
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${
                            isSuccess
                              ? "bg-emerald-500/12 text-emerald-300 border-emerald-400/25"
                              : isPending
                              ? "bg-amber-500/12 text-amber-300 border-amber-400/25"
                              : "bg-white/5 text-[#8E8268] border-white/10"
                          }`}
                        >
                          {isSuccess ? "Hoàn tất" : isPending ? "Chờ xác nhận" : "Đã dừng"}
                        </span>
                        {isPending && tx.paymentGatewayId && (
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await verifyOrder(tx.paymentGatewayId, false);
                              if (ok) fetchTransactions();
                            }}
                            className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/35 text-[#F6D87A] font-semibold cursor-pointer"
                          >
                            Kiểm tra
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* ================================================================ */
          /* VIEW 4: BA GÓI PHÁP BẢO TÍN CHỈ + LỐI NHẬN LỘC MIỄN PHÍ         */
          /* ================================================================ */
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
              {packages.map((pkg) => {
                const totalTokens = pkg.credits + (pkg.bonusCredits || 0);
                const costPerCredit = Math.round(pkg.priceVnd / Math.max(1, totalTokens));
                const isPopular = Boolean(pkg.popular);

                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 ${
                      isPopular
                        ? "bg-gradient-to-b from-[#1D1630] via-[#130E21] to-[#0D0A17] border-2 border-[#D4AF37]/65 shadow-[0_14px_40px_rgba(212,175,55,0.16)] md:-translate-y-1.5"
                        : "bg-gradient-to-b from-[#130F20]/90 to-[#0B0913]/95 border border-[#D4AF37]/20 hover:border-[#D4AF37]/45"
                    }`}
                  >
                    {/* Nhãn nổi 1 dòng duy nhất, không bao giờ gãy chữ */}
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded-full hc-gold-btn text-[10px] font-bold uppercase tracking-[0.16em] shadow-md">
                        ✦ Được Chọn Nhiều Nhất ✦
                      </div>
                    )}

                    {!isPopular && pkg.saveBadge && (
                      <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/12 border border-[#D4AF37]/35 text-[10px] font-semibold text-[#F6D87A]">
                        {pkg.saveBadge}
                      </div>
                    )}

                    {/* Chữ Hán chìm góc thẻ */}
                    <span className="pointer-events-none select-none absolute right-4 bottom-16 font-serif text-5xl font-bold text-[#D4AF37]/[0.05]">
                      {pkg.hanzi}
                    </span>

                    <div>
                      {/* Biểu tượng Pháp Bảo */}
                      <div className="flex items-center justify-center mb-3 pt-1">
                        <TierArtifactEmblem tier={pkg.tier} />
                      </div>

                      <div className="text-center mb-4">
                        <h4 className="text-xl font-serif font-bold text-[#FFF5D6] tracking-wide">
                          {pkg.name}
                        </h4>
                        <p className="text-[11.5px] text-[#9E9482] mt-0.5">{pkg.subtitle}</p>
                      </div>

                      {/* Số lượng Tín Chỉ & Đơn giá minh bạch */}
                      <div className="rounded-xl bg-[#090710]/80 border border-[#D4AF37]/15 py-3.5 px-3 text-center mb-4">
                        <div className="flex items-baseline justify-center gap-1.5">
                          <span className="text-3xl sm:text-4xl font-serif font-bold text-[#F6D87A]">
                            {totalTokens}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#C5B386]">
                            Tín Chỉ
                          </span>
                        </div>

                        {pkg.bonusCredits > 0 ? (
                          <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/12 border border-emerald-400/25 text-[10.5px] font-semibold text-emerald-300">
                            <span>+{pkg.bonusCredits} Tín Chỉ Lộc tặng thêm</span>
                          </div>
                        ) : (
                          <div className="mt-1 text-[11px] text-[#8E8268]">
                            Gói tiêu chuẩn • Kích hoạt tức thì
                          </div>
                        )}

                        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-baseline justify-center gap-1.5">
                          <span className="text-xl font-bold text-[#FFFDF9]">
                            {pkg.priceVnd.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="text-[11px] text-[#9E9482]">
                            (~{costPerCredit.toLocaleString("vi-VN")}đ / lượt)
                          </span>
                        </div>
                      </div>

                      {/* Quyền lợi cụ thể giúp tăng giá trị cảm nhận */}
                      <ul className="space-y-2 mb-5 text-xs text-[#D7CEBE]">
                        {pkg.perks.map((perk, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2 leading-5">
                            <span className="text-[#E8C96A] text-[10px] mt-0.5 shrink-0">✦</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPackage(pkg.id)}
                      disabled={loadingId === pkg.id}
                      className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-[0.15em] transition-all cursor-pointer disabled:opacity-60 ${
                        isPopular
                          ? "hc-gold-btn"
                          : "bg-[#171226] hover:bg-[#221B38] text-[#F6D87A] border border-[#D4AF37]/35 hover:border-[#D4AF37]/70"
                      }`}
                    >
                      {loadingId === pkg.id
                        ? "Đang khởi tạo QR..."
                        : isPopular
                        ? "Thỉnh Gói Linh Ngọc"
                        : `Thỉnh Gói ${pkg.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Lối thoát thân thiện: Chia sẻ nhận Tín Chỉ miễn phí (Không ép buộc người dùng) */}
            <div className="rounded-2xl bg-gradient-to-r from-[#120E1E]/95 via-[#161225]/95 to-[#120E1E]/95 border border-[#D4AF37]/20 px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E8C96A] shrink-0">
                  <ShareSealIcon size={17} />
                </div>
                <div className="text-xs leading-5">
                  <p className="font-semibold text-[#FFF3C4]">
                    Chưa muốn nạp ngay? Nhận Tín Chỉ miễn phí mỗi ngày
                  </p>
                  <p className="text-[#A89B82]">
                    Tặng sẵn <strong className="text-[#E8C96A]">2 lượt Lộc Khai Tâm mỗi ngày</strong>, hoặc mời bạn bè trải nghiệm để nhận thêm <strong className="text-emerald-300">+5 Tín Chỉ thưởng</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="self-stretch sm:self-auto px-4 py-2 rounded-full bg-[#0B0914] hover:bg-[#1A152B] border border-[#D4AF37]/35 text-[11px] font-semibold text-[#E8C96A] hover:text-[#FFF3C4] transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                {shareCopied ? "✓ Đã chép liên kết nhận lộc" : "Sao chép link nhận +5 Tín Chỉ"}
              </button>
            </div>
          </div>
        )}

        {/* Footer bảo chứng thanh toán */}
        <div className="mt-5 pt-3.5 border-t border-[#D4AF37]/12 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8E8268]">
          <span>Bảo mật & tự động đối soát 24/7 qua PayOS • VietQR Napas247</span>
          <span className="font-serif tracking-widest text-[#C5B386]/70">HUYỀN CƠ CÁC • CALNOVAAI</span>
        </div>
      </div>
    </div>
  );
}
