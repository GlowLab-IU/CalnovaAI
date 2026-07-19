"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
  description?: string | null;
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

const capitalizeWords = (str: string) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx} className="block min-h-[1em]">
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIdx} className="font-extrabold text-[#d4af37]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </span>
    );
  });
};

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
  if (houseName === "Mệnh") return "rgba(212, 175, 55, 0.12)";
  if (houseName === "Thân") return "rgba(59, 130, 246, 0.12)";
  return "rgba(15, 23, 42, 0.75)";
};

const getHouseBorderColor = (houseName?: string) => {
  if (!houseName) return "rgba(148, 163, 184, 0.15)";
  if (houseName === "Mệnh") return "rgba(212, 175, 55, 0.55)";
  if (houseName === "Thân") return "rgba(59, 130, 246, 0.55)";
  return "rgba(148, 163, 184, 0.15)";
};

const getHouseAnalysisText = (house: HouseInfo, overview?: string) => {
  const mainStars = house.stars.filter(s => s.category === 1);
  const goodSubStars = house.stars.filter(s => s.category !== 1 && s.description);

  let localText = `**Học Thuật Tinh Bàn (Luận Giải Chi Tiết)**\n`;
  localText += `${house.description || `Cung ${house.name} phản ánh các yếu tố năng lượng liên quan đến phương diện này trong cuộc sống của đương số.`}\n\n`;

  if (mainStars.length > 0) {
    localText += `Tọa thủ tại cung vị này có các Chính tinh nổi bật:\n`;
    mainStars.forEach(s => {
      localText += `• **${capitalizeWords(s.name)}** (${s.strength ? `Trạng thái ${s.strength}` : "Cát tinh"}): ${s.description || `Chủ về các đặc tính năng lượng của hành ${s.element}.`}\n`;
    });
  } else {
    localText += `Cung này ở trạng thái **Vô Chính Diệu** (Không có chính tinh tọa thủ), năng lượng sẽ chịu ảnh hưởng mạnh mẽ từ cung xung chiếu và tam hợp chiếu.\n`;
  }

  if (goodSubStars.length > 0) {
    localText += `\nĐồng thời, cung vị hội tụ các Phụ tinh quan trọng:\n`;
    goodSubStars.forEach(s => {
      localText += `• **${capitalizeWords(s.name)}**: ${s.description}\n`;
    });
  }

  if (overview && !overview.includes("RAG Service Unavailable")) {
    return `**Luận Giải Tổng Quan (Cố Vấn AI)**\n${overview}\n\n${localText}`;
  }

  return localText;
};

function ChartResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chartId = searchParams.get("id");

  const [chart, setChart] = useState<TuviChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedHouse, setSelectedHouse] = useState<HouseInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [isChatStarting, setIsChatStarting] = useState(false);

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

  const getChatBase = () => {
    let baseUrl = "https://api.calnovaai.com/api";
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("calnovaai.com")) {
        baseUrl = "https://api.calnovaai.com/api";
      }
    }
    return baseUrl;
  };

  useEffect(() => {
    if (!chartId) {
      setErrorMsg("Không tìm thấy mã số tinh bàn.");
      setLoading(false);
      return;
    }
    fetchChartDetails(Number(chartId));
  }, [chartId]);

  const fetchChartDetails = async (id: number) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${getTuviBase()}/charts/${id}`);
      const data = await res.json();
      if (res.ok && (data.success || data.code === "OPERATION_SUCCESS" || data.data)) {
        const chartData = data.data || data;
        setChart(chartData);
      } else {
        setErrorMsg(data.message || "Không tải được thông tin lá số.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Lỗi kết nối máy chủ khi tải lá số.");
    } finally {
      setLoading(false);
    }
  };

  const handleShareLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartChat = async (c: TuviChartData) => {
    const uid = c.userId || 1;
    try {
      setIsChatStarting(true);
      const res = await fetch(`${getChatBase()}/v1/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: uid, chart_id: c.id }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.conversation_id) {
        router.push(`/huyen-co/chat?conversationId=${data.conversation_id}&chartId=${c.id}`);
      } else {
        alert("Không thể kết nối với Cố Vấn AI lúc này. Vui lòng thử lại sau.");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối mạng đến Cố Vấn AI.");
    } finally {
      setIsChatStarting(false);
    }
  };

  const handleStartChatSpecificHouse = async (house: HouseInfo) => {
    if (!chart) return;
    const mainStars = house.stars.filter((s) => s.category === 1).map((s) => capitalizeWords(s.name)).join(", ") || "Vô Chính Diệu";
    const subStars = house.stars.filter((s) => s.category !== 1).map((s) => capitalizeWords(s.name)).join(", ") || "Không có phụ tinh";
    
    const prompt = `Xin hãy phân tích chi tiết tổ hợp tinh tú tại cung ${house.name} trên bản đồ năng lượng của tôi. Cung này tọa tại ${house.branch} (hành ${house.element}), có Chính tinh: ${mainStars} tọa thủ cùng các Phụ tinh: ${subStars}. Hãy luận đoán rõ đặc tính và ảnh hưởng đối với vận trình cuộc đời tôi.`;
    
    const uid = chart.userId || 1;
    try {
      setIsChatStarting(true);
      const res = await fetch(`${getChatBase()}/v1/chat/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: uid, chart_id: chart.id }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.conversation_id) {
        router.push(`/huyen-co/chat?conversationId=${data.conversation_id}&chartId=${chart.id}&autoSendPrompt=${encodeURIComponent(prompt)}`);
      } else {
        alert("Không thể kết nối với Cố Vấn AI lúc này. Vui lòng thử lại sau.");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối mạng đến Cố Vấn AI.");
    } finally {
      setIsChatStarting(false);
    }
  };

  const getHouseByBranch = (branch: string) => {
    if (!chart || !chart.chartData?.houses) return null;
    return chart.chartData.houses.find((h) => h.branch === branch) || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070512] flex items-center justify-center text-slate-300">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-t-2 border-b-2 border-yellow-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#d4af37]">Đang an định tinh bàn...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !chart) {
    return (
      <div className="min-h-screen bg-[#070512] flex items-center justify-center p-6 text-center text-slate-300">
        <div className="max-w-md bg-[#121826]/80 border border-red-500/20 p-8 rounded-3xl space-y-4 shadow-2xl">
          <span className="text-5xl block">⚠️</span>
          <h3 className="text-xl font-bold font-serif text-red-400">Không Thể Tải Bản Đồ</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{errorMsg || "Lá số không tồn tại hoặc đã bị xóa."}</p>
          <Link
            href="/huyen-co/laso"
            className="inline-block px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs uppercase tracking-wider font-bold hover:text-white transition-colors"
          >
            Quay Lại Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const extra = chart.chartData.extra || {};

  return (
    <div className="min-h-screen bg-[#070512] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#070512] to-[#020108] text-slate-300 p-4 sm:p-6 pb-20 select-none">
      
      {/* Background stars styling */}
      <div className="absolute inset-0 bg-[url(https://www.transparenttextures.com/patterns/dark-matter.png)] opacity-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/huyen-co/laso"
              className="w-10 h-10 rounded-full border border-slate-800/80 bg-[#121826]/40 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
            >
              ←
            </Link>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#22d3ee] font-black">Bản Đồ Năng Lượng</span>
              <h2 className="text-xl font-black font-serif text-white tracking-wider uppercase mt-0.5">{chart.ownerName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleShareLink}
              className={`px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 ${
                copied 
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400" 
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <span>{copied ? "✓" : "🔗"}</span> {copied ? "Đã Sao Chép Link" : "Chia Sẻ Lá Số"}
            </button>
            
            <button
              onClick={() => handleStartChat(chart)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/25 text-white font-bold rounded-full text-xs uppercase tracking-wider transition-opacity hover:opacity-95 flex items-center gap-1.5 shadow-lg shadow-purple-500/10 active:scale-95"
            >
              <span>💬</span> Tham Vấn AI
            </button>
          </div>
        </div>

        {/* Traditional 12 Houses 4x4 Grid layout */}
        <div className="overflow-x-auto w-full py-4 scrollbar-thin">
          <div className="min-w-[800px] max-w-[950px] mx-auto">
            <div className="grid grid-cols-4 grid-rows-4 gap-1.5 aspect-[4/3.8] bg-[#02050b] border border-slate-800/60 p-3 rounded-2xl relative shadow-2xl">
              
              {CELLS_CONFIG.map((cell) => {
                const house = getHouseByBranch(cell.branch);
                if (!house) return <div key={cell.branch} className={`${cell.gridClass} bg-slate-900/10 border border-slate-900 rounded`} />;

                const isMenh = house.name === "Mệnh";
                const isThan = house.is_body_house;
                const stars = Array.isArray(house.stars) ? house.stars : [];
                const mainStars = stars.filter((s) => s.category === 1);
                const subStars = stars.filter((s) => s.category !== 1);

                // Split minor stars into left and right columns
                const half = Math.ceil(subStars.length / 2);
                const leftStars = subStars.slice(0, half).slice(0, 5);
                const rightStars = subStars.slice(half).slice(0, 5);

                return (
                  <button
                    key={cell.branch}
                    onClick={() => setSelectedHouse(house)}
                    style={{
                      backgroundColor: getHouseBgColor(house.name),
                      borderColor: getHouseBorderColor(house.name),
                    }}
                    className={`${cell.gridClass} border rounded-xl p-2.5 sm:p-3 text-left flex flex-col justify-between relative overflow-hidden transition-all duration-200 group active:scale-[0.98] ${
                      isMenh 
                        ? "shadow-[inset_0_0_12px_rgba(212,175,55,0.15)] hover:shadow-[inset_0_0_16px_rgba(212,175,55,0.25)]" 
                        : isThan 
                          ? "shadow-[inset_0_0_12px_rgba(59,130,246,0.15)] hover:shadow-[inset_0_0_16px_rgba(59,130,246,0.25)]" 
                          : "hover:bg-slate-900/60"
                    }`}
                  >
                    {/* Tuần/Triệt Indication corners */}
                    <div className="absolute top-0 left-0 right-0 flex justify-between z-10">
                      {house.tuan_trung && (
                        <span className="bg-purple-900/95 text-purple-200 text-[8px] px-1.5 py-0.5 rounded-br font-extrabold uppercase tracking-wide">Tuần</span>
                      )}
                      {house.triet_lo && (
                        <span className="bg-red-900/95 text-red-200 text-[8px] px-1.5 py-0.5 rounded-bl ml-auto font-extrabold uppercase tracking-wide">Triệt</span>
                      )}
                    </div>

                    {/* Cell Header */}
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-1 mb-1.5 w-full mt-2 select-none">
                      <span className={`text-[11px] sm:text-xs md:text-[13px] font-black uppercase tracking-wider ${isMenh ? "text-[#d4af37]" : isThan ? "text-blue-400" : "text-slate-200"}`}>
                        {house.name} {isThan && <span className="text-[9px] text-blue-400 font-bold">(Thân)</span>}
                      </span>
                      <span className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 font-black uppercase">{cell.branch}</span>
                    </div>

                    {/* Main Stars Column */}
                    <div className="w-full flex flex-col gap-0.5 justify-center py-1">
                      {mainStars.length > 0 ? (
                        mainStars.slice(0, 2).map((s, idx) => (
                          <div
                            key={idx}
                            style={{ color: getElementColor(s.element) }}
                            className="text-xs sm:text-[13px] md:text-[14px] font-black text-center truncate leading-tight w-full"
                          >
                            {capitalizeWords(s.name)} {s.strength && <span className="text-[9px] sm:text-[10px] opacity-75 font-normal">({s.strength})</span>}
                          </div>
                        ))
                      ) : (
                        <div className="text-[10px] sm:text-xs text-slate-600 italic text-center py-1 select-none">Vô Chính Diệu</div>
                      )}
                    </div>

                    {/* Minor Stars double columns */}
                    <div className="w-full flex justify-between gap-1 my-1 text-[9px] sm:text-[10px] md:text-[10.5px] leading-tight select-none overflow-hidden h-[45px] sm:h-[55px] md:h-[65px]">
                      {/* Left Column (Good Stars) */}
                      <div className="w-[48%] flex flex-col items-start gap-0.5">
                        {leftStars.map((s, idx) => (
                          <span
                            key={idx}
                            style={{ color: getElementColor(s.element) }}
                            className="truncate max-w-[55px] sm:max-w-[70px] text-left opacity-90 font-medium"
                          >
                            {capitalizeWords(s.name)}
                          </span>
                        ))}
                      </div>
                      {/* Right Column (Sát/Hung Stars) */}
                      <div className="w-[48%] flex flex-col items-end gap-0.5">
                        {rightStars.map((s, idx) => (
                          <span
                            key={idx}
                            style={{ color: getElementColor(s.element) }}
                            className="truncate max-w-[55px] sm:max-w-[70px] text-right opacity-85 font-medium"
                          >
                            {capitalizeWords(s.name)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cell Footer */}
                    <div className="flex justify-between items-center border-t border-slate-800/60 pt-1 w-full mt-auto select-none">
                      <span className="text-[9px] sm:text-[10.5px] md:text-xs text-red-400 font-black">{house.major_period || ""}</span>
                      <span className="text-[8px] sm:text-[9px] text-slate-500 font-extrabold uppercase">{house.element}</span>
                    </div>

                    {/* Zoom overlay symbol */}
                    <span className="absolute bottom-1 right-1.5 text-[9px] text-slate-500 group-hover:text-slate-350 opacity-40 group-hover:opacity-100 transition-all font-mono font-bold">🔍</span>
                  </button>
                );
              })}

              {/* ============================================== */}
              {/* CENTER BOARD: middle 2x2 cells */}
              {/* ============================================== */}
              <div className="col-start-2 col-span-2 row-start-2 row-span-2 bg-[#060914] border border-[#d4af37]/45 rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#060914] to-black z-0 pointer-events-none" />
                
                {/* Decorative Rotating Cosmic Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] overflow-hidden select-none z-0">
                  <svg className="w-[125%] h-[125%] animate-[spin_180s_linear_infinite]" viewBox="0 0 200 200" fill="none" stroke="#d4af37">
                    <circle cx="100" cy="100" r="30" strokeWidth="0.5" strokeDasharray="2 2" />
                    <circle cx="100" cy="100" r="55" strokeWidth="0.75" />
                    <circle cx="100" cy="100" r="80" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="20" y1="100" x2="180" y2="100" strokeWidth="0.5" />
                    <line x1="100" y1="20" x2="100" y2="180" strokeWidth="0.5" />
                    <line x1="43.4" y1="43.4" x2="156.6" y2="156.6" strokeWidth="0.3" strokeDasharray="2 1" />
                    <line x1="43.4" y1="156.6" x2="156.6" y2="43.4" strokeWidth="0.3" strokeDasharray="2 1" />
                    <circle cx="100" cy="100" r="95" strokeWidth="0.75" />
                  </svg>
                </div>

                <div className="relative z-10 w-full h-full flex flex-col justify-between text-center gap-1.5">
                  
                  {/* Name and Gender polarity header */}
                  <div>
                    <h4 className="text-lg sm:text-xl font-black font-serif text-[#d4af37] tracking-[3px] uppercase truncate px-1">
                      {chart.ownerName}
                    </h4>
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold mt-1">
                      {chart.gender === "female" ? "♀️ Nữ Mệnh" : "♂️ Nam Mệnh"} • {extra.am_duong_nam_sinh || ""}
                    </div>
                  </div>

                  {/* Birth Details Box (Modern glassmorphic container) */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-[10px] sm:text-xs space-y-1 my-0.5">
                    <div className="text-slate-400 flex justify-between px-1">
                      <span>Dương lịch:</span>
                      <span className="font-bold text-slate-200">{extra.solar_date || "--"}</span>
                    </div>
                    <div className="text-slate-400 flex justify-between px-1">
                      <span>Âm lịch:</span>
                      <span className="font-bold text-[#d4af37]">{extra.lunar_date || "--"}</span>
                    </div>
                    <div className="text-slate-400 flex justify-between px-1">
                      <span>Giờ sinh:</span>
                      <span className="font-bold text-slate-200">{extra.hour || "--"}</span>
                    </div>
                  </div>

                  {/* Can Chi row badges */}
                  <div className="grid grid-cols-4 gap-1 py-1 px-1 border-t border-b border-slate-850 my-0.5">
                    <div className="text-center">
                      <span className="text-slate-500 text-[8px] uppercase block">Năm</span>
                      <span className="font-extrabold text-slate-200 text-[10px] sm:text-[11px] block">{extra.stem_branch?.year || "--"}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-slate-500 text-[8px] uppercase block">Tháng</span>
                      <span className="font-extrabold text-slate-200 text-[10px] sm:text-[11px] block">{extra.stem_branch?.month || "--"}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-slate-500 text-[8px] uppercase block">Ngày</span>
                      <span className="font-extrabold text-slate-200 text-[10px] sm:text-[11px] block">{extra.stem_branch?.day || "--"}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-slate-500 text-[8px] uppercase block">Giờ</span>
                      <span className="font-extrabold text-[#fde047] text-[10px] sm:text-[11px] block">{extra.stem_branch?.hour || "--"}</span>
                    </div>
                  </div>

                  {/* Core energy ratings */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] sm:text-xs pt-1">
                    <div className="bg-[#10b981]/5 border border-[#10b981]/15 rounded-lg py-1 px-1.5">
                      <span className="text-slate-500 uppercase block text-[8px] tracking-wider mb-0.5">Mệnh</span>
                      <span className="font-extrabold text-[#34d399] block truncate">{extra.menh || "--"}</span>
                    </div>
                    <div className="bg-[#3b82f6]/5 border border-[#3b82f6]/15 rounded-lg py-1 px-1.5">
                      <span className="text-slate-500 uppercase block text-[8px] tracking-wider mb-0.5">Cục</span>
                      <span className="font-extrabold text-[#60a5fa] block truncate">{extra.cuc || "--"}</span>
                    </div>
                    <div className="border-t border-slate-850/60 pt-1 text-left pl-1">
                      <span className="text-slate-500 uppercase block text-[8px]">Mệnh Chủ</span>
                      <span className="font-bold text-slate-300 block truncate">{extra.menh_chu || "--"}</span>
                    </div>
                    <div className="border-t border-slate-850/60 pt-1 text-right pr-1">
                      <span className="text-slate-500 uppercase block text-[8px]">Thân Chủ</span>
                      <span className="font-bold text-slate-300 block truncate">{extra.than_chu || "--"}</span>
                    </div>
                  </div>

                  {/* Astrological Insight Footnotes (menh_vs_cuc and am_duong_menh) */}
                  <div className="border-t border-slate-850/80 pt-1.5 flex flex-col gap-0.5">
                    {extra.menh_vs_cuc && (
                      <span className="text-[10px] text-[#eab308] italic opacity-95 tracking-wide">
                        ✨ {extra.menh_vs_cuc}
                      </span>
                    )}
                    {extra.am_duong_menh && (
                      <span className="text-[9.5px] text-slate-400 tracking-wide font-medium">
                        ☯️ {extra.am_duong_menh}
                      </span>
                    )}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* General Overview description under the board */}
        {extra.cuc_description && (
          <div className="bg-[#121826]/75 border border-slate-900 rounded-2xl p-5 backdrop-blur-sm max-w-[950px] mx-auto shadow-lg">
            <h4 className="text-sm font-bold text-[#d4af37] font-serif uppercase tracking-wider mb-2">Tổng Quan Năng Lượng Mệnh Lý</h4>
            <p className="text-xs text-slate-300 leading-7">{extra.cuc_description}</p>
          </div>
        )}

        <div className="text-center text-[10px] text-slate-500">
          💡 Nhấn vào bất kỳ ô cung nào ở sa bàn để xem chi tiết sao chiếu và luận giải bằng AI.
        </div>

      </div>

      {/* ============================================================== */}
      {/* MODAL OVERLAY: HOUSE DETAILS */}
      {/* ============================================================== */}
      {selectedHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedHouse(null)} />
          
          <div className="relative w-full max-w-2xl bg-[#0f1322] border border-[#d4af37]/45 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up z-10">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-850 flex justify-between items-center relative z-10 bg-slate-950/40">
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
              
              {/* Core attributes badges */}
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
                  Hành cung: {selectedHouse.element}
                </span>
                {selectedHouse.major_period && (
                  <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    Đại Hạn: {selectedHouse.major_period} tuổi
                  </span>
                )}
              </div>

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
                            {capitalizeWords(s.name)}
                          </span>
                          {s.strength && (
                            <span className="text-[10px] text-yellow-400 font-bold uppercase bg-yellow-950/40 border border-yellow-500/20 px-2 py-0.5 rounded">
                              {s.strength}
                            </span>
                          )}
                        </div>
                        {s.description && (
                          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{s.description}</p>
                        )}
                      </div>
                    ))}
                    {selectedHouse.stars.filter((s) => s.category === 1).length === 0 && (
                      <p className="text-xs text-slate-500 italic px-2">Cung Vô Chính Diệu (Không có chính tinh chiếu thủ).</p>
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
                          {capitalizeWords(s.name)} {s.strength && <span className="text-[10px] opacity-60">({s.strength})</span>}
                        </span>
                      </div>
                    ))}
                    {selectedHouse.stars.filter((s) => s.category !== 1).length === 0 && (
                      <p className="text-xs text-slate-500 italic px-2">Không hội tụ phụ tinh nổi bật.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Readings */}
              <div className="border-t border-slate-850 pt-5">
                <h4 className="text-xs font-black text-[#d4af37] uppercase tracking-widest mb-3">📜 Luận giải năng lượng tinh bàn</h4>
                <div className="bg-[#0b0d16] border border-slate-850/80 p-4 rounded-2xl">
                  <div className="text-sm text-slate-200 leading-7 font-serif space-y-1">
                    {renderMarkdown(getHouseAnalysisText(selectedHouse, chart.houseOverviews[selectedHouse.house_number.toString()]?.overview))}
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-850 bg-[#0f1322] flex justify-end gap-2 relative z-10">
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
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 border border-cyan-500/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center gap-1.5 shadow-lg shadow-purple-500/10 active:scale-95"
              >
                <span>🔮</span> Nhờ Phân Tích Cung {selectedHouse.name}
              </button>
            </div>

          </div>
        </div>
      )}

      {isChatStarting && (
        <div className="fixed inset-0 z-50 bg-[#070512]/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-purple-500 animate-spin [animation-duration:1.5s]" />
            <div className="absolute inset-4 rounded-full border-t-2 border-pink-500 animate-spin [animation-duration:2.5s]" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">
              🔮
            </div>
          </div>
          <h3 className="text-lg font-black uppercase text-[#d4af37] tracking-wider mb-2 animate-pulse">
            Đang khởi tạo Cố vấn AI
          </h3>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Hệ thống đang kết nối dữ liệu tinh bàn của bạn với OpenAI để thiết lập buổi luận giải cá nhân hóa. Quá trình này có thể mất vài giây...
          </p>
        </div>
      )}
    </div>
  );
}

export default function LasoResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070512] flex items-center justify-center text-slate-300">
        <p className="text-xs uppercase tracking-widest text-[#d4af37]">Đang tải dữ liệu...</p>
      </div>
    }>
      <ChartResultContent />
    </Suspense>
  );
}
