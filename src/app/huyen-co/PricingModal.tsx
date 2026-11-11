"use client";

import React, { useEffect, useState, useRef } from "react";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess?: (updatedUser: any) => void;
}

interface CreditPkg {
  id: number;
  name: string;
  priceVnd: number;
  credits: number;
  bonusCredits?: number;
  icon: string;
  description: string;
  popular?: boolean;
}

const DEFAULT_PACKAGES: CreditPkg[] = [
  { id: 1, name: "Khởi Đầu", priceVnd: 30000, credits: 50, bonusCredits: 0, icon: "🥉", description: "Lựa chọn tốt để trải nghiệm" },
  { id: 2, name: "Cơ Bản", priceVnd: 50000, credits: 90, bonusCredits: 10, icon: "🥈", description: "Phổ biến nhất (+10 Bonus)", popular: true },
  { id: 3, name: "Nâng Cao", priceVnd: 100000, credits: 200, bonusCredits: 30, icon: "🥇", description: "Tiết kiệm nhất (+30 Bonus)" },
];

export default function PricingModal({ isOpen, onClose, user, onSuccess }: PricingModalProps) {
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

  // Transaction History State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getBaseUrl = () => {
    return "https://api.calnovaai.com/glowlab";
  };

  // Load synchronized packages from backend DB
  useEffect(() => {
    if (!isOpen) return;
    const baseUrl = getBaseUrl();
    fetch(`${baseUrl}/credit-packages`)
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res?.data) && res.data.length > 0) {
          const icons = ["🥉", "🥈", "🥇", "💎"];
          const descs = [
            "Lựa chọn tốt để trải nghiệm",
            "Phổ biến nhất",
            "Tiết kiệm nhất",
            "Gói VIP ưu đãi lớn",
          ];
          const mapped: CreditPkg[] = res.data.slice(0, 3).map((item: any, idx: number) => ({
            id: item.id,
            name: item.name,
            priceVnd: Number(item.priceVnd),
            credits: Number(item.credits),
            bonusCredits: Number(item.bonusCredits || 0),
            icon: icons[idx] || "🪙",
            description:
              Number(item.bonusCredits || 0) > 0
                ? `${descs[idx] || "Ưu đãi"} (+${item.bonusCredits} Bonus)`
                : descs[idx] || "Gói nạp tín chỉ",
            popular: idx === 1,
          }));
          setPackages(mapped);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_PACKAGES silently
      });
  }, [isOpen]);

  // Load transaction history when switching to history tab
  const fetchTransactions = async () => {
    const userId = user?.id || user?.userId;
    if (!userId) return;
    setLoadingHistory(true);
    try {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/payment/transactions?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        },
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

  // Auto-poll payment verification every 3 seconds while QR code is displayed
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

  const syncUserProfile = async () => {
    const baseUrl = getBaseUrl();
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    try {
      const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const meJson = await meRes.json();
        if (meJson?.data) {
          localStorage.setItem("authUser", JSON.stringify(meJson.data));
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
      const res = await fetch(`${baseUrl}/payment/vietqr/verify?orderCode=${orderCode}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
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
        const newBal = Number(updatedUser?.credits ?? result?.credits ?? (Number(user?.credits || 0) + added));
        setPaymentCompleted({
          creditAmount: added,
          newBalance: newBal,
        });
        return true;
      } else if (!silent) {
        if (result?.status === "CANCELLED" || result?.status === "EXPIRED") {
          setError("Giao dịch này đã bị hủy hoặc hết hạn. Vui lòng tạo mã QR mới.");
        } else {
          setError("Hệ thống chưa ghi nhận được chuyển khoản. Nếu bạn vừa chuyển, vui lòng đợi 5-10 giây rồi bấm kiểm tra lại nhé!");
        }
      }
    } catch (err: any) {
      if (!silent) {
        setError("Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại sau ít giây.");
      }
    } finally {
      if (!silent) setVerifying(false);
    }
    return false;
  };

  const handleSelectPackage = async (pkgId: number) => {
    const userId = user?.id || user?.userId;
    if (!userId) {
      setError("Vui lòng đăng nhập để nạp tín chỉ");
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
            Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          },
        }
      );

      const data = await res.json();

      if ((data.code === 0 || data.code === "OPERATION_SUCCESS") && data.data) {
        setPaymentData(data.data);
      } else {
        setError(data.message || "Có lỗi xảy ra khi khởi tạo mã VietQR, vui lòng thử lại.");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi mạng, vui lòng kiểm tra kết nối");
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#05030A]/85 backdrop-blur-md transition-opacity duration-300">
      <div className="w-full max-w-3xl transform overflow-y-auto max-h-[92vh] rounded-3xl bg-gradient-to-b from-[#1a1528] to-[#0a0812] border border-amber-500/30 p-5 sm:p-8 text-left shadow-[0_0_50px_rgba(212,175,55,0.2)] relative">
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#d4af37] to-amber-600 mb-2">
            Nạp Tín Chỉ Huyền Cơ
          </h3>
          <p className="text-slate-300/80 text-xs sm:text-sm">
            Thanh toán tự động 24/7 qua VietQR — Tín chỉ được cộng ngay lập tức sau 3 giây chuyển khoản.
          </p>

          {/* Tabs when not in QR checkout */}
          {!paymentData && !paymentCompleted && (
            <div className="inline-flex mt-4 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setActiveTab("packages")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "packages"
                    ? "bg-gradient-to-r from-[#d4af37] to-amber-600 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🪙 Chọn Gói Nạp
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "history"
                    ? "bg-gradient-to-r from-[#d4af37] to-amber-600 text-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📜 Lịch Sử Giao Dịch
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs sm:text-sm text-center">
            {error}
          </div>
        )}

        {/* VIEW 1: PAYMENT COMPLETED CELEBRATION */}
        {paymentCompleted ? (
          <div className="py-8 px-4 text-center space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              🎉
            </div>
            <h4 className="text-2xl font-black text-emerald-400 uppercase tracking-wider">
              Nạp Tín Chỉ Thành Công!
            </h4>
            <p className="text-slate-200 text-sm sm:text-base max-w-md mx-auto">
              Hệ thống đã xác nhận thanh toán và cộng thêm{" "}
              <span className="text-[#d4af37] font-black">+{paymentCompleted.creditAmount} Tín Chỉ</span> vào tài khoản của bạn.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] font-black text-lg">
              <span>🪙 Số dư hiện tại:</span>
              <span>{paymentCompleted.newBalance} Tín Chỉ</span>
            </div>
            <div className="pt-4">
              <button
                onClick={handleCloseModal}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-600 text-black font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all shadow-lg"
              >
                Hoàn Tất & Tiếp Tục Khám Phá
              </button>
            </div>
          </div>
        ) : paymentData ? (
          /* VIEW 2: INLINE VIETQR CHECKOUT & AUTO-POLLING */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <button
                onClick={() => {
                  setPaymentData(null);
                  setError(null);
                }}
                className="text-xs font-bold text-slate-300 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
              >
                ← Chọn gói khác
              </button>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Đang tự động chờ xác nhận...
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: VietQR Image */}
              <div className="flex flex-col items-center bg-white rounded-2xl p-4 shadow-xl">
                <img
                  src={qrImageUrl}
                  alt="Mã VietQR thanh toán"
                  className="w-full max-w-[260px] h-auto rounded-lg object-contain"
                />
                <span className="mt-2 text-[11px] font-semibold text-slate-600 text-center">
                  Mở App Ngân hàng bất kỳ hoặc MoMo/ZaloPay để quét mã QR
                </span>
              </div>

              {/* Right: Transfer Details */}
              <div className="space-y-3.5 text-sm">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div className="text-xs text-amber-300/80 uppercase font-bold tracking-wider mb-1">
                    Gói đang thanh toán
                  </div>
                  <div className="text-base font-black text-white flex items-center justify-between">
                    <span>{paymentData.packageName || "Gói Tín Chỉ"}</span>
                    <span className="text-[#d4af37]">
                      +{paymentData.totalCredits || paymentData.credits || ""} Tín Chỉ
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Chủ tài khoản</p>
                    <p className="font-bold text-white">{paymentData.accountName}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Số tài khoản (MB Bank / Napas)</p>
                    <p className="font-mono font-bold text-amber-300 text-base">{paymentData.accountNumber}</p>
                  </div>
                  <button
                    onClick={() => copyText(paymentData.accountNumber, "acc")}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                  >
                    {copiedField === "acc" ? "Đã chép ✓" : "Sao chép"}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Số tiền chuyển khoản</p>
                    <p className="font-mono font-black text-emerald-400 text-lg">
                      {Number(paymentData.amount).toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                  <button
                    onClick={() => copyText(String(paymentData.amount), "amt")}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                  >
                    {copiedField === "amt" ? "Đã chép ✓" : "Sao chép"}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Nội dung chuyển khoản (Bắt buộc đúng)</p>
                    <p className="font-mono font-black text-[#d4af37] text-base">{paymentData.description}</p>
                  </div>
                  <button
                    onClick={() => copyText(paymentData.description, "desc")}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                  >
                    {copiedField === "desc" ? "Đã chép ✓" : "Sao chép"}
                  </button>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => verifyOrder(paymentData.orderCode, false)}
                    disabled={verifying}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-600 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    {verifying ? "Đang kiểm tra..." : "✅ Tôi Đã Chuyển Khoản"}
                  </button>
                  {paymentData.checkoutUrl && (
                    <a
                      href={paymentData.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider text-center transition-all"
                    >
                      Mở PayOS ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "history" ? (
          /* VIEW 3: TRANSACTION HISTORY TAB */
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {loadingHistory ? (
              <div className="py-12 text-center text-slate-400 text-sm">Đang tải lịch sử giao dịch...</div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Chưa có giao dịch nào được ghi nhận.
              </div>
            ) : (
              transactions.map((tx: any) => {
                const isSuccess = tx.transactionStatus === "SUCCESS";
                const isPending = tx.transactionStatus === "PENDING";
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {tx.description || "Giao dịch Tín Chỉ"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tx.createAt ? new Date(tx.createAt).toLocaleString("vi-VN") : ""}
                        {tx.paymentGatewayId ? ` • Mã ĐH: #${tx.paymentGatewayId}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span
                        className={`text-sm font-black ${
                          tx.transactionType === "IN" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {tx.transactionType === "IN" ? "+" : "-"}
                        {tx.creditAmount} 🪙
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isSuccess
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isPending
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-slate-500/20 text-slate-400"
                          }`}
                        >
                          {isSuccess ? "Thành công" : isPending ? "Chờ TT" : "Đã hủy"}
                        </span>
                        {isPending && tx.paymentGatewayId && (
                          <button
                            onClick={async () => {
                              const ok = await verifyOrder(tx.paymentGatewayId, false);
                              if (ok) fetchTransactions();
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 hover:bg-[#d4af37]/40 text-[#d4af37] font-bold"
                          >
                            Kiểm tra lại
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
          /* VIEW 4: PACKAGE SELECTION */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map((pkg) => {
              const totalTokens = pkg.credits + (pkg.bonusCredits || 0);
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-2xl border ${
                    pkg.popular ? "border-[#d4af37]" : "border-white/10"
                  } bg-white/5 p-5 sm:p-6 flex flex-col hover:bg-white/10 transition-all ${
                    pkg.popular ? "shadow-[0_0_30px_rgba(212,175,55,0.15)] md:scale-105 z-10" : ""
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-[#d4af37] text-black text-[10px] font-black uppercase tracking-widest rounded-full">
                      Phổ Biến Nhất
                    </div>
                  )}

                  <div className="text-4xl mb-3 text-center">{pkg.icon}</div>
                  <h4 className="text-lg font-bold text-white text-center mb-1">{pkg.name}</h4>
                  <p className="text-xs text-slate-400 text-center mb-5">{pkg.description}</p>

                  <div className="text-center mb-6 flex-grow">
                    <div className="text-3xl font-black text-[#d4af37] mb-1">
                      {totalTokens} <span className="text-sm font-normal text-slate-300">Tín Chỉ</span>
                    </div>
                    {pkg.bonusCredits ? (
                      <div className="text-[11px] text-emerald-400 font-semibold mb-1">
                        ({pkg.credits} gốc + {pkg.bonusCredits} tặng thêm)
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 mb-1">Kích hoạt tức thì</div>
                    )}
                    <div className="text-sm text-slate-400 line-through opacity-50 mb-0.5">
                      {Math.round(pkg.priceVnd * 1.4).toLocaleString("vi-VN")}đ
                    </div>
                    <div className="text-xl font-black text-white">
                      {pkg.priceVnd.toLocaleString("vi-VN")} <span className="text-xs font-normal">VNĐ</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPackage(pkg.id)}
                    disabled={loadingId === pkg.id}
                    className={`w-full py-3 rounded-xl font-black transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-2 ${
                      pkg.popular
                        ? "bg-gradient-to-r from-[#d4af37] to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {loadingId === pkg.id ? "Đang tạo QR..." : "Mua Ngay (VietQR)"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span className="opacity-70">Thanh toán tự động 24/7 qua</span>
          <span className="font-bold text-white tracking-wider">PayOS • VietQR Napas247</span>
        </div>
      </div>
    </div>
  );
}
