"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StarInfo {
  star_id: number;
  name: string;
  element: string;
  category: number;
  strength?: string | null;
  direction?: string | null;
  description?: string | null;
}

interface HouseInfo {
  house_number: number;
  branch: string;
  name: string;
  element: string;
  am_duong: number;
  is_body_house: boolean;
  tuan_trung?: boolean;
  triet_lo?: boolean;
  major_period?: number | null;
  minor_period?: string | null;
  stars: StarInfo[];
}

interface HouseOverview {
  house_number: number;
  name: string;
  overview: string;
}

interface TuviChartData {
  id: number;
  userId: number;
  isPrimary: boolean;
  ownerName: string;
  birthDate: string;
  birthHour: number;
  gender: string;
  chartData: {
    request: {
      day: number;
      month: number;
      year: number;
      hour_branch: number;
      solar_calendar?: boolean;
    };
    houses: HouseInfo[];
    extra: {
      name?: string;
      gender?: string;
      am_duong_nam_sinh?: string;
      stem_branch?: {
        year?: string;
        month?: string;
        day?: string;
        hour?: string;
      };
      solar_date?: string;
      lunar_date?: string;
      hour?: string;
      menh?: string;
      cuc?: string;
      menh_chu?: string;
      than_chu?: string;
      menh_vs_cuc?: string;
      am_duong_menh?: string;
      cuc_description?: string;
    };
  };
  houseOverviews: Record<string, HouseOverview>;
}

const HOUR_BRANCHES = [
  { value: 1, label: "Tý", time: "23h - 01h" },
  { value: 2, label: "Sửu", time: "01h - 03h" },
  { value: 3, label: "Dần", time: "03h - 05h" },
  { value: 4, label: "Mão", time: "05h - 07h" },
  { value: 5, label: "Thìn", time: "07h - 09h" },
  { value: 6, label: "Tỵ", time: "09h - 11h" },
  { value: 7, label: "Ngọ", time: "11h - 13h" },
  { value: 8, label: "Mùi", time: "13h - 15h" },
  { value: 9, label: "Thân", time: "15h - 17h" },
  { value: 10, label: "Dậu", time: "17h - 19h" },
  { value: 11, label: "Tuất", time: "19h - 21h" },
  { value: 12, label: "Hợi", time: "21h - 23h" },
];

const CELLS_CONFIG = [
  { branch: "Tỵ", gridClass: "col-start-1 row-start-1" },
  { branch: "Ngọ", gridClass: "col-start-2 row-start-1" },
  { branch: "Mùi", gridClass: "col-start-3 row-start-1" },
  { branch: "Thân", gridClass: "col-start-4 row-start-1" },
  { branch: "Dậu", gridClass: "col-start-4 row-start-2" },
  { branch: "Tuất", gridClass: "col-start-4 row-start-3" },
  { branch: "Hợi", gridClass: "col-start-4 row-start-4" },
  { branch: "Tý", gridClass: "col-start-3 row-start-4" },
  { branch: "Sửu", gridClass: "col-start-2 row-start-4" },
  { branch: "Dần", gridClass: "col-start-1 row-start-4" },
  { branch: "Mão", gridClass: "col-start-1 row-start-3" },
  { branch: "Thìn", gridClass: "col-start-1 row-start-2" },
];

const getElementColor = (element?: string) => {
  if (!element) return "#94A3B8";
  const el = element.toLowerCase();
  if (el.includes("kim")) return "#FDE047";
  if (el.includes("mộc") || el.includes("moc")) return "#4ADE80";
  if (el.includes("thủy") || el.includes("thuy")) return "#60A5FA";
  if (el.includes("hỏa") || el.includes("hoa")) return "#F87171";
  if (el.includes("thổ") || el.includes("tho")) return "#FB923C";
  return "#94A3B8";
};

const getHouseBgColor = (houseName?: string) => {
  if (!houseName) return "rgba(15, 23, 42, 0.75)";
  if (houseName === "Mệnh") return "rgba(212, 175, 55, 0.15)";
  if (houseName === "Thân") return "rgba(59, 130, 246, 0.15)";
  return "rgba(15, 23, 42, 0.75)";
};

const getHouseBorderColor = (houseName?: string) => {
  if (!houseName) return "rgba(148, 163, 184, 0.15)";
  if (houseName === "Mệnh") return "rgba(212, 175, 55, 0.5)";
  if (houseName === "Thân") return "rgba(59, 130, 246, 0.5)";
  return "rgba(148, 163, 184, 0.15)";
};

