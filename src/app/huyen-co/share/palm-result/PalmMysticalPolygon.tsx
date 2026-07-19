"use client";

import React, { useMemo } from "react";

// --- SVG Icons for Palm Reading ---
interface IconProps {
  color: string;
  size?: number;
}

const defaultSize = 20;

/** Tổng Quan – palm with all lines */
const IconPalmOverview = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 19V6a1 1 0 0 1 2 0v7" strokeWidth="2" />
    <path d="M10 7V4a1 1 0 0 1 2 0v9" strokeWidth="2" />
    <path d="M12 6V4a1 1 0 0 1 2 0v9" strokeWidth="2" />
    <path d="M14 7V5a1 1 0 0 1 2 0v8l-1 3a5 5 0 0 1-5 2H9a4 4 0 0 1-4-4v-1" />
    <line x1="6" y1="15" x2="6" y2="19" opacity="0.4" />
  </svg>
);

/** Sinh Đạo (Life Line) */
const IconLifeLine = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4c0 4 6 6 6 12" strokeWidth="2" />
    <path d="M14 20a6 6 0 0 1-6-6" opacity="0.5" />
    <circle cx="8" cy="4" r="1.5" fill={color} stroke="none" />
  </svg>
);

/** Trí Đạo (Head Line) */
const IconHeadLine = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11c4-1 8 1 12-1" strokeWidth="2" />
    <path d="M4 11c2 2 4 4 8 5" opacity="0.5" />
    <circle cx="20" cy="10" r="1.5" fill={color} stroke="none" />
  </svg>
);

/** Tâm Đạo (Heart Line) */
const IconHeartLine = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8c4 0 6 2 10 1s4-3 6-1" strokeWidth="2" />
    <path d="M8 8c0 2-2 4-4 6" opacity="0.4" />
    <circle cx="20" cy="8" r="1.5" fill={color} stroke="none" />
  </svg>
);

/** Định Mệnh (Fate Line) */
const IconFateLine = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2" />
    <path d="M9 7l3-3 3 3" opacity="0.7" />
    <circle cx="12" cy="20" r="1.5" fill={color} stroke="none" />
  </svg>
);

/** Sức Khỏe (Health) */
const IconHealth = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.335 4.68 1 8 1c2.07 0 4.126 1.03 5 2.895C13.874 2.03 15.93 1 18 1c3.32 0 7 2.335 7 6.191 0 .75-.127 1.537-.397 2.393" strokeWidth="1.5" />
    <path d="M15 13h2l2 5 2-8 2 3h2" strokeWidth="1.5" />
  </svg>
);

/** Sự Nghiệp (Career) */
const IconCareer = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);

/** Tình Duyên (Relationships) */
const IconRelationships = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/** Tính Cách (Personality) */
const IconPersonality = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" strokeWidth="2" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    <circle cx="12" cy="8" r="1.5" fill={color} stroke="none" />
  </svg>
);

/** Thái Dương (Sun Line) */
const IconSunLine = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" strokeWidth="2" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
    <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
    <line x1="19.07" y1="4.93" x2="16.95" y2="7.05" />
    <line x1="7.05" y1="16.95" x2="4.93" y2="19.07" />
  </svg>
);

const ICON_SIZE = 22;

const LINE_COLORS: Record<string, string> = {
  life: "#22c55e",
  head: "#38bdf8",
  heart: "#f472b6",
  fate: "#facc15",
  sun: "#fb923c",
};

const ASPECT_COLORS: Record<string, string> = {
  health: "#34d399",
  career: "#60a5fa",
  relationships: "#f9a8d4",
  personality: "#a78bfa",
};

const getIcon = (type: string, color: string) => {
  switch (type.toLowerCase()) {
    case "overview": return <IconPalmOverview size={ICON_SIZE} color={color} />;
    case "life": return <IconLifeLine size={ICON_SIZE} color={color} />;
    case "head": return <IconHeadLine size={ICON_SIZE} color={color} />;
    case "heart": return <IconHeartLine size={ICON_SIZE} color={color} />;
    case "fate": return <IconFateLine size={ICON_SIZE} color={color} />;
    case "sun": return <IconSunLine size={ICON_SIZE} color={color} />;
    case "health": return <IconHealth size={ICON_SIZE} color={color} />;
    case "career": return <IconCareer size={ICON_SIZE} color={color} />;
    case "relationships": return <IconRelationships size={ICON_SIZE} color={color} />;
    case "personality": return <IconPersonality size={ICON_SIZE} color={color} />;
    default: return <IconPalmOverview size={ICON_SIZE} color={color} />;
  }
};

const getNodeColor = (type: string, isActive: boolean) => {
  const baseColor = LINE_COLORS[type.toLowerCase()] || ASPECT_COLORS[type.toLowerCase()] || "#d4af37";
  return isActive ? baseColor : "#94a3b8";
};

export interface PalmNavItem {
  id: string;
  title: string;
  type: string; // "overview" | line type | aspect type
  category: "overview" | "line" | "aspect";
}

interface PalmMysticalPolygonProps {
  items: PalmNavItem[];
  onSelect: (id: string) => void;
  activeId: string;
}

