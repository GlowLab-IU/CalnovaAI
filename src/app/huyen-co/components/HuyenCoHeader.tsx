"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HuyenCoLogoIcon,
  CreditCoinIcon,
  ScrollHistoryIcon,
} from "./HuyenCoIcons";
import AuthModal from "../AuthModal";
import PricingModal from "../PricingModal";
import {
  AUTH_CHANGE_EVENT,
  clearStoredAuth,
  formatUserDisplayName,
  formatUserInitial,
  getStoredAuth,
  refreshAuthMe,
  saveStoredAuth,
  updateStoredUser,
} from "../utils/authSync";
import { OPEN_PRICING_EVENT } from "../utils/creditFlow";

interface HuyenCoHeaderProps {
  user?: any | null;
  onOpenAuth?: () => void;
  onOpenPricing?: () => void;
  onLogout?: () => void;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/huyen-co", label: "Tổng Quan", exact: true },
  { href: "/huyen-co/face-scan", label: "Diện Tướng" },
  { href: "/huyen-co/palm-scan", label: "Thủ Tướng" },
  { href: "/huyen-co/laso", label: "Tử Vi 12 Cung" },
  { href: "/huyen-co/boibai", label: "Bói Bài 32 Lá" },
  { href: "/huyen-co/chat", label: "Cố Vấn AI" },
];

