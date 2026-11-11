"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Style, Avatar } from '@dicebear/core';
import definition from '@dicebear/styles/initial-face.json';
import PricingModal from "../PricingModal";
import HuyenCoHeader from "../components/HuyenCoHeader";
import { clearStoredAuth, getStoredAuth, refreshAuthMe, updateStoredUser } from "../utils/authSync";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [friendRefCode, setFriendRefCode] = useState<string>("");
  const [refLoading, setRefLoading] = useState<boolean>(false);
  const [refMsg, setRefMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedType, setCopiedType] = useState<"code" | "link" | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFirstName, setEditFirstName] = useState<string>("");
  const [editLastName, setEditLastName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editAge, setEditAge] = useState<string>("");
  const [editGender, setEditGender] = useState<string>("male");
  const [editSaving, setEditSaving] = useState<boolean>(false);
  const [editMsg, setEditMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const openEditForm = () => {
    setEditFirstName(user?.firstName || "");
    setEditLastName(user?.lastName || "");
    setEditPhone(user?.phone || "");
    setEditAge(user?.age ? String(user.age) : "");
    setEditGender(user?.gender || "male");
    setEditMsg(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMsg(null);

    const cleanFirstName = editFirstName.trim();
    const cleanLastName = editLastName.trim();
    const cleanPhone = editPhone.trim().replace(/[\s\-().]/g, "");
    const parsedAge = editAge.trim() ? Number(editAge.trim()) : undefined;

    if (!cleanFirstName) {
      setEditMsg({ type: "error", text: "Vui lòng nhập tên của bạn." });
      return;
    }

    if (cleanPhone && !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(cleanPhone)) {
      setEditMsg({
        type: "error",
        text: "Số điện thoại không hợp lệ (gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).",
      });
      return;
    }

    if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120)) {
      setEditMsg({
        type: "error",
        text: "Độ tuổi không hợp lệ (từ 1 đến 120 tuổi).",
      });
      return;
    }

    setEditSaving(true);
    try {
      const payload: Record<string, any> = {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: user.email,
        gender: editGender,
      };
      if (cleanPhone) payload.phone = cleanPhone;
      if (parsedAge !== undefined) payload.age = parsedAge;

      const res = await fetch(`${getGlowlabBase()}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && (data.code === 0 || data.code === "OPERATION_SUCCESS" || data.data)) {
        const updatedUser = { ...user, ...payload, ...(data.data || {}) };
        setUser(updatedUser);
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
        setEditMsg({ type: "success", text: "Cập nhật thông tin hồ sơ thành công!" });
        setTimeout(() => setIsEditing(false), 900);
      } else {
        setEditMsg({
          type: "error",
          text: data?.message || "Không thể cập nhật thông tin. Vui lòng kiểm tra lại dữ liệu.",
        });
      }
    } catch (err) {
      setEditMsg({
        type: "error",
        text: "Lỗi kết nối máy chủ. Vui lòng thử lại.",
      });
    } finally {
      setEditSaving(false);
    }
  };

  const getGlowlabBase = () => {
    return "https://api.calnovaai.com/glowlab";
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { token: storedToken, user: storedUser } = getStoredAuth();

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(storedUser);
      }
      refreshAuthMe(storedToken).then((fresh) => {
        if (fresh) {
          setUser(fresh);
        } else if (!storedUser) {
          router.push("/huyen-co");
        }
      });
    } else {
      router.push("/huyen-co");
    }
  }, [router]);

  const handleCopyReferral = (type: "code" | "link") => {
    if (!user?.referralCode) return;
    const text =
      type === "code"
        ? user.referralCode
        : `${window.location.origin}/huyen-co?ref=${user.referralCode}`;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleApplyReferral = async () => {
    const cleanCode = friendRefCode.trim().toUpperCase();
    if (!cleanCode || !token) return;
    setRefLoading(true);
    setRefMsg(null);
    try {
      const res = await fetch(`${getGlowlabBase()}/referral/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ referralCode: cleanCode }),
      });
      const data = await res.json();
      if (res.ok && (data.code === 0 || data.code === "OPERATION_SUCCESS")) {
        setRefMsg({
          type: "success",
          text: data.data?.message || "Áp dụng mã giới thiệu thành công! Bạn đã nhận +20 Tín Chỉ.",
        });
        setFriendRefCode("");
        // Refresh user profile
        const meRes = await fetch(`${getGlowlabBase()}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meRes.json();
        if (meData?.data) {
          setUser(meData.data);
          localStorage.setItem("authUser", JSON.stringify(meData.data));
        }
      } else {
        setRefMsg({
          type: "error",
          text: data.message || "Không thể áp dụng mã giới thiệu này.",
        });
      }
    } catch (err) {
      setRefMsg({
        type: "error",
        text: "Không thể kết nối máy chủ. Vui lòng thử lại.",
      });
    } finally {
      setRefLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    router.push("/huyen-co");
  };

  // Generate Dicebear SVG
  const avatarSvg = useMemo(() => {
    if (!user) return "";
    try {
      const style = new Style(definition as any);
      const avatar = new Avatar(style, {
        seed: user.firstName || user.email || "H",
        size: 128,
        scale: 1,
        borderRadius: 20,
      });
      return avatar.toString();
    } catch (err) {
      console.error("Failed to generate avatar:", err);
      return "";
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#05030A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030A] text-slate-200 font-sans relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url(/images/mystic-bg.webp)] bg-cover bg-center opacity-20 mix-blend-screen" />
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-900/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/15 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] opacity-10 [background-size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05030A]/80 to-[#05030A]" />
      </div>

      {/* Unified Header */}
      <HuyenCoHeader
        user={user}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onLogout={handleLogout}
        subtitle="Hồ Sơ Bản Mệnh & Quản Lý Tín Chỉ"
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        user={user}
        onSuccess={(updatedUser) => {
          setUser(updatedUser);
          updateStoredUser(updatedUser);
        }}
      />

      {/* Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-300 to-[#8B5CF6] mb-4">
            Hồ Sơ Của Bạn
          </h2>
          <p className="text-sm text-slate-400 font-light max-w-md mx-auto">
            Quản lý thông tin cá nhân và số dư tín chỉ trên Huyền Cơ Portal.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,241,0.05)] relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-gradient-to-r from-transparent via-[#8B5CF6]/50 to-transparent"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
            {/* Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full animate-pulse"></div>
              <div 
                className="w-32 h-32 rounded-3xl border-2 border-indigo-500/30 overflow-hidden shadow-2xl relative z-10 bg-[#090514] flex justify-center items-center"
                dangerouslySetInnerHTML={{ __html: avatarSvg }}
              />
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                {user.lastName} {user.firstName}
              </h3>
              <p className="text-sm text-indigo-300 mb-4 font-mono">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full text-xs text-[#d4af37] font-bold">
                  🪙 Tín chỉ khả dụng: {user.credits ?? 0}
                </div>
                <button
                  onClick={() => setIsPricingModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#d4af37] to-amber-600 text-black rounded-full text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                >
                  + Nạp Tín Chỉ / Lịch Sử GD
                </button>
                <Link
                  href="/huyen-co/history"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                >
                  📜 Lịch Sử Phân Tích
                </Link>
                <button
                  onClick={openEditForm}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  ✏️ Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>
          </div>

          {isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="mb-8 bg-[#090514]/80 border border-indigo-500/30 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300">
                  ✏️ Chỉnh Sửa Thông Tin Cá Nhân
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Đóng ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                    Họ & Tên Đệm
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Nguyễn Văn"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                    Tên *
                  </label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="An"
                    required
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                    Số điện thoại (10 số)
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                    Độ tuổi
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    placeholder="25"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1.5">
                    Giới tính
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "male", label: "Nam" },
                      { value: "female", label: "Nữ" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEditGender(opt.value)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                          editGender === opt.value
                            ? "bg-indigo-600/30 border-indigo-400 text-white"
                            : "bg-black/40 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {editMsg && (
                <p
                  className={`text-xs font-semibold ${
                    editMsg.type === "success" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {editMsg.text}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {editSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#090514]/50 border border-indigo-500/10 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Số điện thoại</p>
              <p className="text-sm text-slate-200 font-medium">{user.phone || "Chưa cập nhật"}</p>
            </div>
            
            <div className="bg-[#090514]/50 border border-indigo-500/10 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Độ tuổi</p>
              <p className="text-sm text-slate-200 font-medium">{user.age ? `${user.age} tuổi` : "Chưa cập nhật"}</p>
            </div>
            
            <div className="bg-[#090514]/50 border border-indigo-500/10 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Giới tính</p>
              <p className="text-sm text-slate-200 font-medium">
                {user.gender === "male" ? "Nam" : user.gender === "female" ? "Nữ" : "Khác"}
              </p>
            </div>
            
            <div className="bg-[#090514]/50 border border-indigo-500/10 rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Ngày tham gia</p>
              <p className="text-sm text-slate-200 font-medium">
                {user.createAt ? new Date(user.createAt).toLocaleDateString("vi-VN") : "N/A"}
              </p>
            </div>
          </div>

          {/* Referral Section */}
          <div className="mt-8 bg-[#090514]/60 border border-[#d4af37]/20 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                  <span>🎁</span> Giới Thiệu Bạn Bè (+20 Tín Chỉ)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Chia sẻ mã giới thiệu của bạn. Cả hai đều nhận ngay +20 Tín Chỉ!
                </p>
              </div>
              {user.referralCode && (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 bg-black/50 border border-[#d4af37]/30 rounded-xl font-mono text-sm font-bold text-[#d4af37] tracking-widest">
                    {user.referralCode}
                  </div>
                  <button
                    onClick={() => handleCopyReferral("code")}
                    className="px-3 py-2 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 rounded-xl text-xs font-bold text-[#d4af37] transition-all cursor-pointer"
                  >
                    {copiedType === "code" ? "✓ Đã chép" : "Chép mã"}
                  </button>
                  <button
                    onClick={() => handleCopyReferral("link")}
                    className="px-3 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-300 transition-all cursor-pointer"
                  >
                    {copiedType === "link" ? "✓ Đã chép link" : "Chép link mời"}
                  </button>
                </div>
              )}
            </div>

            {!user.referredById && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Nhập mã giới thiệu từ bạn bè:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={friendRefCode}
                    onChange={(e) => setFriendRefCode(e.target.value.toUpperCase())}
                    placeholder="VD: ABC123XYZ"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white uppercase tracking-wider focus:outline-none focus:border-[#d4af37]/60"
                  />
                  <button
                    onClick={handleApplyReferral}
                    disabled={refLoading || !friendRefCode.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-amber-600 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {refLoading ? "Đang xử lý..." : "Nhận +20 🪙"}
                  </button>
                </div>
                {refMsg && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      refMsg.type === "success" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {refMsg.text}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <button 
              onClick={handleLogout}
              className="px-8 py-3 bg-red-950/40 border border-red-500/30 text-red-400 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-red-900/60 hover:text-red-300 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
