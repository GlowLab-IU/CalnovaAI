"use client";

export const AUTH_CHANGE_EVENT = "huyenco-auth-change";
const GLOWLAB_BASE_URL = "https://api.calnovaai.com/glowlab";

export interface StoredAuthSession {
  token: string | null;
  user: any | null;
}

export function getStoredAuth(): StoredAuthSession {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  let rawToken =
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  if (rawToken === "undefined" || rawToken === "null" || !rawToken?.trim()) {
    rawToken = null;
  } else if (!localStorage.getItem("authToken")) {
    localStorage.setItem("authToken", rawToken);
  }

  let parsedUser: any | null = null;
  const rawUser = localStorage.getItem("authUser") || localStorage.getItem("user");
  if (rawUser && rawUser !== "undefined" && rawUser !== "null") {
    try {
      const obj = JSON.parse(rawUser);
      if (obj && typeof obj === "object") {
        parsedUser = obj;
        if (!localStorage.getItem("authUser")) {
          localStorage.setItem("authUser", JSON.stringify(obj));
        }
      }
    } catch {
      parsedUser = null;
    }
  }

  return { token: rawToken, user: parsedUser };
}

export function saveStoredAuth(token: string, user: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("authToken", token);
  if (user && typeof user === "object") {
    localStorage.setItem("authUser", JSON.stringify(user));
  }
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGE_EVENT, { detail: { token, user } })
  );
}

export function updateStoredUser(user: any): void {
  if (typeof window === "undefined" || !user) return;
  const token = localStorage.getItem("authToken");
  localStorage.setItem("authUser", JSON.stringify(user));
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGE_EVENT, { detail: { token, user } })
  );
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGE_EVENT, { detail: { token: null, user: null } })
  );
}

export async function refreshAuthMe(tokenOverride?: string | null): Promise<any | null> {
  if (typeof window === "undefined") return null;
  const { token: storedToken } = getStoredAuth();
  const token = tokenOverride || storedToken;
  if (!token) return null;

  try {
    const res = await fetch(`${GLOWLAB_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401) {
      clearStoredAuth();
      return null;
    }

    const result = await res.json();
    if (res.ok && (result.code === 0 || result.code === "OPERATION_SUCCESS") && result.data) {
      localStorage.setItem("authToken", token);
      updateStoredUser(result.data);
      return result.data;
    }
  } catch (err) {
    console.error("Failed to refresh /auth/me:", err);
  }
  return null;
}

export function formatUserDisplayName(user: any): string {
  if (!user) return "";
  const full = [user.lastName, user.firstName]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .join(" ");
  if (full) return full;
  if (user.name) return String(user.name).trim();
  if (user.fullName) return String(user.fullName).trim();
  if (user.username) return String(user.username).trim();
  if (user.email) return String(user.email).split("@")[0];
  return "Đạo Hữu";
}

export function formatUserInitial(user: any): string {
  if (!user) return "H";
  const candidate =
    user.firstName ||
    user.lastName ||
    user.name ||
    user.username ||
    user.email ||
    "H";
  return String(candidate).trim().charAt(0).toUpperCase() || "H";
}
