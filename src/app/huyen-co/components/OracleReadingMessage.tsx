"use client";

import React, { useMemo, useState } from "react";

interface OracleReadingMessageProps {
  text: string;
  ownerName?: string;
  ownerMenh?: string;
}

interface StarBadge {
  name: string;
  strength?: string;
  tone: "bright" | "neutral" | "caution" | "good_minor" | "warn_minor" | "seal";
}

interface ParsedPalace {
  palaceTitle: string;
  palaceSubtitle: string;
  branch: string;
  element: string;
  isBodyHouse: boolean;
  majorPeriod: string;
  badges: StarBadge[];
  mainAnalysis: string;
  supportNote: string;
}

interface ActionItem {
  title: string;
  body: string;
  kind: "energy" | "action" | "guard";
}

interface ParsedOracle {
  isStructured: boolean;
  tldrPills: { label: string; value: string; tone: "gold" | "jade" | "amber" }[];
  section1Title: string;
  section1Paragraphs: string[];
  section2Title: string;
  palaces: ParsedPalace[];
  rawSection2Bullets: string[];
  canonTitle: string;
  canonQuote: string;
  canonExplanation: string;
  section3Title: string;
  actions: ActionItem[];
}

const ELEMENT_CHIP_STYLES: Record<string, string> = {
  Kim: "bg-slate-200/10 text-slate-200 border-slate-300/30",
  Mộc: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
  Thủy: "bg-sky-500/10 text-sky-300 border-sky-400/30",
  Hỏa: "bg-rose-500/10 text-rose-300 border-rose-400/30",
  Thổ: "bg-amber-500/15 text-amber-300 border-amber-400/35",
};

