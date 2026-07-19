"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AuthModal from "./AuthModal";

// Subcomponent to safely call useSearchParams inside Suspense
function QueryParamsTracker({ 
  onRefCodeFound, 
  onRedirectFound 
}: { 
  onRefCodeFound: (code: string) => void;
  onRedirectFound: (path: string) => void;
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
  }, [searchParams, onRefCodeFound, onRedirectFound]);

  return null;
}

export default function HuyenCoPortal() {
  const router = useRouter();
  const [refCode, setRefCode] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  
  // Auth states
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Handle redirect param from URL on load
  const handleRedirectFound = React.useCallback((path: string) => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      // Already logged in, redirect immediately
      router.push(path);
    } else {
      // Not logged in, save redirect path and open modal
      setRedirectPath(path);
      setIsAuthModalOpen(true);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Fetch fresh user profile to update credits
        const meUrl = typeof window !== "undefined" && window.location.hostname.includes("calnovaai.com")
          ? "https://api.calnovaai.com/glowlab/auth/me"
          : "https://api.calnovaai.com/glowlab/auth/me";
        fetch(meUrl, {
          headers: {
            "Authorization": `Bearer ${storedToken}`,
          }
        })
          .then(res => res.json())
          .then(result => {
            if (result.code === 0 || result.code === "OPERATION_SUCCESS") {
              setUser(result.data);
              localStorage.setItem("authUser", JSON.stringify(result.data));
            }
          })
          .catch(err => console.error("Error refreshing user profile:", err));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
    
    if (redirectPath) {
      router.push(redirectPath);
      setRedirectPath(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
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
    const link = `${window.location.origin}/huyen-co${refCode ? `?ref=${refCode}` : ""}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#05030A] text-slate-200 font-sans overflow-x-hidden relative">
      {/* Safe Suspense boundary for useSearchParams */}
      <Suspense fallback={null}>
        <QueryParamsTracker 
          onRefCodeFound={setRefCode} 
          onRedirectFound={handleRedirectFound} 
        />
      </Suspense>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Background - Mystical Galaxy/Nebula Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url(/images/mystic-bg.webp)] bg-cover bg-center opacity-30 mix-blend-screen" />
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/15 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60vw] h-[60vw] bg-amber-900/5 rounded-full blur-[150px]" />
        {/* Floating Stars */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05030A]/60 to-[#05030A]" />
      </div>

      {/* Sticky Glass Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#05030A]/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:border-[#d4af37]/50 transition-colors">
              <img src="/images/logo.png" alt="Huyền Cơ Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37] uppercase">
                Huyền Cơ
              </h1>
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#d4af37]/70 font-bold">
                Bản Đồ Vận Mệnh AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="#features" className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-[#d4af37] transition-colors hidden sm:inline">
              Khám Phá
            </Link>

            {user && (
              <Link
                href="/huyen-co/history"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-[#d4af37] transition-colors"
              >
                <span>📜</span> Lịch Sử
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                <span className="text-xs text-[#d4af37] font-bold flex items-center gap-1">
                  <span className="text-sm">🪙</span> {user.credits ?? 0}
                </span>
                <span className="w-px h-3 bg-white/20" />
                <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                  {user.lastName} {user.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold text-red-400/80 hover:text-red-400 uppercase tracking-wider ml-1 transition-colors"
                >
                  Thoát
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37]/80 to-amber-600/80 text-white text-xs font-black rounded-full uppercase tracking-widest hover:from-[#d4af37] hover:to-amber-500 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-amber-300/30"
              >
                Đăng Nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Cinematic Hero Section */}
        <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          {refCode && (
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full text-xs text-[#d4af37] font-bold mb-8 animate-pulse backdrop-blur-md">
              <span className="text-base">🤝</span> Bạn nhận được lời mời! Nhận +20 credit khi đăng nhập.
            </div>
          )}
          
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-[#d4af37] blur-[100px] opacity-20 animate-pulse" />
            <h2 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] uppercase relative z-10 drop-shadow-2xl">
              Thấu Hiểu <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#d4af37] to-amber-600">
                Bản Ngã
              </span>
            </h2>
          </div>
          
          <p className="text-slate-300/80 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto font-light">
            Tiên phong kết hợp di sản tinh hoa huyền học phương Đông, bài Tarot phương Tây cùng công nghệ AI Sinh Trắc Học đỉnh cao. Giải mã vận mệnh, thắp sáng tương lai của bạn.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-900/80 to-purple-900/80 hover:from-indigo-800 hover:to-purple-800 border border-indigo-500/30 rounded-full font-bold transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] text-xs uppercase tracking-widest text-center backdrop-blur-md"
            >
              Bắt Đầu Khám Phá
            </Link>
            <button 
              onClick={handleSharePortal}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <span className="text-base">🔗</span> {copied ? "Đã Sao Chép Link!" : "Chia Sẻ Nhận Lượt"}
            </button>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-4 flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-indigo-500/30" />
              Các công năng chính
              <span className="w-12 h-px bg-indigo-500/30" />
            </h3>
            <h4 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Cánh Cửa Mở Ra Huyền Cơ
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Face Scan */}
            <div 
              onClick={() => handleLaunchFeature("/huyen-co/face-scan")}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 cursor-pointer transition-all hover:bg-white/10 hover:border-[#d4af37]/40 flex flex-col items-center text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-20 flex flex-col items-center">
                <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_40px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-all duration-500 border border-white/10">
                  <img src="/images/face_scan_spiritual.png" alt="Face Scan" className="w-full h-full object-cover" />
                </div>
                <h5 className="text-xl font-bold mb-3 text-white group-hover:text-[#d4af37] transition-colors">Tướng Mặt AI</h5>
                <p className="text-sm text-slate-300/80 line-clamp-3">Phân tích tỷ lệ ngũ quan, dự đoán vận mệnh và tính cách qua ảnh chụp khuôn mặt thời gian thực.</p>
              </div>
            </div>

            {/* 2. Palm Scan */}
            <div 
              onClick={() => handleLaunchFeature("/huyen-co/palm-scan")}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 cursor-pointer transition-all hover:bg-white/10 hover:border-[#d4af37]/40 flex flex-col items-center text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-20 flex flex-col items-center">
                <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_40px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-all duration-500 border border-white/10">
                  <img src="/images/palm_scan_spiritual.png" alt="Palm Scan" className="w-full h-full object-cover" />
                </div>
                <h5 className="text-xl font-bold mb-3 text-white group-hover:text-[#d4af37] transition-colors">Chỉ Tay AI</h5>
                <p className="text-sm text-slate-300/80 line-clamp-3">Đọc các đường sinh đạo, trí đạo, tâm đạo trên lòng bàn tay bạn.</p>
              </div>
            </div>

            {/* 3. Tarot */}
            <div 
              onClick={() => handleLaunchFeature("/huyen-co/boibai")}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 cursor-pointer transition-all hover:bg-white/10 hover:border-indigo-400/40 flex flex-col items-center text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-20 flex flex-col items-center">
                <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_40px_rgba(99,102,241,0.3)] group-hover:scale-105 transition-all duration-500 border border-white/10">
                  <img src="/images/tarot_spiritual.png" alt="Tarot" className="w-full h-full object-cover" />
                </div>
                <h5 className="text-xl font-bold mb-3 text-white group-hover:text-indigo-300 transition-colors">Bói Bài Tây AR</h5>
                <p className="text-sm text-slate-300/80 line-clamp-3">Bốc bài bằng cử chỉ tay qua camera và lắng nghe AI giải mã thông điệp.</p>
              </div>
            </div>

            {/* 4. Zi Wei (Tu Vi) */}
            <div 
              onClick={() => handleLaunchFeature("/huyen-co/laso")}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 cursor-pointer transition-all hover:bg-white/10 hover:border-amber-400/40 flex flex-col items-center text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-20 flex flex-col items-center">
                <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_40px_rgba(251,191,36,0.3)] group-hover:scale-105 transition-all duration-500 border border-white/10">
                  <img src="/images/laso_spiritual.png" alt="Tử Vi" className="w-full h-full object-cover" />
                </div>
                <h5 className="text-xl font-bold mb-3 text-white group-hover:text-amber-300 transition-colors">Lập Lá Số Tử Vi</h5>
                <p className="text-sm text-slate-300/80 line-clamp-3">Kiến tạo lá số 12 cung và xem luận giải chi tiết theo ngày sinh.</p>
              </div>
            </div>

            {/* 5. TuVi Chat */}
            <div 
              onClick={() => handleLaunchFeature("/huyen-co/chat")}
              className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 cursor-pointer transition-all hover:bg-white/10 hover:border-cyan-400/40 flex flex-col items-center text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-20 flex flex-col items-center">
                <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_40px_rgba(34,211,238,0.3)] group-hover:scale-105 transition-all duration-500 border border-white/10">
                  <img src="/images/chat_spiritual.png" alt="TuVi Chat" className="w-full h-full object-cover" />
                </div>
                <h5 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors">TuVi Chat AI</h5>
                <p className="text-sm text-slate-300/80 line-clamp-3">Chuyên gia phong thủy ảo, sẵn sàng giải đáp 24/7 mọi thắc mắc của bạn.</p>
              </div>
            </div>

            {/* 6. History – chỉ hiện khi đã đăng nhập */}
            {user && (
              <div
                onClick={() => router.push("/huyen-co/history")}
                className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-8 cursor-pointer transition-all hover:bg-white/10 hover:border-emerald-400/40 flex flex-col items-center text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-20 flex flex-col items-center">
                  <div className="w-24 h-24 mb-6 rounded-2xl bg-white/5 border border-emerald-500/20 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_10px_40px_rgba(52,211,153,0.3)] group-hover:scale-105 transition-all duration-500">
                    <span className="text-5xl">📜</span>
                  </div>
                  <h5 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-300 transition-colors">Lịch Sử Của Bạn</h5>
                  <p className="text-sm text-slate-300/80 line-clamp-3">Xem lại toàn bộ kết quả tướng mặt và chỉ tay đã phân tích trước đây.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Download App Banner */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#120a26] to-[#080412] border border-white/5 p-10 sm:p-16 text-center">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10">
              <h4 className="text-2xl sm:text-4xl font-serif font-bold mb-6 text-white">
                Tải App Ngay Hôm Nay
              </h4>
              <p className="text-slate-300/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-10">
                Nhận thêm lượt dùng thử miễn phí, thông báo tử vi hàng ngày và trải nghiệm mượt mà nhất trên thiết bị di động của bạn.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => alert("Sắp ra mắt trên App Store!")}
                  className="px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-all flex items-center justify-center gap-3 text-sm"
                >
                  <span className="text-xl">🍎</span> App Store
                </button>
                <button 
                  onClick={() => alert("Sắp ra mắt trên Google Play!")}
                  className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-3 text-sm backdrop-blur-md"
                >
                  <span className="text-xl">🤖</span> Google Play
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto px-6 py-8 mt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50">
            <img src="/images/logo.png" alt="Logo" className="w-6 h-6 rounded-md grayscale" />
            <span className="text-xs font-bold tracking-widest uppercase">CalnovaAI</span>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            © 2026 Huyền Cơ Portal. Môi trường phát triển.
          </p>
        </footer>
      </main>
    </div>
  );
}

