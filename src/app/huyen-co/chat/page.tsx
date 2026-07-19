"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  text: string;
  suggestions?: string[];
}

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
      <span key={lineIdx} className="block min-h-[1.2em]">
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIdx} className="font-extrabold text-[#fcd34d]">
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

const getInitialWelcomeMessage = (chart: any) => {
  if (!chart) {
    return "Xin chào! Tôi là Trợ Lý Tâm Linh Huyền Cơ. Tôi có thể hỗ trợ bạn luận giải các thắc mắc về Tình Duyên, Sự Nghiệp, Tài Lộc hay Sức Khỏe của bản thân. Hôm nay bạn cần giải đáp điều gì?";
  }
  const extra = chart.extra || {};
  return `Xin chào **${extra.name || "bạn"}**! 🔮

Tôi đã thiết lập kết nối tinh bàn của bạn:
• **Bản mệnh**: ${extra.menh || "--"} (${extra.am_duong_menh || ""})
• **Cục**: ${extra.cuc || "--"} (${extra.menh_vs_cuc || ""})
• **Mệnh chủ**: ${extra.menh_chu || "--"} • **Thân chủ**: ${extra.than_chu || "--"}
• **Giờ & Ngày sinh**: Giờ ${extra.hour || ""}, ngày ${extra.solar_date || ""} (Âm lịch: ${extra.lunar_date || ""})

Chào mừng bạn đến với không gian chiêm nghiệm Huyền Cơ AI. Tôi đã thấu suốt toàn bộ 12 cung vị trên bản đồ năng lượng của bạn. Bạn muốn bắt đầu tham vấn sâu sắc về khía cạnh nào trước?`;
};

