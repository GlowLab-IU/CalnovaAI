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
  tldrPills: { label: string; value: string; tone: "gold" | "jade" | "amber"; hanzi: string }[];
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

const ELEMENT_HANZI: Record<string, string> = {
  Kim: "金",
  Mộc: "木",
  Thủy: "水",
  Hỏa: "火",
  Thổ: "土",
};

export function renderInlineRichText(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|«[^»]+»)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-[#F6D87A]">
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

  const colonIdx = line.indexOf(":");
  if (colonIdx === -1) return null;

  const headerPart = line.slice(0, colonIdx).trim();
  const bodyPart = line.slice(colonIdx + 1).trim();

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

  const badges: StarBadge[] = [];

  if (/Vô Chính Diệu/i.test(bodyPart)) {
    badges.push({ name: "Vô Chính Diệu", tone: "neutral" });
  } else {
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
): { label: string; value: string; tone: "gold" | "jade" | "amber"; hanzi: string }[] {
  const pills: { label: string; value: string; tone: "gold" | "jade" | "amber"; hanzi: string }[] = [];

  if (/Tỷ Hòa/i.test(fullText)) {
    pills.push({ label: "Khí Vận", value: "Tỷ Hòa • Nội Lực Vững", tone: "jade", hanzi: "氣" });
  } else if (/Tương Sinh/i.test(fullText)) {
    pills.push({ label: "Khí Vận", value: "Tương Sinh • Đại Cát", tone: "jade", hanzi: "吉" });
  } else if (/Thực Thương sinh tài/i.test(fullText)) {
    pills.push({ label: "Khí Vận", value: "Sinh Xuất • Phát Huy Tài Năng", tone: "gold", hanzi: "運" });
  } else if (/Tài khí vượng/i.test(fullText)) {
    pills.push({ label: "Khí Vận", value: "Tài Khí Vượng • Chủ Động", tone: "gold", hanzi: "財" });
  } else if (/Cục sinh Bản mệnh/i.test(fullText)) {
    pills.push({ label: "Cách Cục", value: "Cục Sinh Mệnh • Thuận Thời", tone: "jade", hanzi: "命" });
  } else if (/Sinh Mệnh|Tương sinh/i.test(fullText)) {
    pills.push({ label: "Cách Cục", value: "Khí Số Tương Trợ", tone: "jade", hanzi: "順" });
  } else if (palaces.length > 0) {
    const brightCount = palaces.reduce(
      (acc, p) => acc + p.badges.filter((b) => b.tone === "bright").length,
      0
    );
    pills.push({
      label: "Tinh Bàn",
      value: brightCount >= 2 ? `${brightCount} Chính Tinh Miếu/Vượng` : "Cân Bằng Âm Dương",
      tone: "gold",
      hanzi: "星",
    });
  }

  const trucMatch = fullText.match(/\*\*(Trực\s+[^*]+)\*\*/i);
  if (trucMatch) {
    pills.push({ label: "Tiết Khí", value: trucMatch[1].trim(), tone: "gold", hanzi: "時" });
  } else if (palaces.length > 0) {
    const pNames = palaces
      .map((p) => p.palaceTitle.replace(/^Cung\s+/i, "").trim())
      .slice(0, 3)
      .join(" • ");
    pills.push({ label: "Trọng Tâm", value: pNames, tone: "gold", hanzi: "宮" });
  }

  const hourMatch = fullText.match(/giờ\s+([A-ZÀ-Ỹa-zà-ỹ]+\s*\d{1,2}h[–-]\d{1,2}h)/);
  if (hourMatch) {
    pills.push({ label: "Giờ Tốt", value: `Giờ ${hourMatch[1]}`, tone: "amber", hanzi: "辰" });
  } else {
    const chuMatch = fullText.match(/Mệnh Chủ\s+([^*,.]+)\*\*?\s+và\s+\*\*?Thân Chủ\s+([^*,.]+)/i);
    if (chuMatch) {
      pills.push({
        label: "Hộ Mệnh",
        value: `${stripMarkdown(chuMatch[1])} • ${stripMarkdown(chuMatch[2])}`,
        tone: "amber",
        hanzi: "護",
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

/* ============================================================================
 * CANVAS HELPERS CHO THẺ CÁT KHÍ HOÀNG GIA (ROYAL ORIENTAL TALISMAN CARD)
 * ============================================================================ */

function measureWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (let i = 0; i < words.length; i++) {
    const candidate = current ? `${current} ${words[i]}` : words[i];
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      if (lines.length >= maxLines) {
        const last = lines[lines.length - 1];
        lines[lines.length - 1] = last.replace(/[.,;:\s]+$/, "") + "…";
        return lines;
      }
      current = words[i];
    } else {
      current = candidate;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

function drawImperialCorner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sx: number,
  sy: number,
  size = 44
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.strokeStyle = "rgba(232, 201, 106, 0.78)";
  ctx.lineWidth = 2.2;

  // Nhánh ngoài chữ L kèm hồi văn vuông (Hồi Văn Cung Đình)
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.stroke();

  // Hồi văn xoắn nhẹ bên trong góc
  const s = 16;
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = "rgba(232, 201, 106, 0.55)";
  ctx.beginPath();
  ctx.moveTo(8, size * 0.72);
  ctx.lineTo(8, 8);
  ctx.lineTo(size * 0.72, 8);
  ctx.stroke();

  ctx.strokeRect(8, 8, s, s);
  ctx.fillStyle = "rgba(232, 201, 106, 0.75)";
  ctx.fillRect(13, 13, 6, 6);
  ctx.restore();
}

function drawAstrolabeHalo(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  // Hào quang Hoàng Kim tỏa nhẹ
  const radial = ctx.createRadialGradient(cx, cy, 24, cx, cy, 460);
  radial.addColorStop(0, "rgba(212, 175, 55, 0.16)");
  radial.addColorStop(0.5, "rgba(212, 175, 55, 0.05)");
  radial.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, 1080, 900);

  // Các vòng La Kinh Tinh Đồ mảnh như tơ vàng
  const radii = [160, 225, 295];
  radii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(212, 175, 55, ${0.09 - idx * 0.02})`;
    ctx.lineWidth = idx === 1 ? 1.4 : 1;
    if (idx === 1) ctx.setLineDash([6, 8]);
    else ctx.setLineDash([]);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // 8 tia Bát Quái mảnh và Bát Quái Hán Tự chìm siêu nhẹ
  const bagua = ["乾", "兌", "離", "震", "巽", "坎", "艮", "坤"];
  ctx.font = "500 18px Georgia, 'Noto Serif SC', serif";
  ctx.fillStyle = "rgba(232, 201, 106, 0.11)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    const x1 = cx + Math.cos(angle) * 165;
    const y1 = cy + Math.sin(angle) * 165;
    const x2 = cx + Math.cos(angle) * 290;
    const y2 = cy + Math.sin(angle) * 290;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "rgba(212, 175, 55, 0.05)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const gx = cx + Math.cos(angle) * 258;
    const gy = cy + Math.sin(angle) * 258;
    ctx.fillText(bagua[i], gx, gy);
  }
  ctx.restore();
}

function drawVerticalCouplet(
  ctx: CanvasRenderingContext2D,
  chars: string,
  x: number,
  startY: number,
  stepY: number
) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 24px Georgia, 'Songti SC', 'Noto Serif SC', serif";
  ctx.fillStyle = "rgba(212, 175, 55, 0.13)";
  Array.from(chars).forEach((ch, idx) => {
    ctx.fillText(ch, x, startY + idx * stepY);
  });
  ctx.restore();
}

function drawDividerOrnament(ctx: CanvasRenderingContext2D, y: number) {
  ctx.save();
  const grad = ctx.createLinearGradient(130, y, 950, y);
  grad.addColorStop(0, "rgba(212, 175, 55, 0)");
  grad.addColorStop(0.35, "rgba(212, 175, 55, 0.42)");
  grad.addColorStop(0.5, "rgba(255, 243, 196, 0.75)");
  grad.addColorStop(0.65, "rgba(212, 175, 55, 0.42)");
  grad.addColorStop(1, "rgba(212, 175, 55, 0)");

  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(130, y);
  ctx.lineTo(516, y);
  ctx.moveTo(564, y);
  ctx.lineTo(950, y);
  ctx.stroke();

  // Viên kim cương nhỏ chính giữa
  ctx.translate(540, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#E8C96A";
  ctx.fillRect(-5, -5, 10, 10);
  ctx.strokeStyle = "rgba(232, 201, 106, 0.5)";
  ctx.lineWidth = 1;
  ctx.strokeRect(-9, -9, 18, 18);
  ctx.restore();
}

function drawCinnabarImperialSeal(ctx: CanvasRenderingContext2D, x: number, y: number, size = 96) {
  ctx.save();
  // Đổ bóng nhẹ cho ấn chương
  ctx.shadowColor = "rgba(166, 44, 34, 0.35)";
  ctx.shadowBlur = 16;

  // Nền Chu Sa cổ điển
  const sealGrad = ctx.createLinearGradient(x, y, x + size, y + size);
  sealGrad.addColorStop(0, "#B83326");
  sealGrad.addColorStop(1, "#8E2017");
  ctx.fillStyle = sealGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 12);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Khung viền trong khắc chìm của ấn triện
  ctx.strokeStyle = "rgba(255, 241, 214, 0.82)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(x + 7, y + 7, size - 14, size - 14, 7);
  ctx.stroke();

  // Đường chữ thập mảnh chia 4 ô chữ Triện: 玄機 / 吉印 (Huyền Cơ Cát Ấn)
  ctx.strokeStyle = "rgba(255, 241, 214, 0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + size / 2, y + 12);
  ctx.lineTo(x + size / 2, y + size - 12);
  ctx.moveTo(x + 12, y + size / 2);
  ctx.lineTo(x + size - 12, y + size / 2);
  ctx.stroke();

  ctx.fillStyle = "#FFF4DC";
  ctx.font = "bold 28px Georgia, 'Songti SC', 'Noto Serif SC', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const q = size / 4;
  // Đọc theo lối ấn cổ hoặc thuận mắt trái-phải: 玄 機 / 吉 印
  ctx.fillText("玄", x + q + 2, y + q + 3);
  ctx.fillText("機", x + q * 3 - 2, y + q + 3);
  ctx.fillText("吉", x + q + 2, y + q * 3 - 1);
  ctx.fillText("印", x + q * 3 - 2, y + q * 3 - 1);
  ctx.restore();
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

  // 1. Nền lụa Huyền Vũ Hoàng Gia đa tầng
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
  bgGrad.addColorStop(0, "#090712");
  bgGrad.addColorStop(0.35, "#130E22");
  bgGrad.addColorStop(0.75, "#0D0A18");
  bgGrad.addColorStop(1, "#06050B");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // Hạt bụi sao tinh tế (Subtle Celestial Stardust - cố định vị trí để sắc nét)
  const stars = [
    [140, 150, 1.4], [920, 180, 1.6], [210, 390, 1.1], [870, 410, 1.3],
    [160, 780, 1.2], [935, 860, 1.5], [125, 1260, 1.3], [945, 1340, 1.2],
    [280, 1660, 1.1], [810, 1620, 1.4], [540, 95, 1.8], [390, 220, 1.0],
    [695, 235, 1.1],
  ];
  stars.forEach(([sx, sy, sr]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(247, 215, 116, 0.35)";
    ctx.fill();
  });

  // 2. La Kinh Tinh Đồ & Bát Quái chìm sau phần Header
  drawAstrolabeHalo(ctx, 540, 265);

  // 3. Khung viền đôi Hoàng Kim & 4 góc Hồi Văn Cung Đình
  ctx.strokeStyle = "rgba(212, 175, 55, 0.52)";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(42, 42, 996, 1836);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.18)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(58, 58, 964, 1804);

  drawImperialCorner(ctx, 42, 42, 1, 1, 52);
  drawImperialCorner(ctx, 1038, 42, -1, 1, 52);
  drawImperialCorner(ctx, 42, 1878, 1, -1, 52);
  drawImperialCorner(ctx, 1038, 1878, -1, -1, 52);

  // 4. Đôi liễn Hán tự chìm đối xứng hai bên mép thẻ (Thuận Thiên Ứng Thời • Nghênh Tường Nạp Phúc)
  drawVerticalCouplet(ctx, "順天應時", 80, 760, 48);
  drawVerticalCouplet(ctx, "迎祥納福", 1000, 760, 48);

  // 5. Huy hiệu đỉnh thẻ: Ấn tròn 玄機 + Tiêu đề thương hiệu
  ctx.save();
  ctx.beginPath();
  ctx.arc(540, 118, 30, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(212, 175, 55, 0.10)";
  ctx.fill();
  ctx.strokeStyle = "rgba(232, 201, 106, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#F5D061";
  ctx.font = "600 18px Georgia, 'Songti SC', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("玄機", 540, 119);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#F3D37A";
  ctx.font = "bold 34px Georgia, serif";
  ctx.fillText("H U Y Ề N   C Ơ   C Á C", 540, 192);

  ctx.fillStyle = "#B8A886";
  ctx.font = "600 17px system-ui, -apple-system, sans-serif";
  ctx.fillText("THẺ CÁT KHÍ  •  KHÂM THIÊN MỆNH LÝ ĐỒ", 540, 224);

  // 6. Khối Danh Tính Đương Số & Bản Mệnh
  let cursorY = 258;
  if (ownerName || ownerMenh) {
    cursorY = 286;
    ctx.fillStyle = "#FFF7E0";
    ctx.font = "bold 42px Georgia, serif";
    ctx.fillText(ownerName || "Đạo Hữu Hữu Duyên", 540, cursorY);
    cursorY += 42;

    if (ownerMenh) {
      const pillText = `✦  Bản mệnh: ${ownerMenh.toUpperCase()}  ✦`;
      ctx.font = "600 20px system-ui, -apple-system, sans-serif";
      const pw = Math.min(760, ctx.measureText(pillText).width + 56);
      ctx.fillStyle = "rgba(212, 175, 55, 0.12)";
      ctx.strokeStyle = "rgba(232, 201, 106, 0.42)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(540 - pw / 2, cursorY - 26, pw, 38, 19);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F5D061";
      ctx.fillText(pillText, 540, cursorY);
      cursorY += 36;
    } else {
      cursorY += 12;
    }
  } else {
    cursorY = 266;
  }

  drawDividerOrnament(ctx, cursorY);
  cursorY += 34;

  // 7. Dải 3 Ô Tóm Tắt Thiên Cơ (có chữ Hán chìm từng ô)
  if (parsed.tldrPills.length > 0) {
    const boxX = 108;
    const boxW = 864;
    const boxH = 122;

    const stripGrad = ctx.createLinearGradient(boxX, cursorY, boxX + boxW, cursorY + boxH);
    stripGrad.addColorStop(0, "rgba(29, 22, 46, 0.92)");
    stripGrad.addColorStop(0.5, "rgba(20, 15, 33, 0.95)");
    stripGrad.addColorStop(1, "rgba(29, 22, 46, 0.92)");
    ctx.fillStyle = stripGrad;
    ctx.strokeStyle = "rgba(212, 175, 55, 0.38)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(boxX, cursorY, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    const colW = boxW / parsed.tldrPills.length;
    parsed.tldrPills.forEach((pill, idx) => {
      const colLeft = boxX + colW * idx;
      const cx = colLeft + colW / 2;

      if (idx > 0) {
        ctx.strokeStyle = "rgba(212, 175, 55, 0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(colLeft, cursorY + 22);
        ctx.lineTo(colLeft, cursorY + boxH - 22);
        ctx.stroke();
      }

      // Chữ Hán chìm góc ô
      ctx.save();
      ctx.fillStyle = "rgba(212, 175, 55, 0.08)";
      ctx.font = "bold 54px Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText(pill.hanzi, colLeft + colW - 18, cursorY + 86);
      ctx.restore();

      ctx.textAlign = "center";
      ctx.fillStyle = "#B4A482";
      ctx.font = "700 16px system-ui, -apple-system, sans-serif";
      ctx.fillText(pill.label.toUpperCase(), cx, cursorY + 44);

      ctx.fillStyle =
        pill.tone === "jade" ? "#6EE7B7" : pill.tone === "amber" ? "#FCD34D" : "#FFF3C4";
      ctx.font = "700 21px system-ui, -apple-system, sans-serif";
      const valStr = pill.value.length > 25 ? pill.value.slice(0, 24) + "…" : pill.value;
      ctx.fillText(valStr, cx, cursorY + 84);
    });

    cursorY += boxH + 30;
  }

  // 8. Khối Khí Số Chủ Đạo (kèm ấn chìm 命局)
  if (parsed.section1Paragraphs[0]) {
    const cleanSec1 = stripMarkdown(parsed.section1Paragraphs[0]);
    ctx.font = "400 22.5px system-ui, -apple-system, sans-serif";
    const sec1Lines = measureWrappedLines(ctx, cleanSec1, 804, 5);
    const cardH = 74 + sec1Lines.length * 35 + 18;

    ctx.fillStyle = "rgba(18, 14, 30, 0.82)";
    ctx.strokeStyle = "rgba(212, 175, 55, 0.24)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(108, cursorY, 864, cardH, 20);
    ctx.fill();
    ctx.stroke();

    // Chữ Hán chìm 命局
    ctx.save();
    ctx.fillStyle = "rgba(212, 175, 55, 0.06)";
    ctx.font = "bold 62px Georgia, serif";
    ctx.textAlign = "right";
    ctx.fillText("命局", 946, cursorY + 74);
    ctx.restore();

    ctx.textAlign = "left";
    ctx.fillStyle = "#F3D37A";
    ctx.font = "bold 23px Georgia, serif";
    ctx.fillText("✦  KHÍ SỐ & VẬN TRÌNH CHỦ ĐẠO", 138, cursorY + 44);

    ctx.fillStyle = "#EDE4D3";
    ctx.font = "400 22.5px system-ui, -apple-system, sans-serif";
    sec1Lines.forEach((ln, idx) => {
      ctx.fillText(ln, 138, cursorY + 86 + idx * 35);
    });

    cursorY += cardH + 26;
  }

  // 9. Sớ Lụa Cổ Thư Tử Vi (kèm chữ chìm 古籍 & thanh Vàng Hoàng Gia bên trái)
  if (parsed.canonQuote || parsed.canonExplanation) {
    ctx.font = "italic bold 24px Georgia, serif";
    const quoteLines = parsed.canonQuote
      ? measureWrappedLines(ctx, parsed.canonQuote, 796, 2)
      : [];
    ctx.font = "400 20.5px system-ui, -apple-system, sans-serif";
    const expLines = parsed.canonExplanation
      ? measureWrappedLines(ctx, stripMarkdown(parsed.canonExplanation), 796, 3)
      : [];

    const cardH =
      68 +
      (quoteLines.length > 0 ? quoteLines.length * 35 + 10 : 0) +
      (expLines.length > 0 ? expLines.length * 31 + 8 : 0) +
      18;

    const scrollGrad = ctx.createLinearGradient(108, cursorY, 972, cursorY + cardH);
    scrollGrad.addColorStop(0, "rgba(42, 31, 17, 0.88)");
    scrollGrad.addColorStop(0.6, "rgba(23, 18, 31, 0.92)");
    scrollGrad.addColorStop(1, "rgba(18, 14, 26, 0.92)");
    ctx.fillStyle = scrollGrad;
    ctx.strokeStyle = "rgba(232, 201, 106, 0.42)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(108, cursorY, 864, cardH, 20);
    ctx.fill();
    ctx.stroke();

    // Thanh kim tuyến bên trái sớ lụa
    ctx.fillStyle = "#F5D061";
    ctx.beginPath();
    ctx.roundRect(108, cursorY + 16, 5, cardH - 32, 3);
    ctx.fill();

    // Chữ Hán chìm 紫微古籍
    ctx.save();
    ctx.fillStyle = "rgba(232, 201, 106, 0.07)";
    ctx.font = "bold 54px Georgia, serif";
    ctx.textAlign = "right";
    ctx.fillText("古籍", 946, cursorY + 68);
    ctx.restore();

    ctx.textAlign = "left";
    ctx.fillStyle = "#E8C96A";
    ctx.font = "700 18px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `❖  ${(parsed.canonTitle || "LỜI BÀN CỔ THƯ TỬ VI").toUpperCase()}`,
      138,
      cursorY + 40
    );

    let innerY = cursorY + 80;
    if (quoteLines.length > 0) {
      ctx.fillStyle = "#FFF5D1";
      ctx.font = "italic bold 24px Georgia, serif";
      quoteLines.forEach((ln) => {
        ctx.fillText(ln, 138, innerY);
        innerY += 35;
      });
      innerY += 6;
    }
    if (expLines.length > 0) {
      ctx.fillStyle = "#D8C8A4";
      ctx.font = "400 20.5px system-ui, -apple-system, sans-serif";
      expLines.forEach((ln) => {
        ctx.fillText(ln, 138, innerY);
        innerY += 31;
      });
    }

    cursorY += cardH + 28;
  }

  // 10. Cẩm Nang Đón Cát Khí (Giới hạn khoảng trống an toàn phía trên Footer 1685)
  const maxContentBottom = 1665;
  if (parsed.actions.length > 0 && cursorY < maxContentBottom - 120) {
    ctx.textAlign = "left";
    ctx.fillStyle = "#F3D37A";
    ctx.font = "bold 24px Georgia, serif";
    ctx.fillText("✦  CẨM NANG HÀNH ĐỘNG & ĐÓN CÁT KHÍ", 112, cursorY + 24);

    // Nhãn Hán tự nhỏ bên phải tiêu đề
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(232, 201, 106, 0.35)";
    ctx.font = "600 20px Georgia, serif";
    ctx.fillText("趨吉避凶", 968, cursorY + 24);
    cursorY += 44;

    const actionBadges = ["氣", "行", "守"];
    for (let i = 0; i < Math.min(3, parsed.actions.length); i++) {
      const act = parsed.actions[i];
      const remaining = maxContentBottom - cursorY;
      if (remaining < 95) break;

      ctx.font = "400 20.5px system-ui, -apple-system, sans-serif";
      const maxBodyLines = remaining > 220 ? 3 : 2;
      const bodyLines = measureWrappedLines(ctx, stripMarkdown(act.body), 748, maxBodyLines);
      const itemH = 50 + bodyLines.length * 30 + 16;
      if (cursorY + itemH > maxContentBottom) break;

      ctx.fillStyle = "rgba(20, 16, 33, 0.85)";
      ctx.strokeStyle = "rgba(212, 175, 55, 0.22)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(108, cursorY, 864, itemH, 16);
      ctx.fill();
      ctx.stroke();

      // Huy hiệu chữ Hán tròn bên trái mỗi mục (氣 Khí / 行 Hành / 守 Thủ)
      const badgeKanji =
        act.kind === "energy" ? "氣" : act.kind === "guard" ? "守" : actionBadges[i] || "吉";
      ctx.fillStyle = "rgba(212, 175, 55, 0.14)";
      ctx.strokeStyle = "rgba(232, 201, 106, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(128, cursorY + 18, 44, 44, 11);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#F5D061";
      ctx.font = "bold 22px Georgia, serif";
      ctx.fillText(badgeKanji, 150, cursorY + 48);

      ctx.textAlign = "left";
      ctx.fillStyle = "#F7D97E";
      ctx.font = "700 21px system-ui, -apple-system, sans-serif";
      ctx.fillText(act.title, 188, cursorY + 38);

      ctx.fillStyle = "#E8DFCE";
      ctx.font = "400 20.5px system-ui, -apple-system, sans-serif";
      bodyLines.forEach((ln, lIdx) => {
        ctx.fillText(ln, 188, cursorY + 70 + lIdx * 30);
      });

      cursorY += itemH + 14;
    }
  }

  // 11. CHÂN TRANG THƯƠNG HIỆU ĐẲNG CẤP & ẤN TRIỆN CHU SA (Vị trí cố định trang trọng ở đáy thẻ)
  const footerTop = 1695;
  ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(108, footerTop);
  ctx.lineTo(972, footerTop);
  ctx.stroke();

  // Bên trái: Nhận diện Thương hiệu + Link chính thức nổi bật
  ctx.textAlign = "left";
  ctx.fillStyle = "#F3D37A";
  ctx.font = "bold 22px Georgia, serif";
  ctx.fillText("HUYỀN CƠ CÁC  •  CALNOVAAI", 108, footerTop + 44);

  ctx.fillStyle = "#B0A182";
  ctx.font = "500 17.5px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `Tinh Hoa Mệnh Lý & Nhân Tướng Học AI  •  ${new Date().toLocaleDateString("vi-VN")}`,
    108,
    footerTop + 76
  );

  // Pill Link thương hiệu mạ vàng để người xem dễ truy cập
  const brandUrl = "calnovaai.com/huyen-co";
  ctx.font = "700 19px system-ui, -apple-system, sans-serif";
  const urlBoxW = ctx.measureText(`✦  ${brandUrl}  ✦`).width + 44;
  ctx.fillStyle = "rgba(212, 175, 55, 0.14)";
  ctx.strokeStyle = "rgba(232, 201, 106, 0.50)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(108, footerTop + 94, urlBoxW, 42, 21);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FFF3C4";
  ctx.fillText(`✦  ${brandUrl}  ✦`, 130, footerTop + 122);

  // Bên phải: Ấn Triện Chu Sa 4 chữ "玄機吉印" (Huyền Cơ Cát Ấn)
  drawCinnabarImperialSeal(ctx, 868, footerTop + 28, 102);

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

  // Hiển thị tinh tế cho lời chào mở đầu hoặc phản hồi hội thoại ngắn
  if (!parsed.isStructured) {
    const lines = text.split("\n");
    return (
      <div className="space-y-2 text-[14px] leading-7 text-[#EAE2D0]">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="h-1" />;
          if (/^[•\-]\s*/.test(trimmed)) {
            const content = trimmed.replace(/^[•\-]\s*/, "");
            return (
              <div
                key={lIdx}
                className="flex items-start gap-2.5 pl-1 py-0.5 text-[13.5px] leading-6"
              >
                <span className="text-[#E8C96A] text-[11px] mt-1 shrink-0">✦</span>
                <div>{renderInlineRichText(content)}</div>
              </div>
            );
          }
          return (
            <p key={lIdx} className="whitespace-pre-line">
              {renderInlineRichText(trimmed.replace(/\s*🔮\s*/g, " "))}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-[#EAE2D0]">
      {/* 1. DẢI TÓM TẮT "THIÊN CƠ 3 GIÂY" (TL;DR SUMMARY STRIP) */}
      {parsed.tldrPills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-gradient-to-r from-[#171226]/95 via-[#120E1E]/95 to-[#171226]/95 border border-[#D4AF37]/25 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          {parsed.tldrPills.map((pill, idx) => {
            const dotClass =
              pill.tone === "jade"
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]"
                : pill.tone === "amber"
                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.75)]"
                : "bg-[#F5D061] shadow-[0_0_8px_rgba(245,208,97,0.75)]";
            const valClass =
              pill.tone === "jade"
                ? "text-emerald-300"
                : pill.tone === "amber"
                ? "text-[#FCD34D]"
                : "text-[#FFF3C4]";
            return (
              <div
                key={idx}
                className="relative overflow-hidden flex flex-col justify-center px-3 py-2 rounded-lg bg-[#0A0812]/80 border border-[#D4AF37]/10"
              >
                <span className="pointer-events-none select-none absolute right-2.5 bottom-0.5 font-serif text-2xl font-bold text-[#D4AF37]/[0.07]">
                  {pill.hanzi}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-[#A89B7D] font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                  {pill.label}
                </div>
                <div className={`text-xs font-semibold mt-0.5 truncate pr-5 ${valClass}`} title={pill.value}>
                  {pill.value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PHẦN I: KHÍ SỐ CHỦ ĐẠO */}
      <section className="relative overflow-hidden rounded-xl bg-[#110E1B]/85 border border-[#D4AF37]/20 p-3.5 sm:p-4 space-y-2">
        <span className="pointer-events-none select-none absolute right-3.5 top-2 font-serif text-3xl font-bold text-[#D4AF37]/[0.06]">
          命局
        </span>
        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.12em] text-[#F5D061]">
          <span className="text-[11px]">✦</span>
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
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.12em] text-[#F5D061]">
              <span className="text-[11px]">✦</span>
              <span>{parsed.section2Title}</span>
            </div>
            <span className="text-[11px] font-serif tracking-widest text-[#D4AF37]/30 select-none">
              星盤詳解
            </span>
          </div>

          {parsed.palaces.map((palace, pIdx) => {
            const elStyle =
              ELEMENT_CHIP_STYLES[palace.element] ||
              "bg-[#D4AF37]/10 text-[#E8C96A] border-[#D4AF37]/30";
            const elHanzi = ELEMENT_HANZI[palace.element] || "";
            return (
              <div
                key={pIdx}
                className="relative overflow-hidden rounded-xl bg-[#120F1E]/90 border border-[#D4AF37]/20 hover:border-[#D4AF37]/38 transition-colors p-3.5 sm:p-4 space-y-2.5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-[#D4AF37]/10">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-[15.5px] text-[#FFF3C4] tracking-wide">
                        {palace.palaceTitle}
                      </h4>
                      {palace.isBodyHouse && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#D4AF37]/15 text-[#F7D774] border border-[#D4AF37]/35">
                          身宮 • An Thân
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
                        {palace.element
                          ? ` • ${palace.element}${elHanzi ? ` ${elHanzi}` : ""}`
                          : ""}
                      </span>
                    )}
                    {palace.majorPeriod && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.03] text-[#C5B386] border border-white/10">
                        {palace.majorPeriod}
                      </span>
                    )}
                  </div>
                </div>

                {palace.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {palace.badges.map((b, bIdx) => {
                      let badgeCls =
                        "bg-[#D4AF37]/14 text-[#FDE68A] border-[#D4AF37]/40 font-semibold";
                      let prefix = "★ ";
                      if (b.tone === "neutral") {
                        badgeCls = "bg-sky-500/12 text-sky-200 border-sky-400/30 font-medium";
                        prefix = "✦ ";
                      } else if (b.tone === "caution") {
                        badgeCls =
                          "bg-amber-500/12 text-amber-200 border-amber-400/35 font-medium";
                        prefix = "◆ ";
                      } else if (b.tone === "good_minor") {
                        badgeCls =
                          "bg-emerald-500/10 text-emerald-300 border-emerald-400/25 font-medium";
                        prefix = "+ ";
                      } else if (b.tone === "warn_minor") {
                        badgeCls = "bg-rose-500/10 text-rose-300 border-rose-400/25 font-medium";
                        prefix = "• ";
                      } else if (b.tone === "seal") {
                        badgeCls =
                          "bg-indigo-500/12 text-indigo-200 border-indigo-400/30 font-medium";
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
                            <span className="ml-1 opacity-80 text-[10px]">({b.strength})</span>
                          ) : null}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-1.5 text-[13.5px] leading-7 text-[#E5DEC9]">
                  <p>{renderInlineRichText(palace.mainAnalysis)}</p>
                  {palace.supportNote && (
                    <p className="text-[13px] text-[#C9BFA6] bg-[#0A0812]/60 rounded-lg px-3 py-2 border border-[#D4AF37]/10">
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
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#20180E] via-[#15111C] to-[#100D17] border border-[#D4AF37]/35 border-l-[3px] border-l-[#F5D061] p-4 shadow-[0_6px_24px_rgba(0,0,0,0.38)]">
          <div className="pointer-events-none select-none absolute right-3.5 top-2 text-3xl font-serif text-[#D4AF37]/[0.09] font-bold tracking-widest">
            紫微古籍
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8C96A] mb-2">
            <span className="inline-block w-1.5 h-1.5 rotate-45 bg-[#F5D061]" />
            <span>{parsed.canonTitle || "Lời Bàn Cổ Thư Tử Vi"}</span>
          </div>
          {parsed.canonQuote && (
            <blockquote className="font-serif italic text-[15px] sm:text-[16px] text-[#FFF4CC] leading-7 mb-1.5">
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
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs sm:text-[13px] font-serif font-bold uppercase tracking-[0.12em] text-[#F5D061]">
              <span className="text-[11px]">✦</span>
              <span>{parsed.section3Title}</span>
            </div>
            <span className="text-[11px] font-serif tracking-widest text-[#D4AF37]/30 select-none">
              趨吉避凶
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {parsed.actions.map((act, aIdx) => {
              const sealChar =
                act.kind === "energy" ? "氣" : act.kind === "guard" ? "守" : "行";
              const accentBorder =
                act.kind === "energy"
                  ? "border-[#D4AF37]/25 bg-[#151120]/90"
                  : act.kind === "guard"
                  ? "border-emerald-400/20 bg-[#10161B]/85"
                  : "border-[#D4AF37]/25 bg-[#141022]/90";
              return (
                <div
                  key={aIdx}
                  className={`rounded-xl border p-3 sm:p-3.5 flex items-start gap-3 ${accentBorder}`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0A0812] border border-[#D4AF37]/30 flex items-center justify-center font-serif text-xs font-bold text-[#E8C96A] shrink-0 mt-0.5">
                    {sealChar}
                  </div>
                  <div className="text-[13.5px] leading-6">
                    <div className="font-semibold text-[#F7D774] mb-0.5">{act.title}</div>
                    <div className="text-[#E5DEC9]">{renderInlineRichText(act.body)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Thanh tiện ích cuối bài luận: Tinh giản, sang trọng, bỏ "(Ảnh 9:16)" */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D4AF37]/10">
        <span className="text-[10px] tracking-[0.16em] uppercase text-[#8E8268] font-medium hidden sm:inline">
          玄機閣 • Huyền Cơ Các
        </span>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleCopyAdvice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#110E1B] hover:bg-[#1A1529] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 text-[11px] font-medium text-[#C5B386] hover:text-[#FFF3C4] transition-all cursor-pointer"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-[#E8C96A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            )}
            <span>{copied ? "Đã sao chép lời luận" : "Sao chép lời khuyên"}</span>
          </button>

          <button
            type="button"
            onClick={() => exportOracleCardImage(parsed, ownerName, ownerMenh)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37]/20 to-[#B8860B]/20 hover:from-[#D4AF37]/30 hover:to-[#B8860B]/30 border border-[#D4AF37]/45 text-[11px] font-semibold text-[#F6D87A] shadow-[0_2px_12px_rgba(212,175,55,0.12)] transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-[#F6D87A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
            </svg>
            <span>Lưu Thẻ Cát Khí</span>
          </button>
        </div>
      </div>
    </div>
  );
}
