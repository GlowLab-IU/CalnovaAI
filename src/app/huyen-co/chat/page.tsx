"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RollDatePicker from "../RollDatePicker";
import HuyenCoHeader from "../components/HuyenCoHeader";
import OracleReadingMessage from "../components/OracleReadingMessage";
import { AICoachOracleIcon, TuViAstrolabeIcon } from "../components/HuyenCoIcons";
import { AUTH_CHANGE_EVENT, getStoredAuth, refreshAuthMe } from "../utils/authSync";

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
    const trimmed = line.trim();
    if (trimmed.startsWith("###") || trimmed.startsWith("## ") || trimmed.startsWith("✦ **")) {
      const headingText = trimmed
        .replace(/^#{2,3}\s*/, "")
        .replace(/^✦\s*/, "")
        .replace(/\*\*/g, "")
        .replace(/:$/, "")
        .trim();
      return (
        <span
          key={lineIdx}
          className="block mt-3 mb-1.5 py-1 px-2.5 rounded-lg bg-gradient-to-r from-[#d4af37]/20 to-transparent border-l-2 border-[#f5d061] font-serif font-bold text-[#f5d061] tracking-wide text-[14px]"
        >
          ✧ {headingText} ✧
        </span>
      );
    }
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
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
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return (
              <em key={partIdx} className="italic text-[#e5d5a7]">
                {part.slice(1, -1)}
              </em>
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
  const extra = chart.chartData?.extra || chart.extra || {};
  const ownerName = chart.ownerName || extra.name || chart.payload?.name || "bạn";
  return `Xin chào **${ownerName}**! 🔮

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
  const [showMobileConfig, setShowMobileConfig] = useState<boolean>(false);

  // Auth states
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const API_BASE = "https://api.calnovaai.com";

  const TUVI_BASE = "https://api.calnovaai.com/glowlab/tuvi";

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Check Auth on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { token: storedToken, user: storedUser } = getStoredAuth();

    if (!storedToken) {
      setIsAuthorized(false);
    } else if (storedUser) {
      setIsAuthorized(true);
      setUser(storedUser);
      refreshAuthMe(storedToken).then((fresh) => {
        if (fresh) setUser(fresh);
      });
    } else {
      refreshAuthMe(storedToken).then((fresh) => {
        if (fresh) {
          setUser(fresh);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      });
    }

    const onAuthChange = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.user) {
        setUser(custom.detail.user);
        setIsAuthorized(true);
      } else if (custom.detail && !custom.detail.token) {
        setUser(null);
        setIsAuthorized(false);
      }
    };
    window.addEventListener(AUTH_CHANGE_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, onAuthChange);
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
            } else if (Array.isArray(data.data) && data.data.length > 0) {
              matchedChart = data.data[0];
            }
            if (matchedChart) {
              const extra = matchedChart.chartData?.extra || matchedChart.extra || {};
              setSelectedChart(matchedChart);
              setBirthContext({
                name: matchedChart.ownerName || extra.name || matchedChart.payload?.name || "",
                birthDate: matchedChart.birthDate
                  ? String(matchedChart.birthDate).split("T")[0]
                  : (extra.solar_date || matchedChart.payload?.birthDate || ""),
                gender: matchedChart.gender === "female" || matchedChart.payload?.gender === -1 ? "female" : "male",
              });
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
          let cleanText = text
            .replace(/---SUGGESTED_QUESTION---.*?---\/SUGGESTED_QUESTION---/g, "")
            .replace(/^\[BỐI CẢNH CHỦ SỰ\][\s\S]*?\[CÂU HỎI\]:\s*/i, "")
            .trim();

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
      const autoSendPrompt = searchParams.get("autoSendPrompt") || searchParams.get("q");

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
        user_id: uid,
        language: "vi",
      };
      if (chartIdParam) {
        bodyPayload.chart_id = Number(chartIdParam);
      } else if (activeChart?.id) {
        bodyPayload.chart_id = Number(activeChart.id);
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
    
    const extra = chart.chartData?.extra || chart.extra || {};
    setBirthContext({
      name: chart.ownerName || extra.name || chart.payload?.name || "",
      birthDate: chart.birthDate
        ? String(chart.birthDate).split("T")[0]
        : (extra.solar_date || chart.payload?.birthDate || ""),
      gender: chart.gender === "female" || chart.payload?.gender === -1 ? "female" : "male",
    });

    try {
      setIsSending(true);
      const res = await fetch(`${API_BASE}/api/v1/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(user.id || user.userId || 1),
          chart_id: chart.id,
          language: "vi",
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
              let cleanText = text
            .replace(/---SUGGESTED_QUESTION---.*?---\/SUGGESTED_QUESTION---/g, "")
            .replace(/^\[BỐI CẢNH CHỦ SỰ\][\s\S]*?\[CÂU HỎI\]:\s*/i, "")
            .trim();
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
      let activeConvId = conversationId;
      if (!activeConvId) {
        const uid = Number(user?.id || user?.userId || 1);
        const startBody: any = { user_id: uid, language: "vi" };
        if (selectedChart?.id) startBody.chart_id = Number(selectedChart.id);
        const startRes = await fetch(`${API_BASE}/api/v1/chat/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(startBody),
        });
        const startData = await startRes.json();
        if (startData.success || startData.conversation_id) {
          activeConvId = startData.conversation_id || startData.conversationId;
          setConversationId(activeConvId);
        }
      }

      const res = await fetch(`${API_BASE}/api/v1/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: activeConvId,
          message: richPrompt,
          context: topic,
          language: "vi",
        }),
      });

      const data = await res.json();
      if (
        res.ok &&
        data.success &&
        data.answer &&
        !data.answer.includes("Xin lỗi, tôi gặp lỗi khi tạo câu trả lời") &&
        !data.answer.includes("Xin lỗi, ta gặp trở ngại")
      ) {
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
        const extra = selectedChart?.chartData?.extra || selectedChart?.extra || {};
        const menhInfo = extra.menh ? ` (Bản mệnh: **${extra.menh}**${extra.cuc ? ` • ${extra.cuc}` : ""})` : "";
        const ownerLabel = birthContext.name || selectedChart?.ownerName || "bạn";
        const fallbackReply = `Chào ${ownerLabel}${menhInfo},\n\nDựa trên dòng chảy năng lượng của bạn xoay quanh câu hỏi *"${textToSend}"*, tinh bàn cho thấy giai đoạn này nội lực của bạn đang có sự tích lũy mạnh mẽ. Để tối ưu hóa vận trình:\n• **Về công việc & định hướng:** Giữ sự kiên định trong mục tiêu cốt lõi, ưu tiên hoàn thiện từng bước chắc chắn trước khi mở rộng quy mô.\n• **Về tài chính & nguồn lực:** Quản trị dòng tiền cân bằng, tránh đầu tư dàn trải theo cảm xúc nhất thời.\n• **Về nhịp sinh học & tinh thần:** Dành thời gian tái tạo năng lượng, lắng nghe trực giác để nắm bắt cơ hội quý nhân trợ lực sắp tới.`;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: fallbackReply,
            suggestions: [
              "Phân tích chi tiết cung Quan Lộc và sự nghiệp của tôi",
              "Vận trình tài lộc trong 6 tháng tới có điểm gì sáng?",
              "Mối quan hệ tình cảm và đối tác cần lưu ý điều gì?",
            ],
          },
        ]);
      }
    } catch (err) {
      const extra = selectedChart?.chartData?.extra || selectedChart?.extra || {};
      const menhInfo = extra.menh ? ` (Bản mệnh: **${extra.menh}**)` : "";
      const ownerLabel = birthContext.name || selectedChart?.ownerName || "bạn";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Chào ${ownerLabel}${menhInfo},\n\nVề vấn đề bạn hỏi (*"${textToSend}"*), năng lượng hiện tại khuyên bạn nên giữ tâm thế điềm tĩnh, tập trung củng cố nền tảng chuyên môn và cân bằng nhịp sinh học cá nhân. Sự chuẩn bị kỹ lưỡng lúc này sẽ mở ra bước tiến thuận lợi trong thời gian tới.`,
          suggestions: [
            "Phân tích tổng quan cung Mệnh của tôi",
            "Sự nghiệp và tài lộc sắp tới thế nào?",
          ],
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#07060B] text-[#F5EFE6] flex flex-col font-sans relative">
        <HuyenCoHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
          <div className="max-w-md w-full hc-card p-8 rounded-3xl shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E8C96A]">
              <AICoachOracleIcon className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold uppercase text-[#E8C96A] tracking-widest mb-3 font-serif">
              Yêu Cầu Đăng Nhập
            </h2>
            <p className="text-[#9E9482] text-sm leading-6 mb-8">
              Cổng Huyền Cơ AI yêu cầu bạn đăng nhập để kết nối tinh bàn và tham vấn trực tiếp với Cố Vấn Mệnh Lý AI.
            </p>
            <Link
              href="/huyen-co?redirect=/huyen-co/chat"
              className="inline-block px-8 py-3.5 hc-gold-btn rounded-full font-bold uppercase text-xs tracking-wider"
            >
              Về Trang Chủ Đăng Nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-[#07060B] text-[#F5EFE6] font-sans flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.07),_#07060B_65%)] z-0 pointer-events-none" />

      <HuyenCoHeader
        user={user}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowMobileConfig(!showMobileConfig)}
            className="md:hidden px-3 py-1.5 rounded-full bg-[#181426] border border-[#D4AF37]/30 text-[11px] font-bold text-[#E8C96A]"
          >
            {showMobileConfig ? "Đóng ✕" : "Hồ sơ ▾"}
          </button>
        }
      />

      {/* Main Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-2.5 sm:p-4 flex flex-col md:flex-row gap-3 sm:gap-4 relative z-10 overflow-hidden min-h-0">
        {/* Left column: Context config (Collapsible on mobile, always visible on desktop) */}
        <div
          className={`${
            showMobileConfig ? "flex max-h-[55dvh] overflow-y-auto" : "hidden"
          } md:flex md:max-h-full md:overflow-y-auto w-full md:w-80 shrink-0 hc-card rounded-2xl p-4 flex-col gap-4 self-start`}
        >
          <div>
            <h3 className="text-[11px] font-bold uppercase text-[#E8C96A] tracking-[0.18em] mb-2.5">
              Chủ Đề Tham Vấn
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "general", label: "Tổng Quan" },
                { id: "love", label: "Tình Duyên" },
                { id: "career", label: "Sự Nghiệp" },
                { id: "wealth", label: "Tài Lộc" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                    topic === t.id
                      ? "bg-[#D4AF37]/20 border-[#D4AF37]/60 text-[#E8C96A] shadow-[0_0_12px_rgba(212,175,55,0.12)]"
                      : "bg-[#07060B]/80 border-[#D4AF37]/15 text-[#9E9482] hover:border-[#D4AF37]/35 hover:text-[#F5EFE6]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#D4AF37]/15 pt-3.5">
            <h3 className="text-[11px] font-bold uppercase text-[#E8C96A] tracking-[0.18em] mb-2">
              Lá Số Kết Nối
            </h3>
            <select
              value={selectedChart?.id || ""}
              onChange={(e) => {
                const cid = Number(e.target.value);
                const matched = savedCharts.find((c) => c.id === cid);
                if (matched) {
                  handleSelectChart(matched);
                  setShowMobileConfig(false);
                } else {
                  setSelectedChart(null);
                  setBirthContext({ name: "", birthDate: "", gender: "male" });
                }
              }}
              className="w-full px-3 py-2.5 bg-[#07060B] border border-[#D4AF37]/25 rounded-xl text-base sm:text-xs outline-none focus:border-[#D4AF37] transition-all text-[#E8C96A] font-bold"
            >
              <option value="" className="text-[#9E9482] font-normal">-- Nhập tay bối cảnh tự do --</option>
              {savedCharts.map((chart) => {
                const cExtra = chart.chartData?.extra || chart.extra || {};
                const cName = chart.ownerName || cExtra.name || chart.payload?.name || `Lá số #${chart.id}`;
                const cMenh = cExtra.menh || "Mệnh";
                return (
                  <option key={chart.id} value={chart.id} className="text-[#F5EFE6] font-semibold">
                    {cName} ({cMenh})
                  </option>
                );
              })}
            </select>
          </div>

          {!selectedChart ? (
            <div className="border-t border-[#D4AF37]/15 pt-3.5">
              <h3 className="text-[11px] font-bold uppercase text-[#C5B386] tracking-[0.18em] mb-2.5">
                Bối Cảnh Nhập Tay
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase text-[#9E9482] font-bold mb-1">Họ Tên</label>
                    <input
                      type="text"
                      placeholder="Họ Tên"
                      value={birthContext.name}
                      onChange={(e) => setBirthContext({ ...birthContext, name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#07060B] border border-[#D4AF37]/20 rounded-xl text-base sm:text-xs outline-none focus:border-[#D4AF37] transition-all text-[#F5EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-[#9E9482] font-bold mb-1">Giới Tính</label>
                    <select
                      value={birthContext.gender}
                      onChange={(e) => setBirthContext({ ...birthContext, gender: e.target.value })}
                      className="w-full px-2 py-2 bg-[#07060B] border border-[#D4AF37]/20 rounded-xl text-base sm:text-xs outline-none focus:border-[#D4AF37] transition-all text-[#F5EFE6]"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-[#9E9482] font-bold mb-1">Ngày Sinh (Cuộn lên/xuống)</label>
                  <RollDatePicker
                    value={birthContext.birthDate}
                    onChange={(val) => setBirthContext({ ...birthContext, birthDate: val })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-[#D4AF37]/15 pt-3 text-center">
              <p className="text-[11px] text-[#9E9482] italic">Hệ thống đang kết nối trực tiếp với tinh bàn 12 cung của lá số đã chọn.</p>
            </div>
          )}
        </div>

        {/* Right column: Chat Area */}
        <div className="flex-1 hc-card rounded-2xl flex flex-col min-h-0 overflow-hidden">
          {/* Mobile Quick Topic & Chart Bar */}
          <div className="md:hidden flex items-center justify-between gap-2 px-3 py-2 bg-[#07060B]/80 border-b border-[#D4AF37]/15 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { id: "general", label: "Tổng Quan" },
                { id: "love", label: "Tình Duyên" },
                { id: "career", label: "Sự Nghiệp" },
                { id: "wealth", label: "Tài Lộc" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  className={`py-1 px-3 text-[11px] font-semibold rounded-full border transition-all whitespace-nowrap ${
                    topic === t.id
                      ? "bg-[#D4AF37]/20 border-[#D4AF37]/60 text-[#E8C96A]"
                      : "bg-[#07060B] border-[#D4AF37]/15 text-[#9E9482]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-4 flex flex-col">
            {selectedChart && (
              <div className="bg-[#07060B]/80 border border-[#D4AF37]/25 p-4 rounded-2xl mb-2 shadow-md flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl flex items-center justify-center text-[#E8C96A]">
                    <TuViAstrolabeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-[#C5B386] font-bold uppercase tracking-wider">Tinh bàn đang kết nối</p>
                    <p className="text-xs font-bold text-[#F5EFE6]">
                      {selectedChart.ownerName || selectedChart.chartData?.extra?.name || selectedChart.payload?.name || selectedChart.extra?.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-[10px]">
                  <div className="border-l border-[#D4AF37]/15 pl-3">
                    <span className="text-[8px] text-[#9E9482] block uppercase">Giới tính</span>
                    <span className="font-semibold text-[#F5EFE6]">
                      {selectedChart.gender === "female" || selectedChart.payload?.gender === -1 ? "Nữ" : "Nam"}
                    </span>
                  </div>
                  <div className="border-l border-[#D4AF37]/15 pl-3">
                    <span className="text-[8px] text-[#9E9482] block uppercase">Bản mệnh</span>
                    <span className="font-semibold text-[#E8C96A]">
                      {selectedChart.chartData?.extra?.menh || selectedChart.extra?.menh || "--"}
                    </span>
                  </div>
                  <div className="border-l border-[#D4AF37]/15 pl-3">
                    <span className="text-[8px] text-[#9E9482] block uppercase">Ngày sinh</span>
                    <span className="font-semibold text-[#F5EFE6]">
                      {selectedChart.chartData?.extra?.solar_date ||
                        selectedChart.extra?.solar_date ||
                        (selectedChart.birthDate ? new Date(selectedChart.birthDate).toLocaleDateString("vi-VN") : "--")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const chartOwnerName =
                selectedChart?.ownerName ||
                selectedChart?.chartData?.extra?.name ||
                selectedChart?.payload?.name ||
                selectedChart?.extra?.name ||
                birthContext.name ||
                undefined;
              const chartOwnerMenh =
                selectedChart?.chartData?.extra?.menh ||
                selectedChart?.extra?.menh ||
                undefined;

              return (
                <div
                  key={i}
                  className={`rounded-2xl p-3.5 sm:p-4 text-sm leading-relaxed border ${
                    msg.role === "user"
                      ? "max-w-[85%] sm:max-w-[75%] bg-[#D4AF37]/15 text-[#F5EFE6] self-end border-[#D4AF37]/40 rounded-br-none"
                      : "w-full max-w-[96%] sm:max-w-[90%] bg-[#090810]/95 text-[#E5DEC9] self-start border-[#D4AF37]/20 rounded-bl-none shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <OracleReadingMessage
                      text={msg.text}
                      ownerName={chartOwnerName}
                      ownerMenh={chartOwnerMenh}
                    />
                  ) : (
                    <div className="whitespace-pre-line leading-relaxed">
                      {renderMarkdown(msg.text)}
                    </div>
                  )}

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#D4AF37]/15">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9E9482] mb-2">
                        ✦ Gợi ý tham vấn tiếp theo
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, sugIndex) => (
                          <button
                            key={sugIndex}
                            onClick={() => handleSend(sug)}
                            disabled={isSending}
                            className="px-3 py-1.5 bg-[#131020] border border-[#D4AF37]/30 text-[#E8C96A] rounded-full text-xs hover:bg-[#D4AF37] hover:text-[#07060B] transition-all font-semibold disabled:opacity-50 text-left cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {isSending && (
              <div className="w-full max-w-[92%] sm:max-w-[72%] bg-[#090810]/95 border border-[#D4AF37]/25 self-start rounded-2xl rounded-bl-none p-4 space-y-2.5 shadow-lg">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#F5D061] animate-pulse">
                  <AICoachOracleIcon className="w-4 h-4" />
                  <span>✦ Cố Vấn Mệnh Lý đang đối chiếu tinh bàn & cổ thư...</span>
                </div>
                <div className="h-2 w-3/4 rounded bg-[#D4AF37]/15 animate-pulse" />
                <div className="h-2 w-1/2 rounded bg-[#D4AF37]/10 animate-pulse" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input control */}
          <div className="p-3 sm:p-4 border-t border-[#D4AF37]/15 bg-[#07060B]/70 flex gap-2 items-center shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập câu hỏi tham vấn..."
              disabled={isSending}
              className="flex-1 px-4 py-2.5 bg-[#120F1D] border border-[#D4AF37]/25 rounded-full text-base sm:text-sm outline-none text-[#F5EFE6] placeholder:text-[#9E9482] focus:border-[#D4AF37] transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isSending}
              className="px-6 py-2.5 hc-gold-btn font-bold rounded-full text-xs uppercase tracking-wider disabled:opacity-50 shrink-0"
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
      <div className="min-h-screen bg-[#07060B] text-[#F5EFE6] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#C5B386] text-xs uppercase tracking-widest animate-pulse">Đang kết nối Cố Vấn Mệnh Lý AI...</p>
        </div>
      </div>
    }>
      <SpiritualChatInner />
    </Suspense>
  );
}
