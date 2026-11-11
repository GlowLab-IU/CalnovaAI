"use client";

import React, { useEffect, useState } from "react";

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Check if running in browser
    if (typeof window === "undefined") return;

    // 2. Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 3. Detect OS
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    // 4. Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("pwa_banner_dismissed");
    if (isDismissed) return;

    // 5. Show banner
    setShowBanner(true);

    // 6. Capture Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS Safari requires manual guide
      setShowGuide(true);
    } else if (deferredPrompt) {
      // Android Chrome uses native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Install Prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowBanner(false);
    } else {
      // Android fallback guide
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_banner_dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Mystical Bottom Banner */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md bg-[#120F1D]/95 border border-[#D4AF37]/35 shadow-[0_12px_32px_rgba(0,0,0,0.65)] rounded-2xl p-4 flex items-center justify-between backdrop-blur-md animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#0d0b21] flex items-center justify-center border border-[#d4af37]/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
            <img src="/icons/icon-192.png" alt="Huyền Cơ Icon" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#d4af37] tracking-wider uppercase font-serif">
              Tải Huyền Cơ AI App
            </h4>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Cài đặt lên MH chính để xem mượt mà hơn
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-[#d4af37] hover:bg-yellow-400 text-black font-black text-[10px] tracking-wider uppercase rounded-full shadow transition-all font-sans"
          >
            Cài đặt
          </button>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-xs transition-all font-sans"
          >
            ✕
          </button>
        </div>
      </div>

      {/* OS-specific Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#120a24] border border-[#d4af37]/30 rounded-3xl p-6 max-w-xs w-full text-center relative shadow-[0_0_30px_rgba(212,175,55,0.15)]">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-sans"
            >
              ✕
            </button>
            <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden bg-[#0d0b21] flex items-center justify-center border border-[#d4af37]/20 mb-4">
              <img src="/icons/icon-192.png" alt="Huyền Cơ Icon" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-sm font-black text-[#d4af37] tracking-widest uppercase font-serif mb-4">
              Hướng dẫn cài đặt
            </h3>
            {isIOS ? (
              <div className="text-left text-xs text-slate-300 space-y-3 leading-relaxed font-sans">
                <p>
                  1. Bấm nút <strong>Chia sẻ (Share)</strong>{" "}
                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800">📤</span> ở thanh công cụ của trình duyệt Safari.
                </p>
                <p>
                  2. Cuộn xuống và chọn mục <strong>Thêm vào MH chính (Add to Home Screen)</strong>{" "}
                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800">➕</span>.
                </p>
                <p>3. Bấm <strong>Thêm (Add)</strong> ở góc trên bên phải để xác nhận.</p>
              </div>
            ) : (
              <div className="text-left text-xs text-slate-300 space-y-3 leading-relaxed font-sans">
                <p>
                  1. Bấm nút <strong>Menu (3 chấm dọc)</strong> ở góc trên bên phải trình duyệt Chrome.
                </p>
                <p>
                  2. Chọn mục <strong>Cài đặt ứng dụng (Install app)</strong> hoặc <strong>Thêm vào màn hình chính</strong>.
                </p>
                <p>3. Xác nhận tải ứng dụng về điện thoại.</p>
              </div>
            )}
            <button
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full py-2 bg-[#d4af37] hover:bg-yellow-400 text-black font-black text-xs tracking-widest uppercase rounded-full shadow transition-all font-sans"
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}
    </>
  );
}
