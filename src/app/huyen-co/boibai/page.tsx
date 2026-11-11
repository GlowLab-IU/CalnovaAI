"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HuyenCoHeader from "../components/HuyenCoHeader";
import {
  FolkCardsIcon,
  ScrollHistoryIcon,
  SparkleIcon,
} from "../components/HuyenCoIcons";

// Clean Markdown Renderer for Folk Card Readings & Chat (strips ###, **, *)
function renderRichMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((rawLine, lineIdx) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-2.5" />;
    }

    // Check if it's a heading (e.g. "### I. ..." or "I. CỤC DIỆN...")
    const isHeading =
      /^#{1,4}\s+/.test(trimmed) ||
      /^(I|II|III|IV|V)\.\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(
        trimmed
      );
    const cleanedLine = trimmed.replace(/^#{1,4}\s+/, "");

    // Parse inline **bold** and *italic*
    const renderInline = (str: string) => {
      const tokens = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return tokens.map((tok, i) => {
        if (tok.startsWith("**") && tok.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-[#E8C96A] not-italic">
              {tok.slice(2, -2)}
            </strong>
          );
        }
        if (tok.startsWith("*") && tok.endsWith("*") && tok.length > 2) {
          return (
            <em key={i} className="italic text-[#F5EFE6]/90">
              {tok.slice(1, -1)}
            </em>
          );
        }
        return tok.replace(/\*\*/g, "");
      });
    };

    if (isHeading) {
      return (
        <h4
          key={lineIdx}
          className="text-sm font-serif font-bold uppercase tracking-wider text-[#E8C96A] mt-3.5 mb-1.5 pb-1 border-b border-[#D4AF37]/20 not-italic"
        >
          {renderInline(cleanedLine)}
        </h4>
      );
    }

    return (
      <div
        key={lineIdx}
        className="text-xs sm:text-[13px] text-[#E5DEC9] leading-relaxed mb-1.5 not-italic"
      >
        {renderInline(cleanedLine)}
      </div>
    );
  });
}

