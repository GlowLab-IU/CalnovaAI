"use client";

import React, { useMemo } from "react";

// --- Custom Web SVG Icons ---
interface IconProps {
  color: string;
  size?: number;
}

const defaultSize = 20;

export const IconEyes = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" strokeWidth="2" />
  </svg>
);

export const IconEyebrows = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 11c0-2.5 2-4 5-4s5 1.5 5 4" />
    <path d="M14 11c0-2.5 2-4 5-4s5 1.5 5 4" />
  </svg>
);

export const IconNose = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v11" strokeWidth="2" />
    <path d="M8 16a4 4 0 0 0 8 0" />
    <path d="M10 18a2 2 0 0 1 4 0" opacity="0.6" />
  </svg>
);

export const IconMouth = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10c2 1.5 6 1.5 10 0" />
    <path d="M8 12c1.5 3 6.5 3 8 0" strokeWidth="2" />
  </svg>
);

export const IconForehead = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 10a7 7 0 0 1 14 0" strokeWidth="2" />
    <line x1="4" y1="14" x2="20" y2="14" opacity="0.4" strokeWidth="1" />
    <path d="M9 6l3-2 3 2" opacity="0.6" />
  </svg>
);

export const IconChin = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="8" x2="20" y2="8" opacity="0.4" strokeWidth="1" />
    <path d="M5 12v3a7 7 0 0 0 14 0v-3" strokeWidth="2" />
  </svg>
);

export const IconMidface = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="4" x2="12" y2="20" strokeWidth="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="9" y1="18" x2="15" y2="18" />
    <circle cx="12" cy="12" r="1" fill={color} stroke="none" />
  </svg>
);

export const IconPhiltrum = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 6a2 2 0 0 1 4 0" opacity="0.5"/>
    <path d="M11 8v8" strokeWidth="2"/>
    <path d="M13 8v8" strokeWidth="2"/>
    <path d="M9 18c1 1 4 1 6 0" opacity="0.5"/>
  </svg>
);

export const IconFaceOverview = ({ color, size = defaultSize }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" strokeWidth="2" />
    <line x1="12" y1="3" x2="12" y2="21" opacity="0.5" />
    <line x1="3" y1="12" x2="21" y2="12" opacity="0.5" />
    <circle cx="12" cy="12" r="2" fill={color} stroke="none" opacity="0.8"/>
  </svg>
);

const ICON_SIZE = 24;

const getIcon = (key: string, color: string) => {
  switch (key) {
    case "intro": return <IconFaceOverview size={ICON_SIZE} color={color} />;
    case "eye":
    case "eyes": return <IconEyes size={ICON_SIZE} color={color} />;
    case "eyebrow":
    case "eyebrows": return <IconEyebrows size={ICON_SIZE} color={color} />;
    case "nose": return <IconNose size={ICON_SIZE} color={color} />;
    case "mouth": return <IconMouth size={ICON_SIZE} color={color} />;
    case "forehead": return <IconForehead size={ICON_SIZE} color={color} />;
    case "chin": return <IconChin size={ICON_SIZE} color={color} />;
    case "midface": return <IconMidface size={ICON_SIZE} color={color} />;
    case "lower_face": return <IconChin size={ICON_SIZE} color={color} />;
    case "philtrum": return <IconPhiltrum size={ICON_SIZE} color={color} />;
    default: return <IconFaceOverview size={ICON_SIZE} color={color} />;
  }
};

interface MysticalPolygonProps {
  items: any[];
  onSelect: (id: string) => void;
  activeId: string | null;
}