function SpiritualChatInner() {
  const searchParams = useSearchParams();
  const hasAutoSent = useRef(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Xin chào! Tôi là Trợ Lý Tâm Linh Huyền Cơ. Tôi có thể hỗ trợ bạn luận giải các thắc mắc về Tình Duyên, Sự Nghiệp, Tài Lộc hay Sức Khỏe của bản thân. Hôm nay bạn cần giải đáp điều gì?",
      suggestions: [
        "Xem tình duyên năm nay",
        "Sự nghiệp sắp tới thế nào?",
        "Tài lộc có khởi sắc không?",
        "Hỏi về sức khỏe bản thân",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [topic, setTopic] = useState<string>("general");
  const [birthContext, setBirthContext] = useState({
    name: "",
    birthDate: "",
    gender: "male",
  });

  const [savedCharts, setSavedCharts] = useState<any[]>([]);
  const [selectedChart, setSelectedChart] = useState<any | null>(null);

  // Auth states
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const API_BASE = typeof window !== "undefined" && window.location.hostname.includes("calnovaai.com")
    ? "https://api.calnovaai.com/api"
    : "https://api.calnovaai.com/api";

  const TUVI_BASE = typeof window !== "undefined" && window.location.hostname.includes("calnovaai.com")
    ? "https://api.calnovaai.com/tuvi"
    : "https://api.calnovaai.com/tuvi";

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Check Auth on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    
    if (!storedToken || !storedUser) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch charts first, then initialize chat session
  useEffect(() => {
    if (isAuthorized === true && user) {
      const uid = Number(user.id || user.userId || 1);
      
      const setup = async () => {
        try {
          const res = await fetch(`${TUVI_BASE}/charts/user/${uid}`);
          const data = await res.json();
          let matchedChart = null;
          if (data.code === "OPERATION_SUCCESS" && data.data) {
            setSavedCharts(data.data);
            
            const chartIdParam = searchParams.get("chartId");
            if (chartIdParam) {
              matchedChart = data.data.find((c: any) => c.id === Number(chartIdParam));
              if (matchedChart) {
                setSelectedChart(matchedChart);
                setBirthContext({
                  name: matchedChart.payload?.name || matchedChart.extra?.name || "",
                  birthDate: matchedChart.payload?.birthDate || matchedChart.extra?.solar_date || "",
                  gender: matchedChart.payload?.gender === 1 ? "male" : "female",
                });
              }
            }
          }
          await initChat(uid, matchedChart);
        } catch (e) {
          console.error("Failed setup:", e);
          await initChat(uid, null);
        }
      };
      
      setup();
    }
  }, [isAuthorized, user]);

  const loadHistory = async (convId: number, activeChart: any) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/history/${convId}`);
      const data = await res.json();
      
      let msgs: any[] = [];
      if (Array.isArray(data)) msgs = data;
      else if (data?.data && Array.isArray(data.data)) msgs = data.data;
      else if (data?.messages && Array.isArray(data.messages)) msgs = data.messages;
      else if (data?.data?.messages && Array.isArray(data.data.messages)) msgs = data.data.messages;

      if (msgs.length > 0) {
        const mapped = msgs.map((m: any) => {
          const role = ((m.role === "user" || m.sender === "user") ? "user" : "assistant") as "user" | "assistant";
          const text = m.text || m.content || m.message || "";
          
          const suggestedRegex = /---SUGGESTED_QUESTION---(.*?)---\/SUGGESTED_QUESTION---/g;
          const suggestions: string[] = [];
          let match;
          while ((match = suggestedRegex.exec(text)) !== null) {
            suggestions.push(match[1].trim());
          }
          let cleanText = text.replace(/---SUGGESTED_QUESTION---.*?---\/SUGGESTED_QUESTION---/g, "").trim();

          return {
            role,
            text: cleanText,
            suggestions: suggestions.length > 0 ? suggestions : undefined,
          };
        });
        setMessages(mapped);
      } else {
        setMessages([
          {
            role: "assistant",
            text: getInitialWelcomeMessage(activeChart),
            suggestions: [
              "Phân tích tổng quan cung Mệnh của tôi",
              "Sự nghiệp và tài lộc sắp tới thế nào?",
              "Tình duyên gia đạo có điểm gì cần lưu ý?",
              "Hỏi về vận hạn năm nay",
            ],
          },
        ]);
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  };

  const initChat = async (uid: number, activeChart: any) => {
    if (!searchParams) return;
    
    try {
      const chartIdParam = searchParams.get("chartId");
      const conversationIdParam = searchParams.get("conversationId");
      const autoSendPrompt = searchParams.get("autoSendPrompt");

      if (conversationIdParam) {
        const convId = Number(conversationIdParam);
        setConversationId(convId);
        await loadHistory(convId, activeChart);
        
        if (autoSendPrompt && !hasAutoSent.current) {
          hasAutoSent.current = true;
          setTimeout(() => handleSend(autoSendPrompt), 800);
        }
        return;
      }

      const bodyPayload: any = {
        user_id: uid
      };
      if (chartIdParam) {
        bodyPayload.chart_id = Number(chartIdParam);
      }

      const res = await fetch(`${API_BASE}/api/v1/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (data.success || data.conversation_id) {
        const newConvId = data.conversation_id || data.conversationId;
        setConversationId(newConvId);
        
        if (data.message) {
          const suggestedRegex = /---SUGGESTED_QUESTION---(.*?)---\/SUGGESTED_QUESTION---/g;
          const suggestions: string[] = [];
          let match;
          while ((match = suggestedRegex.exec(data.message)) !== null) {
            suggestions.push(match[1].trim());
          }
          let cleanText = data.message.replace(/---SUGGESTED_QUESTION---.*?---\/SUGGESTED_QUESTION---/g, "").trim();

          setMessages([
            {
              role: "assistant",
              text: cleanText,
              suggestions: suggestions.length > 0 ? suggestions : [
                "Phân tích tổng quan cung Mệnh của tôi",
                "Sự nghiệp và tài lộc sắp tới thế nào?",
                "Tình duyên gia đạo có điểm gì cần lưu ý?",
                "Hỏi về vận hạn năm nay",
              ],
            },
          ]);
        } else {
          await loadHistory(newConvId, activeChart);
        }
        
        if (autoSendPrompt && !hasAutoSent.current) {
          hasAutoSent.current = true;
          setTimeout(() => handleSend(autoSendPrompt), 800);
        }
      }
    } catch (e) {
      console.error("Failed to start chat session:", e);
    }
  };

  const handleSelectChart = async (chart: any) => {
    setSelectedChart(chart);
    if (!user) return;
    
    setBirthContext({
      name: chart.payload?.name || chart.extra?.name || "",
      birthDate: chart.payload?.birthDate || chart.extra?.solar_date || "",
      gender: chart.payload?.gender === 1 ? "male" : "female",
    });

    try {
      setIsSending(true);
      const res = await fetch(`${API_BASE}/api/v1/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(user.id || user.userId || 1),
          chart_id: chart.id,
        }),
      });
      const data = await res.json();
      if (data.success || data.conversation_id) {
        const newConvId = data.conversation_id || data.conversationId;
        setConversationId(newConvId);
        
        if (data.message) {
          const suggestedRegex = /---SUGGESTED_QUESTION---(.*?)---\/SUGGESTED_QUESTION---/g;
          const suggestions: string[] = [];
          let match;
          while ((match = suggestedRegex.exec(data.message)) !== null) {
            suggestions.push(match[1].trim());
          }
          let cleanText = data.message.replace(/---SUGGESTED_QUESTION---.*?---\/SUGGESTED_QUESTION---/g, "").trim();

          setMessages([
            {
              role: "assistant",
              text: cleanText,
              suggestions: suggestions.length > 0 ? suggestions : [
                "Phân tích tổng quan cung Mệnh của tôi",
                "Sự nghiệp và tài lộc sắp tới thế nào?",
                "Tình duyên gia đạo có điểm gì cần lưu ý?",
                "Hỏi về vận hạn năm nay",
              ],
            },
          ]);
        } else {
          const histRes = await fetch(`${API_BASE}/api/v1/chat/history/${newConvId}`);
          const histData = await histRes.json();
          let msgs: any[] = [];
          if (Array.isArray(histData)) msgs = histData;
          else if (histData?.data && Array.isArray(histData.data)) msgs = histData.data;
          
          if (msgs.length > 0) {
            const mapped = msgs.map((m: any) => {
              const role = ((m.role === "user" || m.sender === "user") ? "user" : "assistant") as "user" | "assistant";
              const text = m.text || m.content || m.message || "";
              const suggestedRegex = /---SUGGESTED_QUESTION---(.*?)---\/SUGGESTED_QUESTION---/g;
              const suggestions: string[] = [];
              let match;
              while ((match = suggestedRegex.exec(text)) !== null) {
                suggestions.push(match[1].trim());
              }
              let cleanText = text.replace(/---SUGGESTED_QUESTION---.*?---\/SUGGESTED_QUESTION---/g, "").trim();
              return {
                role,
                text: cleanText,
                suggestions: suggestions.length > 0 ? suggestions : undefined,
              };
            });
            setMessages(mapped);
          } else {
            setMessages([
              {
                role: "assistant",
                text: getInitialWelcomeMessage(chart),
                suggestions: [
                  "Phân tích tổng quan cung Mệnh của tôi",
                  "Sự nghiệp và tài lộc sắp tới thế nào?",
                  "Tình duyên gia đạo có điểm gì cần lưu ý?",
                  "Hỏi về vận hạn năm nay",
                ],
              },
            ]);
          }
        }
      }
    } catch (e) {
      console.error("Failed to switch chart session:", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputValue.trim();
    if (!textToSend || isSending) return;

    if (!customText) setInputValue("");
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setIsSending(true);

    // Build rich context from topic and birth information
    let richPrompt = textToSend;
    if (birthContext.name || birthContext.birthDate) {
      richPrompt = `[BỐI CẢNH CHỦ SỰ] Tên: ${birthContext.name || "N/A"}, Ngày Sinh: ${
        birthContext.birthDate || "N/A"
      }, Giới Tính: ${birthContext.gender === "male" ? "Nam" : "Nữ"}. [CHỦ ĐỀ]: ${topic.toUpperCase()}. [CÂU HỎI]: ${textToSend}`;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId || 9999,
          message: richPrompt,
          context: topic,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Parse custom markers for suggested questions
        const suggestedRegex = /---SUGGESTED_QUESTION---(.*?)---\/SUGGESTED_QUESTION---/g;
        const suggestions: string[] = [];
        let match;
        while ((match = suggestedRegex.exec(data.answer)) !== null) {
          suggestions.push(match[1].trim());
        }
        
        let cleanText = data.answer.replace(/---SUGGESTED_QUESTION---.*?---\/SUGGESTED_QUESTION---/g, "").trim();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: cleanText, suggestions: suggestions.length > 0 ? suggestions : undefined },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Trợ lý Huyền Cơ đang tĩnh tâm suy nghĩ, vui lòng thử lại sau giây lát." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Lỗi kết nối. Không thể liên lạc với thần điện AI lúc này." },
      ]);
    } finally {
      setIsSending(false);
    }
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
            Cổng Huyền Cơ AI yêu cầu bạn đăng nhập để tích lũy tín chỉ và trò chuyện trực tiếp với TuviChat AI.
          </p>
          <Link
            href="/huyen-co?redirect=/huyen-co/chat"
            className="inline-block px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-full font-bold uppercase text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            Về Trang Chủ Đăng Nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090514] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background Stars */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#090514] to-[#050209] z-0 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#120a26]/90 backdrop-blur border-b border-indigo-500/20 px-6 py-4 flex items-center justify-between">
        <Link href="/huyen-co" className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors text-sm">
          <span>⬅️</span> Thoát
        </Link>
        <div className="text-center">
          <h1 className="text-base font-black tracking-widest text-[#fcd34d] uppercase">Trò Chuyện AI</h1>
          <p className="text-[9px] text-indigo-300/60 uppercase tracking-widest">Huyền Cơ TuviChat</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col md:flex-row gap-4 relative z-10 overflow-hidden">
        {/* Left column: Context config */}
        <div className="w-full md:w-80 bg-[#120a26]/80 border border-indigo-500/20 rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-sm self-start">
          <div>
            <h3 className="text-xs font-black uppercase text-[#22d3ee] tracking-wider mb-2">
              🧭 Chọn Chủ Đề Hỏi
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "general", label: "✨ Chung" },
                { id: "love", label: "❤️ Tình Duyên" },
                { id: "career", label: "💼 Sự Nghiệp" },
                { id: "wealth", label: "💰 Tài Lộc" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    topic === t.id
                      ? "bg-indigo-600/30 border-indigo-500 text-white"
                      : "bg-[#090514] border-indigo-500/10 text-slate-400 hover:border-indigo-500/30"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-indigo-500/10 pt-3">
            <h3 className="text-xs font-black uppercase text-[#fcd34d] tracking-wider mb-2">
              🔮 Chọn Lá Số Chiêm Nghiệm
            </h3>
            <select
              value={selectedChart?.id || ""}
              onChange={(e) => {
                const cid = Number(e.target.value);
                const matched = savedCharts.find((c) => c.id === cid);
                if (matched) {
                  handleSelectChart(matched);
                } else {
                  setSelectedChart(null);
                  setBirthContext({ name: "", birthDate: "", gender: "male" });
                }
              }}
              className="w-full px-3 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-lg text-xs outline-none focus:border-[#fcd34d] transition-all text-[#fcd34d] font-bold"
            >
              <option value="" className="text-slate-400 font-normal">-- Nhập tay bối cảnh tự do --</option>
              {savedCharts.map((chart) => (
                <option key={chart.id} value={chart.id} className="text-white font-semibold">
                  {chart.payload?.name || chart.extra?.name || `Lá số #${chart.id}`} ({chart.extra?.menh || "Mệnh"})
                </option>
              ))}
            </select>
          </div>

          {!selectedChart ? (
            <div className="border-t border-indigo-500/10 pt-3">
              <h3 className="text-xs font-black uppercase text-indigo-300/80 tracking-wider mb-3">
                📝 Bối Cảnh Nhập Tay
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase text-indigo-300 font-bold mb-1">Họ Tên</label>
                  <input
                    type="text"
                    placeholder="Họ Tên"
                    value={birthContext.name}
                    onChange={(e) => setBirthContext({ ...birthContext, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090514] border border-indigo-500/20 rounded-lg text-xs outline-none focus:border-[#fcd34d] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase text-indigo-300 font-bold mb-1">Giới Tính</label>
                    <select
                      value={birthContext.gender}
                      onChange={(e) => setBirthContext({ ...birthContext, gender: e.target.value })}
                      className="w-full px-2 py-2 bg-[#090514] border border-indigo-500/20 rounded-lg text-xs outline-none focus:border-[#fcd34d] transition-all"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-indigo-300 font-bold mb-1">Ngày Sinh</label>
                    <input
                      type="date"
                      value={birthContext.birthDate}
                      onChange={(e) => setBirthContext({ ...birthContext, birthDate: e.target.value })}
                      className="w-full px-2 py-2 bg-[#090514] border border-indigo-500/20 rounded-lg text-xs outline-none focus:border-[#fcd34d] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-indigo-500/10 pt-3 text-center">
              <p className="text-[10px] text-slate-400 italic">Hệ thống đang sử dụng dữ liệu tinh bàn của lá số đã chọn ở trên.</p>
            </div>
          )}
        </div>

        {/* Right column: Chat Area */}
        <div className="flex-1 bg-[#120a26]/60 border border-indigo-500/20 rounded-2xl flex flex-col h-[75vh] backdrop-blur-sm overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedChart && (
              <div className="bg-gradient-to-r from-indigo-950/40 to-[#120a26] border border-indigo-500/10 p-4 rounded-2xl mb-4 shadow-md flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-900/30 border border-indigo-500/20 rounded-xl flex items-center justify-center text-sm">
                    🗺️
                  </div>
                  <div>
                    <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">Hồ sơ đang phân tích</p>
                    <p className="text-xs font-black text-white">{selectedChart.payload?.name || selectedChart.extra?.name}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-[10px]">
                  <div className="border-l border-indigo-500/10 pl-3">
                    <span className="text-[8px] text-slate-400 block uppercase">Giới tính</span>
                    <span className="font-semibold text-slate-200">{selectedChart.payload?.gender === 1 ? "Nam" : "Nữ"}</span>
                  </div>
                  <div className="border-l border-indigo-500/10 pl-3">
                    <span className="text-[8px] text-slate-400 block uppercase">Bản mệnh</span>
                    <span className="font-semibold text-[#fcd34d]">{selectedChart.extra?.menh || "--"}</span>
                  </div>
                  <div className="border-l border-indigo-500/10 pl-3">
                    <span className="text-[8px] text-slate-400 block uppercase">Ngày sinh</span>
                    <span className="font-semibold text-slate-200">{selectedChart.extra?.solar_date || selectedChart.payload?.birthDate || "--"}</span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border ${
                  msg.role === "user"
                    ? "bg-indigo-600/30 text-white self-end border-indigo-500/40 rounded-br-none"
                    : "bg-[#090514]/90 text-indigo-100 self-start border-indigo-500/10 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">
                  {renderMarkdown(msg.text)}
                </div>

                {msg.suggestions && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-indigo-500/10">
                    {msg.suggestions.map((sug, sugIndex) => (
                      <button
                        key={sugIndex}
                        onClick={() => handleSend(sug)}
                        disabled={isSending}
                        className="px-2.5 py-1 bg-indigo-950 border border-indigo-500/30 text-indigo-300 rounded-full text-xs hover:bg-[#fcd34d] hover:text-indigo-950 transition-all font-semibold disabled:opacity-50"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isSending && (
              <div className="bg-[#090514]/90 border border-indigo-500/10 text-indigo-300 self-start rounded-2xl p-4 text-xs font-sans animate-pulse">
                🔮 Đang kết nối mạng lưới AI...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input control */}
          <div className="p-4 border-t border-indigo-500/10 bg-black/30 flex gap-2.5 items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={isSending}
              className="flex-1 px-4 py-2.5 bg-[#090514] border border-indigo-500/20 rounded-full text-sm outline-none text-white focus:border-[#fcd34d] transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isSending}
              className="px-5 py-2.5 bg-[#fcd34d] text-indigo-950 font-black rounded-full text-xs uppercase tracking-wider hover:bg-yellow-300 transition-all disabled:opacity-50"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpiritualChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090514] text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm uppercase tracking-widest animate-pulse">Đang kết nối thần điện AI...</p>
        </div>
      </div>
    }>
      <SpiritualChatInner />
    </Suspense>
  );
}
