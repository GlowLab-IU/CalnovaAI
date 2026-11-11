"use client";

import React, { useState } from "react";
import Link from "next/link";
import MysticalPolygon, { getFeatureIcon } from "./MysticalPolygon";
import HuyenCoHeader from "../../components/HuyenCoHeader";
import {
  FacePhysiognomyIcon,
  AICoachOracleIcon,
  SparkleIcon,
  ShareSealIcon,
} from "../../components/HuyenCoIcons";

interface FacialAnalysisData {
  id: number;
  userId: number;
  resultText: string;
  faceShape: string;
  harmonyScore: number;
  probabilities: Record<string, number> | any;
  harmonyDetails: Record<string, any> | any;
  metrics: Record<string, any> | any;
  annotatedImage: string;
  processedAt: string;
  createAt: string;
  physiognomyResult?: any;
}

interface FaceResultClientProps {
  analysis: FacialAnalysisData;
  refCode?: string;
  isScanningPage?: boolean;
  saveStatus?: "unsaved" | "saving" | "saved" | "error";
  onSave?: () => void;
  onShare?: () => void;
  onReset?: () => void;
  token?: string | null;
}

interface ClassicalPartDetail {
  palaceName: string;
  palaceRole: string;
  defaultDesc: string;
  characterReading: string;
  destinyReading: string;
  classicalQuote: string;
  cultivationAdvice: string;
}

