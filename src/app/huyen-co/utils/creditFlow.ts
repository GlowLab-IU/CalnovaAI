"use client";

import { getStoredAuth, updateStoredUser } from "./authSync";

export const OPEN_PRICING_EVENT = "huyenco-open-pricing";
export const CREDIT_STATE_CHANGE_EVENT = "huyenco-credit-state-change";
export const DAILY_FREE_LIMIT = 2;

const GLOWLAB_BASE = "https://api.calnovaai.com/glowlab";

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDailyStorageKey(userId?: string | number | null): string {
  return `hc_daily_free_${userId || "guest"}_${getTodayKey()}`;
}

export function getDailyFreeUsed(userId?: string | number | null): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(getDailyStorageKey(userId));
  const parsed = Number(raw || 0);
  if (Number.isNaN(parsed) || parsed < 0) return 0;
  return Math.min(DAILY_FREE_LIMIT, parsed);
}

export function getDailyFreeRemaining(userId?: string | number | null): number {
  return Math.max(0, DAILY_FREE_LIMIT - getDailyFreeUsed(userId));
}

function incrementDailyFreeUsed(userId?: string | number | null): number {
  if (typeof window === "undefined") return DAILY_FREE_LIMIT;
  const next = Math.min(DAILY_FREE_LIMIT, getDailyFreeUsed(userId) + 1);
  localStorage.setItem(getDailyStorageKey(userId), String(next));
  window.dispatchEvent(new CustomEvent(CREDIT_STATE_CHANGE_EVENT));
  return Math.max(0, DAILY_FREE_LIMIT - next);
}

export function openGlobalPricingModal(contextNote?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(OPEN_PRICING_EVENT, {
      detail: { contextNote: contextNote || "" },
    })
  );
}

export function buildReferralShareUrl(user?: any | null): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://calnovaai.com";
  const refCode = user?.referralCode || user?.refCode || "";
  return refCode ? `${origin}/huyen-co?ref=${encodeURIComponent(refCode)}` : `${origin}/huyen-co`;
}

export interface ConsumeCreditResult {
  allowed: boolean;
  usedFreeDaily: boolean;
  freeRemaining: number;
  creditsRemaining: number;
  reason?: "INSUFFICIENT_CREDIT" | "UNAUTHORIZED";
}

/**
 * Cơ chế tiêu hao Tín Chỉ thân thiện ("Lộc Khai Tâm Hàng Ngày" + Ví Linh Khí):
 * 1. Mỗi ngày tặng trước DAILY_FREE_LIMIT (2) lượt miễn phí để người dùng trải nghiệm thấy giá trị thực.
 * 2. Khi dùng hết lượt miễn phí trong ngày, trừ đúng 1 Tín Chỉ trên hệ thống và đồng bộ tức thì lên Header.
 * 3. Nếu Ví = 0 Tín Chỉ, trả về allowed=false để hiển thị lời mời nạp nhẹ nhàng, lịch sự.
 */
export async function consumeFeatureCredit(
  featureDescription: string
): Promise<ConsumeCreditResult> {
  const { token, user } = getStoredAuth();
  const uid = user?.id || user?.userId || null;
  const currentCredits = Number(user?.credits ?? 0);

  // 1. Ưu tiên dùng Lộc Khai Tâm miễn phí mỗi ngày
  const freeRem = getDailyFreeRemaining(uid);
  if (freeRem > 0) {
    const afterFree = incrementDailyFreeUsed(uid);
    return {
      allowed: true,
      usedFreeDaily: true,
      freeRemaining: afterFree,
      creditsRemaining: currentCredits,
    };
  }

  // 2. Đã hết lượt miễn phí hôm nay -> kiểm tra Tín Chỉ
  if (!token) {
    return {
      allowed: false,
      usedFreeDaily: false,
      freeRemaining: 0,
      creditsRemaining: 0,
      reason: "UNAUTHORIZED",
    };
  }

  if (currentCredits <= 0) {
    return {
      allowed: false,
      usedFreeDaily: false,
      freeRemaining: 0,
      creditsRemaining: 0,
      reason: "INSUFFICIENT_CREDIT",
    };
  }

  // 3. Gọi backend trừ 1 Tín Chỉ & ghi sổ giao dịch
  try {
    const res = await fetch(`${GLOWLAB_BASE}/api/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: featureDescription.slice(0, 80),
      }),
    });

    const json = await res.json().catch(() => null);

    if (res.ok && json?.data) {
      const nextCredits =
        typeof json.data.remainingCredits === "number"
          ? json.data.remainingCredits
          : Math.max(0, currentCredits - 1);
      if (user) {
        updateStoredUser({ ...user, credits: nextCredits });
      }
      window.dispatchEvent(new CustomEvent(CREDIT_STATE_CHANGE_EVENT));
      return {
        allowed: true,
        usedFreeDaily: false,
        freeRemaining: 0,
        creditsRemaining: nextCredits,
      };
    }

    if (json?.code === "INSUFFICIENT_CREDIT" || res.status === 400) {
      if (user) {
        updateStoredUser({ ...user, credits: 0 });
      }
      window.dispatchEvent(new CustomEvent(CREDIT_STATE_CHANGE_EVENT));
      return {
        allowed: false,
        usedFreeDaily: false,
        freeRemaining: 0,
        creditsRemaining: 0,
        reason: "INSUFFICIENT_CREDIT",
      };
    }
  } catch {
    // Nếu mạng chập chờn nhưng user vẫn còn credits hiển thị, ưu tiên không làm gián đoạn trải nghiệm
  }

  return {
    allowed: true,
    usedFreeDaily: false,
    freeRemaining: 0,
    creditsRemaining: Math.max(0, currentCredits - 1),
  };
}