export default function HuyenCoHeader({
  user: propUser,
  onOpenAuth,
  onOpenPricing,
  onLogout,
  subtitle = "Tinh Hoa Mệnh Lý & Nhân Tướng AI",
  rightSlot,
}: HuyenCoHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [internalUser, setInternalUser] = useState<any | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [localAuthModalOpen, setLocalAuthModalOpen] = useState<boolean>(false);
  const [localPricingModalOpen, setLocalPricingModalOpen] = useState<boolean>(false);
  const [pricingContextNote, setPricingContextNote] = useState<string>("");

  // Đồng bộ từ propUser nếu trang cha truyền xuống
  useEffect(() => {
    if (propUser && typeof propUser === "object") {
      setInternalUser(propUser);
      setHasToken(true);
    }
  }, [propUser]);

  // Tự động đọc localStorage & làm mới /auth/me khi mount hoặc khi có sự kiện đổi trạng thái đăng nhập
  useEffect(() => {
    const syncFromStorage = () => {
      const { token, user: storedUser } = getStoredAuth();
      setHasToken(Boolean(token));
      if (storedUser) {
        setInternalUser(storedUser);
      } else if (!token) {
        setInternalUser(null);
      }
      return { token, storedUser };
    };

    const { token } = syncFromStorage();
    if (token) {
      refreshAuthMe(token).then((freshUser) => {
        if (freshUser) {
          setInternalUser(freshUser);
          setHasToken(true);
        }
      });
    }

    const handleAuthChange = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail) {
        setHasToken(Boolean(custom.detail.token));
        setInternalUser(custom.detail.user || null);
      } else {
        syncFromStorage();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || ["authToken", "authUser", "accessToken", "token"].includes(e.key)) {
        syncFromStorage();
      }
    };

    const handleGlobalOpenPricing = (e: Event) => {
      const custom = e as CustomEvent;
      setPricingContextNote(custom.detail?.contextNote || "");
      setLocalPricingModalOpen(true);
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(OPEN_PRICING_EVENT, handleGlobalOpenPricing);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(OPEN_PRICING_EVENT, handleGlobalOpenPricing);
    };
  }, []);

  const effectiveUser = propUser || internalUser;
  const isLoggedIn = Boolean(effectiveUser || hasToken);
  const currentCredits = Number(effectiveUser?.credits ?? 0);
  const isLowCredits = currentCredits <= 3;

  const isActive = (href: string, exact?: boolean) => {
    if (!pathname) return false;
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleOpenAuthClick = () => {
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      setLocalAuthModalOpen(true);
    }
  };

  const handleOpenPricingClick = () => {
    setPricingContextNote("");
    if (onOpenPricing) {
      onOpenPricing();
    } else {
      setLocalPricingModalOpen(true);
    }
  };

  const handleLogoutClick = () => {
    clearStoredAuth();
    setInternalUser(null);
    setHasToken(false);
    if (onLogout) {
      onLogout();
    } else if (pathname && pathname !== "/huyen-co") {
      router.push("/huyen-co");
    }
  };

  const handleBuiltInLoginSuccess = (newToken: string, newUser: any) => {
    saveStoredAuth(newToken, newUser);
    setInternalUser(newUser);
    setHasToken(true);
    setLocalAuthModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#D4AF37]/15 bg-[#07060B]/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center gap-3">
          {/* Brand Identity */}
          <Link href="/huyen-co" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative w-10 h-10 rounded-xl bg-[#120F1D] border border-[#D4AF37]/30 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.12)] group-hover:border-[#D4AF37]/70 transition-all">
              <HuyenCoLogoIcon size={32} />
            </div>
            <div>
              <div className="text-base sm:text-xl font-serif font-bold tracking-[0.12em] hc-gold-gradient-text uppercase leading-tight">
                Huyền Cơ Các
              </div>
              <p className="text-[9px] tracking-[0.16em] uppercase text-[#C5B386]/80 font-medium hidden sm:block">
                {subtitle}
              </p>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#120F1D]/80 border border-[#D4AF37]/15 rounded-full px-2 py-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider transition-all ${
                    active
                      ? "bg-[#D4AF37]/20 text-[#FFF3C4] border border-[#D4AF37]/45 font-semibold shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                      : "text-[#C5B386] hover:text-[#FFF3C4] hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {rightSlot}
            {isLoggedIn && (
              <Link
                href="/huyen-co/history"
                className={`flex items-center gap-1.5 text-xs font-medium tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                  isActive("/huyen-co/history")
                    ? "bg-[#D4AF37]/20 text-[#FFF3C4] border-[#D4AF37]/50"
                    : "bg-[#120F1D] text-[#C5B386] border-[#D4AF37]/20 hover:border-[#D4AF37]/45 hover:text-[#FFF3C4]"
                }`}
                title="Sớ Lụa Lịch Sử"
              >
                <ScrollHistoryIcon size={15} />
                <span className="hidden sm:inline">Lịch Sử</span>
              </Link>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5 bg-[#120F1D] border border-[#D4AF37]/25 pl-2.5 pr-1.5 py-1 rounded-full">
                <button
                  type="button"
                  onClick={handleOpenPricingClick}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    isLowCredits
                      ? "bg-[#D4AF37]/14 hover:bg-[#D4AF37]/24 border border-[#D4AF37]/35"
                      : "hover:bg-[#D4AF37]/10"
                  }`}
                  title="Tụ Bảo Các • Nạp Tín Chỉ"
                >
                  <CreditCoinIcon size={16} />
                  <span className="text-xs text-[#F6D87A] font-bold">
                    {currentCredits}
                  </span>
                  {isLowCredits ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#D4AF37]/25 text-[#FFF3C4] text-[9.5px] font-bold tracking-wide leading-none">
                      Nạp +
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#E8C96A] flex items-center justify-center text-[10px] font-bold leading-none">
                      +
                    </span>
                  )}
                </button>

                <span className="w-px h-4 bg-[#D4AF37]/20" />

                <Link
                  href="/huyen-co/profile"
                  className={`flex items-center gap-2 px-1.5 py-0.5 rounded-full transition-colors ${
                    isActive("/huyen-co/profile")
                      ? "text-[#FFF3C4] font-semibold"
                      : "hover:text-[#E8C96A]"
                  }`}
                  title="Hồ Sơ Bản Mệnh"
                >
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[11px] font-serif font-bold text-[#FFF3C4] uppercase">
                    {formatUserInitial(effectiveUser)}
                  </div>
                  <span className="text-xs font-medium text-[#EFECE6] truncate max-w-[85px] sm:max-w-[125px] hidden sm:inline">
                    {formatUserDisplayName(effectiveUser) || "Hồ Sơ"}
                  </span>
                </Link>

                <span className="w-px h-4 bg-[#D4AF37]/20" />
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-[#C5B386] hover:text-white hover:bg-[#B93829]/80 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenAuthClick}
                className="px-4 sm:px-5 py-2 hc-gold-btn text-xs font-bold rounded-full uppercase tracking-wider cursor-pointer"
              >
                Khai Mở Hồ Sơ
              </button>
            )}
          </div>
        </div>

        {/* Mobile Quick Navigation Strip */}
        <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 overflow-x-auto border-t border-[#D4AF37]/10 bg-[#0A0812]/90 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  active
                    ? "bg-[#D4AF37]/20 text-[#FFF3C4] border border-[#D4AF37]/45 font-semibold"
                    : "text-[#C5B386] border border-transparent hover:text-[#FFF3C4]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {!onOpenAuth && (
        <AuthModal
          isOpen={localAuthModalOpen}
          onClose={() => setLocalAuthModalOpen(false)}
          onLoginSuccess={handleBuiltInLoginSuccess}
        />
      )}

      {effectiveUser && (
        <PricingModal
          isOpen={localPricingModalOpen}
          onClose={() => {
            setLocalPricingModalOpen(false);
            setPricingContextNote("");
          }}
          user={effectiveUser}
          contextNote={pricingContextNote}
          onSuccess={(updatedUser) => {
            setInternalUser(updatedUser);
            updateStoredUser(updatedUser);
          }}
        />
      )}
    </>
  );
}