export function renderInlineRichText(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|«[^»]+»)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-[#F7D774]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic text-[#E5D5A7]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("«") && part.endsWith("»")) {
      return (
        <span key={idx} className="font-serif italic text-[#FFF3C4]">
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function stripMarkdown(s: string): string {
  return (s || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .trim();
}

function parseSinglePalaceLine(rawBullet: string): ParsedPalace | null {
  const line = rawBullet.replace(/^[•\-]\s*/, "").trim();
  if (!line.toLowerCase().includes("cung ")) return null;

  // Tách phần header trước dấu hai chấm đầu tiên
  const colonIdx = line.indexOf(":");
  if (colonIdx === -1) return null;

  const headerPart = line.slice(0, colonIdx).trim();
  const bodyPart = line.slice(colonIdx + 1).trim();

  // Tên cung & mô tả trong ngoặc: **Cung Mệnh (Gốc rễ...)**
  let palaceTitle = "Cung Vị";
  let palaceSubtitle = "";
  const titleMatch = headerPart.match(/\*\*([^*]+)\*\*/);
  if (titleMatch) {
    const fullTitle = titleMatch[1].trim();
    const parenMatch = fullTitle.match(/^([^(]+)\(([^)]+)\)/);
    if (parenMatch) {
      palaceTitle = parenMatch[1].trim();
      palaceSubtitle = parenMatch[2].trim();
    } else {
      palaceTitle = fullTitle;
    }
  }

  // Địa chi & Ngũ hành: an tại cung **Dần** (Mộc)
  let branch = "";
  let element = "";
  const locMatch = headerPart.match(/an tại cung\s+\*\*([^*]+)\*\*\s*(?:\(([^)]+)\))?/i);
  if (locMatch) {
    branch = locMatch[1].trim();
    element = (locMatch[2] || "").trim();
  }

  const isBodyHouse = /Cung An Thân/i.test(headerPart);
  let majorPeriod = "";
  const periodMatch =
    headerPart.match(/\[Đại hạn\s+([^\]]+)\]/i) ||
    headerPart.match(/\(Đại hạn\s+([^)]+)\)/i);
  if (periodMatch) {
    majorPeriod = `Đại hạn ${periodMatch[1].trim()}`;
  }

  // Trích xuất các Star Badges trực quan từ bodyPart
  const badges: StarBadge[] = [];

  if (/Vô Chính Diệu/i.test(bodyPart)) {
    badges.push({ name: "Vô Chính Diệu", tone: "neutral" });
  } else {
    // Tìm các chính tinh trong câu đầu tiên ("Tọa thủ bởi ...")
    const firstSentenceEnd = bodyPart.indexOf(".");
    const firstSentence = firstSentenceEnd !== -1 ? bodyPart.slice(0, firstSentenceEnd) : bodyPart;
    const starSegments = firstSentence.split(/;\s*kết hợp cùng\s*/i);
    for (const seg of starSegments) {
      const sNameMatch = seg.match(/\*\*([^*]+)\*\*/);
      if (!sNameMatch) continue;
      const starName = sNameMatch[1].trim();
      if (starName.includes(" địa") || starName.includes("Bình hòa")) continue;

      let shortStrength = "";
      let tone: StarBadge["tone"] = "bright";
      if (/Miếu địa/i.test(seg)) {
        shortStrength = "Miếu";
        tone = "bright";
      } else if (/Vượng địa/i.test(seg)) {
        shortStrength = "Vượng";
        tone = "bright";
      } else if (/Đắc địa/i.test(seg)) {
        shortStrength = "Đắc";
        tone = "neutral";
      } else if (/Bình hòa/i.test(seg)) {
        shortStrength = "Bình";
        tone = "neutral";
      } else if (/Hãm địa/i.test(seg)) {
        shortStrength = "Hãm";
        tone = "caution";
      }
      badges.push({ name: starName, strength: shortStrength, tone });
    }
  }

  // Cát tinh trợ lực
  const goodMatch = bodyPart.match(/Hội hợp cát tinh trợ lực gồm\s+([^.]+)\./i);
  if (goodMatch) {
    const rawItems = goodMatch[1]
      .replace(/\([^)]*\)/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const cleanName of rawItems) {
      if (cleanName.length < 24) {
        badges.push({ name: cleanName, tone: "good_minor" });
      }
    }
  }

  // Sát tinh / Lưu tâm
  const warnMatch = bodyPart.match(/Điểm cần lưu tâm là sự hiện diện của\s+([^.]+)\./i);
  if (warnMatch) {
    const rawWarns = warnMatch[1]
      .replace(/\([^)]*\)/g, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const cleanName of rawWarns) {
      if (cleanName.length < 24) {
        badges.push({ name: cleanName, tone: "warn_minor" });
      }
    }
  }

  // Tuần / Triệt
  if (/Tuần\s*[–-]\s*Triệt/i.test(bodyPart)) {
    badges.push({ name: "Tuần – Triệt", tone: "seal" });
  } else {
    if (/Tuần Trung Không Vong/i.test(bodyPart)) {
      badges.push({ name: "Tuần Không", tone: "seal" });
    }
    if (/Triệt Lộ/i.test(bodyPart)) {
      badges.push({ name: "Triệt Lộ", tone: "seal" });
    }
  }

  // Tách body thành 2 phần gọn gàng: Luận chính tinh & Phụ tinh/Tuần Triệt
  const sentences = bodyPart
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const mainAnalysis = sentences[0] || bodyPart;
  const supportNote = sentences.slice(1).join(" ");

  return {
    palaceTitle,
    palaceSubtitle,
    branch,
    element,
    isBodyHouse,
    majorPeriod,
    badges,
    mainAnalysis,
    supportNote,
  };
}