export default function PalmMysticalPolygon({ items, onSelect, activeId }: PalmMysticalPolygonProps) {
  const WIDTH = 320;
  const CENTER = WIDTH / 2;
  const RADIUS = 110;

  const { overviewItem, satellites, points, polygonPoints } = useMemo(() => {
    const overview = items.find((i) => i.category === "overview");
    const sat = items.filter((i) => i.category !== "overview");
    const count = sat.length;
    const angleStep = (2 * Math.PI) / count;

    const pts = sat.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      return {
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
        item,
      };
    });

    const polyPts = pts.map((p) => `${p.x},${p.y}`).join(" ");
    return { overviewItem: overview, satellites: sat, points: pts, polygonPoints: polyPts };
  }, [items]);

  if (satellites.length === 0) return null;

  return (
    <div
      className="relative mx-auto flex items-center justify-center select-none"
      style={{ width: WIDTH, height: WIDTH }}
    >
      {/* SVG Background Lines & Polygon */}
      <svg height={WIDTH} width={WIDTH} className="absolute inset-0 pointer-events-none">
        <defs>
          <radialGradient id="gradPalmPoly" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.03" />
          </radialGradient>
          {/* Bát Quái decorative rings */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.45} stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.2" fill="none" />
          <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.75} stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.12" fill="none" />
        </defs>

        {/* Outer polygon fill */}
        <polygon
          points={polygonPoints}
          fill="url(#gradPalmPoly)"
          stroke="#d4af37"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          className="transition-all duration-300"
        />

        {/* Decorative spoke lines from center */}
        {points.map((p, i) => (
          <line
            key={`spoke-${i}`}
            x1={CENTER}
            y1={CENTER}
            x2={p.x}
            y2={p.y}
            stroke="#d4af37"
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeDasharray="3,5"
          />
        ))}

        {/* Decorative Bát Quái inner cross lines */}
        <line x1={CENTER} y1={CENTER - RADIUS * 0.42} x2={CENTER} y2={CENTER + RADIUS * 0.42} stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1={CENTER - RADIUS * 0.42} y1={CENTER} x2={CENTER + RADIUS * 0.42} y2={CENTER} stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1={CENTER - RADIUS * 0.3} y1={CENTER - RADIUS * 0.3} x2={CENTER + RADIUS * 0.3} y2={CENTER + RADIUS * 0.3} stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.1" />
        <line x1={CENTER + RADIUS * 0.3} y1={CENTER - RADIUS * 0.3} x2={CENTER - RADIUS * 0.3} y2={CENTER + RADIUS * 0.3} stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.1" />
      </svg>

      {/* Satellite Nodes */}
      {points.map((p) => {
        const isActive = activeId === p.item.id;
        const nodeColor = getNodeColor(p.item.type, isActive);

        return (
          <div
            key={p.item.id}
            className="absolute flex flex-col items-center justify-center"
            style={{ left: p.x - 26, top: p.y - 26, width: 52, height: 52, zIndex: 20 }}
          >
            <button
              onClick={() => onSelect(p.item.id)}
              className="group relative flex items-center justify-center focus:outline-none w-11 h-11 rounded-full transition-all duration-300 active:scale-95"
              title={p.item.title}
            >
              {/* Pulsing ring for active */}
              {isActive && (
                <div
                  className="absolute w-14 h-14 rounded-full animate-ping pointer-events-none"
                  style={{ backgroundColor: `${nodeColor}22` }}
                />
              )}

              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-md ${
                  isActive
                    ? "bg-[#1a0f04] scale-110"
                    : "bg-[#faf7f0]/80 hover:bg-[#f0e8d8] hover:scale-105"
                }`}
                style={{
                  borderColor: isActive ? nodeColor : `${nodeColor}66`,
                  boxShadow: isActive ? `0 0 12px ${nodeColor}55` : undefined,
                }}
              >
                {getIcon(p.item.type, isActive ? nodeColor : "#8C6D53")}
              </div>

              {/* Label */}
              <span
                className="absolute bottom-[-20px] text-[9px] uppercase tracking-wider font-extrabold whitespace-nowrap px-1 rounded transition-all"
                style={{ color: isActive ? nodeColor : "#8C6D53" }}
              >
                {p.item.title.split(" ")[0]}
              </span>
            </button>
          </div>
        );
      })}

      {/* Center Overview Button */}
      {overviewItem && (
        <div
          className="absolute z-30 flex items-center justify-center"
          style={{ left: CENTER - 34, top: CENTER - 34 }}
        >
          <button
            onClick={() => onSelect(overviewItem.id)}
            className="w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 shadow-xl relative focus:outline-none"
            style={{
              backgroundColor: activeId === "overview" ? "#1a0f04" : "#fdfbf7",
              borderColor: activeId === "overview" ? "#d4af37" : "#d4af3766",
              boxShadow: activeId === "overview" ? "0 0 24px #d4af3744" : undefined,
            }}
            title="Tổng Quan"
          >
            {activeId === "overview" && (
              <div className="absolute w-20 h-20 rounded-full bg-[#d4af37]/10 animate-pulse pointer-events-none" />
            )}
            {getIcon("overview", activeId === "overview" ? "#d4af37" : "#5C3E21")}
            <span
              className="text-[8px] font-black tracking-widest mt-1 uppercase"
              style={{ color: activeId === "overview" ? "#d4af37" : "#5C3E21" }}
            >
              Tổng Quan
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