export default function MysticalPolygon({ items, onSelect, activeId }: MysticalPolygonProps) {
  const WIDTH = 320;
  const CENTER = WIDTH / 2;
  const RADIUS = 110;

  const { polygonItems, introItem, points, polygonPoints } = useMemo(() => {
    const pItems = items.filter((i) => i.id !== "intro");
    const iItem = items.find((i) => i.id === "intro");
    const count = pItems.length;
    const angleStep = count > 0 ? (2 * Math.PI) / count : 0;

    const pts = pItems.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      return {
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
        item: item,
      };
    });

    const polyPts = pts.map((p) => `${p.x},${p.y}`).join(" ");
    return { polygonItems: pItems, introItem: iItem, points: pts, polygonPoints: polyPts };
  }, [items]);

  return (
    <div 
      className="relative mx-auto flex items-center justify-center select-none"
      style={{ width: WIDTH, height: WIDTH }}
    >
      {/* Svg lines, background polygon and Bát Quái decorative rings */}
      <svg height={WIDTH} width={WIDTH} className="absolute inset-0 pointer-events-none">
        <defs>
          <radialGradient id="gradPoly" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0891b2" stopOpacity="0.05" />
          </radialGradient>
        </defs>
        {/* Bát Quái decorative rings */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.38} stroke="#06b6d4" strokeWidth="0.8" strokeOpacity="0.2" fill="none" strokeDasharray="3,6" />
        <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.65} stroke="#06b6d4" strokeWidth="0.6" strokeOpacity="0.12" fill="none" />
        <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.95} stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.08" fill="none" strokeDasharray="2,8" />
        {/* Axis lines */}
        <line x1={CENTER} y1={CENTER - RADIUS * 0.92} x2={CENTER} y2={CENTER + RADIUS * 0.92} stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.1" />
        <line x1={CENTER - RADIUS * 0.92} y1={CENTER} x2={CENTER + RADIUS * 0.92} y2={CENTER} stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.1" />
        {polygonPoints && (
          <polygon 
            points={polygonPoints} 
            fill="url(#gradPoly)" 
            stroke="#06b6d4" 
            strokeWidth="2" 
            strokeOpacity="0.8" 
            className="transition-all duration-300"
          />
        )}
        {points.map((p, i) => (
          <line 
            key={`line-${i}`} 
            x1={CENTER} 
            y1={CENTER} 
            x2={p.x} 
            y2={p.y} 
            stroke="#06b6d4" 
            strokeWidth="1.2" 
            strokeOpacity="0.45" 
            strokeDasharray="4,4" 
          />
        ))}
      </svg>


      {/* Satellite Buttons */}
      {points.map((p) => {
        const isActive = activeId === p.item.id;
        const iconKey = p.item.rawKey || p.item.id;

        return (
          <div
            key={p.item.id}
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: p.x - 24,
              top: p.y - 24,
              width: 48,
              height: 48,
              zIndex: 20,
            }}
          >
            <button
              onClick={() => onSelect(p.item.id)}
              className="group relative flex items-center justify-center focus:outline-none w-10 h-10 rounded-full transition-all duration-300 active:scale-95"
            >
              {/* Pulsing ring animation for active node */}
              {isActive && (
                <div className="absolute w-12 h-12 rounded-full bg-[#06b6d4]/30 animate-ping pointer-events-none" />
              )}

              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 shadow-md ${
                  isActive 
                    ? "bg-slate-900 border-[#06b6d4] shadow-[#06b6d4]/40" 
                    : "bg-slate-800/90 border-[#06b6d4]/50 hover:bg-slate-700/90"
                }`}
              >
                {getIcon(iconKey, isActive ? "#22D3EE" : "#e2e8f0")}
              </div>

              {/* Tag below the node */}
              <span 
                className={`absolute bottom-[-18px] text-[10px] uppercase tracking-wider font-extrabold whitespace-nowrap px-1.5 py-0.5 rounded transition-all ${
                  isActive 
                    ? "text-[#0891b2] font-black" 
                    : "text-[#5C3E21] hover:text-[#8C6D53]"
                }`}
              >
                {p.item.title.split("(")[0]}
              </span>
            </button>
          </div>
        );
      })}

      {/* Center Overview Button */}
      <div 
        className="absolute z-30 flex items-center justify-center"
        style={{ left: CENTER - 32, top: CENTER - 32 }}
      >
        <button
          onClick={() => introItem && onSelect(introItem.id)}
          className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border transition-all duration-300 shadow-lg ${
            activeId === "intro"
              ? "bg-slate-900 border-[#06b6d4] shadow-[#06b6d4]/40"
              : "bg-slate-800 border-[#06b6d4]/30 hover:border-[#06b6d4]/60"
          }`}
        >
          {activeId === "intro" && (
            <div className="absolute w-20 h-20 rounded-full bg-[#06b6d4]/10 animate-pulse pointer-events-none" />
          )}
          {getIcon("intro", activeId === "intro" ? "#22D3EE" : "#e2e8f0")}
          <span 
            className="text-[8px] font-black tracking-widest mt-1 uppercase"
            style={{ color: activeId === "intro" ? "#22D3EE" : "#e2e8f0" }}
          >
            Tổng Quan
          </span>
        </button>
      </div>
    </div>
  );
}
