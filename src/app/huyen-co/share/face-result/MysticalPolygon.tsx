"use client";

import React, { useMemo } from "react";

interface IconProps {
  color: string;
  size?: number;
}

const defaultSize = 20;

export const IconEyes = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
  </svg>
);

export const IconEyebrows = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11c1.5-3 4.5-4 8-2.5" />
    <path d="M13 8.5c3.5-1.5 6.5-.5 8 2.5" />
    <circle cx="7" cy="14" r="1.2" fill={color} stroke="none" opacity="0.65" />
    <circle cx="17" cy="14" r="1.2" fill={color} stroke="none" opacity="0.65" />
  </svg>
);

export const IconNose = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11" strokeWidth="2" />
    <path d="M7.5 15.5a4.5 4.5 0 0 0 9 0" />
    <path d="M9.5 18a2.5 2.5 0 0 1 5 0" opacity="0.65" />
  </svg>
);

export const IconMouth = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 11c2.5-2 5-2 7-0.5 2-1.5 4.5-1.5 7 0.5" />
    <path d="M6 11.5c2 4 10 4 12 0" strokeWidth="1.8" />
  </svg>
);

export const IconForehead = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 11a7.5 7.5 0 0 1 15 0" strokeWidth="2" />
    <line x1="4" y1="15" x2="20" y2="15" opacity="0.45" strokeWidth="1.2" />
    <circle cx="12" cy="8.5" r="1.6" fill={color} stroke="none" />
  </svg>
);

export const IconChin = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="8" x2="19" y2="8" opacity="0.4" strokeWidth="1.2" />
    <path d="M5 11.5v2.5a7 7 0 0 0 14 0v-2.5" strokeWidth="2" />
  </svg>
);

export const IconFaceOverview = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
    <path d="M12 3a4.5 4.5 0 0 1 0 9 4.5 4.5 0 0 0 0 9" strokeWidth="1.4" opacity="0.85" />
    <circle cx="12" cy="7.5" r="1.3" fill={color} stroke="none" />
    <circle cx="12" cy="16.5" r="1.3" fill={color} stroke="none" opacity="0.6" />
  </svg>
);

const ICON_SIZE = 20;

export const getFeatureIcon = (key: string, color: string, size = ICON_SIZE) => {
  switch (key) {
    case "intro":
      return <IconFaceOverview size={size} color={color} />;
    case "eye":
    case "eyes":
      return <IconEyes size={size} color={color} />;
    case "eyebrow":
    case "eyebrows":
      return <IconEyebrows size={size} color={color} />;
    case "nose":
      return <IconNose size={size} color={color} />;
    case "mouth":
      return <IconMouth size={size} color={color} />;
    case "forehead":
      return <IconForehead size={size} color={color} />;
    case "chin":
      return <IconChin size={size} color={color} />;
    default:
      return <IconFaceOverview size={size} color={color} />;
  }
};

const TRIGRAMS = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];

const PALACE_SUBTITLES: Record<string, string> = {
  forehead: "Quan Lộc",
  eyebrows: "Bảo Thọ",
  eyes: "Thần Khí",
  nose: "Tài Bạch",
  mouth: "Xuất Nạp",
  chin: "Địa Các",
};

interface MysticalPolygonProps {
  items: any[];
  onSelect: (id: string) => void;
  activeId: string | null;
}