function buildTldrPills(
  fullText: string,
  palaces: ParsedPalace[]
): { label: string; value: string; tone: "gold" | "jade" | "amber" }[] {
  const pills: { label: string; value: string; tone: "gold" | "jade" | "amber" }[] = [];

  // 1. Khí Vận / Tương quan Ngũ Hành
  if (/Tỷ Hòa/i.test(fullText)) {
    pills.push({ label: "Khí Vận", value: "Tỷ Hòa • Nội Lực Vững", tone: "jade" });
  } else if (/Tương Sinh/i.test(fullText)) {
    pills.push({ label: "Khí Vận", value: "Tương Sinh • Đại Cát", tone: "jade" });
  } else if (/Thực Thương sinh tài/i.test(fullText)) {
    pills.push({ label: "Khí Vận", value: "Sinh Xuất • Phát Huy Tài Năng", tone: "gold" });
  } else if (/Tài khí vượng/i.test(fullText)) {
    pills.push({ label: "Khí Vận", value: "Tài Khí Vượng • Chủ Động", tone: "gold" });
  } else if (/Cục sinh Bản mệnh/i.test(fullText)) {
    pills.push({ label: "Cách Cục", value: "Cục Sinh Mệnh • Thuận Thời", tone: "jade" });
  } else if (/Sinh Mệnh|Tương sinh/i.test(fullText)) {
    pills.push({ label: "Cách Cục", value: "Khí Số Tương Trợ", tone: "jade" });
  } else if (palaces.length > 0) {
    const brightCount = palaces.reduce(
      (acc, p) => acc + p.badges.filter((b) => b.tone === "bright").length,
      0
    );
    pills.push({
      label: "Tinh Bàn",
      value: brightCount >= 2 ? `${brightCount} Chính Tinh Miếu/Vượng` : "Cân Bằng Âm Dương",
      tone: "gold",
    });
  }

  // 2. Tiết khí Trực hoặc Cung Trọng Tâm
  const trucMatch = fullText.match(/\*\*(Trực\s+[^*]+)\*\*/i);
  if (trucMatch) {
    pills.push({ label: "Tiết Khí", value: trucMatch[1].trim(), tone: "gold" });
  } else if (palaces.length > 0) {
    const pNames = palaces
      .map((p) => p.palaceTitle.replace(/^Cung\s+/i, "").trim())
      .slice(0, 3)
      .join(" • ");
    pills.push({ label: "Trọng Tâm", value: pNames, tone: "gold" });
  }

  // 3. Khung giờ cát lợi hoặc Sao Hộ Mệnh
  const hourMatch = fullText.match(/giờ\s+([A-ZÀ-Ỹa-zà-ỹ]+\s*\d{1,2}h[–-]\d{1,2}h)/);
  if (hourMatch) {
    pills.push({ label: "Giờ Tốt", value: `Giờ ${hourMatch[1]}`, tone: "amber" });
  } else {
    const chuMatch = fullText.match(/Mệnh Chủ\s+([^*,.]+)\*\*?\s+và\s+\*\*?Thân Chủ\s+([^*,.]+)/i);
    if (chuMatch) {
      pills.push({
        label: "Hộ Mệnh",
        value: `${stripMarkdown(chuMatch[1])} • ${stripMarkdown(chuMatch[2])}`,
        tone: "amber",
      });
    }
  }

  return pills.slice(0, 3);
}