export default function LasoTuviPage() {
  const router = useRouter();

  const getTuviBase = () => {
    let baseUrl = "https://api.calnovaai.com/tuvi";
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("calnovaai.com")) {
        baseUrl = "https://api.calnovaai.com/tuvi";
      }
    }
    return baseUrl;
  };

  // Navigation states
  const [viewMode, setViewMode] = useState<"dashboard" | "form" | "chart">("dashboard");
  const [formMode, setFormMode] = useState<"self" | "guest">("self");

  // Chart data
  const [primaryChart, setPrimaryChart] = useState<TuviChartData | null>(null);
  const [guestCharts, setGuestCharts] = useState<TuviChartData[]>([]);
  const [currentChart, setCurrentChart] = useState<TuviChartData | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    ownerName: "",
    birthDate: "2000-01-01",
    birthHour: 1,
    gender: "male" as "male" | "female",
    calendarType: "solar" as "solar" | "lunar",
  });

  // Selected house details in Modal
  const [selectedHouse, setSelectedHouse] = useState<HouseInfo | null>(null);

  // Process states
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auth states
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);

  // Check Auth and load charts on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    
    if (!storedToken || !storedUser) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        const uid = Number(parsed.id || parsed.userId || 1);
        fetchUserCharts(uid);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchUserCharts = async (uid: number) => {
    setLoadingList(true);
    try {
      const res = await fetch(`${getTuviBase()}/charts/user/${uid}`);
      const data = await res.json();
      if (res.ok && (data.success || data.code === "OPERATION_SUCCESS" || data.data)) {
        const list = data.data || [];
        const primary = list.find((c: any) => c.isPrimary);
        const guests = list.filter((c: any) => !c.isPrimary);
        setPrimaryChart(primary || null);
        setGuestCharts(guests);
      }
    } catch (err) {
      console.error("Failed to fetch charts list:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleOpenForm = (mode: "self" | "guest") => {
    setFormMode(mode);
    setErrorMsg("");
    if (mode === "self" && user) {
      const fullName = [user.lastName, user.firstName].filter(Boolean).join(" ").trim();
      setFormData({
        ownerName: fullName || user.username || "Bản Thân",
        birthDate: "2000-01-01",
        birthHour: 1,
        gender: user.gender === "female" ? "female" : "male",
        calendarType: "solar",
      });
    } else {
      setFormData({
        ownerName: "",
        birthDate: "2000-01-01",
        birthHour: 1,
        gender: "male",
        calendarType: "solar",
      });
    }
    setViewMode("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerName.trim()) {
      setErrorMsg("Vui lòng nhập họ tên.");
      return;
    }
    if (!formData.birthDate) {
      setErrorMsg("Vui lòng chọn ngày sinh.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const uid = user ? Number(user.id || user.userId || 1) : 1;
      const res = await fetch(`${getTuviBase()}/charts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: uid,
          ownerName: formData.ownerName,
          birthDate: formData.birthDate,
          birthHour: Number(formData.birthHour),
          gender: formData.gender,
          isPrimary: formMode === "self",
        }),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.code === "OPERATION_SUCCESS" || data.data)) {
        // Refetch user's charts
        await fetchUserCharts(uid);
        
        // Open newly created chart details directly or go back to dashboard
        const createdChart = data.data.chart;
        router.push(`/huyen-co/laso/result?id=${createdChart.id}`);
      } else {
        setErrorMsg(data.message || "Không thể an định lá số. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Lỗi kết nối. Không thể liên lạc với máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (chart: TuviChartData) => {
    const extra = chart.chartData.extra || {};
    const name = chart.ownerName || "Bản Thân";
    const genderStr = chart.gender === "female" ? "Nữ" : "Nam";
    const solarDate = extra.solar_date || "";
    const hour = extra.hour || "";
    const menh = extra.menh || "";

    const urlParams = new URLSearchParams({
      chartId: String(chart.id),
      chartName: name,
      chartGender: genderStr,
      chartDate: solarDate,
      chartHour: hour,
      chartMenh: menh,
    });

    router.push(`/huyen-co/chat?${urlParams.toString()}`);
  };

  const handleStartChatSpecificHouse = (house: HouseInfo) => {
    if (!currentChart) return;
    const extra = currentChart.chartData.extra || {};
    const name = currentChart.ownerName || "Bản Thân";
    const genderStr = currentChart.gender === "female" ? "Nữ" : "Nam";
    const solarDate = extra.solar_date || "";
    const hour = extra.hour || "";
    const menh = extra.menh || "";

    const mainStars = house.stars?.filter((s) => s.category === 1).map((s) => s.name).join(", ") || "Vô Chính Diệu";
    const subStars = house.stars?.filter((s) => s.category !== 1).map((s) => s.name).join(", ") || "Không có phụ tinh đáng chú ý";

    const prompt = `Xin chào trợ lý AI, xin hãy phân tích chi tiết tổ hợp tinh tú tại cung ${house.name} trên bản đồ năng lượng của tôi. Cung này tọa tại ${house.branch} (hành ${house.element}), có Chính tinh ${mainStars} tọa thủ cùng sự hội tụ của các Phụ tinh ${subStars}. Xin hãy chỉ rõ đặc tính và ảnh hưởng sâu sắc của cung này đối với tiến trình phát triển sự nghiệp và cuộc sống của tôi.`;

    const urlParams = new URLSearchParams({
      chartId: String(currentChart.id),
      chartName: name,
      chartGender: genderStr,
      chartDate: solarDate,
      chartHour: hour,
      chartMenh: menh,
      autoSendPrompt: prompt,
    });

    router.push(`/huyen-co/chat?${urlParams.toString()}`);
  };

  const getHouseByBranch = (branch: string) => {
    if (!currentChart || !currentChart.chartData || !currentChart.chartData.houses) return null;
    return currentChart.chartData.houses.find(
      (h) => h.branch.toLowerCase().trim() === branch.toLowerCase().trim()
    );
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#090514] text-white flex flex-col items-center justify-center p-6 text-center font-serif relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#090514] to-[#050209] z-0 pointer-events-none" />
        <div className="relative z-10 max-w-md w-full bg-[#120a26]/80 border border-indigo-500/30 p-8 rounded-3xl backdrop-blur-sm shadow-2xl">
          <span className="text-6xl block mb-6 animate-pulse">🔮</span>
          <h2 className="text-2xl font-black uppercase text-[#fcd34d] tracking-widest mb-4">
            Yêu Cầu Đăng Nhập
          </h2>
          <p className="text-slate-300 text-sm leading-6 mb-8">
            Cổng Huyền Cơ AI yêu cầu bạn đăng nhập để tích lũy tín chỉ và an định lá số tử vi cá nhân của mình.
          </p>
          <Link
            href="/huyen-co?redirect=/huyen-co/laso"
            className="inline-block px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full font-bold uppercase text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            Về Trang Chủ Đăng Nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 font-sans relative selection:bg-[#8b5cf6]/30 selection:text-white pb-24">
      {/* Stars Background Overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#050814] to-[#010208] z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-[url(https://www.transparenttextures.com/patterns/dark-matter.png)] opacity-25 z-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 pt-8 relative z-10">
        
        {/* ============================================================== */}
        {/* HEADER BAR */}
        {/* ============================================================== */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          {viewMode === "dashboard" ? (
            <Link href="/huyen-co" className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors text-sm font-semibold">
              <span>⬅️</span> Về Trang Chủ
            </Link>
          ) : (
            <button
              onClick={() => {
                setViewMode("dashboard");
                setSelectedHouse(null);
              }}
              className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors text-sm font-semibold"
            >
              <span>⬅️</span> Quay Lại Dashboard
            </button>
          )}

          <div className="text-right">
            <h1 className="text-xl font-black text-[#fcd34d] tracking-[3px] uppercase font-serif">HUYỀN CƠ</h1>
            <p className="text-[9px] text-slate-400 uppercase tracking-[2px] mt-0.5">Energy Birth Chart</p>
          </div>
        </header>

        {/* ============================================================== */}
        {/* VIEW: DASHBOARD */}
        {/* ============================================================== */}
        {viewMode === "dashboard" && (
          <div className="space-y-10">
            {/* Upper Header Welcome */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold font-serif text-white tracking-wide">Sa Bàn Năng Lượng Mệnh Lý</h2>
              <p className="text-slate-400 text-sm mt-1">Quản lý bản đồ năng lượng chính chủ và xem hộ người thân</p>
            </div>

            {/* Main Primary Chart Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Primary Chart Card */}
              <div className="lg:col-span-2">
                <h3 className="text-xs font-black uppercase text-[#22d3ee] tracking-widest mb-3">🧭 Hồ Sơ Năng Lượng Chính Chủ</h3>
                
                {loadingList ? (
                  <div className="bg-[#121826]/70 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[220px]">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-xs text-slate-400 uppercase tracking-wider animate-pulse">Đang nạp dữ liệu lá số...</p>
                  </div>
                ) : primaryChart ? (
                  /* Premium Gradient Parchment Box */
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#2e155c] via-[#111625] to-[#0f111a] border border-[#d4af37]/30 rounded-3xl p-6 md:p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#fcd34d] text-[10px] font-black uppercase rounded">Bản Thân</span>
                          <span className="text-slate-400 text-xs">{primaryChart.gender === "female" ? "Nữ Mệnh" : "Nam Mệnh"}</span>
                        </div>
                        <h4 className="text-3xl font-black font-serif text-white tracking-wide mt-1.5 capitalize">{primaryChart.ownerName}</h4>
                        <p className="text-sm text-slate-400 mt-1 font-mono">
                          Dương Lịch: {primaryChart.chartData?.extra?.solar_date || new Date(primaryChart.birthDate).toLocaleDateString("vi-VN")}
                        </p>
                        {primaryChart.chartData?.extra?.lunar_date && (
                          <p className="text-xs text-[#d4af37]/80 mt-0.5">
                            Âm Lịch: {primaryChart.chartData.extra.lunar_date}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <button
                          onClick={() => {
                            router.push(`/huyen-co/laso/result?id=${primaryChart.id}`);
                          }}
                          className="flex-1 md:flex-none px-6 py-3 bg-[#d4af37] text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-yellow-400 transition-all text-center shadow-lg shadow-yellow-500/10"
                        >
                          Xem Sa Bàn
                        </button>
                        <button
                          onClick={() => handleStartChat(primaryChart)}
                          className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>🔮</span> Chat AI
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                      <div className="bg-slate-900/50 border border-slate-800/60 p-3 rounded-2xl text-center">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Thiên Can Địa Chi</span>
                        <span className="text-sm font-bold text-slate-300 mt-1 block">{primaryChart.chartData?.extra?.stem_branch?.year || "--"}</span>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800/60 p-3 rounded-2xl text-center">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Giờ Sinh</span>
                        <span className="text-sm font-bold text-slate-300 mt-1 block">{primaryChart.chartData?.extra?.hour || "--"}</span>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800/60 p-3 rounded-2xl text-center">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Cục Số</span>
                        <span className="text-sm font-bold text-blue-400 mt-1 block truncate px-1">{primaryChart.chartData?.extra?.cuc || "--"}</span>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800/60 p-3 rounded-2xl text-center">
                        <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">Bản Mệnh</span>
                        <span className="text-sm font-bold text-emerald-400 mt-1 block truncate px-1">{primaryChart.chartData?.extra?.menh || "--"}</span>
                      </div>
                    </div>

                    {primaryChart.chartData?.extra?.cuc_description && (
                      <div className="mt-6 p-4 bg-slate-950/40 border border-slate-800/50 rounded-2xl">
                        <span className="text-[10px] uppercase text-[#d4af37] font-bold tracking-wider block mb-1">Mô tả năng lượng</span>
                        <p className="text-xs text-slate-300 leading-5 line-clamp-3">{primaryChart.chartData.extra.cuc_description}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty state for Primary Chart */
                  <div className="bg-[#121826]/70 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[260px] backdrop-blur-sm">
                    <span className="text-5xl block mb-4 animate-pulse">🌌</span>
                    <h4 className="text-lg font-bold text-white uppercase tracking-wider">Chưa Khởi Tạo Bản Đồ Bản Thân</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                      Thiết lập bản đồ năng lượng cá nhân để an định bản mệnh và bắt đầu tham vấn với Cố vấn mệnh lý AI.
                    </p>
                    <button
                      onClick={() => handleOpenForm("self")}
                      className="mt-6 px-8 py-3.5 bg-[#d4af37] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    >
                      Thiết Lập Ngay
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Actions Sidebar */}
              <div>
                <h3 className="text-xs font-black uppercase text-[#22d3ee] tracking-widest mb-3">🧭 Tính Năng Khai Vấn</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (primaryChart) {
                        router.push(`/huyen-co/laso/result?id=${primaryChart.id}`);
                      } else {
                        handleOpenForm("self");
                      }
                    }}
                    className="w-full p-4 bg-[#121826]/80 hover:bg-[#1b2336] border border-slate-800 rounded-2xl text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#fcd34d] transition-colors uppercase tracking-wider">🗓️ Luận Giải Năm mới</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Dự phóng đại hạn, tiểu hạn chi tiết năm nay</p>
                    </div>
                    <span className="text-slate-500 group-hover:text-white transition-colors">➡️</span>
                  </button>

                  <button
                    onClick={() => handleOpenForm("guest")}
                    className="w-full p-4 bg-[#121826]/80 hover:bg-[#1b2336] border border-slate-800 rounded-2xl text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#fcd34d] transition-colors uppercase tracking-wider">👥 Thêm Bản Đồ (Xem Hộ)</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Xem lá số và chat AI cho người thân/bạn bè</p>
                    </div>
                    <span className="text-slate-500 group-hover:text-white transition-colors">➡️</span>
                  </button>

                  <Link
                    href="/huyen-co/chat"
                    className="w-full p-4 bg-[#121826]/80 hover:bg-[#1b2336] border border-slate-800 rounded-2xl text-left transition-all flex items-center justify-between group block"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#fcd34d] transition-colors uppercase tracking-wider">💬 Lịch Sử Khai Vấn</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Xem lại các đoạn hội thoại tư vấn tử vi với AI</p>
                    </div>
                    <span className="text-slate-500 group-hover:text-white transition-colors">➡️</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* Hồ Sơ Liên Kết Section */}
            <div>
              <h3 className="text-xs font-black uppercase text-[#22d3ee] tracking-widest mb-4">👥 Hồ Sơ Liên Kết (Xem Hộ)</h3>
              
              {loadingList ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-[#121826]/40 border border-slate-800/60 rounded-2xl h-32 animate-pulse" />
                  ))}
                </div>
              ) : guestCharts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {guestCharts.map((chart) => {
                    const extra = chart.chartData?.extra || {};
                    return (
                      <div
                        key={chart.id}
                        className="bg-[#121826]/85 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between min-h-[140px] shadow-lg hover:shadow-xl transition-all"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                              {chart.gender === "female" ? "♀️ Nữ" : "♂️ Nam"}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: #{chart.id}</span>
                          </div>
                          <h4 className="text-lg font-black text-white font-serif tracking-wide mt-1.5 capitalize truncate">{chart.ownerName}</h4>
                          <p className="text-xs text-slate-400 mt-1 font-mono">{extra.solar_date || new Date(chart.birthDate).toLocaleDateString("vi-VN")}</p>
                          <p className="text-[11px] text-[#d4af37]/80 mt-0.5">Giờ: {extra.hour || getChiName(chart.birthHour)}</p>
                        </div>

                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800/60">
                          <button
                            onClick={() => {
                              router.push(`/huyen-co/laso/result?id=${chart.id}`);
                            }}
                            className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-lg text-xs font-semibold text-slate-200 transition-colors uppercase tracking-wider"
                          >
                            Chi Tiết
                          </button>
                          <button
                            onClick={() => handleStartChat(chart)}
                            className="px-3 py-2 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/35 rounded-lg text-xs font-semibold text-indigo-300 transition-all flex items-center gap-1"
                          >
                            <span>🔮</span> Hỏi AI
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#121826]/40 border border-slate-800/60 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  Chưa có hồ sơ xem hộ nào được lập. Nhấn vào &quot;Thêm Bản Đồ&quot; ở trên để lập lá số cho người khác.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: FORM */}
        {/* ============================================================== */}
        {viewMode === "form" && (
          <div className="max-w-xl mx-auto bg-[#121826]/90 border border-indigo-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
            <div className="absolute top-4 right-4 text-xs font-mono text-slate-500">
              {formMode === "self" ? "Chính chủ" : "Xem hộ"}
            </div>
            
            <div className="text-center mb-6">
              <span className="text-5xl block mb-3 animate-bounce">
                {formMode === "self" ? "🔮" : "👤"}
              </span>
              <h2 className="text-2xl font-bold font-serif uppercase tracking-wider text-white">
                {formMode === "self" ? "Lập Bản Đồ Bản Thân" : "Gieo Lá Số Cho Người Khác"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {formMode === "self" 
                  ? "Nhập ngày giờ sinh chính xác của bạn để cấu hình hồ sơ năng lượng gốc." 
                  : "Nhập thông tin người thân/bạn bè để phân tích vận hạn và tham vấn AI."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-indigo-300 font-bold mb-1.5">
                  Họ và Tên Chủ Sự
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#090514] border border-slate-800 focus:border-[#d4af37]/60 rounded-xl outline-none text-sm text-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-indigo-300 font-bold mb-1.5">
                    Giới Tính
                  </label>
                  <div className="flex bg-[#090514] p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "male" })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all uppercase ${
                        formData.gender === "male" 
                          ? "bg-[#d4af37] text-slate-950" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Nam
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "female" })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all uppercase ${
                        formData.gender === "female" 
                          ? "bg-[#d4af37] text-slate-950" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Nữ
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-indigo-300 font-bold mb-1.5">
                    Giờ Sinh (Chi Giờ)
                  </label>
                  <select
                    value={formData.birthHour}
                    onChange={(e) => setFormData({ ...formData, birthHour: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-[#090514] border border-slate-800 focus:border-[#d4af37]/60 rounded-xl outline-none text-sm text-white transition-all font-medium h-[42px]"
                  >
                    {HOUR_BRANCHES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-slate-950">
                        {c.label} ({c.time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-indigo-300 font-bold mb-1.5">
                  Ngày Sinh (Dương Lịch)
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[#090514] border border-slate-800 focus:border-[#d4af37]/60 rounded-xl outline-none text-sm text-white transition-all font-mono font-medium"
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between bg-[#090514] p-3 rounded-xl border border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {formData.calendarType === "solar" ? "☀️ Dương Lịch" : "🌙 Âm Lịch"}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Lịch mặc định: Gregorian</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, calendarType: formData.calendarType === "solar" ? "lunar" : "solar" })}
                    className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white uppercase transition-colors"
                  >
                    Đổi
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl text-center font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setViewMode("dashboard")}
                  className="flex-1 py-3.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#d4af37] text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/10"
                >
                  {loading ? "Đang gieo tinh bàn..." : "An Định Lá Số"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: 12-HOUSE GRID VIEW */}
        {/* ============================================================== */}
        {viewMode === "chart" && currentChart && (
          <div className="space-y-6">
            
            {/* Sheet Info Board */}
            <div className="bg-[#121826]/85 border border-[#d4af37]/35 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-sm shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <span className="text-[10px] font-black uppercase text-[#22d3ee] tracking-[2px]">Sa Bàn Bản Mệnh</span>
                <h3 className="text-2xl font-black font-serif text-white tracking-wide capitalize mt-0.5">{currentChart.ownerName}</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Dương Lịch: {currentChart.chartData?.extra?.solar_date || new Date(currentChart.birthDate).toLocaleDateString("vi-VN")}
                  {currentChart.chartData?.extra?.lunar_date && ` | Âm Lịch: ${currentChart.chartData.extra.lunar_date}`}
                  {currentChart.chartData?.extra?.hour && ` | Giờ ${currentChart.chartData.extra.hour}`}
                </p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => handleStartChat(currentChart)}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 text-white font-bold rounded-full text-xs uppercase tracking-wider hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/10"
                >
                  <span>💬</span> Khai Vấn Cố Vấn AI
                </button>
              </div>
            </div>

            {/* Traditional 12 Houses 4x4 Grid with middle CenterBoard */}
            <div className="overflow-x-auto w-full py-4 scrollbar-thin">
              <div className="min-w-[700px] max-w-[850px] mx-auto">
                
                <div className="grid grid-cols-4 grid-rows-4 gap-1.5 aspect-[4/3.8] bg-[#02050b] border border-slate-800 p-2.5 rounded-2xl relative shadow-2xl">
                  
                  {CELLS_CONFIG.map((cell) => {
                    const house = getHouseByBranch(cell.branch);
                    if (!house) return <div key={cell.branch} className={`${cell.gridClass} bg-slate-900/30 border border-slate-850 rounded`} />;

                    const isMenh = house.name === "Mệnh";
                    const isThan = house.is_body_house;
                    const stars = Array.isArray(house.stars) ? house.stars : [];
                    const mainStars = stars.filter((s) => s.category === 1);
                    const subStars = stars.filter((s) => s.category !== 1);

                    return (
                      <button
                        key={cell.branch}
                        onClick={() => setSelectedHouse(house)}
                        style={{
                          backgroundColor: getHouseBgColor(house.name),
                          borderColor: getHouseBorderColor(house.name),
                        }}
                        className={`${cell.gridClass} border rounded-lg p-2 text-left flex flex-col justify-between relative overflow-hidden transition-all duration-200 group active:scale-[0.98] ${
                          isMenh 
                            ? "shadow-[inset_0_0_12px_rgba(212,175,55,0.15)] hover:shadow-[inset_0_0_16px_rgba(212,175,55,0.25)]" 
                            : isThan 
                              ? "shadow-[inset_0_0_12px_rgba(59,130,246,0.15)] hover:shadow-[inset_0_0_16px_rgba(59,130,246,0.25)]" 
                              : "hover:bg-slate-900/60"
                        }`}
                      >
                        {/* Tuần/Triệt Indicator corners */}
                        <div className="absolute top-0 left-0 right-0 flex justify-between z-10">
                          {house.tuan_trung && (
                            <span className="bg-purple-900/90 text-purple-200 text-[7px] px-1 py-0.5 rounded-br font-extrabold uppercase">T.Trung</span>
                          )}
                          {house.triet_lo && (
                            <span className="bg-red-900/90 text-red-200 text-[7px] px-1 py-0.5 rounded-bl ml-auto font-extrabold uppercase">Triệt</span>
                          )}
                        </div>

                        {/* Cell Header */}
                        <div className="flex justify-between items-center border-b border-slate-800 pb-0.5 mb-1.5 w-full mt-2 select-none">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isMenh ? "text-[#d4af37]" : isThan ? "text-blue-400" : "text-slate-200"}`}>
                            {house.name} {isThan && <span className="text-[8px] text-blue-400">(Thân)</span>}
                          </span>
                          <span className="text-[8px] text-slate-500 font-bold uppercase">{cell.branch}</span>
                        </div>

                        {/* Main Stars Column */}
                        <div className="flex-1 flex flex-col gap-0.5 justify-center py-1">
                          {mainStars.length > 0 ? (
                            mainStars.slice(0, 2).map((s, idx) => (
                              <div
                                key={idx}
                                style={{ color: getElementColor(s.element) }}
                                className="text-[10px] font-extrabold tracking-wide truncate leading-tight"
                              >
                                {s.name} {s.strength && <span className="text-[8px] opacity-70">({s.strength})</span>}
                              </div>
                            ))
                          ) : (
                            <div className="text-[9px] text-slate-600 italic select-none">Vô Chính Diệu</div>
                          )}
                        </div>

                        {/* Minor Stars compact list */}
                        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 my-1.5 w-full max-h-[22px] overflow-hidden">
                          {subStars.slice(0, 4).map((s, idx) => (
                            <span
                              key={idx}
                              style={{ color: getElementColor(s.element) }}
                              className="text-[8px] opacity-80 font-medium whitespace-nowrap truncate max-w-[45px]"
                            >
                              {s.name}
                            </span>
                          ))}
                          {subStars.length > 4 && (
                            <span className="text-[7px] text-slate-500 font-bold">+{subStars.length - 4}</span>
                          )}
                        </div>

                        {/* Cell Footer */}
                        <div className="flex justify-between items-center border-t border-slate-800/60 pt-0.5 w-full mt-auto select-none">
                          <span className="text-[8px] text-red-400 font-extrabold">{house.major_period || ""}</span>
                          <span className="text-[7px] text-slate-500 uppercase">{house.element}</span>
                        </div>

                        {/* Zoom overlay symbol */}
                        <span className="absolute bottom-1 right-1.5 text-[8px] text-slate-500 group-hover:text-slate-300 opacity-50 group-hover:opacity-100 transition-all font-mono font-bold">🔍</span>
                      </button>
                    );
                  })}

                  {/* ============================================== */}
                  {/* CENTER BOARD: middle 2x2 cells */}
                  {/* ============================================== */}
                  <div className="col-start-2 col-span-2 row-start-2 row-span-2 bg-[#060914] border border-[#d4af37]/35 rounded-xl p-3 flex flex-col justify-between shadow-2xl relative select-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#060914] to-black z-0 pointer-events-none" />
                    
                    <div className="relative z-10 w-full h-full flex flex-col justify-between text-center">
                      <div>
                        <h4 className="text-base font-black font-serif text-[#d4af37] tracking-[2px] uppercase truncate px-1">
                          {currentChart.ownerName}
                        </h4>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
                          {currentChart.gender === "female" ? "Nữ" : "Nam"} Mệnh • {currentChart.chartData?.extra?.am_duong_nam_sinh || ""}
                        </div>
                      </div>

                      {/* Small Center Board birth details grid */}
                      <div className="bg-[#0b1020]/80 border border-slate-800/80 rounded-lg p-1.5 text-[9px] space-y-0.5 my-1.5">
                        <div className="text-slate-400 flex justify-between px-1">
                          <span>Năm sinh:</span>
                          <span className="font-bold text-slate-200">{currentChart.chartData?.extra?.stem_branch?.year || "--"}</span>
                        </div>
                        <div className="text-slate-400 flex justify-between px-1">
                          <span>Dương lịch:</span>
                          <span className="font-bold text-slate-200">{currentChart.chartData?.extra?.solar_date || "--"}</span>
                        </div>
                        <div className="text-slate-400 flex justify-between px-1">
                          <span>Âm lịch:</span>
                          <span className="font-bold text-slate-200">{currentChart.chartData?.extra?.lunar_date || "--"}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] border-t border-slate-850 pt-1.5">
                        <div>
                          <span className="text-slate-500 uppercase block text-[8px]">Mệnh Số</span>
                          <span className="font-black text-emerald-400 block truncate">{currentChart.chartData?.extra?.menh?.split(" ")[0]}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase block text-[8px]">Cục Số</span>
                          <span className="font-black text-blue-400 block truncate">{currentChart.chartData?.extra?.cuc?.split(" ")[0]}</span>
                        </div>
                        <div className="border-t border-slate-850/60 pt-1">
                          <span className="text-slate-500 uppercase block text-[8px]">Mệnh Chủ</span>
                          <span className="font-bold text-slate-300 block truncate">{currentChart.chartData?.extra?.menh_chu || "--"}</span>
                        </div>
                        <div className="border-t border-slate-850/60 pt-1">
                          <span className="text-slate-500 uppercase block text-[8px]">Thân Chủ</span>
                          <span className="font-bold text-slate-300 block truncate">{currentChart.chartData?.extra?.than_chu || "--"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* General Overview description under the board */}
            {currentChart.chartData?.extra?.cuc_description && (
              <div className="bg-[#121826]/75 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm max-w-[850px] mx-auto">
                <h4 className="text-sm font-bold text-[#d4af37] font-serif uppercase tracking-wider mb-2">Tổng Quan Năng Lượng Mệnh Lý</h4>
                <p className="text-xs text-slate-300 leading-6">{currentChart.chartData.extra.cuc_description}</p>
              </div>
            )}

            {/* details zoom note */}
            <div className="text-center text-[10px] text-slate-500">
              💡 Nhấn vào bất kỳ ô cung nào ở sa bàn để xem luận giải tinh tú chi tiết và phân tích sâu bằng Trợ lý AI.
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL OVERLAY: HOUSE DETAILS */}
        {/* ============================================================== */}
        {selectedHouse && currentChart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            {/* Click outside backdrop to close */}
            <div className="absolute inset-0" onClick={() => setSelectedHouse(null)} />
            
            <div className="relative w-full max-w-2xl bg-[#0f1322] border border-[#d4af37]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 flex justify-between items-center relative z-10 bg-slate-950/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-[#d4af37] font-black tracking-wider bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/20">
                      Cung vị
                    </span>
                    <span className="text-slate-400 text-xs font-semibold">Tọa tại {selectedHouse.branch}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white font-serif tracking-wide mt-1 capitalize">
                    Cung {selectedHouse.name} {selectedHouse.is_body_house && "(Thân Cung)"}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedHouse(null)}
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-black transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 relative z-10 scrollbar-thin">
                
                {/* Core attribute badges */}
                <div className="flex flex-wrap gap-2.5">
                  {selectedHouse.tuan_trung && (
                    <span className="px-2.5 py-1 bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      Tuần Trung Không Vong
                    </span>
                  )}
                  {selectedHouse.triet_lo && (
                    <span className="px-2.5 py-1 bg-red-950/60 border border-red-500/30 text-red-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      Triệt Lộ Không Vong
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-slate-900/60 border border-slate-800 text-slate-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    Bản Cung: Hành {selectedHouse.element}
                  </span>
                  {selectedHouse.major_period && (
                    <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      Đại Hạn: {selectedHouse.major_period} tuổi
                    </span>
                  )}
                </div>

                {/* Stars List Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Column: Chính tinh */}
                  <div>
                    <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-3 pb-1 border-b border-slate-800/80">⭐ Chính tinh chiếu thủ</h4>
                    <div className="space-y-2">
                      {selectedHouse.stars.filter((s) => s.category === 1).map((s) => (
                        <div key={s.star_id} className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
                              <span style={{ backgroundColor: getElementColor(s.element) }} className="w-2.5 h-2.5 rounded-full block" />
                              {s.name}
                            </span>
                            {s.strength && (
                              <span className="text-[10px] text-yellow-400 font-bold uppercase bg-yellow-950/40 border border-yellow-500/20 px-2 py-0.5 rounded">
                                {s.strength}
                              </span>
                            )}
                          </div>
                          {s.description && (
                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-sans">{s.description}</p>
                          )}
                        </div>
                      ))}
                      {selectedHouse.stars.filter((s) => s.category === 1).length === 0 && (
                        <p className="text-xs text-slate-500 italic px-2">Cung Vô Chính Diệu (Không có chính tinh chiếu thủ, cần mượn tinh tú từ cung đối cung để luận đoán).</p>
                      )}
                    </div>
                  </div>

                  {/* Column: Cát tinh / Phụ tinh */}
                  <div>
                    <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-3 pb-1 border-b border-slate-800/80">✨ Phụ tinh hội tụ</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedHouse.stars.filter((s) => s.category !== 1).map((s) => (
                        <div
                          key={s.star_id}
                          style={{ borderColor: getElementColor(s.element) + "35" }}
                          className="px-3 py-1.5 bg-slate-900/30 border rounded-xl flex items-center gap-1.5"
                        >
                          <span style={{ backgroundColor: getElementColor(s.element) }} className="w-1.5 h-1.5 rounded-full" />
                          <span className="text-xs text-slate-300 font-medium">
                            {s.name} {s.strength && <span className="text-[10px] opacity-60">({s.strength})</span>}
                          </span>
                        </div>
                      ))}
                      {selectedHouse.stars.filter((s) => s.category !== 1).length === 0 && (
                        <p className="text-xs text-slate-500 italic px-2">Không hội tụ phụ tinh nổi bật.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* AI RAG generated House Readings */}
                <div className="border-t border-slate-850 pt-5">
                  <h4 className="text-xs font-black text-[#d4af37] uppercase tracking-widest mb-3">📜 Luận giải năng lượng tinh bàn</h4>
                  <div className="bg-[#0b0d16] border border-slate-850 p-4 rounded-2xl">
                    <p className="text-sm text-slate-200 leading-7 whitespace-pre-line font-serif">
                      {currentChart.houseOverviews[selectedHouse.house_number.toString()]?.overview || 
                        "Cố vấn mệnh lý đang phân tích tinh tú của cung này..."}
                    </p>
                  </div>
                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 border-t border-slate-800 bg-[#0f1322] flex justify-end gap-2 relative z-10">
                <button
                  onClick={() => setSelectedHouse(null)}
                  className="px-5 py-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setSelectedHouse(null);
                    handleStartChatSpecificHouse(selectedHouse);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 border border-cyan-500/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-opacity hover:opacity-95 flex items-center gap-1.5 shadow-lg shadow-purple-500/10"
                >
                  <span>🔮</span> Nhờ Phân Tích Cung {selectedHouse.name}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function getChiName(hour: number) {
  return HOUR_BRANCHES.find((c) => c.value === hour)?.label || "Tý";
}