const CLASSICAL_PART_ENRICHMENT: Record<string, ClassicalPartDetail> = {
  forehead: {
    palaceName: "Cung Quan Lộc & Thiên Di",
    palaceRole: "Thượng Đình • Chủ Tiền Vận (15 – 30 tuổi) & Trí Tuệ Thiên Phú",
    defaultDesc: "Thượng Đình (Trán) sáng sủa, bề ngang cân đối với trục Ấn Đường và Thiên Đình.",
    characterReading:
      "Thượng Đình đại diện cho thiên tư, tầm nhìn chiến lược và khả năng lĩnh hội tri thức. Cấu trúc trán hài hòa phản ánh tư duy logic sắc bén, óc quan sát tinh tế, giàu sáng kiến và có khả năng hoạch định mục tiêu đường dài.",
    destinyReading:
      "Trong phép xem Thập Nhị Cung, chính giữa trán là Cung Quan Lộc, hai bên tiếp giáp Thiên Thương và Dịch Mã. Vầng trán quang đãng báo hiệu giai đoạn Tiền vận sớm định hình chí hướng, thuận lợi trong học tập, thi cử, mở rộng giao thương và dễ gặp quý nhân nâng đỡ trên bước đường lập nghiệp.",
    classicalQuote: "« Thiên đình cao rộng, khí sắc thanh nhuận thì công danh sớm đạt, quý khí tự nhiên. » — Ma Y Thần Tướng",
    cultivationAdvice:
      "Giữ vùng Ấn Đường (giữa hai đầu lông mày) luôn thư thái, sáng sủa; tránh thói quen nhíu mày suy tư quá độ để tụ hội dương khí và đón nhận vận hội tốt.",
  },
  eyebrows: {
    palaceName: "Bảo Thọ Quan • Cung Huynh Đệ",
    palaceRole: "Chủ Khí Phách, Tình Nghĩa, Bằng Hữu & Sức Sống",
    defaultDesc: "Bảo Thọ Quan (Chân mày) có đường nét rõ ràng, ôm thuận theo vòng cung xương mi.",
    characterReading:
      "Trong Ngũ Quan, lông mày là Bảo Thọ Quan, phản ánh khí chất can trường, sự điềm tĩnh và đạo đối nhân xử thế. Thế mày cân xứng biểu thị người trọng chữ tín, giàu nghĩa khí, hành xử phân minh và biết cương nhu đúng lúc.",
    destinyReading:
      "Hai hàng chân mày gắn liền với Cung Huynh Đệ và Giao Hữu, chủ về mối liên kết với anh chị em, đồng nghiệp và đối tác. Đường mày thuận chiều báo hiệu nhân duyên tốt lành, khi khởi sự đại cuộc luôn có cộng sự trung thành, bạn hiền tri kỷ kề vai sát cánh.",
    classicalQuote: "« Mi thanh mục tú, sợi mày thuận mọc thì nghĩa trọng tình thâm, bách sự đắc nhân hòa. » — Thần Tướng Toàn Biên",
    cultivationAdvice:
      "Luyện tâm bình hòa, tiết chế nóng nảy và giữ chữ tín trong mọi cam kết sẽ giúp củng cố quý nhân vận và hóa giải thị phi.",
  },
  eyes: {
    palaceName: "Giám Sát Quan • Cung Điền Trạch & Phu Thê",
    palaceRole: "Chủ Thần Khí, Nội Lực, Trí Tuệ & Hạnh Phúc Gia Đạo",
    defaultDesc: "Giám Sát Quan (Đôi mắt) có thần khí, ánh nhìn tập trung và cân xứng hai bên.",
    characterReading:
      "Cổ nhân dạy: «Một điểm thần quang ở đôi mắt quyết định bảy phần quý tiện của cả khuôn mặt». Đôi mắt có thần phản ánh nội lực dồi dào, trực giác nhạy bén, tâm tính quang minh chính trực và ý chí kiên cường trước thử thách.",
    destinyReading:
      "Khoảng giữa mi và mắt là Cung Điền Trạch (tài sản, cơ ngơi), đuôi mắt là Cung Phu Thê (hôn nhân, tình cảm). Nhãn thần sáng và định tĩnh giúp đương số nhạy bén nắm bắt thời cơ sự nghiệp, tích lũy điền sản bền vững và gìn giữ đời sống tình cảm êm ấm, hòa hợp.",
    classicalQuote: "« Nhãn thần tàng chính khí, định tĩnh bất loạn tắc phú quý miên trường. » — Ma Y Thần Tướng",
    cultivationAdvice:
      "Ngủ nghỉ đúng nhịp sinh học, hạn chế căng thẳng thị giác và giữ tâm niệm thiện lành để đôi mắt luôn sáng trong, tụ thần khí.",
  },
  nose: {
    palaceName: "Thẩm Biện Quan • Cung Tài Bạch",
    palaceRole: "Trung Nhạc • Chủ Trung Vận (31 – 50 tuổi), Tài Lộc & Bản Lĩnh",
    defaultDesc: "Thẩm Biện Quan (Sống mũi & Chuẩn đầu) thẳng, cân xứng và hài hòa cùng Lưỡng quyền.",
    characterReading:
      "Mũi là Trung Nhạc (núi Tung Sơn) đứng giữa khuôn mặt, làm trụ cột cho toàn bộ Trung Đình. Dáng mũi vững chãi biểu thị người có chủ kiến độc lập, lòng tự trọng cao, làm việc có nguyên tắc và năng lực quản trị, điều phối xuất sắc.",
    destinyReading:
      "Trong diện tướng học, Chuẩn đầu (chóp mũi) là chính khố của Cung Tài Bạch, hai cánh mũi (Gián Đài – Đình Úy) chủ về khả năng giữ tiền và sinh lời. Sống mũi ngay ngắn, chuẩn đầu đầy đặn báo hiệu dòng tiền hanh thông, đặc biệt giai đoạn Trung vận (31–50 tuổi) dễ lập nên cơ nghiệp vững vàng.",
    classicalQuote: "« Tỵ như huyền đởm, chuẩn đầu phong륭, lưỡng quyền tương xứng tắc tài nguyên quảng tiến. » — Thần Tướng Toàn Biên",
    cultivationAdvice:
      "Kết hợp kỷ luật quản trị tài chính với việc trọng chữ tín trong kinh doanh và chia sẻ phước báu sẽ giúp kho Tài Bạch ngày càng hưng vượng.",
  },
  mouth: {
    palaceName: "Xuất Nạp Quan • Cung Phúc Lộc",
    palaceRole: "Chủ Ngôn Từ, Tín Nghĩa, Phúc Khí & Tài Lộc Ẩm Thực",
    defaultDesc: "Xuất Nạp Quan (Khuôn miệng) cân đối, viền môi rõ nét, khóe miệng hài hòa.",
    characterReading:
      "Miệng là Xuất Nạp Quan — cửa ngõ của ngôn từ, khí độ và phúc họa. Khuôn miệng ngay ngắn, sắc môi hồng nhuận thể hiện người có khẩu đức, giao tiếp đĩnh đạc, lời nói có trọng lượng và giàu lòng nhân ái.",
    destinyReading:
      "Tướng miệng cân xứng chủ về lộc ăn uống dồi dào, đời sống vật chất sung túc và hậu thuẫn vững chắc từ gia đình. Trong sự nghiệp, người có Xuất Nạp Quan tốt thường giỏi đàm phán, thuyết phục, dễ thu phục nhân tâm và giữ được uy tín lâu dài.",
    classicalQuote: "« Khẩu phương nhi chính, thần hồng răng đều, xuất ngôn hữu tín tắc phúc lộc tự lai. » — Ma Y Thần Tướng",
    cultivationAdvice:
      "Giữ thói quen mỉm cười tự nhiên (khóe miệng hướng lên như cánh cung) và cẩn trọng lời nói (ái ngữ, chân ngữ) để bồi đắp phúc đức mỗi ngày.",
  },
  chin: {
    palaceName: "Địa Các • Cung Nô Bộc & Hậu Vận",
    palaceRole: "Hạ Đình • Chủ Hậu Vận (Sau 50 tuổi), Điền Sản & Hậu Thuẫn",
    defaultDesc: "Hạ Đình (Cằm & Địa các) vững chãi, khung hàm đầy đặn nâng đỡ toàn bộ diện mạo.",
    characterReading:
      "Trong quy tắc Ngũ Nhạc, cằm là Bắc Nhạc (Hằng Sơn), đóng vai trò điểm tựa cuối cùng thu giữ toàn bộ khí lực từ Thượng Đình và Trung Đình chảy xuống. Cằm vững chãi biểu thị tính kiên trì, làm việc có thủy có chung, trầm ổn và bao dung.",
    destinyReading:
      "Địa Các đại diện cho bất động sản, khả năng dẫn dắt đội ngũ/hậu bối (Cung Nô Bộc) và phúc cảnh tuổi già. Cấu trúc Hạ Đình đầy đặn báo hiệu Hậu vận sau tuổi 50 an nhàn, điền sản tích lũy được bảo toàn bền vững, gia đạo sum vầy ấm êm.",
    classicalQuote: "« Địa các phương viên nhi phong mãn, vãn niên vinh hiển, tử tôn hiếu thuận. » — Thần Tướng Toàn Biên",
    cultivationAdvice:
      "Sống rộng lượng, dìu dắt thế hệ trẻ và kiên trì tích lũy cả tri thức lẫn phúc đức chính là nền móng vững chắc nhất cho Hậu vận viên mãn.",
  },
};