// Type definitions for window-attached libraries
declare global {
  interface Window {
    THREE: any;
    TWEEN: any;
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

// Spread configurations matching the mobile app
const SPREADS: Record<string, { id: string, name: string, count: number, labels: string[], sub: string, desc: string, icon: string }> = {
  tam_da: {
    id: "tam_da",
    name: "CHIÊM NGHIỆM TAM ĐA",
    sub: "Quá Khứ - Hiện Tại - Tương Lai",
    desc: "Phân tích năng lượng cá nhân, môi trường xung quanh và động lực phát triển.",
    count: 3,
    labels: ["Quá Khứ", "Hiện Tại", "Tương Lai"],
    icon: "🎴",
  },
  that_tinh: {
    id: "that_tinh",
    name: "ĐA DIỆN CUỘC SỐNG",
    sub: "7 Khía Cạnh Cuộc Sống",
    desc: "Đánh giá 7 khía cạnh cảm xúc, tài nguyên, sự nghiệp, xã hội, năng lượng, trở ngại và cơ hội hỗ trợ.",
    count: 7,
    labels: ["Cảm Xúc", "Tài Nguyên", "Sự Nghiệp", "Định Hướng", "Năng Lượng", "Trở Ngại", "Cơ Hội Hỗ Trợ"],
    icon: "⭐",
  },
  thoi_van: {
    id: "thoi_van",
    name: "CHU KỲ NĂNG LƯỢNG 12 THÁNG",
    sub: "Nhịp Sinh Học Hàng Tháng",
    desc: "Phân tích xu hướng năng lượng và lời khuyên tối ưu cho 12 tháng.",
    count: 12,
    labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
    icon: "⏳",
  }
};

const VIETNAMESE_MAP: Record<string, string> = {
  "Que Tam Da": "CHIÊM NGHIỆM TAM ĐA",
  "Quẻ Tam Đa": "CHIÊM NGHIỆM TAM ĐA",
  "Que That Tinh": "ĐA DIỆN CUỘC SỐNG",
  "Quẻ Thất Tinh": "ĐA DIỆN CUỘC SỐNG",
  "Que Thoi Van": "CHU KỲ NĂNG LƯỢNG 12 THÁNG",
  "Quẻ Thời Vận": "CHU KỲ NĂNG LƯỢNG 12 THÁNG",
  "Bon Mang": "Bổn Mạng",
  "Gia Dao": "Gia Đạo",
  "Tai Loc": "Tài Lộc",
  "Tinh": "Tình Cảm",
  "Tien": "Tài Chính",
  "Danh": "Danh Vọng",
  "Loi": "Lợi Ích",
  "Suc": "Sức Khỏe",
  "Tieu Nhan": "Tiểu Nhân",
  "Quy Nhan": "Quý Nhân",
  "Toan Do": "Toàn Đỏ (Đại Cát)",
  "Toan Den": "Toàn Đen (Cần Nỗ Lực)",
  "Tieu Sanh": "Tiểu Sảnh (Thuận Tiến 3 Bước)",
  "Trung Sanh": "Trung Sảnh (Thuận Tiến 4 Bước)",
  "Dai Sanh": "Đại Sảnh (Thuận Tiến 5 Bước)",
  "Ach Bich + Chin Bich": "Ách Bích + Chín Bích (Trọng Cảnh Báo)",
  "Tam Bich": "Tam Bích (Thử Thách Chồng Chất)",
  "Dai Cat - Que rat tot": "Đại Cát - Quẻ Rất Tốt 🌟",
  "Cat - Que tot": "Cát - Quẻ Tốt 👍",
  "Binh - Que trung binh": "Bình Hòa - Trung Bình ⚖️",
  "Hung - Que can can trong": "Thử Thách - Cần Thận Trọng ⚠️",
  "Dai Hung - Que xau, can de phong": "Trọng Cảnh Báo - Cần Đề Phòng 🚨",
};

const CARD_VI_DETAILS: Record<string, { name: string; short: string; full: string }> = {
  "A-H": { name: "Ách Cơ", short: "Ánh sáng khởi nguồn, phúc lành gia đạo", full: "Ngọn lửa thiêng liêng của tình cảm và gia đạo bừng sáng. Năng lượng tích cực bắt đầu luân chuyển, mang theo tin vui lớn, sự hòa hợp tâm hồn và phúc lành đến với bạn." },
  "K-H": { name: "Già Cơ", short: "Quý nhân nam giới độ lượng che chở", full: "Hình tượng người đàn ông chín chắn, nhân hậu mang năng lượng bảo vệ và dẫn dắt. Bạn đang được một bậc trưởng bối hoặc quý nhân giàu lòng nhân ái nâng đỡ." },
  "Q-H": { name: "Đầm Cơ", short: "Năng lượng ấm áp, tình thương bao dung", full: "Năng lượng hiền hòa đang bao bọc lấy bạn như dòng suối mát lành. Đại diện cho người phụ nữ nhân hậu, sự thấu cảm sâu sắc và niềm hạnh phúc êm đềm." },
  "J-H": { name: "Bồi Cơ", short: "Sứ giả tình cảm, tin lành hội ngộ", full: "Thông điệp chân thành từ trái tim đang tìm đến bạn. Năng lượng trẻ trung mang theo tin vui về tình cảm, sự gắn kết bạn bè hoặc cuộc gặp gỡ đầy cảm hứng." },
  "10-H": { name: "Mười Cơ", short: "Viên mãn tối cao, hạnh phúc tròn đầy", full: "Đỉnh cao của phúc đức trong tình cảm và gia đình. Vòng tròn nhân duyên được hoàn thiện viên mãn như trăng rằm sáng tỏ, hóa giải mọi ưu phiền." },
  "9-H": { name: "Chín Cơ", short: "Điều ước linh nghiệm, tâm nguyện thành tựu", full: "Nguyện ước chân thành của bạn đang được lắng nghe. Những dự định ấp ủ bấy lâu sắp kết trái ngọt nhờ sự kiên định và niềm tin sáng suốt." },
  "8-H": { name: "Tám Cơ", short: "Dòng chảy tình cảm, gắn kết sẻ chia", full: "Dòng cảm xúc đang chuyển mình tích cực. Có cơ hội tham gia tiệc vui, gặp gỡ tri kỷ hoặc tiến thêm một bước sâu sắc hơn trong mối quan hệ." },
  "7-H": { name: "Bảy Cơ", short: "Lắng nghe nội tâm, định hướng tình cảm", full: "Đứng trước những suy tư của trái tim, bạn cần tĩnh lặng để phân biệt giữa mong muốn nhất thời và giá trị lâu dài. Sự chân thành sẽ tháo gỡ mọi khúc mắc." },
  "A-D": { name: "Ách Rô", short: "Khởi nguồn tài lộc, cơ hội văn thư", full: "Viên ngọc quý của vận may vật chất vừa xuất hiện. Mở ra cơ hội ký kết hợp đồng, nhận tin tức tài chính quan trọng hoặc bắt đầu dự án sinh lời." },
  "K-D": { name: "Già Rô", short: "Thế lực tài chính, quý nhân thương trường", full: "Đại diện cho người có thực lực kinh tế, quyết đoán và nhạy bén. Quý nhân trong lĩnh vực kinh doanh hoặc đầu tư đang xuất hiện để mở đường cho tài vận." },
  "Q-D": { name: "Đầm Rô", short: "Quản trị tài chính khéo léo, sung túc", full: "Năng lượng quản lý tài nguyên khôn ngoan và tinh tế. Một người phụ nữ tháo vát hoặc sự khéo léo trong giao tiếp sẽ mang lại nguồn lợi vật chất đáng kể." },
  "J-D": { name: "Bồi Rô", short: "Tin tức tiền tài, cơ hội giao dịch", full: "Thông điệp mới về giao dịch, buôn bán hoặc cơ hội gia tăng thu nhập. Hãy nhanh nhạy nắm bắt thông tin và giữ sự minh bạch trong thỏa thuận." },
  "10-D": { name: "Mười Rô", short: "Đại phú quý, mùa màng bội thu", full: "Đỉnh cao của sự sung túc về vật chất. Dòng tiền dồi dào, thích hợp để mở rộng quy mô công việc hoặc tích lũy tài sản bền vững." },
  "9-D": { name: "Chín Rô", short: "Vận may tài lộc, phúc báo bất ngờ", full: "Tài lộc tự tìm đến nhờ công sức tích lũy trước đây. Có cơ hội nhận thưởng, thu hồi khoản nợ cũ hoặc gặp may mắn bất ngờ trong tài chính." },
  "8-D": { name: "Tám Rô", short: "Dòng tiền luân chuyển, đầu tư sinh lời", full: "Tài chính có sự vận động đều đặn và khởi sắc. Những khoản đầu tư công sức hoặc tiền bạc bắt đầu mang lại nguồn thu ổn định." },
  "7-D": { name: "Bảy Rô", short: "Cân nhắc thu chi, quản trị thông thái", full: "Thời điểm cần rà soát lại kế hoạch tài chính và định giá đúng công sức của bản thân. Khoản lợi nhỏ nhưng chắc chắn sẽ tạo đà cho bước tiến xa hơn." },
  "A-C": { name: "Ách Chuồn", short: "Ấn tín sự nghiệp, khởi đầu quyền lực", full: "Cánh cửa công danh và học vấn rộng mở. Biểu trưng cho quyết định bổ nhiệm, dự án trọng điểm hoặc bước ngoặt khẳng định vị thế cá nhân." },
  "K-C": { name: "Già Chuồn", short: "Cấp trên nâng đỡ, quý nhân công danh", full: "Người có uy tín, kinh nghiệm và quyền hạn đang đánh giá cao năng lực của bạn. Sự đề bạt, cố vấn chiến lược hoặc thăng tiến đang đến gần." },
  "Q-C": { name: "Đầm Chuồn", short: "Trí tuệ sắc sảo, hợp tác chuyên nghiệp", full: "Năng lượng độc lập, quyết đoán và giàu kinh nghiệm tổ chức. Sự đồng hành của một cộng sự đáng tin cậy giúp công việc tiến triển mạch lạc." },
  "J-C": { name: "Bồi Chuồn", short: "Cơ hội nghề nghiệp, tin vui công việc", full: "Tin tức tích cực liên quan đến công việc, thi cử hoặc dự án hợp tác. Tinh thần cầu tiến và năng động giúp bạn nhanh chóng khẳng định bản thân." },
  "10-C": { name: "Mười Chuồn", short: "Đỉnh cao sự nghiệp, uy tín vững bền", full: "Thành tựu rực rỡ sau chuỗi ngày nỗ lực bền bỉ. Công sức của bạn được tập thể ghi nhận xứng đáng, mang lại cả danh tiếng lẫn vị thế vững chắc." },
  "9-C": { name: "Chín Chuồn", short: "Mục tiêu thành tựu, kế hoạch kết trái", full: "Mục tiêu công việc bạn kiên trì theo đuổi đang bước vào giai đoạn thu hoạch. Giữ vững kỷ luật sẽ giúp bạn đạt kết quả vượt kỳ vọng." },
  "8-C": { name: "Tám Chuồn", short: "Nhịp độ công việc, rèn luyện bứt phá", full: "Công việc đang trên đà mở rộng đòi hỏi sự tập trung cao độ. Mỗi thử thách chuyên môn lúc này đều là bậc thang nâng tầm năng lực của bạn." },
  "7-C": { name: "Bảy Chuồn", short: "Định hướng ưu tiên, tháo gỡ vướng mắc", full: "Cần xác định rõ thứ tự ưu tiên trong công việc để tránh phân tán năng lượng. Giải quyết dứt điểm từng việc nhỏ sẽ mở thông lộ trình phía trước." },
  "A-S": { name: "Ách Bích", short: "Khép lại chu kỳ cũ, chuyển hóa sâu sắc", full: "Một giai đoạn cũ cần khép lại để mở đường cho nhận thức mới. Hãy giữ tâm thế điềm tĩnh, chu đáo và tránh những quyết định nóng vội." },
  "K-S": { name: "Già Bích", short: "Nguyên tắc kỷ luật, đề phòng cạnh tranh", full: "Cần lưu tâm đến các quy định pháp lý, nguyên tắc làm việc hoặc đối thủ cạnh tranh sắc sảo. Hành xử minh bạch và chuẩn mực sẽ giúp bạn đứng vững." },
  "Q-S": { name: "Đầm Bích", short: "Trực giác sắc bén, tránh lời thị phi", full: "Nhắc nhở bạn giữ khoảng cách an toàn trước những lời đồn đoán hoặc sự đố kỵ xung quanh. Hãy dùng lý trí độc lập để bảo vệ sự bình yên." },
  "J-S": { name: "Bồi Bích", short: "Tín hiệu nhắc nhở, kiểm chứng thông tin", full: "Có thể xuất hiện sự chậm trễ nhỏ hoặc thông tin chưa đầy đủ. Hãy kiểm tra kỹ lưỡng trước khi hành động và tránh nghe lời phiến diện." },
  "10-S": { name: "Mười Bích", short: "Vượt ngưỡng áp lực, bình minh phía trước", full: "Giai đoạn nặng nề nhất của thử thách đang dần đi qua. Hãy buông bỏ gánh nặng quá sức và chăm sóc bản thân để đón nhận chu kỳ phục hồi." },
  "9-S": { name: "Chín Bích", short: "Giải tỏa âu lo, giữ tâm sáng suốt", full: "Nhiều nỗi lo hiện tại xuất phát từ sự suy nghĩ quá mức hơn là thực tế. Hãy nghỉ ngơi điều độ, chia sẻ cùng người tin cậy để lấy lại cân bằng." },
  "8-S": { name: "Tám Bích", short: "Chủ động tháo gỡ, tìm lối mở mới", full: "Cảm giác bị bó buộc chỉ là tạm thời. Khi bạn thay đổi góc nhìn và tháo gỡ từng nút thắt nhỏ, con đường giải quyết sẽ dần hiện rõ." },
  "7-S": { name: "Bảy Bích", short: "Thận trọng từng bước, kiên nhẫn chờ thời", full: "Mọi việc cần thêm thời gian để sáng tỏ. Hãy cẩn trọng trong lời nói và cam kết, kiên nhẫn chờ thời điểm thuận lợi hơn để bứt phá." },
};

const formatVietnameseText = (raw?: string): string => {
  if (!raw) return "";
  if (VIETNAMESE_MAP[raw]) return VIETNAMESE_MAP[raw];
  const thangMatch = raw.match(/^Thang\s+(\d+)$/i);
  if (thangMatch) return `Tháng ${thangMatch[1]}`;
  const doiMatch = raw.match(/^Doi\s+(.+)$/i);
  if (doiMatch) return `Đôi ${doiMatch[1]}`;
  const tamMatch = raw.match(/^Tam\s+(.+)$/i);
  if (tamMatch) return `Tam ${tamMatch[1]}`;
  const tuQuyMatch = raw.match(/^Tu Quy\s+(.+)$/i);
  if (tuQuyMatch) return `Tứ Quý ${tuQuyMatch[1]}`;
  return raw
    .replace(/\bTang cuong y nghia, nhan doi nang luong\b/gi, "Tăng cường ý nghĩa, nhân đôi năng lượng cộng hưởng")
    .replace(/\bThuan loi, may man, tinh tai deu tot\b/gi, "Đại cát tường, thuận lợi, tình cảm và tài lộc đều vượng")
    .replace(/\bCan no luc, co thu thach nhung se vuot qua\b/gi, "Cần nỗ lực kiên trì, có thử thách nhưng sẽ vượt qua")
    .replace(/\bThuan tien (\d+) buoc, tien trien tot\b/gi, "Thuận tiến $1 bước, công việc tiến triển tốt")
    .replace(/\bThuan tien (\d+) buoc, duong dai suon se\b/gi, "Thuận tiến $1 bước, đường dài suôn sẻ")
    .replace(/\bThuan tien (\d+) buoc, van su nhu y\b/gi, "Thuận tiến $1 bước, vạn sự như ý");
};

export default function BoiBaiARPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loadedScripts, setLoadedScripts] = useState({
    three: false,
    tween: false,
    cameraUtils: false,
    controlUtils: false,
    hands: false,
  });

  // State configurations
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const selectedSpreadRef = useRef<string | null>(null);
  const updateSelectedSpread = (spread: string | null) => {
    setSelectedSpread(spread);
    selectedSpreadRef.current = spread;
    setCounter(0);
    setSelectedCards([]);
    setServerResult(null);
    setShowModal(false);
    setIsGameActive(true);
    if (gameRef.current) {
      gameRef.current.storedCards = [];
      gameRef.current.inspectingCard = null;
      gameRef.current.isGameActive = true;
      gameRef.current.cardPickedInCurrentPinch = false;
    }
  };

  const [counter, setCounter] = useState(0);
  const [guideText, setGuideText] = useState("Đang tải các thư viện tâm linh...");
  const [isGameActive, setIsGameActive] = useState(true);
  
  // Pre-drawn cards from server
  const [predeterminedCards, setPredeterminedCards] = useState<any[]>([]);
  const predeterminedCardsRef = useRef<any[]>([]);
  const updatePredeterminedCards = (cards: any[]) => {
    setPredeterminedCards(cards);
    predeterminedCardsRef.current = cards;
  };
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [serverResult, setServerResult] = useState<any>(null);

  // Auth and charts state
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [savedCharts, setSavedCharts] = useState<any[]>([]);
  const [primaryChart, setPrimaryChart] = useState<any | null>(null);
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);
  
  // Chat state inside modal
  const [chatConversationId, setChatConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; suggestions?: string[] }>>([
    {
      role: "assistant",
      text: "Chào bạn, ta là bậc thầy giải mã thẻ bài tây. Bạn vừa gieo được một quẻ bài chứa đầy mật mã năng lượng. Hãy đặt câu hỏi của bạn để cùng ta tháo gỡ nhé.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<"result" | "chat">("result");
  const [isMirrored, setIsMirrored] = useState(true);
  const [isInitializingHandModel, setIsInitializingHandModel] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  
  // Three.js and game loop refs
  const gameRef = useRef<{
    scene: any;
    camera: any;
    renderer: any;
    cardGroup: any;
    raycaster: any;
    mouse: any;
    starFieldMesh: any;
    explosions: any[];
    storedCards: any[];
    inspectingCard: any;
    handX: number;
    isPinching: boolean;
    cardPickedInCurrentPinch: boolean;
    cursorPosition: any;
    rotationSpeed: number;
    handsDetector: any;
    cameraUtilsInstance: any;
    isGameActive: boolean;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    cardGroup: null,
    raycaster: null,
    mouse: null,
    starFieldMesh: null,
    explosions: [],
    storedCards: [],
    inspectingCard: null,
    handX: 0.5,
    isPinching: false,
    cardPickedInCurrentPinch: false,
    cursorPosition: { x: 0, y: 0 },
    rotationSpeed: 0.002,
    handsDetector: null,
    cameraUtilsInstance: null,
    isGameActive: true,
  });

  const CHAT_API_BASE = "https://api.calnovaai.com";

  // Dynamic API Base Resolver
  const callRAGBoiBaiAPI = async (path: string, body: any) => {
    let baseUrl = "https://api.calnovaai.com/glowlab";
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("calnovaai.com")) {
        baseUrl = "https://api.calnovaai.com";
      }
    }
    
    // Try primary port
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`Fetch ${baseUrl}${path} failed, trying port 8003 fallback...`, e);
    }

    // Try fallback port for local RAG server dev setup
    try {
      const res = await fetch(`https://api.calnovaai.com${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (e) {
      console.error(`All endpoints failed for ${path}:`, e);
      throw e;
    }
  };

  // Load CDN scripts sequentially on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadScripts = async () => {
      const scripts = [
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
      ];

      for (const src of scripts) {
        if (document.querySelector(`script[src="${src}"]`)) {
          continue;
        }
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.head.appendChild(script);
        });
      }

      setLoadedScripts({
        three: true,
        tween: true,
        cameraUtils: true,
        controlUtils: true,
        hands: true,
      });
    };

    setIsMounted(true);
    
    // Check Auth
    const storedToken =
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");
    const storedUser = localStorage.getItem("authUser");
    if (!storedToken) {
      setIsAuthorized(false);
    } else if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      setIsAuthorized(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    } else {
      fetch("https://api.calnovaai.com/glowlab/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => res.json())
        .then((result) => {
          if ((result.code === 0 || result.code === "OPERATION_SUCCESS") && result.data) {
            localStorage.setItem("authToken", storedToken);
            localStorage.setItem("authUser", JSON.stringify(result.data));
            setUser(result.data);
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        })
        .catch(() => setIsAuthorized(false));
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
    window.addEventListener("huyenco-auth-change", onAuthChange);

    loadScripts().catch((err) => {
      console.error("Error loading scripts:", err);
      setGuideText("Không thể tải các thư viện tâm linh. Vui lòng tải lại trang.");
    });
  }, []);

  // Fetch Saved Charts
  useEffect(() => {
    if (isAuthorized === true && user) {
      const uid = Number(user.id || user.userId || 1);
      const tuviBaseUrl = `https://api.calnovaai.com/glowlab/tuvi/charts/user/${uid}`;
      fetch(tuviBaseUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "OPERATION_SUCCESS" && data.data) {
            setSavedCharts(data.data);
            const primary = data.data.find((c: any) => c.isPrimary);
            if (primary) setPrimaryChart(primary);
          }
        })
        .catch((e) => console.error("Error loading saved charts:", e));
    }
  }, [isAuthorized, user]);

  const allScriptsLoaded =
    loadedScripts.three &&
    loadedScripts.tween &&
    loadedScripts.cameraUtils &&
    loadedScripts.controlUtils &&
    loadedScripts.hands;

  // Initialize game when selectedSpread is chosen
  useEffect(() => {
    if (!isMounted || !allScriptsLoaded || !selectedSpread) return;
    
    setGuideText("Đang yêu cầu quyền truy cập camera...");
    
    const cleanupThree = initThreeGame();
    startCameraAndMediaPipe();

    return () => {
      if (cleanupThree) cleanupThree();
      if (gameRef.current.renderer) {
        gameRef.current.renderer.dispose();
      }
      if (gameRef.current.cameraUtilsInstance) {
        try {
          gameRef.current.cameraUtilsInstance.stop();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [isMounted, allScriptsLoaded, selectedSpread]);

  // Fetch pre-drawn cards when spread changes
  useEffect(() => {
    if (!selectedSpread) return;

    const fetchPredeterminedCards = async () => {
      setIsLoadingCards(true);
      setGuideText("Đang thiết lập quẻ bài từ thiên cơ...");
      try {
        const count = SPREADS[selectedSpread].count;
        const resData = await callRAGBoiBaiAPI("/api/folk-cards/draw", {
          count: count,
          mode: 32, // 32-card mode (7-A)
          user_id: user ? String(user.id || user.userId || "guest") : "guest"
        });

        if (resData && resData.success && resData.data?.cards) {
          updatePredeterminedCards(resData.data.cards);
          setGuideText("Đưa tay lên trước Camera để bắt đầu gieo quẻ");
        } else {
          alert("Lỗi kết nối hoặc không nhận được quẻ bài.");
          updateSelectedSpread(null);
        }
      } catch (e) {
        console.error(e);
        alert("Không thể gieo quẻ bài lúc này. Vui lòng kiểm tra kết nối API.");
        updateSelectedSpread(null);
      } finally {
        setIsLoadingCards(false);
      }
    };

    fetchPredeterminedCards();
  }, [selectedSpread, user]);

  // Card deck configuration
  const SUITS = ["C", "D", "H", "S"];
  const RANK_NAMES = ["7", "8", "9", "10", "J", "Q", "K", "A"];
  const CARD_DATA: any[] = [];
  SUITS.forEach((suit) => {
    RANK_NAMES.forEach((rank) => {
      let name = `${rank} ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;
      if (rank === "J") name = `Bồi ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;
      if (rank === "Q") name = `Đầm ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;
      if (rank === "K") name = `Già ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;
      if (rank === "A") name = `Ách ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;

      const detailInfo = CARD_VI_DETAILS[`${rank}-${suit}`];
      CARD_DATA.push({
        id: `${rank}-${suit}`,
        name: detailInfo?.name || name,
        url: `/static/cards/${rank}-${suit}.png`,
        meaning: detailInfo?.full || `Lá ${name} - Đại diện cho dòng chảy năng lượng đặc biệt trong quẻ bài của bạn.`,
      });
    });
  });

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const CONFIG = {
    cardCount: CARD_DATA.length,
    radius: 6.5,
    cardWidth: 1.4,
    cardHeight: 2.4,
    inspectPos: { x: 0, y: 0, z: 3.8 },
    inspectScale: 0.5,
    storageScale: 0.09,
    storageZ: 3.5,
    storeMarginX: 0.1,
    storeMarginTop: 1.1,
    storeGapY: 0.25,
  };

  // Generate white glow texture
  const generateParticleTexture = (THREE: any) => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.4, "rgba(255, 255, 255, 0.5)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  const initThreeGame = () => {
    const THREE = window.THREE;
    const TWEEN = window.TWEEN;

    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02);
    gameRef.current.scene = scene;
    gameRef.current.storedCards = [];
    gameRef.current.inspectingCard = null;
    gameRef.current.isGameActive = true;
    gameRef.current.cardPickedInCurrentPinch = false;
    gameRef.current.cursorPosition = new THREE.Vector2(0, 0);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);
    gameRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const spotLight = new THREE.SpotLight(0xffffff, 2.0);
    spotLight.position.set(0, 10, 10);
    scene.add(spotLight);

    const textureLoader = new THREE.TextureLoader();
    const particleTexture = generateParticleTexture(THREE);

    // Create background stars
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];
    for (let i = 0; i < starCount; i++) {
      positions.push((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 50 - 10);
      sizes.push(Math.random() * 0.5 + 0.1);
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    starGeo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    const starMat = new THREE.PointsMaterial({
      size: 0.8,
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
    });
    const starFieldMesh = new THREE.Points(starGeo, starMat);
    scene.add(starFieldMesh);
    gameRef.current.starFieldMesh = starFieldMesh;

    shuffleArray(CARD_DATA);
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    gameRef.current.cardGroup = cardGroup;

    const cardGeo = new THREE.BoxGeometry(CONFIG.cardWidth, CONFIG.cardHeight, 0.02);
    const backTex = textureLoader.load("/static/cards/BACK.png");
    const matEdge = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });

    CARD_DATA.forEach((data, i) => {
      const frontTex = textureLoader.load(data.url);
      const matFront = new THREE.MeshStandardMaterial({ map: frontTex });
      const matBack = new THREE.MeshStandardMaterial({ map: backTex, color: 0xffffff });
      const materials = [matEdge, matEdge, matEdge, matEdge, matBack, matFront];
      const card = new THREE.Mesh(cardGeo, materials);

      const angle = (i / CONFIG.cardCount) * Math.PI * 2;
      const yPos = (i - CONFIG.cardCount / 2) * 0.08;

      card.position.set(Math.sin(angle) * CONFIG.radius, yPos, Math.cos(angle) * CONFIG.radius);
      card.lookAt(0, yPos * 0.2, 0);
      card.userData = { id: i, data: data, isPicked: false, baseY: yPos };
      cardGroup.add(card);
    });

    gameRef.current.raycaster = new THREE.Raycaster();
    gameRef.current.mouse = new THREE.Vector2();

    const onMouseDown = (event: MouseEvent) => {
      const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];
      if (!gameRef.current.isGameActive || gameRef.current.storedCards.length >= activeConfig.count || predeterminedCardsRef.current.length === 0) return;
      gameRef.current.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      gameRef.current.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      gameRef.current.raycaster.setFromCamera(gameRef.current.mouse, camera);
      const intersects = gameRef.current.raycaster.intersectObjects(cardGroup.children);
      if (intersects.length > 0) {
        triggerPickCard(intersects[0].object);
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", onResize);

    let animFrameId: number;
    const animate = (time: number) => {
      animFrameId = requestAnimationFrame(animate);
      TWEEN.update(time);
      updateExplosions();

      if (gameRef.current.isGameActive) {
        let targetRotSpeed = 0.002;
        if (gameRef.current.handX < 0.45) targetRotSpeed = -0.005;
        else if (gameRef.current.handX > 0.55) targetRotSpeed = 0.005;

        gameRef.current.rotationSpeed += (targetRotSpeed - gameRef.current.rotationSpeed) * 0.05;
        cardGroup.rotation.y += gameRef.current.rotationSpeed;

        cardGroup.children.forEach((c: any, i: number) => {
          if (!c.userData.isPicked) {
            c.position.y = c.userData.baseY + Math.sin(time * 0.0015 + i) * 0.1;
          }
        });
      }

      if (starFieldMesh) {
        starFieldMesh.rotation.y = time * 0.00005;
        starFieldMesh.material.size = Math.sin(time * 0.002) * 0.1 + 0.9;
      }
      
      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("resize", onResize);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  };

  const onResize = () => {
    const camera = gameRef.current.camera;
    const renderer = gameRef.current.renderer;
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      repositionStoredCards();
    }
  };

  const createExplosion = (position: any) => {
    const THREE = window.THREE;
    const particleCount = 150;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const sizes = [];

    const particleTexture = generateParticleTexture(THREE);

    for (let i = 0; i < particleCount; i++) {
      positions.push(position.x, position.y, position.z);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = Math.random() * 0.03 + 0.01;

      velocities.push(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi)
      );
      sizes.push(Math.random() * 0.15 + 0.05);
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.2,
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
    });

    const points = new THREE.Points(geo, mat);
    gameRef.current.scene.add(points);
    gameRef.current.explosions.push({ mesh: points, velocities: velocities, age: 0 });
  };

  const updateExplosions = () => {
    for (let i = gameRef.current.explosions.length - 1; i >= 0; i--) {
      const ex = gameRef.current.explosions[i];
      const positions = ex.mesh.geometry.attributes.position.array;
      ex.age += 1;
      for (let j = 0; j < ex.velocities.length / 3; j++) {
        positions[j * 3] += ex.velocities[j * 3];
        positions[j * 3 + 1] += ex.velocities[j * 3 + 1];
        positions[j * 3 + 2] += ex.velocities[j * 3 + 2];
      }
      ex.mesh.geometry.attributes.position.needsUpdate = true;
      ex.mesh.material.opacity = 1 - ex.age / 60;
      ex.mesh.scale.setScalar(1 + ex.age * 0.01);
      if (ex.age > 60) {
        gameRef.current.scene.remove(ex.mesh);
        ex.mesh.geometry.dispose();
        gameRef.current.explosions.splice(i, 1);
      }
    }
  };

  const getSafeVerticalLeftPosition = (index: number) => {
    const camera = gameRef.current.camera;
    const dist = camera.position.z - CONFIG.storageZ;
    const vFOV = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
    const visibleWidth = visibleHeight * camera.aspect;

    const leftEdge = -visibleWidth / 2;
    const topEdge = visibleHeight / 2;

    const x = leftEdge + CONFIG.storeMarginX;
    const y = topEdge - CONFIG.storeMarginTop - index * CONFIG.storeGapY;

    return { x, y, z: CONFIG.storageZ };
  };

  const repositionStoredCards = () => {
    const TWEEN = window.TWEEN;
    storedCardsList.forEach((c: any, i: number) => {
      const pos = getSafeVerticalLeftPosition(i);
      new TWEEN.Tween(c.position).to({ x: pos.x, y: pos.y, z: pos.z }, 500).start();
      new TWEEN.Tween(c.scale).to({ x: CONFIG.storageScale, y: CONFIG.storageScale, z: CONFIG.storageScale }, 500).start();
    });
  };

  const storedCardsList: any[] = [];

  const triggerPickCard = (card: any) => {
    const THREE = window.THREE;
    const TWEEN = window.TWEEN;
    const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];

    console.log("🔮 [debug] triggerPickCard called for card index/id:", card.userData?.id);
    console.log("🔮 [debug] current storedCards count:", gameRef.current.storedCards.length, "max count:", activeConfig.count);
    console.log("🔮 [debug] is card already picked:", card.userData.isPicked);
    console.log("🔮 [debug] inspectingCard state:", !!gameRef.current.inspectingCard);

    if (gameRef.current.inspectingCard || gameRef.current.storedCards.length >= activeConfig.count || card.userData.isPicked) {
      console.warn("🔮 [debug] triggerPickCard returned early: checks failed.");
      return;
    }
    
    // Select predetermined card face based on sequence
    const nextCard = predeterminedCardsRef.current[gameRef.current.storedCards.length];
    console.log("🔮 [debug] nextCard resolved:", nextCard);
    if (!nextCard) {
      console.error("🔮 [debug] nextCard is undefined! predeterminedCardsRef.current length:", predeterminedCardsRef.current.length);
      return;
    }

    card.userData.isPicked = true;
    gameRef.current.inspectingCard = card;
    gameRef.current.scene.attach(card);

    // Apply texture loader to update the front face of the 3D card
    const textureLoader = new THREE.TextureLoader();
    const frontTex = textureLoader.load(nextCard.url || `/static/cards/${nextCard.id}.png`);
    frontTex.wrapS = THREE.RepeatWrapping;
    frontTex.repeat.x = -1;
    card.material[5] = new THREE.MeshStandardMaterial({ map: frontTex });

    new TWEEN.Tween(card.position).to(CONFIG.inspectPos, 650).easing(TWEEN.Easing.Cubic.Out).start();
    new TWEEN.Tween(card.rotation).to({ x: 0, y: Math.PI, z: 0 }, 650).easing(TWEEN.Easing.Back.Out).start();

    const targetScale = CONFIG.inspectScale;
    new TWEEN.Tween(card.scale)
      .to({ x: targetScale, y: targetScale, z: targetScale }, 650)
      .onComplete(() => {
        setTimeout(() => {
          try {
            createExplosion(card.position);
          } catch (e) {
            console.warn("Explosion skipped:", e);
          }
          setTimeout(() => {
            const stored = gameRef.current.storedCards;
            stored.push(card);
            storedCardsList.push(card);
            gameRef.current.inspectingCard = null;

            const index = stored.length - 1;
            const pos = getSafeVerticalLeftPosition(index);
            const scale = CONFIG.storageScale;

            new TWEEN.Tween(card.position)
              .to({ x: pos.x, y: pos.y, z: pos.z }, 550)
              .easing(TWEEN.Easing.Exponential.Out)
              .onComplete(() => {
                card.visible = false;
              })
              .start();
            new TWEEN.Tween(card.scale).to({ x: scale, y: scale, z: scale }, 550).start();

            const enrichedCard = {
              ...nextCard,
              name: CARD_VI_DETAILS[nextCard.id]?.name || nextCard.name,
              meaning: CARD_VI_DETAILS[nextCard.id]?.full || nextCard.meaning || nextCard.suit_meaning,
            };
            setCounter(stored.length);
            setSelectedCards((prev) => [...prev, enrichedCard]);

            if (stored.length === activeConfig.count) {
              setGuideText("Định mệnh đã an bài...");
              gameRef.current.isGameActive = false;
              setIsGameActive(false);
              setTimeout(() => {
                revealReading(stored);
              }, 1200);
            } else {
              setGuideText(`Đã rút ${stored.length}/${activeConfig.count} lá — Chọn tiếp lá thứ ${stored.length + 1}`);
            }
          }, 80);
        }, 750);
      })
      .start();
  };

  const handleQuickPickNextCard = () => {
    const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];
    if (!gameRef.current.isGameActive || gameRef.current.inspectingCard || gameRef.current.storedCards.length >= activeConfig.count) {
      return;
    }
    const availableCards = (gameRef.current.cardGroup?.children || []).filter((c: any) => !c.userData?.isPicked);
    if (availableCards.length > 0) {
      const randomMesh = availableCards[Math.floor(Math.random() * availableCards.length)];
      triggerPickCard(randomMesh);
    }
  };

  const buildSynthesizedReading = (spreadKey: string | null, cardsList: any[], scoreVal: number, combos: any[] = []) => {
    const cfg = SPREADS[spreadKey || "tam_da"];
    const enriched = cardsList.map((c, idx) => {
      const info = CARD_VI_DETAILS[c.id];
      const isRed = c.id?.endsWith("-H") || c.id?.endsWith("-D") || c.suit === "heart" || c.suit === "diamond";
      const isNeg = c.id?.endsWith("-S") && ["7-S", "8-S", "9-S", "J-S", "Q-S"].includes(c.id);
      return {
        pos: cfg.labels[idx] || `Vị trí ${idx + 1}`,
        name: info?.name || c.name || c.id,
        meaning: info?.full || c.meaning || "",
        isRed,
        isPositive: !isNeg,
      };
    });
    const redCount = enriched.filter((e) => e.isRed).length;
    const blackCount = enriched.length - redCount;
    const posCards = enriched.filter((e) => e.isPositive);
    const negCards = enriched.filter((e) => !e.isPositive);

    const balanceStr =
      redCount > blackCount
        ? `Sắc Đỏ (Cơ/Rô — ${redCount}/${enriched.length} lá) chiếm ưu thế, báo hiệu Dương khí vượng, nhiều tin vui về tài lộc, tình cảm và quý nhân.`
        : blackCount > redCount
          ? `Sắc Đen (Chuồn/Bích — ${blackCount}/${enriched.length} lá) nổi bật, nhắc nhở bạn đề cao sự điềm tĩnh, chiều sâu tư duy và cẩn trọng trước các quyết định lớn.`
          : `Sắc Đỏ và Đen cân bằng hài hòa (${redCount} Đỏ – ${blackCount} Đen), biểu thị vận trình ổn định, trong thử thách luôn có cơ hội song hành.`;

    const posLines = enriched.map((e) => `• **${e.pos}** — ứng vào lá **${e.name}**: ${e.meaning}`).join("\n");

    let synergyStr = "";
    if (posCards.length > 0 && negCards.length > 0) {
      synergyStr = `Trong quẻ có sự giao thoa giữa thử thách tại **${negCards[0].pos}** (*${negCards[0].name}*) và cát khí nâng đỡ tại **${posCards[0].pos}** (*${posCards[0].name}*). Theo phép luận dân gian, đây là thế **"Trong nguy có cơ, Cát hóa giải Hung"**: dù bước đầu có việc phải suy tính, nhưng nhờ quý nhân và nội lực vững vàng, mọi khúc mắc đều được hóa giải êm đẹp.`;
    } else if (negCards.length === 0) {
      synergyStr = `Toàn bộ các vị trí đều hội tụ **Cát Khí hanh thông**, không vướng lá bài xung khắc nặng. Đây là thời điểm thiên thời – địa lợi – nhân hòa cùng mở để bạn tự tin triển khai kế hoạch lớn.`;
    } else {
      synergyStr = `Quẻ bài khuyên bạn áp dụng nguyên tắc **"Lấy tĩnh chế động, lấy thủ làm công"**. Không nên nóng vội quyết định bốc đồng; chỉ cần giữ tâm thế điềm tĩnh và quản trị chặt kế hoạch, vận khí sẽ sớm chuyển mình tích cực.`;
    }

    const comboLine =
      combos && combos.length > 0
        ? `\n• **Cách cục đặc biệt:** ${combos.map((cb: any) => `${formatVietnameseText(cb.name)} (${formatVietnameseText(cb.meaning)})`).join("; ")}.`
        : "";

    return [
      `I. CỤC DIỆN KHÍ VẬN — ${cfg.name}\n• Khí sắc Âm Dương: ${balanceStr}${comboLine}`,
      `II. LUẬN GIẢI THEO CUNG VỊ\n${posLines}`,
      `III. TƯƠNG TÁC & CHUYỂN HÓA TRONG QUẺ BÀI\n${synergyStr}`,
      `IV. LỜI KHUYÊN HÀNH ĐỘNG\nHãy ưu tiên phát huy năng lượng tích cực ở các cung vị có lá Cơ và Rô chiếu sáng, đồng thời chuẩn bị kế hoạch chủ động, chu đáo cho những phương diện cần sự kiên nhẫn.`,
    ].join("\n\n");
  };

  const revealReading = async (stored: any[]) => {
    if (cursorRef.current) cursorRef.current.style.display = "none";
    
    setIsInterpreting(true);
    try {
      const drawnCardsPayload = predeterminedCardsRef.current.map((c) => ({
        id: c.id,
        name: CARD_VI_DETAILS[c.id]?.name || c.name,
      }));
      
      const interpretRes = await callRAGBoiBaiAPI("/api/folk-cards/interpret", {
        spread_type: selectedSpreadRef.current,
        drawn_cards: drawnCardsPayload,
        user_question: "",
        chart: primaryChart
      });

      if (interpretRes && interpretRes.success) {
        const rawRag = String(interpretRes.rag_luan_giai || "");
        const isBareLookup = !rawRag.includes("Cục Diện") && !rawRag.includes("III.") && rawRag.split("**Lá ").length >= 2;
        const enhancedRag = isBareLookup || !rawRag.trim()
          ? buildSynthesizedReading(
              selectedSpreadRef.current,
              predeterminedCardsRef.current,
              interpretRes.score?.score || 7,
              interpretRes.combinations || []
            )
          : formatVietnameseText(rawRag);

        setServerResult({
          ...interpretRes,
          rag_luan_giai: enhancedRag,
        });
        setShowModal(true);
      } else {
        setServerResult({
          success: true,
          spread_name: SPREADS[selectedSpreadRef.current || "tam_da"].name,
          score: { score: 7.5, assessment: "Cát — Quẻ tốt, nhiều cơ hội thuận lợi" },
          combinations: [],
          rag_luan_giai: buildSynthesizedReading(selectedSpreadRef.current, predeterminedCardsRef.current, 7.5, []),
        });
        setShowModal(true);
      }
    } catch (e) {
      console.error(e);
      setServerResult({
        success: true,
        spread_name: SPREADS[selectedSpreadRef.current || "tam_da"].name,
        score: { score: 7.5, assessment: "Cát — Quẻ tốt, nhiều cơ hội thuận lợi" },
        combinations: [],
        rag_luan_giai: buildSynthesizedReading(selectedSpreadRef.current, predeterminedCardsRef.current, 7.5, []),
      });
      setShowModal(true);
    } finally {
      setIsInterpreting(false);
    }
  };

  // Start Camera & MediaPipe Hands
  const startCameraAndMediaPipe = async () => {
    const Hands = window.Hands;
    const Camera = window.Camera;

    if (!Hands || !Camera || !videoRef.current) return;

    const handsDetector = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    handsDetector.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    handsDetector.onResults((results: any) => {
      setIsInitializingHandModel(false);
      onHandResults(results);
    });
    gameRef.current.handsDetector = handsDetector;

    setIsInitializingHandModel(true);
    const warmupFallback = setTimeout(() => {
      setIsInitializingHandModel(false);
    }, 3200);

    try {
      if (typeof handsDetector.initialize === "function") {
        await handsDetector.initialize();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      stream.getTracks().forEach((track) => track.stop());

      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await handsDetector.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      await cam.start();
      gameRef.current.cameraUtilsInstance = cam;
      setGuideText("Đưa tay lên trước Camera hoặc chạm vào lá bài để bắt đầu gieo quẻ");
    } catch (err) {
      console.error("Camera access denied:", err);
      clearTimeout(warmupFallback);
      setIsInitializingHandModel(false);
      setGuideText("💡 Bạn có thể chạm / nhấp chuột trực tiếp vào lá bài trên màn hình để gieo quẻ!");
    }
  };

  const onHandResults = (results: any) => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    
    // Draw skeleton on PIP canvas
    const pipCanvas = pipCanvasRef.current;
    if (pipCanvas && results.image && videoRef.current) {
      if (pipCanvas.width !== videoRef.current.videoWidth) {
        pipCanvas.width = videoRef.current.videoWidth;
        pipCanvas.height = videoRef.current.videoHeight;
      }
      const ctx = pipCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, pipCanvas.width, pipCanvas.height);
        if (results.multiHandLandmarks && window.drawConnectors && window.drawLandmarks && window.HAND_CONNECTIONS) {
          for (const landmarks of results.multiHandLandmarks) {
            window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
            window.drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 2, radius: 4 });
          }
        }
      }
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const lm = results.multiHandLandmarks[0];
      if (gameRef.current.storedCards.length === 0) {
        setGuideText("Chụm ngón cái và ngón trỏ để chọn bài");
      }

      gameRef.current.handX = isMirrored ? (1 - lm[9].x) : lm[9].x;
      const x = (lm[8].x + lm[4].x) / 2;
      const y = (lm[8].y + lm[4].y) / 2;
      
      const screenX = isMirrored ? (1 - x) * window.innerWidth : x * window.innerWidth;
      const screenY = y * window.innerHeight;

      cursor.style.display = "block";
      cursor.style.left = `${screenX}px`;
      cursor.style.top = `${screenY}px`;

      if (gameRef.current.cursorPosition && typeof gameRef.current.cursorPosition.set === "function") {
        gameRef.current.cursorPosition.set(
          (screenX / window.innerWidth) * 2 - 1,
          -(screenY / window.innerHeight) * 2 + 1
        );
      } else {
        gameRef.current.cursorPosition = {
          x: (screenX / window.innerWidth) * 2 - 1,
          y: -(screenY / window.innerHeight) * 2 + 1
        };
      }

      const distance = Math.hypot(lm[8].x - lm[4].x, lm[8].y - lm[4].y);
      const palmSize = Math.hypot(lm[9].x - lm[0].x, lm[9].y - lm[0].y);
      const pinchRatio = palmSize > 0 ? (distance / palmSize) : 999;
      const isPinchingNow = pinchRatio < 0.45;

      if (isPinchingNow) {
        cursor.classList.add("pinching");
        if (gameRef.current.isGameActive && gameRef.current.renderer && !gameRef.current.cardPickedInCurrentPinch) {
          console.log("🔮 [debug] Pinch Active - NDC Coords:", gameRef.current.cursorPosition.x, gameRef.current.cursorPosition.y, "Ratio:", pinchRatio.toFixed(3));
          console.log("🔮 [debug] Total cardGroup children count:", gameRef.current.cardGroup?.children?.length);
          
          gameRef.current.raycaster.setFromCamera(gameRef.current.cursorPosition, gameRef.current.camera);
          const intersects = gameRef.current.raycaster.intersectObjects(gameRef.current.cardGroup.children, true);
          
          console.log("🔮 [debug] Raycast Intersections found count:", intersects.length);
          if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            console.log("🔮 [debug] Hit detected on mesh:", hitObject.userData);
            triggerPickCard(hitObject);
            gameRef.current.cardPickedInCurrentPinch = true;
          }
        }
      } else {
        cursor.classList.remove("pinching");
        gameRef.current.cardPickedInCurrentPinch = false;
      }
      gameRef.current.isPinching = isPinchingNow;
    } else {
      cursor.style.display = "none";
    }
  };

  const getTuViContext = (chart?: any) => {
    const targetChart = chart || primaryChart;
    if (targetChart) {
      const extra = targetChart.chartData?.extra || targetChart.extra || {};
      const name = targetChart.ownerName || extra.name || targetChart.request?.name || "Vô Danh";
      const date = extra.solar_date || (targetChart.birthDate ? new Date(targetChart.birthDate).toLocaleDateString("vi-VN") : "Chưa rõ");
      const gender = targetChart.gender === "female" ? "Nữ" : (extra.gender || (targetChart.request?.gender === -1 ? "Nữ" : "Nam"));
      const menh = extra.menh || "N/A";
      const cuc = extra.cuc || "N/A";
      return `[THÔNG TIN BẢN MỆNH]: Tên ${name}, Giới tính ${gender}, Ngày sinh ${date}, Bản mệnh ngũ hành ${menh}, Cục ${cuc}. `;
    }
    return user ? `[THÔNG TIN USER]: Tên ${[user.lastName, user.firstName].filter(Boolean).join(" ")}, Giới tính ${user.gender === "female" || user.gender === -1 ? "Nữ" : "Nam"}. ` : "";
  };

  // Launch chat inside modal
  const handleStartAIConsultation = () => {
    if (savedCharts.length > 0) {
      setIsSelectorVisible(true);
    } else {
      onConfirmChat(primaryChart);
    }
  };

  const onConfirmChat = async (selectedChart?: any) => {
    setIsSelectorVisible(false);
    setIsSending(true);

    const uid = user ? Number(user.id || user.userId || 1) : 1;
    const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];
    
    // Start Chat Session
    try {
      const res = await fetch(`${CHAT_API_BASE}/api/v1/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: uid,
          chart_id: selectedChart?.id || null,
          language: "vi",
        }),
      });
      const startData = await res.json();
      if (startData.success) {
        setChatConversationId(startData.conversation_id);
        
        // Auto-send initial prompt
        const chartContext = getTuViContext(selectedChart);
        const targetName = selectedChart?.ownerName || selectedChart?.chartData?.extra?.name || selectedChart?.extra?.name || selectedChart?.request?.name || "tôi";
        
        const cardsText = predeterminedCardsRef.current.map((c, idx) => {
          const positionName = serverResult?.card_details?.find((d: any) => d.position_index === idx)?.position_name || activeConfig.labels[idx];
          return `${positionName.toUpperCase()}: ${c.name}`;
        }).join("; ");

        const prompt = `[BOI BAI TAY]
Quẻ: ${VIETNAMESE_MAP[serverResult?.spread_name] || serverResult?.spread_name || activeConfig.name} (${predeterminedCards.length} lá)
Bài gieo được: ${cardsText}

User hỏi: Chào Cố Vấn, ${chartContext}hãy kết hợp thông tin bản mệnh của ${targetName} và quẻ bài tây này để phân tích vận mệnh tổng quan nhé.`;

        await handleSendMessage(prompt, startData.conversation_id);
      } else {
        alert("Lỗi khởi tạo chat: " + (startData.error || "Không rõ nguyên nhân"));
      }
    } catch (e) {
      console.error(e);
      alert("Không thể kết nối đến server Chat.");
    } finally {
      setIsSending(false);
    }
  };

  // Chat send message
  const handleSendMessage = async (customText?: string, specificConvId?: number) => {
    const textToSend = customText || inputValue.trim();
    if (!textToSend || isSending) return;

    if (!customText) setInputValue("");
    
    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setIsSending(true);

    try {
      let activeConvId = specificConvId || chatConversationId;
      let finalMessage = textToSend;

      if (!activeConvId) {
        const uid = user ? Number(user.id || user.userId || 1) : 1;
        const startRes = await fetch(`${CHAT_API_BASE}/api/v1/chat/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: uid,
            chart_id: primaryChart?.id || null,
            language: "vi",
          }),
        });
        const startData = await startRes.json();
        if (startData.success || startData.conversation_id) {
          activeConvId = startData.conversation_id || startData.conversationId;
          setChatConversationId(activeConvId);
        }

        // Attach drawn cards context if not already included in prompt
        if (!textToSend.includes("[BOI BAI TAY]")) {
          const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];
          const cardsText = predeterminedCardsRef.current
            .map((c, idx) => {
              const positionName =
                serverResult?.card_details?.find((d: any) => d.position_index === idx)?.position_name ||
                activeConfig.labels[idx];
              return `${positionName.toUpperCase()}: ${c.name}`;
            })
            .join("; ");
          const chartContext = getTuViContext(primaryChart);
          finalMessage = `[BOI BAI TAY]\nQuẻ: ${
            VIETNAMESE_MAP[serverResult?.spread_name] || serverResult?.spread_name || activeConfig.name
          } (${predeterminedCardsRef.current.length} lá)\nBài gieo được: ${cardsText}\n\n${chartContext}Câu hỏi của người dùng: ${textToSend}`;
        }
      }

      const res = await fetch(`${CHAT_API_BASE}/api/v1/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: activeConvId,
          message: finalMessage,
          context: "folk_cards",
          language: "vi",
        }),
      });
      const data = await res.json();
      if (data.success && data.answer && !data.answer.includes("Xin lỗi, ta gặp trở ngại")) {
        // Parse suggested questions
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
        const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];
        const cardSummaries = selectedCards
          .map((c, idx) => {
            const rawPos = serverResult?.card_details?.find((d: any) => d.position_index === idx)?.position_name || activeConfig.labels[idx];
            const posLabel = formatVietnameseText(rawPos);
            const cDetail = CARD_VI_DETAILS[c.id];
            return `• **${posLabel} — ${cDetail?.name || c.name}**: ${cDetail?.full || c.meaning || "Mang thông điệp chuyển dịch năng lượng quan trọng."}`;
          })
          .join("\n");
        const fallbackReading = `🎴 **Luận Giải Huyền Cơ (${activeConfig.name})**\n\nXoay quanh vấn đề bạn đang trăn trở:\n\n${cardSummaries}\n\n**Lời khuyên từ Cố Vấn:** Tổ hợp bài cho thấy vận trình của bạn có điểm sáng về nội lực và cơ hội chuyển mình. Hãy giữ sự điềm tĩnh, ưu tiên các quyết định có kế hoạch rõ ràng và lắng nghe trực giác nhạy bén của bản thân.`;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: fallbackReading,
            suggestions: [
              "Phương diện tài chính sắp tới cần lưu ý gì?",
              "Làm sao để hóa giải các trở ngại trong quẻ này?",
              "Thời điểm nào thuận lợi nhất để hành động?",
            ],
          },
        ]);
      }
    } catch (e) {
      const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];
      const cardSummaries = selectedCards
        .map((c, idx) => {
          const rawPos = serverResult?.card_details?.find((d: any) => d.position_index === idx)?.position_name || activeConfig.labels[idx];
          const posLabel = formatVietnameseText(rawPos);
          const cDetail = CARD_VI_DETAILS[c.id];
          return `• **${posLabel} — ${cDetail?.name || c.name}**: ${cDetail?.full || c.meaning || ""}`;
        })
        .join("\n");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `🎴 **Luận Giải Chi Tiết Quẻ Bài**\n\n${cardSummaries}\n\n**Tổng kết:** Hãy giữ tâm thế chủ động và vững vàng để đón nhận các cơ hội đang mở ra.`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleChatSpecificCard = (cardOrDetail: any, fallbackCard?: any, idx?: number) => {
    setMobileTab("chat");
    const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];
    const cardId = cardOrDetail?.card_id || cardOrDetail?.id || fallbackCard?.id || "";
    const resolvedName =
      CARD_VI_DETAILS[cardId]?.name ||
      cardOrDetail?.card_name ||
      cardOrDetail?.name ||
      fallbackCard?.name ||
      "Lá bài";
    const rawPos =
      cardOrDetail?.position_name ||
      (typeof idx === "number" ? activeConfig.labels[idx] : "trong quẻ");
    const resolvedPos = formatVietnameseText(rawPos);
    const prompt = `[BOI BAI TAY]
Lá bài: ${resolvedName} ở vị trí ${resolvedPos}.
Yêu cầu: Xin Cố Vấn giải mã sâu sắc hơn sự ảnh hưởng của lá bài ${resolvedName} tại vị trí ${resolvedPos} đối với vận thế sắp tới của tôi.`;
    handleSendMessage(prompt);
  };

  const handleReset = () => {
    setCounter(0);
    setSelectedCards([]);
    updatePredeterminedCards([]);
    setServerResult(null);
    setShowModal(false);
    setIsGameActive(true);
    updateSelectedSpread(null);
    setChatConversationId(null);
    setMessages([
      {
        role: "assistant",
        text: "Chào bạn, ta là bậc thầy giải mã thẻ bài tây. Bạn vừa gieo được một quẻ bài chứa đầy mật mã năng lượng. Hãy đặt câu hỏi của bạn để cùng ta tháo gỡ nhé.",
      }
    ]);
    // Important: we only reset selected cards and result if we really want a "New reading"
    // To go back to Spread Selection, we call updateSelectedSpread(null)
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (!isMounted) return null;

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#07060B] text-[#F5EFE6] flex flex-col font-sans relative">
        <HuyenCoHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
          <div className="max-w-md w-full hc-card p-8 rounded-3xl shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E8C96A]">
              <FolkCardsIcon className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold uppercase text-[#E8C96A] tracking-widest mb-3 font-serif">
              Yêu Cầu Đăng Nhập
            </h2>
            <p className="text-[#9E9482] text-sm leading-6 mb-8 font-sans">
              Cổng Huyền Cơ AI yêu cầu bạn đăng nhập để gieo quẻ Bài Tây 32 Lá truyền thống, lưu giữ kết quả và tham vấn trực tiếp với Cố Vấn Mệnh Lý AI.
            </p>
            <Link
              href="/huyen-co?redirect=/huyen-co/boibai"
              className="inline-block px-8 py-3.5 hc-gold-btn font-bold uppercase text-xs tracking-wider rounded-full font-sans"
            >
              Về Trang Chủ Đăng Nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Selection Screen
  if (selectedSpread === null) {
    return (
      <div className="min-h-screen bg-[#07060B] text-[#F5EFE6] flex flex-col relative font-sans">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_#07060B_65%)] z-0 pointer-events-none" />
        <HuyenCoHeader user={user} subtitle="Bói Bài Tây Dân Gian 32 Lá" />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-5xl w-full mx-auto">
          <header className="text-center mb-10">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#E8C96A]">
              <FolkCardsIcon className="w-8 h-8" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5B386] font-semibold block mb-2">
              Huyền Thuật Bài Tây 32 Lá • Tương Tác Cử Chỉ Tay AI
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold uppercase hc-gold-gradient-text tracking-[0.12em] mb-2 font-serif">
              Gieo Quẻ Bài Tây Truyền Thống
            </h1>
            <p className="text-[#9E9482] text-xs sm:text-sm max-w-xl mx-auto">
              Tĩnh tâm nghĩ về vấn đề bạn đang trăn trở và chọn phương thức trải bài phù hợp bên dưới
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
            {Object.values(SPREADS).map((item) => (
              <button
                key={item.id}
                onClick={() => updateSelectedSpread(item.id)}
                className="flex flex-col text-left p-6 rounded-2xl hc-card hc-card-hover transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/35 flex items-center justify-center text-[#E8C96A] group-hover:scale-105 transition-transform">
                    <FolkCardsIcon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-[#D4AF37]/15 text-[#E8C96A] text-[10px] font-sans font-bold uppercase tracking-wider rounded-full border border-[#D4AF37]/30">
                    {item.count} Lá bài
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5EFE6] mb-1 group-hover:text-[#E8C96A] transition-colors font-serif">
                  {item.name}
                </h3>
                <span className="text-[11px] text-[#C5B386] font-sans font-semibold uppercase tracking-wider mb-3">
                  {item.sub}
                </span>
                <div className="h-[1px] w-full bg-[#D4AF37]/15 mb-3" />
                <p className="text-[#9E9482] text-xs leading-relaxed mb-5 flex-1 font-sans">
                  {item.desc}
                </p>
                <span className="text-xs font-bold text-[#E8C96A] uppercase tracking-wider inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  Bắt đầu rút bài →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeConfig = SPREADS[selectedSpread];

  return (
    <div className="w-screen h-[100dvh] overflow-hidden bg-[#050505] text-white relative font-serif">
      <video
        ref={videoRef}
        id="input-video"
        playsInline
        autoPlay
        muted
        className={`fixed top-6 right-6 w-28 sm:w-36 aspect-[3/4] object-cover rounded-2xl border-[3px] border-[#d4af37]/50 shadow-[0_0_20px_rgba(212,175,55,0.4)] z-[40] transition-opacity duration-300 ${isMirrored ? "scale-x-[-1]" : ""} ${showModal ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      />
      <canvas
        ref={pipCanvasRef}
        className={`fixed top-6 right-6 w-28 sm:w-36 aspect-[3/4] object-cover rounded-2xl z-[41] pointer-events-none transition-opacity duration-300 ${isMirrored ? "scale-x-[-1]" : ""} ${showModal ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      />

      {/* WebGL Canvas container */}
      <div ref={containerRef} className="w-full h-full absolute top-0 left-0 z-10" />

      {/* Virtual Cursor */}
      <div
        ref={cursorRef}
        id="virtual-cursor"
        className="absolute w-[30px] h-[30px] border-2 border-white/90 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 hidden transition-[transform] duration-75 shadow-[0_0_10px_rgba(255,255,255,0.6)]"
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
        <header className="flex justify-between items-start w-full gap-4 relative z-30">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={() => updateSelectedSpread(null)}
              className="px-4 py-2 bg-black/40 hover:bg-black/60 border border-white/20 rounded-full text-xs tracking-wider uppercase font-sans font-bold flex items-center gap-2 backdrop-blur-md transition-colors"
            >
              <span>←</span> Chọn Quẻ Khác
            </button>
            <button
              onClick={() => setIsMirrored(!isMirrored)}
              className="px-4 py-1.5 bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-full text-[10px] tracking-wider uppercase font-sans font-bold flex items-center gap-2 backdrop-blur-md transition-colors w-max"
            >
              <span>🔄</span> Đổi Lật Camera
            </button>
          </div>
          
          {/* We push the counter to the left or keep it on right but below webcam? 
              Webcam is top right, so let's put counter in the top center or left. */}
          <div className="px-5 py-1.5 border border-[#d4af37]/50 rounded-full font-sans font-bold text-sm sm:text-base bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.3)] text-[#d4af37] uppercase tracking-wider absolute left-1/2 -translate-x-1/2 pointer-events-none">
            {activeConfig.name}: {counter} / {activeConfig.count}
          </div>
        </header>

        {/* Bottom Drawn Cards Preview */}
        {!showModal && (
          <div className="w-full bottom-8 absolute left-0 z-20 pointer-events-auto flex flex-col items-center">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <div className="text-xs sm:text-sm font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] uppercase tracking-[2px] text-center">
                {guideText}
              </div>
              {isGameActive && counter < activeConfig.count && (
                <button
                  onClick={handleQuickPickNextCard}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-sans font-black text-xs uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  ✨ Rút Lá Thứ {counter + 1}/{activeConfig.count}
                </button>
              )}
            </div>
            
            <div className="flex gap-4 overflow-x-auto max-w-full px-8 pb-4">
              {selectedCards.map((card, idx) => (
                <div key={idx} className="flex flex-col items-center w-16 sm:w-20 flex-shrink-0">
                  <img
                    src={card.image || card.url || `/static/cards/${card.id}.png`}
                    alt={card.name}
                    className="w-full aspect-[5/8] object-contain rounded-md border border-white/40 shadow-lg bg-white"
                  />
                  <span className="text-[10px] text-slate-300 font-sans uppercase font-bold tracking-wider mt-1 text-center truncate w-full">
                    {activeConfig.labels[idx]}
                  </span>
                </div>
              ))}
              {[...Array(Math.max(0, activeConfig.count - selectedCards.length))].map((_, i) => (
                <div key={`placeholder-${i}`} className="w-16 sm:w-20 aspect-[5/8] rounded-md border border-white/20 border-dashed bg-black/40 flex-shrink-0" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay (Cards + 3D + Hand Gesture AI Model Warmup) */}
      {(isLoadingCards || !allScriptsLoaded || isInitializingHandModel) && (
        <div className="absolute inset-0 bg-[#07060B]/95 backdrop-blur-md z-50 flex flex-col justify-center items-center text-center p-6">
          <div className="max-w-md w-full hc-card rounded-3xl p-8 border border-[#D4AF37]/35 shadow-[0_0_50px_rgba(212,175,55,0.18)] flex flex-col items-center">
            <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 border-t-[#E8C96A] animate-spin" />
              <div className="text-[#E8C96A]">
                <FolkCardsIcon className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-serif font-bold uppercase tracking-widest hc-gold-gradient-text mb-2">
              {isLoadingCards
                ? "Đang Thiết Lập Quẻ Bài Thiên Cơ..."
                : !allScriptsLoaded
                ? "Đang Kết Nối Không Gian 3D..."
                : "Đang Nạp Mô Hình Nhận Diện Cử Chỉ Bàn Tay AI..."}
            </h3>
            <p className="text-xs text-[#C5B386] leading-relaxed mb-5 font-sans">
              Hệ thống đang đồng bộ 32 lá bài cổ điển và kích hoạt cảm biến nhận diện cử chỉ tay qua Camera để quá trình rút bài mượt mà nhất.
            </p>
            <div className="w-full h-1.5 bg-[#07060B] rounded-full overflow-hidden border border-[#D4AF37]/20 mb-4">
              <div className="h-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3C4] to-[#D4AF37] w-3/4 animate-pulse rounded-full" />
            </div>
            {isInitializingHandModel && (
              <button
                type="button"
                onClick={() => setIsInitializingHandModel(false)}
                className="text-[11px] text-[#9E9482] hover:text-[#E8C96A] underline font-sans cursor-pointer"
              >
                Vào bàn bài ngay (Chạm trực tiếp vào lá bài) →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interpretation Loading Overlay */}
      {isInterpreting && (
        <div className="absolute inset-0 bg-[#07060B]/90 backdrop-blur-md z-40 flex flex-col justify-center items-center text-center p-6">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/30 border-t-[#E8C96A] animate-spin" />
            <div className="text-[#E8C96A]">
              <FolkCardsIcon className="w-8 h-8" />
            </div>
          </div>
          <div className="text-sm font-bold text-[#E8C96A] tracking-[0.2em] uppercase font-serif">
            Đang Giải Mã Mật Tông Bài Tây 32 Lá...
          </div>
        </div>
      )}

      {/* Result drawer & Chat modal */}
      {showModal && serverResult && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="w-full max-w-6xl h-full md:h-[90vh] max-h-[900px] bg-[#0c061a] border border-[#d4af37]/60 rounded-2xl md:rounded-3xl flex flex-col md:flex-row overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.2)] relative">
            
            {/* Header close button / Mobile Tabs */}
            <div className="flex items-center justify-between p-4 md:hidden bg-black/40 border-b border-[#d4af37]/20 flex-shrink-0">
              <div className="flex gap-2">
                <button 
                  onClick={() => setMobileTab("result")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg font-sans uppercase tracking-wider transition-colors ${mobileTab === 'result' ? 'bg-[#d4af37] text-black' : 'border border-[#d4af37]/30 text-[#d4af37]'}`}
                >
                  Kết Quả
                </button>
                <button 
                  onClick={() => setMobileTab("chat")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg font-sans uppercase tracking-wider transition-colors ${mobileTab === 'chat' ? 'bg-[#d4af37] text-black' : 'border border-[#d4af37]/30 text-[#d4af37]'}`}
                >
                  Trò Chuyện AI
                </button>
              </div>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white p-2">✕</button>
            </div>
            <button onClick={handleCloseModal} className="hidden md:flex absolute top-4 right-4 z-50 text-slate-400 hover:text-white bg-black/40 w-8 h-8 items-center justify-center rounded-full border border-white/20">✕</button>

            {/* Left Panel: Result analysis */}
            <div className={`w-full md:w-1/2 border-r border-indigo-500/10 flex-col h-full overflow-hidden ${mobileTab === 'result' ? 'flex' : 'hidden md:flex'}`}>
              <div className="p-6 border-b border-indigo-500/10 text-center">
                <h2 className="text-lg font-black uppercase text-[#d4af37] tracking-[2px] mb-1 font-serif">
                  Luận Giải {VIETNAMESE_MAP[serverResult.spread_name] || serverResult.spread_name || activeConfig.name}
                </h2>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase font-sans">
                  Chiêm nghiệm quẻ RAG cổ thư
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Score & Assessment */}
                {serverResult.score && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-[#d4af37]/30">
                    <span className="text-sm font-bold text-slate-300 font-sans uppercase">Điểm Số Bản Mệnh:</span>
                    <div className="text-right">
                      <div className="text-lg font-black text-[#d4af37]">{serverResult.score.score}/10</div>
                      <div className="text-xs text-white/70 mt-0.5">{VIETNAMESE_MAP[serverResult.score.assessment] || serverResult.score.assessment}</div>
                    </div>
                  </div>
                )}

                {/* Combos list */}
                {serverResult.combinations && serverResult.combinations.length > 0 && (
                  <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                    <h3 className="text-xs font-black text-emerald-400 tracking-wider uppercase mb-3 flex items-center gap-1.5 font-sans">
                      <span>✨</span> Tổ Hợp Đặc Biệt Phát Hiện
                    </h3>
                    <div className="space-y-4">
                      {serverResult.combinations.map((combo: any, idx: number) => (
                        <div key={idx} className={idx > 0 ? "border-t border-emerald-500/10 pt-3" : ""}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-white font-serif">{formatVietnameseText(combo.name || combo.key)}</span>
                            <span className="text-xs text-emerald-400 font-bold">{combo.score >= 0 ? `+${combo.score}đ` : `${combo.score}đ`}</span>
                          </div>
                          <p className="text-xs text-emerald-200/80 leading-relaxed font-sans">{formatVietnameseText(combo.meaning)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual cards reading list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-3 font-sans">
                    Chi Tiết Từng Lá Bài
                  </h3>
                  {selectedCards.map((card, idx) => {
                    const detail = serverResult.card_details?.find((d: any) => d.position_index === idx);
                    const isPositive = detail?.is_positive !== false && !String(card.id || "").endsWith("-S");
                    const viDetail = CARD_VI_DETAILS[card.id] || CARD_VI_DETAILS[detail?.card_id];
                    const displayCardName = viDetail?.name || card.name || detail?.card_name || card.id;
                    const displayPositionName = formatVietnameseText(detail?.position_name || activeConfig.labels[idx]);
                    const displayMeaning =
                      viDetail?.full ||
                      detail?.card_meaning?.full ||
                      card.meaning ||
                      detail?.position_meaning ||
                      "Lá bài mang thông điệp năng lượng quan trọng tại vị trí này.";
                    return (
                      <div key={idx} className={`p-4 rounded-xl bg-white/5 border-l-4 flex gap-4 ${isPositive ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                        <img
                          src={card.image || card.url || `/static/cards/${card.id}.png`}
                          alt={displayCardName}
                          className="w-14 aspect-[5/8] object-contain rounded border border-white/20 bg-white flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <div>
                              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-amber-300 font-bold uppercase mr-2 font-sans">
                                {displayPositionName}
                              </span>
                              <span className="text-sm font-bold text-white font-serif">{displayCardName}</span>
                            </div>
                            <button
                              onClick={() => handleChatSpecificCard(detail || card, card, idx)}
                              className="px-2 py-0.5 border border-[#d4af37]/40 text-[9px] text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-black uppercase rounded transition-colors font-sans cursor-pointer"
                            >
                              Luận lá này
                            </button>
                          </div>
                          {viDetail?.short && (
                            <p className="text-[11px] text-[#d4af37] font-semibold mb-1 font-sans">
                              ✦ {viDetail.short}
                            </p>
                          )}
                          <p className="text-xs text-slate-200 leading-relaxed font-sans">{displayMeaning}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RAG Folk Readings context */}
                {serverResult.rag_luan_giai && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-[#120F1D]/95 border border-[#D4AF37]/35 shadow-inner">
                    <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[#D4AF37]/20">
                      <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#E8C96A] shrink-0">
                        <ScrollHistoryIcon size={18} />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-serif font-bold text-[#E8C96A] tracking-wider uppercase">
                          Khai Vấn Tri Thức Dân Gian
                        </h3>
                        <p className="text-[10px] text-[#9E9482] font-sans">
                          Tổng hợp đa chiều từ cổ thư Bài Tây 32 Lá
                        </p>
                      </div>
                    </div>
                    <div className="font-sans">
                      {renderRichMarkdown(serverResult.rag_luan_giai)}
                    </div>
                  </div>
                )}
              </div>

              {/* Reset/Exit buttons */}
              <div className="p-4 border-t border-indigo-500/10 bg-black/20 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => { handleCloseModal(); handleReset(); }}
                  className="flex-1 py-3 bg-[#d4af37] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all font-sans"
                >
                  Gieo Quẻ Mới
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-3 border border-white/20 hover:border-white/50 text-slate-300 text-xs uppercase tracking-widest rounded-xl transition-all font-sans"
                >
                  Đóng Bảng
                </button>
              </div>
            </div>

            {/* Right Panel: Chat Consultation */}
            <div className={`w-full md:w-1/2 flex-col h-full overflow-hidden ${mobileTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
              <div className="p-6 border-b border-indigo-500/10 flex justify-between items-center bg-black/20">
                <div>
                  <h3 className="text-sm font-black text-white tracking-widest uppercase font-serif">
                    Tham Vấn Cố Vấn Mệnh Lý AI
                  </h3>
                  <p className="text-[9px] text-[#d4af37] tracking-wider uppercase font-sans mt-0.5">
                    Hỗ trợ phân tích chuyên sâu cùng tinh bàn của bạn
                  </p>
                </div>
                {!chatConversationId && (
                  <button
                    onClick={handleStartAIConsultation}
                    disabled={isSending}
                    className="px-4 py-2 bg-[#d4af37] text-black hover:bg-yellow-400 rounded-full font-black text-[10px] tracking-wider uppercase transition-all shadow-md font-sans"
                  >
                    Bắt đầu kết nối AI
                  </button>
                )}
              </div>

              {/* Chat screen */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col bg-slate-950/20">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border ${
                      msg.role === "user"
                        ? "bg-slate-800 text-white self-end border-slate-700 rounded-br-none font-sans"
                        : "bg-[#160c2b] text-indigo-100 self-start border-[#d4af37]/30 rounded-bl-none font-sans"
                    }`}
                  >
                    <div className="font-sans">
                      {renderRichMarkdown(msg.text)}
                    </div>
                    
                    {/* Suggestions buttons */}
                    {msg.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-indigo-500/10">
                        {msg.suggestions.map((sug, sIndex) => (
                          <button
                            key={sIndex}
                            onClick={() => handleSendMessage(sug)}
                            disabled={isSending}
                            className="px-2.5 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] rounded-full text-[10px] hover:bg-[#d4af37] hover:text-black font-sans font-semibold transition-all disabled:opacity-50"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="bg-[#160c2b] border border-[#d4af37]/20 text-indigo-300 self-start rounded-2xl p-4 text-xs font-sans animate-pulse">
                    🔮 Đang gieo quẻ luận giải...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 sm:p-4 border-t border-indigo-500/10 bg-black/40 flex gap-2 sm:gap-3 items-center flex-shrink-0">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Nhập câu hỏi chiêm nghiệm của bạn..."
                  disabled={isSending}
                  className="flex-1 px-4 py-3 bg-[#110724] border border-indigo-500/30 rounded-full text-base sm:text-sm outline-none text-white focus:border-[#d4af37] transition-all disabled:opacity-50 font-sans"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isSending}
                  className="px-5 py-3 bg-[#d4af37] text-black font-black rounded-full text-xs hover:bg-yellow-400 transition-all font-sans uppercase tracking-wider disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  Gửi
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Chart Selector Modal */}
      {isSelectorVisible && (
        <div className="fixed inset-0 bg-black/85 z-[120] flex items-center justify-center p-4">
          <div className="bg-[#1e293b] w-full max-w-md rounded-3xl p-6 border border-[#d4af37]/30 shadow-2xl backdrop-blur-sm">
            <h3 className="text-base font-black text-[#d4af37] text-center tracking-wider mb-2 font-serif uppercase">
              Chọn Người Chiêm Nghiệm
            </h3>
            <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed font-sans">
              Thông tin cá nhân giúp phân tích xu hướng năng lượng chính xác hơn.
            </p>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {/* Primary User Chart */}
              {primaryChart && (
                <button 
                  onClick={() => onConfirmChat(primaryChart)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/40 text-left transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-lg">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-[#d4af37] font-sans uppercase">Bản Thân (Chính Chủ)</div>
                    <div className="text-sm font-bold text-white font-serif truncate mt-0.5">
                      {primaryChart.ownerName || primaryChart.chartData?.extra?.name || primaryChart.extra?.name || user?.firstName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {primaryChart.chartData?.extra?.solar_date || primaryChart.extra?.solar_date || (primaryChart.birthDate ? new Date(primaryChart.birthDate).toLocaleDateString("vi-VN") : "")}
                    </div>
                  </div>
                </button>
              )}

              {/* Guest profiles */}
              {savedCharts.filter(c => !c.isPrimary).map((chart) => (
                <button 
                  key={chart.id}
                  onClick={() => onConfirmChat(chart)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                    👥
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-400 font-sans uppercase">Xem Hộ</div>
                    <div className="text-sm font-bold text-white font-serif truncate mt-0.5">
                      {chart.ownerName || chart.chartData?.extra?.name || chart.extra?.name || chart.request?.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {chart.chartData?.extra?.solar_date || chart.extra?.solar_date || (chart.birthDate ? new Date(chart.birthDate).toLocaleDateString("vi-VN") : "")}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => onConfirmChat(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-300 font-sans uppercase py-2"
              >
                Gieo Quẻ Ẩn Danh
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        #virtual-cursor.pinching {
          background: #ffffff;
          width: 15px !important;
          height: 15px !important;
          border: none !important;
          box-shadow: 0 0 20px #ffffff, 0 0 40px #ffffff;
          transform: translate(-50%, -50%) scale(1.2) !important;
        }
      `}</style>
    </div>
  );
}