function parseOracleReading(rawText: string): ParsedOracle {
  const empty: ParsedOracle = {
    isStructured: false,
    tldrPills: [],
    section1Title: "",
    section1Paragraphs: [],
    section2Title: "",
    palaces: [],
    rawSection2Bullets: [],
    canonTitle: "",
    canonQuote: "",
    canonExplanation: "",
    section3Title: "",
    actions: [],
  };

  if (!rawText) return empty;

  // Nhận diện các tiêu đề phần I, II, III (hỗ trợ cả `✦ **I. ...**` và `### I. ...`)
  const headerRegex = /^(?:✦\s*\*\*|#{2,3}\s*)([IVX]+\.\s*[^*\n]+?)(?:\*\*)?\s*$/gm;
  const matches = Array.from(rawText.matchAll(headerRegex));

  if (matches.length < 2) {
    return empty;
  }

  const sections: { title: string; content: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const startIdx = (matches[i].index ?? 0) + matches[i][0].length;
    const endIdx = i + 1 < matches.length ? (matches[i + 1].index ?? rawText.length) : rawText.length;
    sections.push({
      title: matches[i][1].replace(/\*\*/g, "").trim(),
      content: rawText.slice(startIdx, endIdx).trim(),
    });
  }

  const sec1 = sections[0];
  const sec2 = sections[1];
  const sec3 = sections[2];

  const section1Paragraphs = sec1
    ? sec1.content
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  // Parse Section II: tách riêng khối Cổ Thư (`📜 ...`) và các cung (`• **Cung ...`)
  let canonTitle = "";
  let canonQuote = "";
  let canonExplanation = "";
  const palaces: ParsedPalace[] = [];
  const rawSection2Bullets: string[] = [];

  if (sec2) {
    let sec2Body = sec2.content;
    const canonIdx = sec2Body.indexOf("📜");
    if (canonIdx !== -1) {
      const canonBlock = sec2Body.slice(canonIdx).trim();
      sec2Body = sec2Body.slice(0, canonIdx).trim();

      const canonLines = canonBlock.split("\n").map((l) => l.trim()).filter(Boolean);
      if (canonLines.length > 0) {
        canonTitle = stripMarkdown(canonLines[0].replace(/^📜\s*/, "").replace(/:$/, ""));
        const restCanon = canonLines.slice(1).join(" ").trim();
        // Bỏ qua nếu là tin nhắn cũ bị dính prompt hệ thống
        if (!/BẮT BUỘC DÙNG/i.test(restCanon)) {
          const quoteMatch = restCanon.match(/«([^»]+)»\s*(?:[—\-–]\s*)?([\s\S]*)/);
          if (quoteMatch) {
            canonQuote = `«${quoteMatch[1].trim()}»`;
            canonExplanation = (quoteMatch[2] || "").trim();
          } else {
            canonExplanation = stripMarkdown(restCanon);
          }
        }
      }
    }

    const blocks = sec2Body
      .split(/\n{2,}|\n(?=[•\-]\s)/)
      .map((b) => b.trim())
      .filter(Boolean);

    for (const blk of blocks) {
      const parsedP = parseSinglePalaceLine(blk);
      if (parsedP) {
        palaces.push(parsedP);
      } else {
        rawSection2Bullets.push(blk.replace(/^[•\-]\s*/, ""));
      }
    }
  }

  // Parse Section III: Actions
  const actions: ActionItem[] = [];
  if (sec3) {
    const lines = sec3.content
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    lines.forEach((line, idx) => {
      const cleaned = line.replace(/^[•\-]\s*/, "");
      const m = cleaned.match(/^\*\*([^*]+?)(?::)?\*\*:?\s*([\s\S]*)/);
      const title = m ? m[1].replace(/:$/, "").trim() : `Định hướng ${idx + 1}`;
      const body = m ? m[2].trim() : cleaned;
      let kind: ActionItem["kind"] = idx === 0 ? "action" : "guard";
      if (/Nhịp Khí|Ngũ Hành/i.test(title)) {
        kind = "energy";
      } else if (/Phòng ngừa|Giữ Tâm|Tiết chế|Hóa giải|Cân bằng/i.test(title)) {
        kind = "guard";
      }
      actions.push({ title, body, kind });
    });
  }

  const tldrPills = buildTldrPills(rawText, palaces);

  return {
    isStructured: true,
    tldrPills,
    section1Title: sec1?.title || "I. Khí Số Chủ Đạo",
    section1Paragraphs,
    section2Title: sec2?.title || "II. Luận Giải Chuyên Sâu",
    palaces,
    rawSection2Bullets,
    canonTitle,
    canonQuote,
    canonExplanation,
    section3Title: sec3?.title || "III. Cẩm Nang Hành Động",
    actions,
  };
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 6
): number {
  const words = text.split(/\s+/);
  let line = "";
  let currentY = y;
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      linesCount++;
      if (linesCount >= maxLines) {
        ctx.fillText(line.trim() + "...", x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function exportOracleCardImage(
  parsed: ParsedOracle,
  ownerName?: string,
  ownerMenh?: string
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Nền Đêm Huyền Cơ sang trọng
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
  bgGrad.addColorStop(0, "#0C0916");
  bgGrad.addColorStop(0.5, "#130E21");
  bgGrad.addColorStop(1, "#08060E");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Hào quang vàng kim trung tâm
  const glow = ctx.createRadialGradient(540, 340, 40, 540, 340, 560);
  glow.addColorStop(0, "rgba(212, 175, 55, 0.16)");
  glow.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1920);

  // Viền đôi Hoàng Kim
  ctx.strokeStyle = "rgba(212, 175, 55, 0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, 984, 1824);
  ctx.strokeStyle = "rgba(212, 175, 55, 0.22)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(64, 64, 952, 1792);

  // Tiêu đề đỉnh thẻ
  ctx.textAlign = "center";
  ctx.fillStyle = "#E8C96A";
  ctx.font = "bold 30px Georgia, serif";
  ctx.fillText("✦  H U Y Ề N   C Ơ   C Á C  ✦", 540, 145);

  ctx.fillStyle = "#A99B7C";
  ctx.font = "600 20px system-ui, sans-serif";
  ctx.fillText("THẺ CÁT KHÍ & CẨM NANG MỆNH LÝ", 540, 186);

  // Tên Đương Số & Bản Mệnh
  if (ownerName || ownerMenh) {
    ctx.fillStyle = "#FFF5D6";
    ctx.font = "bold 40px Georgia, serif";
    ctx.fillText(ownerName || "Đạo Hữu Hữu Duyên", 540, 260);
    if (ownerMenh) {
      ctx.fillStyle = "#E8C96A";
      ctx.font = "600 24px system-ui, sans-serif";
      ctx.fillText(`Bản mệnh: ${ownerMenh}`, 540, 302);
    }
  }

  let cursorY = ownerName || ownerMenh ? 360 : 250;

  // Dải Tóm tắt Thiên Cơ
  if (parsed.tldrPills.length > 0) {
    ctx.fillStyle = "rgba(212, 175, 55, 0.10)";
    ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(96, cursorY, 888, 125, 22);
    ctx.fill();
    ctx.stroke();

    const colW = 888 / parsed.tldrPills.length;
    parsed.tldrPills.forEach((pill, idx) => {
      const cx = 96 + colW * idx + colW / 2;
      ctx.textAlign = "center";
      ctx.fillStyle = "#A99B7C";
      ctx.font = "bold 18px system-ui, sans-serif";
      ctx.fillText(pill.label.toUpperCase(), cx, cursorY + 48);

      ctx.fillStyle = "#FBE28A";
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.fillText(pill.value.slice(0, 26), cx, cursorY + 88);
    });
    cursorY += 175;
  }

  // Tóm lược Khí Số
  ctx.textAlign = "left";
  if (parsed.section1Paragraphs[0]) {
    ctx.fillStyle = "#E8C96A";
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText("✧ KHÍ SỐ & TƯƠNG QUAN VẬN TRÌNH", 96, cursorY);
    cursorY += 44;

    ctx.fillStyle = "#EAE2D0";
    ctx.font = "400 24px system-ui, sans-serif";
    cursorY = wrapCanvasText(
      ctx,
      stripMarkdown(parsed.section1Paragraphs[0]),
      96,
      cursorY,
      888,
      38,
      6
    );
    cursorY += 34;
  }

  // Khung Phú Cổ Thư
  if (parsed.canonQuote || parsed.canonExplanation) {
    ctx.fillStyle = "rgba(212, 175, 55, 0.08)";
    ctx.strokeStyle = "rgba(232, 201, 106, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(96, cursorY, 888, 250, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#F5D061";
    ctx.font = "bold 21px system-ui, sans-serif";
    ctx.fillText(`📜 ${(parsed.canonTitle || "LỜI BÀN CỔ THƯ").toUpperCase()}`, 128, cursorY + 44);

    let qY = cursorY + 88;
    if (parsed.canonQuote) {
      ctx.fillStyle = "#FFF4CC";
      ctx.font = "italic bold 25px Georgia, serif";
      qY = wrapCanvasText(ctx, parsed.canonQuote, 128, qY, 824, 36, 2);
      qY += 8;
    }
    if (parsed.canonExplanation) {
      ctx.fillStyle = "#D4C5A1";
      ctx.font = "400 21px system-ui, sans-serif";
      wrapCanvasText(ctx, parsed.canonExplanation, 128, qY, 824, 32, 3);
    }
    cursorY += 295;
  }

  // Cẩm nang hành động
  if (parsed.actions.length > 0) {
    ctx.fillStyle = "#E8C96A";
    ctx.font = "bold 26px Georgia, serif";
    ctx.fillText("✧ CẨM NANG HÀNH ĐỘNG & ĐÓN CÁT KHÍ", 96, cursorY);
    cursorY += 46;

    parsed.actions.slice(0, 3).forEach((act) => {
      ctx.fillStyle = "#F7D774";
      ctx.font = "bold 23px system-ui, sans-serif";
      ctx.fillText(`• ${act.title}:`, 96, cursorY);
      cursorY += 36;

      ctx.fillStyle = "#EAE2D0";
      ctx.font = "400 22px system-ui, sans-serif";
      cursorY = wrapCanvasText(ctx, stripMarkdown(act.body), 116, cursorY, 868, 34, 4);
      cursorY += 22;
    });
  }

  // Ấn triện đỏ Chu Sa & chân trang
  ctx.fillStyle = "rgba(185, 56, 41, 0.88)";
  ctx.beginPath();
  ctx.roundRect(872, 1745, 76, 76, 12);
  ctx.fill();
  ctx.fillStyle = "#FFF3C4";
  ctx.textAlign = "center";
  ctx.font = "bold 38px Georgia, serif";
  ctx.fillText("吉", 910, 1796);

  ctx.textAlign = "left";
  ctx.fillStyle = "#8E8268";
  ctx.font = "500 19px system-ui, sans-serif";
  ctx.fillText(
    `Khởi tạo ngày ${new Date().toLocaleDateString("vi-VN")} • Huyền Cơ Các AI`,
    96,
    1800
  );

  const link = document.createElement("a");
  link.download = `the-cat-khi-huyen-co-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export default function OracleReadingMessage({
  text,
  ownerName,
  ownerMenh,
}: OracleReadingMessageProps) {
  const parsed = useMemo(() => parseOracleReading(text), [text]);
  const [copied, setCopied] = useState(false);

  const handleCopyAdvice = async () => {
    try {
      const clean = stripMarkdown(text);
      await navigator.clipboard.writeText(clean);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  // Fallback đẹp mắt cho tin nhắn chào mở đầu hoặc hội thoại ngắn
  if (!parsed.isStructured) {
    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    return (
      <div className="space-y-2.5 text-[14px] leading-7 text-[#EAE2D0]">
        {paragraphs.map((para, pIdx) => (
          <p key={pIdx} className="whitespace-pre-line">
            {renderInlineRichText(para)}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-[#EAE2D0]">
      {/* 1. DẢI TÓM TẮT "THIÊN CƠ 3 GIÂY" (TL;DR SUMMARY STRIP) */}
      {parsed.tldrPills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-gradient-to-r from-[#1A1429]/95 via-[#141020]/95 to-[#1A1429]/95 border border-[#D4AF37]/30 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          {parsed.tldrPills.map((pill, idx) => {
            const dotClass =
              pill.tone === "jade"
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                : pill.tone === "amber"
                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                : "bg-[#F5D061] shadow-[0_0_8px_rgba(245,208,97,0.8)]";
            const valClass =
              pill.tone === "jade"
                ? "text-emerald-300"
                : pill.tone === "amber"
                ? "text-[#FCD34D]"
                : "text-[#FFF3C4]";
            return (
              <div
                key={idx}
                className="flex flex-col justify-center px-3 py-2 rounded-lg bg-[#0A0812]/75 border border-white/[0.05]"
              >
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#A89B7D] font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                  {pill.label}
                </div>
                <div className={`text-xs font-bold mt-0.5 truncate ${valClass}`} title={pill.value}>
                  {pill.value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHẦN I: KHÍ SỐ CHỦ ĐẠO */}
      <section className="rounded-xl bg-[#110E1B]/80 border border-[#D4AF37]/20 p-3.5 sm:p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.1em] text-[#F5D061]">
          <span>✦</span>
          <span>{parsed.section1Title}</span>
        </div>
        <div className="space-y-2 text-[13.5px] sm:text-[14px] leading-7 text-[#EDE5D4]">
          {parsed.section1Paragraphs.map((para, idx) => (
            <p key={idx}>{renderInlineRichText(para)}</p>
          ))}
        </div>
      </section>

      {/* 2. PHẦN II: CÁC THẺ CUNG VỊ + STAR BADGES TRỰC QUAN */}
      {(parsed.palaces.length > 0 || parsed.rawSection2Bullets.length > 0) && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1 text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.1em] text-[#F5D061]">
            <span>✦</span>
            <span>{parsed.section2Title}</span>
          </div>

          {parsed.palaces.map((palace, pIdx) => {
            const elStyle =
              ELEMENT_CHIP_STYLES[palace.element] ||
              "bg-[#D4AF37]/10 text-[#E8C96A] border-[#D4AF37]/30";
            return (
              <div
                key={pIdx}
                className="rounded-xl bg-[#120F1E]/90 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-colors p-3.5 sm:p-4 space-y-2.5 shadow-sm"
              >
                {/* Palace Header */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-[15px] text-[#FFF3C4] tracking-wide">
                        {palace.palaceTitle}
                      </h4>
                      {palace.isBodyHouse && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/35">
                          ★ Cung An Thân
                        </span>
                      )}
                    </div>
                    {palace.palaceSubtitle && (
                      <p className="text-[11px] text-[#A89B7D] mt-0.5">{palace.palaceSubtitle}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {palace.branch && (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${elStyle}`}
                      >
                        {palace.branch}
                        {palace.element ? ` • ${palace.element}` : ""}
                      </span>
                    )}
                    {palace.majorPeriod && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-[#C5B386] border border-white/10">
                        {palace.majorPeriod}
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Star Badges */}
                {palace.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {palace.badges.map((b, bIdx) => {
                      let badgeCls =
                        "bg-[#D4AF37]/15 text-[#FDE68A] border-[#D4AF37]/45 font-bold";
                      let prefix = "★ ";
                      if (b.tone === "neutral") {
                        badgeCls = "bg-sky-500/15 text-sky-200 border-sky-400/35 font-semibold";
                        prefix = "✦ ";
                      } else if (b.tone === "caution") {
                        badgeCls =
                          "bg-amber-500/15 text-amber-200 border-amber-400/40 font-semibold";
                        prefix = "◆ ";
                      } else if (b.tone === "good_minor") {
                        badgeCls =
                          "bg-emerald-500/12 text-emerald-300 border-emerald-400/30 font-medium";
                        prefix = "+ ";
                      } else if (b.tone === "warn_minor") {
                        badgeCls = "bg-rose-500/12 text-rose-300 border-rose-400/30 font-medium";
                        prefix = "⚠ ";
                      } else if (b.tone === "seal") {
                        badgeCls =
                          "bg-indigo-500/15 text-indigo-200 border-indigo-400/35 font-medium";
                        prefix = "⛨ ";
                      }

                      return (
                        <span
                          key={bIdx}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] border ${badgeCls}`}
                        >
                          {prefix}
                          {b.name}
                          {b.strength ? (
                            <span className="ml-1 opacity-85 text-[10px]">({b.strength})</span>
                          ) : null}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Palace Core Reading */}
                <div className="space-y-1.5 text-[13.5px] leading-7 text-[#E5DEC9]">
                  <p>{renderInlineRichText(palace.mainAnalysis)}</p>
                  {palace.supportNote && (
                    <p className="text-[13px] text-[#C9BFA6] bg-[#0A0812]/55 rounded-lg px-3 py-2 border border-white/[0.04]">
                      {renderInlineRichText(palace.supportNote)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {parsed.rawSection2Bullets.length > 0 && (
            <div className="rounded-xl bg-[#120F1E]/90 border border-[#D4AF37]/20 p-3.5 sm:p-4 space-y-2 text-[13.5px] leading-7">
              {parsed.rawSection2Bullets.map((item, idx) => (
                <p key={idx}>• {renderInlineRichText(item)}</p>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. KHUNG "SỚ LỤA CỔ THƯ" (CLASSICAL QUOTE CALLOUT) */}
      {(parsed.canonQuote || parsed.canonExplanation) && (
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#21190F] via-[#15111B] to-[#110D18] border border-[#D4AF37]/35 border-l-4 border-l-[#F5D061] p-4 shadow-[0_6px_25px_rgba(0,0,0,0.4)]">
          <div className="pointer-events-none select-none absolute right-3 top-2 text-4xl font-serif text-[#D4AF37]/10 font-bold">
            古書
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8C96A] mb-2">
            <span>📜</span>
            <span>{parsed.canonTitle || "Lời Bàn Cổ Thư Tử Vi"}</span>
          </div>
          {parsed.canonQuote && (
            <blockquote className="font-serif italic text-[14.5px] sm:text-[15.5px] text-[#FFF4CC] leading-7 mb-1.5">
              {parsed.canonQuote}
            </blockquote>
          )}
          {parsed.canonExplanation && (
            <p className="text-[13px] text-[#D7C7A3] leading-6">
              {renderInlineRichText(parsed.canonExplanation)}
            </p>
          )}
        </section>
      )}

      {/* 5. HỘP "CẨM NANG HÀNH ĐỘNG" + NÚT SAO CHÉP & LƯU THẺ CÁT KHÍ */}
      {parsed.actions.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1 text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.1em] text-[#F5D061]">
            <span>✦</span>
            <span>{parsed.section3Title}</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {parsed.actions.map((act, aIdx) => {
              const icon =
                act.kind === "energy" ? "☯" : act.kind === "guard" ? "🛡️" : "⚡";
              const accentBorder =
                act.kind === "energy"
                  ? "border-amber-400/25 bg-[#171321]/90"
                  : act.kind === "guard"
                  ? "border-emerald-400/20 bg-[#10181C]/85"
                  : "border-[#D4AF37]/25 bg-[#161224]/90";
              return (
                <div
                  key={aIdx}
                  className={`rounded-xl border p-3 sm:p-3.5 flex items-start gap-3 ${accentBorder}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#09070F] border border-[#D4AF37]/25 flex items-center justify-center text-sm shrink-0 mt-0.5">
                    {icon}
                  </div>
                  <div className="text-[13.5px] leading-6">
                    <div className="font-bold text-[#F7D774] mb-0.5">{act.title}</div>
                    <div className="text-[#E5DEC9]">{renderInlineRichText(act.body)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Thanh tiện ích cuối bài luận: Sao chép & Xuất ảnh Thẻ Cát Khí 9:16 */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopyAdvice}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#120F1D] hover:bg-[#1C172D] border border-[#D4AF37]/25 text-[11px] font-semibold text-[#C5B386] hover:text-[#FFF3C4] transition-colors cursor-pointer"
        >
          <span>{copied ? "✓" : "📋"}</span>
          <span>{copied ? "Đã sao chép lời luận" : "Sao chép lời khuyên"}</span>
        </button>

        <button
          type="button"
          onClick={() => exportOracleCardImage(parsed, ownerName, ownerMenh)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[11px] font-bold text-[#F5D061] transition-colors cursor-pointer"
        >
          <span>🎴</span>
          <span>Lưu Thẻ Cát Khí (Ảnh 9:16)</span>
        </button>
      </div>
    </div>
  );
}