export default function FaceResultClient({
  analysis,
  refCode = "",
  isScanningPage = false,
  saveStatus = "unsaved",
  onSave,
  onShare,
  onReset,
  token = null,
}: FaceResultClientProps) {
  const [activeTabId, setActiveTabId] = useState<string>("forehead");

  const getFaceShapeNameVi = (shape: string) => {
    const shapes: Record<string, string> = {
      oval: "Khuôn Mặt Trái Xoan (Oval)",
      round: "Khuôn Mặt Viên Tự — Tròn (Round)",
      square: "Khuôn Mặt Chữ Điền (Square)",
      heart: "Khuôn Mặt Trái Tim (Heart)",
      oblong: "Khuôn Mặt Dài (Oblong)",
      diamond: "Khuôn Mặt Kim Cương (Diamond)",
      triangle: "Khuôn Mặt Tam Giác (Triangle)",
    };
    return shapes[(shape || "").toLowerCase()] || shape || "Cân Đối";
  };

  const extractFeatures = (result: any) => {
    const physiognomyResult = result.physiognomyResult || {};
    const parts = physiognomyResult?.parts || {};
    const summary = physiognomyResult?.summary || result.resultText || "";

    const getBodyPartContent = (
      keys: string[],
      partKeys: string[],
      keywords: string[]
    ): { content: string; description: string } => {
      for (const k of keys) {
        const d = physiognomyResult[k];
        if (d && typeof d === "object" && !Array.isArray(d)) {
          const content = d.meaning || d.description || "";
          if (content) return { content, description: d.description || "" };
        }
        if (typeof d === "string" && d) return { content: d, description: "" };
      }

      for (const pk of partKeys) {
        const arr = parts[pk];
        if (arr && Array.isArray(arr) && arr.length > 0) {
          const content = arr
            .map((x: any) => x.meaning || x.description || "")
            .filter(Boolean)
            .join("\n\n");
          if (content) return { content, description: "" };
        }
        const obj = physiognomyResult[pk];
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          const content = obj.meaning || obj.description || "";
          if (content) return { content, description: obj.description || "" };
        }
      }

      if (summary) {
        const sentences = summary
          .split(/(?<=[.!?。])\s+/)
          .filter((s: string) => s.trim().length > 15);
        const matched = sentences.filter((s: string) =>
          keywords.some((kw) => s.toLowerCase().includes(kw.toLowerCase()))
        );
        if (matched.length > 0) return { content: matched.join(" "), description: "" };
      }

      return { content: "", description: "" };
    };

    const BODY_PARTS = [
      {
        id: "forehead",
        rawKey: "forehead",
        title: "Trán (Thượng Đình)",
        shortLabel: "Trán",
        keys: ["forehead"],
        partKeys: ["forehead"],
        keywords: ["trán", "thiên đình", "thượng đình", "forehead", "quan lộc", "đỉnh đầu"],
      },
      {
        id: "eyebrows",
        rawKey: "eyebrows",
        title: "Lông Mày (Bảo Thọ)",
        shortLabel: "Lông Mày",
        keys: ["eyebrow", "eyebrows"],
        partKeys: ["eyebrows"],
        keywords: ["lông mày", "mi", "huynh đệ", "eyebrow"],
      },
      {
        id: "eyes",
        rawKey: "eyes",
        title: "Đôi Mắt (Giám Sát)",
        shortLabel: "Đôi Mắt",
        keys: ["eye", "eyes"],
        partKeys: ["eyes"],
        keywords: ["mắt", "nhãn", "điền trạch", "eye"],
      },
      {
        id: "nose",
        rawKey: "nose",
        title: "Mũi (Thẩm Biện)",
        shortLabel: "Mũi",
        keys: ["nose"],
        partKeys: ["nose"],
        keywords: ["mũi", "tài bạch", "trung đình", "nose"],
      },
      {
        id: "mouth",
        rawKey: "mouth",
        title: "Miệng (Xuất Nạp)",
        shortLabel: "Miệng",
        keys: ["mouth", "lips"],
        partKeys: ["mouth", "lips"],
        keywords: ["miệng", "môi", "nô bộc", "hạ đình", "mouth", "lip"],
      },
      {
        id: "chin",
        rawKey: "chin",
        title: "Cằm (Địa Các)",
        shortLabel: "Cằm",
        keys: ["chin", "jaw"],
        partKeys: ["chin", "jaw", "lower_face"],
        keywords: ["cằm", "địa các", "hàm", "chin", "jaw"],
      },
    ];

    const list: any[] = [
      {
        id: "intro",
        title: "Tổng Quan Tam Đình",
        shortLabel: "Tổng Quan",
        content: summary,
        rawKey: "intro",
        palaceName: "Tổng Hợp Khí Sắc & Tam Đình",
        palaceRole: "Toàn Cảnh Cốt Cách • Tiền Vận – Trung Vận – Hậu Vận",
      },
    ];

    BODY_PARTS.forEach(({ id, rawKey, title, shortLabel, keys, partKeys, keywords }) => {
      const { content, description } = getBodyPartContent(keys, partKeys, keywords);
      const classical = CLASSICAL_PART_ENRICHMENT[id];
      list.push({
        id,
        rawKey,
        title,
        shortLabel,
        content: content || "",
        description: description || classical?.defaultDesc || "",
        classical,
        palaceName: classical?.palaceName || "",
        palaceRole: classical?.palaceRole || "",
      });
    });

    return list;
  };

  const features = extractFeatures(analysis);
  const activeIndex = Math.max(
    0,
    features.findIndex((f) => f.id === activeTabId)
  );
  const activeFeature = features[activeIndex] || features[0];
  const physiognomyResult = analysis.physiognomyResult || {};
  const shapeLabel = physiognomyResult?.face_shape?.shape
    ? getFaceShapeNameVi(physiognomyResult.face_shape.shape)
    : getFaceShapeNameVi(analysis.faceShape);

  const handleStepFeature = (delta: number) => {
    const nextIdx = (activeIndex + delta + features.length) % features.length;
    setActiveTabId(features[nextIdx].id);
  };

  const aiConsultPrompt = encodeURIComponent(
    `Tôi vừa xem Diện Tướng Học trên Huyền Cơ: Hình tướng ${shapeLabel}, chỉ số hài hòa ${Number(
      analysis.harmonyScore || 80
    ).toFixed(0)}%. Tóm tắt: "${(analysis.resultText || "").slice(
      0,
      240
    )}". Xin Cố vấn phân tích sâu hơn về vận trình Sự nghiệp, Tài lộc và lời khuyên cải vận cho diện tướng của tôi.`
  );

  return (
    <div className="min-h-screen bg-[#07060B] text-[#EFECE6] font-sans pb-24 relative overflow-x-hidden">
      {/* Subtle Oriental Celestial Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70vw] h-[50vw] bg-[#D4AF37]/[0.05] rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#D4AF37_0.75px,transparent_0.75px)] [background-size:48px_48px]" />
      </div>

      {/* Unified Header */}
      <HuyenCoHeader subtitle="Bản Đồ Diện Tướng Học & Nhân Trắc AI" />

      {/* Shared Referral Banner (For external visitors) */}
      {!isScanningPage && (
        <div className="max-w-6xl mx-auto px-4 pt-4 relative z-20">
          <div className="hc-card rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#EFECE6]">
              <SparkleIcon size={16} className="text-[#D4AF37] shrink-0" />
              <span>
                Bạn được chia sẻ bản đồ diện tướng từ bạn bè. Đăng ký ngay để nhận{" "}
                <strong className="text-[#E8C96A]">+20 Tín Chỉ</strong> miễn phí!
              </span>
            </div>
            <Link
              href={`/huyen-co?ref=${refCode}`}
              className="w-full sm:w-auto px-5 py-2 hc-gold-btn font-bold rounded-full text-xs text-center uppercase tracking-wider shrink-0"
            >
              Quét Diện Tướng Ngay
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 pt-7 relative z-10">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-[#120F1D] border border-[#D4AF37]/30 mb-2.5">
            <FacePhysiognomyIcon size={38} />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#D4AF37] mb-1">
            Luận Giải Diện Tướng Học Đông Phương
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
            Bản Đồ Ngũ Quan & Tam Đình
          </h1>
        </div>

        {/* Two Column Layout: Sticky Portrait on Left, Interactive Bagua + Reading Together on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* LEFT COLUMN: Sticky Portrait & Harmony Score */}
          <div className="lg:col-span-5 lg:sticky lg:top-6 hc-card rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3">
              <h2 className="text-xs font-bold uppercase text-[#E8C96A] tracking-[0.18em] flex items-center gap-2">
                <SparkleIcon size={14} />
                <span>Bản Đồ Nhân Trắc Diện Mạo</span>
              </h2>
              <span className="text-[10px] font-semibold text-[#C5B386] bg-[#161124] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/25">
                Ngũ Quan • Tam Đình
              </span>
            </div>

            {/* Portrait Frame with Mystical Đông Phương Huyền Cơ Mandala Backdrop */}
            <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-[0_16px_45px_rgba(0,0,0,0.85)] bg-gradient-to-b from-[#231934] via-[#151022] to-[#0B0813]">
              {/* Sacred Mandala & Golden Glow Backdrop (eliminates plain black background for transparent cutouts) */}
              <div
                className="absolute inset-0 bg-center bg-cover opacity-35 mix-blend-screen pointer-events-none scale-110"
                style={{ backgroundImage: "url('/images/palmbg.png')" }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(232,201,106,0.22)_0%,rgba(42,30,66,0.45)_52%,rgba(11,8,19,0.88)_100%)] pointer-events-none" />

              {/* Decorative Sacred Compass Rings behind portrait */}
              <svg
                viewBox="0 0 300 400"
                className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
              >
                <circle
                  cx="150"
                  cy="175"
                  r="122"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="0.8"
                  strokeDasharray="3,5"
                />
                <circle
                  cx="150"
                  cy="175"
                  r="98"
                  fill="none"
                  stroke="#E8C96A"
                  strokeWidth="0.6"
                  strokeOpacity="0.6"
                />
                {/* Corner Imperial Brackets */}
                <path d="M 14 28 L 14 14 L 28 14" fill="none" stroke="#E8C96A" strokeWidth="1.5" />
                <path d="M 286 28 L 286 14 L 272 14" fill="none" stroke="#E8C96A" strokeWidth="1.5" />
                <path d="M 14 372 L 14 386 L 28 386" fill="none" stroke="#E8C96A" strokeWidth="1.5" />
                <path d="M 286 372 L 286 386 L 272 386" fill="none" stroke="#E8C96A" strokeWidth="1.5" />
              </svg>

              {analysis.annotatedImage ? (
                <img
                  src={
                    analysis.annotatedImage.startsWith("data:") ||
                    analysis.annotatedImage.startsWith("http")
                      ? analysis.annotatedImage
                      : `https://api.calnovaai.com/glowlab${analysis.annotatedImage}`
                  }
                  alt="Bản đồ khuôn mặt"
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_28px_rgba(0,0,0,0.75)]"
                />
              ) : (
                <div className="relative z-10 w-full h-full flex items-center justify-center text-[#C5B386] text-sm">
                  Không có ảnh phân tích
                </div>
              )}

              {/* Subtle bottom gradient & Tam Đình legend overlay */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#09070F]/95 via-[#09070F]/65 to-transparent pt-8 pb-3 px-3">
                <div className="flex items-center justify-center gap-2 text-[10px] text-[#E8C96A]/90 font-medium tracking-wider">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#FFF3C4] shadow-[0_0_6px_#FFF3C4]" />
                  <span>Trục Chính Tâm & Huyệt Vị Tam Đình – Ngũ Quan</span>
                </div>
              </div>
            </div>

            {/* Harmony Score & Primary Shape Card */}
            <div className="bg-[#0B0912]/90 p-4 rounded-2xl border border-[#D4AF37]/25 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#C5B386] tracking-wider block">
                    Chỉ Số Hài Hòa Tam Đình
                  </span>
                  <div className="text-2xl font-serif font-bold text-[#FFF3C4] mt-0.5">
                    {Number(analysis.harmonyScore || 0).toFixed(0)}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-[#C5B386] tracking-wider block">
                    Hình Tướng Chủ Đạo
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-xs font-semibold text-[#FFF3C4]">
                    {shapeLabel}
                  </div>
                </div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#9A7418] via-[#D4AF37] to-[#FFF3C4] rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(10, Number(analysis.harmonyScore || 75)))}%`,
                  }}
                />
              </div>
            </div>

            {/* Action Buttons on Left Card for convenience */}
            {isScanningPage && (
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                {saveStatus === "unsaved" && (
                  <button
                    onClick={onSave}
                    className="flex-1 py-3 hc-gold-btn font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer"
                  >
                    {token ? "Lưu Vào Sớ Lụa" : "Đăng Nhập Để Lưu"}
                  </button>
                )}
                {saveStatus === "saving" && (
                  <button
                    disabled
                    className="flex-1 py-3 bg-[#D4AF37]/20 text-[#E8C96A] text-xs font-bold uppercase tracking-widest rounded-xl cursor-wait"
                  >
                    Đang lưu trữ...
                  </button>
                )}
                {saveStatus === "saved" && (
                  <button
                    onClick={onShare}
                    className="flex-1 py-3 hc-gold-btn font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShareSealIcon size={15} />
                    <span>Chia Sẻ Nhận Tín Chỉ</span>
                  </button>
                )}
                {saveStatus === "error" && (
                  <button
                    onClick={onSave}
                    className="flex-1 py-3 bg-red-950 border border-red-500/50 text-red-200 font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer"
                  >
                    Thử Lưu Lại
                  </button>
                )}
                {onReset && (
                  <button
                    onClick={onReset}
                    className="px-4 py-3 bg-[#0B0912] hover:bg-white/10 border border-[#D4AF37]/30 text-[#E8C96A] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Quét Lại
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Unified Bát Quái Interactive Selector + Immediate Detailed Reading */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. UNIFIED BÁT QUÁI DIỆN TƯỚNG SELECTOR HUB */}
            <div className="hc-card rounded-3xl p-5 sm:p-6 border border-[#D4AF37]/30 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4AF37]/15 pb-3.5 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37] block">
                    La Bàn Bát Quái Ngũ Quan
                  </span>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-white mt-0.5">
                    Chọn Bộ Vị Để Xem Luận Giải Ngay Bên Dưới
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[11px] font-semibold text-[#FFF3C4] animate-pulse self-start sm:self-auto">
                  <span>👆</span>
                  <span>Chạm vào từng cung vị để khám phá</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Interactive Bát Quái Wheel */}
                <div className="md:col-span-7 flex items-center justify-center py-2">
                  <MysticalPolygon
                    items={features}
                    onSelect={setActiveTabId}
                    activeId={activeTabId}
                  />
                </div>

                {/* Quick-Select Cung Vị Cards right beside the wheel */}
                <div className="md:col-span-5 flex flex-col gap-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#C5B386] mb-0.5 px-1">
                    Danh Mục 7 Cung Vị Nhân Tướng:
                  </div>
                  {features.map((item) => {
                    const isSelected = activeTabId === item.id;
                    const iconKey = item.rawKey || item.id;
                    return (
                      <button
                        key={`quick-${item.id}`}
                        type="button"
                        onClick={() => setActiveTabId(item.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-[#2A1F3D] to-[#191229] border-[#E8C96A] shadow-[0_0_16px_rgba(212,175,55,0.28)]"
                            : "bg-[#0B0912]/80 hover:bg-[#151022] border-[#D4AF37]/20 hover:border-[#D4AF37]/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? "bg-[#D4AF37]/20 border-[#FFF3C4]/60"
                                : "bg-[#120E1C] border-[#D4AF37]/25"
                            }`}
                          >
                            {getFeatureIcon(iconKey, isSelected ? "#FFF3C4" : "#C5B386", 17)}
                          </div>
                          <div className="truncate">
                            <div
                              className={`text-xs font-bold truncate ${
                                isSelected ? "text-[#FFF3C4]" : "text-[#EFECE6]"
                              }`}
                            >
                              {item.title}
                            </div>
                            <div className="text-[10px] text-[#C5B386] truncate">
                              {item.palaceName}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold shrink-0 transition-transform ${
                            isSelected ? "text-[#FFF3C4] translate-x-0.5" : "text-[#D4AF37]/50"
                          }`}
                        >
                          {isSelected ? "✦ Đang xem" : "Xem →"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. IMMEDIATE DETAILED READING PANEL (Directly below selector — zero scrolling back and forth!) */}
            <div className="hc-card rounded-3xl p-6 sm:p-8 border border-[#D4AF37]/35 shadow-[0_20px_50px_rgba(0,0,0,0.65)] space-y-6">
              {/* Navigation Header inside the Reading Panel */}
              <div className="border-b border-[#D4AF37]/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-[#E8C96A] tracking-widest bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/35">
                    <SparkleIcon size={12} />
                    <span>{activeFeature.palaceName || "Luận Giải Bộ Vị Ngũ Quan"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                    {activeFeature.title}
                  </h2>
                  {activeFeature.palaceRole && (
                    <p className="text-xs text-[#C5B386] mt-1">{activeFeature.palaceRole}</p>
                  )}
                </div>

                {/* Prev / Next Bộ Vị Stepper */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStepFeature(-1)}
                    className="px-3 py-1.5 rounded-xl bg-[#0B0912] hover:bg-white/10 border border-[#D4AF37]/30 text-xs font-semibold text-[#E8C96A] transition-colors cursor-pointer"
                  >
                    ← Bộ vị trước
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepFeature(1)}
                    className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/45 text-xs font-bold text-[#FFF3C4] transition-colors cursor-pointer"
                  >
                    Bộ vị tiếp →
                  </button>
                </div>
              </div>

              {activeTabId === "intro" ? (
                /* TỔNG QUAN DIỆN TƯỚNG & TAM ĐÌNH */
                <div className="space-y-6">
                  <div className="text-[#EFECE6] text-sm sm:text-base leading-8 whitespace-pre-line bg-[#0B0912]/85 p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/20">
                    {analysis.resultText}
                  </div>

                  {/* Giai Đoạn Cuộc Đời Timeline */}
                  {physiognomyResult?.life_phases && (
                    <div className="bg-[#0B0912]/85 rounded-2xl border border-[#D4AF37]/20 p-5 sm:p-6">
                      <h3 className="text-[#E8C96A] font-serif font-bold text-base uppercase tracking-wider mb-5 border-b border-[#D4AF37]/15 pb-2.5">
                        Vận Trình Tam Đình Qua 3 Giai Đoạn Cuộc Đời
                      </h3>

                      <div className="space-y-5">
                        {physiognomyResult.life_phases.early_life && (
                          <div className="flex">
                            <div className="flex flex-col items-center mr-4">
                              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#FFF3C4]">
                                01
                              </div>
                              <div className="w-px flex-1 bg-[#D4AF37]/20 my-1.5" />
                            </div>
                            <div className="flex-1 pb-4 border-b border-[#D4AF37]/10">
                              <h4 className="text-[#FFF3C4] font-serif font-bold text-base">
                                Tiền Vận — Thượng Đình (15 – 30 tuổi)
                              </h4>
                              <p className="text-[#EFECE6]/90 text-xs sm:text-sm mt-1.5 leading-7">
                                {physiognomyResult.life_phases.early_life}
                              </p>
                            </div>
                          </div>
                        )}

                        {physiognomyResult.life_phases.mid_life && (
                          <div className="flex">
                            <div className="flex flex-col items-center mr-4">
                              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#FFF3C4]">
                                02
                              </div>
                              <div className="w-px flex-1 bg-[#D4AF37]/20 my-1.5" />
                            </div>
                            <div className="flex-1 pb-4 border-b border-[#D4AF37]/10">
                              <h4 className="text-[#FFF3C4] font-serif font-bold text-base">
                                Trung Vận — Trung Đình (31 – 50 tuổi)
                              </h4>
                              <p className="text-[#EFECE6]/90 text-xs sm:text-sm mt-1.5 leading-7">
                                {physiognomyResult.life_phases.mid_life}
                              </p>
                            </div>
                          </div>
                        )}

                        {physiognomyResult.life_phases.late_life && (
                          <div className="flex">
                            <div className="flex flex-col items-center mr-4">
                              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#FFF3C4]">
                                03
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-[#FFF3C4] font-serif font-bold text-base">
                                Hậu Vận — Hạ Đình (Sau 50 tuổi)
                              </h4>
                              <p className="text-[#EFECE6]/90 text-xs sm:text-sm mt-1.5 leading-7">
                                {physiognomyResult.life_phases.late_life}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Points Highlights */}
                  {physiognomyResult?.key_points &&
                    Array.isArray(physiognomyResult.key_points) &&
                    physiognomyResult.key_points.length > 0 && (
                      <div className="bg-[#0B0912]/85 rounded-2xl border border-[#D4AF37]/20 p-5">
                        <h3 className="text-[#E8C96A] font-serif font-bold text-base uppercase tracking-wider mb-3.5 border-b border-[#D4AF37]/15 pb-2">
                          Điểm Sáng Nhân Tướng Cốt Lõi
                        </h3>
                        <div className="space-y-2.5">
                          {physiognomyResult.key_points.map((point: string, idx: number) => (
                            <div key={`kp-${idx}`} className="flex items-start gap-2.5">
                              <span className="text-[#D4AF37] mt-1">✦</span>
                              <p className="text-[#EFECE6] text-xs sm:text-sm leading-7">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                /* CHI TIẾT TỪNG BỘ VỊ NGŨ QUAN (Đầy đủ, sâu sắc, đa tầng) */
                <div className="space-y-5">
                  {/* 1. Hình thái nhân trắc nhận diện */}
                  <div className="p-4 sm:p-5 bg-[#0B0912]/90 rounded-2xl border border-[#D4AF37]/25">
                    <h3 className="text-xs font-bold text-[#E8C96A] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span>◈</span>
                      <span>Hình Thái & Tỷ Lệ Nhân Trắc Nhận Diện</span>
                    </h3>
                    <p className="text-[#FFF3C4] text-sm sm:text-base leading-7 font-medium">
                      {activeFeature.description}
                    </p>
                  </div>

                  {/* 2. Điểm nhấn cá nhân từ AI/CV + Luận giải chuyên sâu */}
                  {activeFeature.content &&
                  activeFeature.content.includes("•") ? (
                    <div className="bg-[#0B0912]/90 p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/25 space-y-3">
                      <h3 className="text-xs font-bold text-[#E8C96A] uppercase tracking-widest">
                        Luận Giải Chuyên Sâu Theo Cổ Thư & Nhân Trắc:
                      </h3>
                      <div className="text-[#EFECE6] text-sm sm:text-base leading-8 whitespace-pre-line">
                        {activeFeature.content}
                      </div>
                    </div>
                  ) : (
                    /* Nếu dữ liệu cũ chỉ có 1 câu ngắn, tự động hiển thị kết hợp Điểm Nhấn + 3 tầng Cổ Thư */
                    <div className="space-y-4">
                      {activeFeature.content && (
                        <div className="bg-gradient-to-r from-[#1D152E] to-[#110D1B] p-5 rounded-2xl border border-[#D4AF37]/35">
                          <h3 className="text-xs font-bold text-[#FFF3C4] uppercase tracking-widest mb-1.5">
                            ✦ Điểm Nhấn Nhân Trắc Cá Nhân:
                          </h3>
                          <p className="text-[#EFECE6] text-sm sm:text-base leading-7">
                            {activeFeature.content}
                          </p>
                        </div>
                      )}

                      {activeFeature.classical && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-[#0B0912]/90 p-5 rounded-2xl border border-[#D4AF37]/20 space-y-2">
                            <h4 className="text-xs font-bold text-[#E8C96A] uppercase tracking-wider">
                              1. Tính Cách & Nội Tâm
                            </h4>
                            <p className="text-[#EFECE6]/90 text-xs sm:text-sm leading-7">
                              {activeFeature.classical.characterReading}
                            </p>
                          </div>

                          <div className="bg-[#0B0912]/90 p-5 rounded-2xl border border-[#D4AF37]/20 space-y-2">
                            <h4 className="text-xs font-bold text-[#E8C96A] uppercase tracking-wider">
                              2. Công Danh • Tài Lộc • Gia Đạo
                            </h4>
                            <p className="text-[#EFECE6]/90 text-xs sm:text-sm leading-7">
                              {activeFeature.classical.destinyReading}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Trích dẫn Cổ Thư & Pháp Dưỡng Khí Cải Vận */}
                  {activeFeature.classical && (
                    <div className="bg-gradient-to-br from-[#191326] via-[#110D1C] to-[#0B0912] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-3">
                      <div className="text-xs sm:text-sm italic text-[#FFF3C4] font-serif border-l-2 border-[#D4AF37] pl-3.5 py-0.5">
                        {activeFeature.classical.classicalQuote}
                      </div>
                      <div className="pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8C96A] block mb-1">
                          Lời Khuyên Dưỡng Khí & Cải Vận:
                        </span>
                        <p className="text-xs sm:text-sm text-[#C5B386] leading-7">
                          {activeFeature.classical.cultivationAdvice}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom CTA: Consult AI Coach */}
              <div className="pt-4 border-t border-[#D4AF37]/15">
                <Link
                  href={`/huyen-co/chat?q=${aiConsultPrompt}`}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#1A1429] hover:bg-[#231B38] border border-[#D4AF37]/40 flex items-center justify-between gap-3 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <AICoachOracleIcon size={32} />
                    <div className="text-left">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#FFF3C4]">
                        Tham Vấn Cố Vấn Mệnh Lý AI Về Diện Tướng Này
                      </div>
                      <div className="text-[11px] text-[#C5B386]">
                        Kết nối kết quả diện tướng với lá số Tử Vi để hỏi sâu về Sự nghiệp & Tình duyên
                      </div>
                    </div>
                  </div>
                  <span className="text-[#E8C96A] font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