export default function MysticalPolygon({ items, onSelect, activeId }: MysticalPolygonProps) {
  const WIDTH = 300;
  const CENTER = WIDTH / 2;
  const RADIUS = 104;

  const { points, introItem, polygonPoints, octagonPoints, trigramCoords } = useMemo(() => {
    const pItems = items.filter((i) => i.id !== "intro");
    const iItem = items.find((i) => i.id === "intro");
    const count = pItems.length;
    const angleStep = count > 0 ? (2 * Math.PI) / count : 0;

    const pts = pItems.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      return {
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
        item,
      };
    });

    const polyPts = pts.map((p) => `${p.x},${p.y}`).join(" ");

    // Octagonal Bát Quái ring
    const octR = RADIUS * 0.86;
    const octPts = Array.from({ length: 8 }, (_, idx) => {
      const a = (idx * Math.PI) / 4 - Math.PI / 2 + Math.PI / 8;
      return `${CENTER + octR * Math.cos(a)},${CENTER + octR * Math.sin(a)}`;
    }).join(" ");

    // 8 Trigram symbols
    const trigR = RADIUS * 0.67;
    const tCoords = TRIGRAMS.map((sym, idx) => {
      const a = (idx * Math.PI) / 4 - Math.PI / 2;
      return {
        sym,
        x: CENTER + trigR * Math.cos(a),
        y: CENTER + trigR * Math.sin(a),
      };
    });

    return {
      points: pts,
      introItem: iItem,
      polygonPoints: polyPts,
      octagonPoints: octPts,
      trigramCoords: tCoords,
    };
  }, [items, CENTER, RADIUS]);

  return (
    <div
      className="relative mx-auto flex items-center justify-center select-none"
      style={{ width: WIDTH, height: WIDTH }}
    >
      {/* Subtle radial golden aura */}
      <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18)_0%,rgba(26,20,41,0.06)_65%,transparent_100%)] pointer-events-none" />

      {/* Rotating Sacred Bát Quái SVG */}
      <svg height={WIDTH} width={WIDTH} className="absolute inset-0 pointer-events-none">
        <defs>
          <radialGradient id="gradBaguaPoly" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8C96A" stopOpacity="0.26" />
            <stop offset="70%" stopColor="#D4AF37" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.02" />
          </radialGradient>
        </defs>

        {/* Outer compass ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS * 1.03}
          stroke="#D4AF37"
          strokeWidth="0.9"
          strokeOpacity="0.28"
          fill="none"
          strokeDasharray="3,5"
        />

        {/* Octagonal Bagua frame */}
        <polygon
          points={octagonPoints}
          fill="none"
          stroke="#E8C96A"
          strokeWidth="1.1"
          strokeOpacity="0.35"
        />

        {/* Inner sacred circles */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS * 0.54}
          stroke="#D4AF37"
          strokeWidth="0.8"
          strokeOpacity="0.3"
          fill="none"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS * 0.34}
          stroke="#E8C96A"
          strokeWidth="0.8"
          strokeOpacity="0.35"
          fill="none"
          strokeDasharray="2,4"
        />

        {/* 8 Trigram symbols */}
        {trigramCoords.map((t, idx) => (
          <text
            key={`trig-${idx}`}
            x={t.x}
            y={t.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#D4AF37"
            fillOpacity="0.45"
            fontSize="11"
          >
            {t.sym}
          </text>
        ))}

        {/* Connecting hexagon/polygon between the 6 Ngũ Quan nodes */}
        {polygonPoints && (
          <polygon
            points={polygonPoints}
            fill="url(#gradBaguaPoly)"
            stroke="#E8C96A"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />
        )}

        {/* Energy spokes from center to each node */}
        {points.map((p, i) => {
          const isNodeActive = activeId === p.item.id;
          return (
            <line
              key={`line-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke={isNodeActive ? "#FFF3C4" : "#D4AF37"}
              strokeWidth={isNodeActive ? "1.8" : "1"}
              strokeOpacity={isNodeActive ? "0.9" : "0.35"}
              strokeDasharray={isNodeActive ? undefined : "4,4"}
            />
          );
        })}
      </svg>

      {/* Satellite Ngũ Quan Nodes */}
      {points.map((p) => {
        const isActive = activeId === p.item.id;
        const iconKey = p.item.rawKey || p.item.id;
        const shortName = p.item.title.split("(")[0].trim();
        const palaceSub = PALACE_SUBTITLES[iconKey] || "";

        return (
          <div
            key={p.item.id}
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: p.x - 28,
              top: p.y - 28,
              width: 56,
              height: 56,
              zIndex: isActive ? 30 : 20,
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(p.item.id)}
              title={`Xem luận giải ${p.item.title}`}
              className="group relative flex items-center justify-center focus:outline-none w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            >
              {/* Active pulsing golden aura */}
              {isActive && (
                <div className="absolute w-13 h-13 rounded-full bg-[#D4AF37]/30 animate-ping pointer-events-none" />
              )}

              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-b from-[#2A1F3D] to-[#161024] border-[#FFF3C4] shadow-[0_0_20px_rgba(232,201,106,0.65)] scale-105"
                    : "bg-[#110D1B]/95 border-[#D4AF37]/50 hover:border-[#FFF3C4] shadow-[0_4px_14px_rgba(0,0,0,0.65)]"
                }`}
              >
                {getFeatureIcon(iconKey, isActive ? "#FFF3C4" : "#E8C96A", 20)}
              </div>

              {/* Label pill underneath node */}
              <div
                className={`absolute bottom-[-22px] flex items-center gap-1 text-[10px] uppercase tracking-wider whitespace-nowrap px-2.5 py-0.5 rounded-full border transition-all ${
                  isActive
                    ? "text-[#140F05] bg-gradient-to-r from-[#F3D88B] to-[#D4AF37] border-[#FFF3C4] font-extrabold shadow-[0_2px_10px_rgba(212,175,55,0.45)]"
                    : "text-[#EFECE6] bg-[#0D0A16]/95 border-[#D4AF37]/35 group-hover:border-[#E8C96A] font-semibold"
                }`}
              >
                <span>{shortName}</span>
                {palaceSub && (
                  <span className={isActive ? "text-[#140F05]/80 font-bold" : "text-[#D4AF37] font-medium"}>
                    • {palaceSub}
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}

      {/* Center Thái Cực / Tổng Quan Button */}
      <div
        className="absolute z-30 flex items-center justify-center"
        style={{ left: CENTER - 34, top: CENTER - 34 }}
      >
        <button
          type="button"
          onClick={() => introItem && onSelect(introItem.id)}
          title="Xem Tổng Quan Diện Tướng & Tam Đình"
          className={`w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            activeId === "intro"
              ? "bg-gradient-to-b from-[#2A1F3D] to-[#140F21] border-[#FFF3C4] shadow-[0_0_25px_rgba(232,201,106,0.55)]"
              : "bg-[#110D1B] border-[#D4AF37]/50 hover:border-[#FFF3C4] shadow-lg"
          }`}
        >
          {activeId === "intro" && (
            <div className="absolute w-20 h-20 rounded-full bg-[#D4AF37]/15 animate-pulse pointer-events-none" />
          )}
          {getFeatureIcon("intro", activeId === "intro" ? "#FFF3C4" : "#E8C96A", 22)}
          <span
            className="text-[9px] font-extrabold tracking-widest mt-1 uppercase"
            style={{ color: activeId === "intro" ? "#FFF3C4" : "#E8C96A" }}
          >
            Tổng Quan
          </span>
        </button>
      </div>
    </div>
  );
}
