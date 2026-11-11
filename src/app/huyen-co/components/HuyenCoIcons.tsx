"use client";

import React from "react";

export interface HuyenCoIconProps {
  className?: string;
  size?: number;
}

/**
 * 1. Logo Ấn Chương Huyền Cơ (Bát Quái Tinh Bàn & Bắc Đẩu)
 */
export function HuyenCoLogoIcon({ className = "", size = 40 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hcGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A7418" />
        </linearGradient>
      </defs>
      {/* Outer Octagon (Bát Quái) */}
      <polygon
        points="32,3 52.5,11.5 61,32 52.5,52.5 32,61 11.5,52.5 3,32 11.5,11.5"
        stroke="url(#hcGoldGrad)"
        strokeWidth="1.5"
        fill="rgba(212,175,55,0.06)"
      />
      {/* Inner Celestial Ring */}
      <circle cx="32" cy="32" r="21" stroke="url(#hcGoldGrad)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      <circle cx="32" cy="32" r="15" stroke="url(#hcGoldGrad)" strokeWidth="1.4" />
      {/* 4 Cardinal Points */}
      <path d="M32 6V11M32 53V58M6 32H11M53 32H58" stroke="url(#hcGoldGrad)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Center North Star / Thái Cực */}
      <path
        d="M32 19L35.2 28.8L45 32L35.2 35.2L32 45L28.8 35.2L19 32L28.8 28.8L32 19Z"
        fill="url(#hcGoldGrad)"
        fillOpacity="0.2"
        stroke="url(#hcGoldGrad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="2.5" fill="#FFF3C4" />
    </svg>
  );
}

/**
 * 2. Diện Tướng Học (Tam Đình – Ngũ Quan – Tinh Tú)
 */
export function FacePhysiognomyIcon({ className = "", size = 64 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="faceGold" x1="10" y1="8" x2="70" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8E6813" />
        </linearGradient>
      </defs>
      {/* Sacred Halo & Tam Đình Measurement Lines */}
      <circle cx="40" cy="40" r="34" stroke="url(#faceGold)" strokeWidth="1.2" opacity="0.4" />
      <circle cx="40" cy="40" r="30" stroke="url(#faceGold)" strokeWidth="1" strokeDasharray="2 4" opacity="0.65" />
      <line x1="14" y1="27" x2="66" y2="27" stroke="url(#faceGold)" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.45" />
      <line x1="14" y1="47" x2="66" y2="47" stroke="url(#faceGold)" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.45" />
      <line x1="40" y1="10" x2="40" y2="70" stroke="url(#faceGold)" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.35" />

      {/* Classical Face Contour */}
      <path
        d="M25 32C25 21.5 31.5 15 40 15C48.5 15 55 21.5 55 32C55 44 51.5 54 44.5 60.5C41.8 63 38.2 63 35.5 60.5C28.5 54 25 44 25 32Z"
        stroke="url(#faceGold)"
        strokeWidth="1.8"
        fill="rgba(212,175,55,0.05)"
      />
      {/* Eyebrows (Bảo Thọ Quan) */}
      <path d="M29 31C31.5 29 35 29 37.5 30.5" stroke="url(#faceGold)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M42.5 30.5C45 29 48.5 29 51 31" stroke="url(#faceGold)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes (Giám Sát Quan) */}
      <path d="M30 35.5C32 34 35 34 37 35.5C35 37 32 37 30 35.5Z" stroke="url(#faceGold)" strokeWidth="1.3" />
      <path d="M43 35.5C45 34 48 34 50 35.5C48 37 45 37 43 35.5Z" stroke="url(#faceGold)" strokeWidth="1.3" />
      {/* Nose Bridge (Thẩm Biện Quan) */}
      <path d="M40 31V45.5M37.5 46.5C39 47.8 41 47.8 42.5 46.5" stroke="url(#faceGold)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Lips (Xuất Nạp Quan) */}
      <path d="M35.5 52.5C37.5 53.8 42.5 53.8 44.5 52.5" stroke="url(#faceGold)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Physiognomy Landmark Nodes (Ấn Đường, Chuẩn Đầu, Địa Các) */}
      <circle cx="40" cy="23" r="2" fill="#FFF3C4" />
      <circle cx="40" cy="30" r="1.8" fill="#D4AF37" />
      <circle cx="40" cy="46" r="1.8" fill="#FFF3C4" />
      <circle cx="40" cy="61.5" r="1.8" fill="#D4AF37" />
      <circle cx="25" cy="35" r="1.5" fill="#D4AF37" />
      <circle cx="55" cy="35" r="1.5" fill="#D4AF37" />
    </svg>
  );
}

/**
 * 3. Thủ Tướng Học (Bàn Tay Tam Đạo Sinh – Trí – Tâm & Bát Quái Chưởng)
 */
export function PalmReadingIcon({ className = "", size = 64 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="palmGold" x1="12" y1="8" x2="68" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8E6813" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="34" stroke="url(#palmGold)" strokeWidth="1.2" opacity="0.4" />
      <circle cx="40" cy="40" r="30" stroke="url(#palmGold)" strokeWidth="1" strokeDasharray="2 4" opacity="0.65" />

      {/* Open Palm Silhouette */}
      <path
        d="M27 44V26C27 24.3 28.3 23 30 23C31.7 23 33 24.3 33 26V36M33 36V19C33 17.3 34.3 16 36 16C37.7 16 39 17.3 39 19V35M39 35V17C39 15.3 40.3 14 42 14C43.7 14 45 15.3 45 17V36M45 36V22C45 20.3 46.3 19 48 19C49.7 19 51 20.3 51 22V42M51 37L55.5 32.5C56.8 31.2 58.8 31.3 59.9 32.6C61 33.9 60.8 35.8 59.5 37.1L51.5 48.5C49.5 56.5 44.5 62 37.5 62C30.5 62 27 56.5 27 48V44Z"
        stroke="url(#palmGold)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(212,175,55,0.05)"
      />

      {/* 3 Sacred Palm Lines: Tâm Đạo, Trí Đạo, Sinh Đạo */}
      {/* Tâm Đạo (Heart Line) */}
      <path d="M50 41C44 41.5 37.5 39.5 32 37" stroke="#FFF3C4" strokeWidth="1.5" strokeLinecap="round" />
      {/* Trí Đạo (Head Line) */}
      <path d="M29 42C36 42.5 42.5 45 47.5 48.5" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      {/* Sinh Đạo (Life Line) */}
      <path d="M31 41C35.5 45.5 37 51.5 35.5 58" stroke="#FFF3C4" strokeWidth="1.5" strokeLinecap="round" />
      {/* Định Mệnh (Fate Line) */}
      <path d="M40 58V38" stroke="url(#palmGold)" strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round" />

      <circle cx="40" cy="44" r="1.8" fill="#FFF3C4" />
    </svg>
  );
}

/**
 * 4. Quẻ Bài Dân Gian 32 Lá (Tam Đa / Thất Tinh — Cơ Rô Chuồn Bích)
 */
export function FolkCardsIcon({ className = "", size = 64 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cardGold" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8E6813" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="34" stroke="url(#cardGold)" strokeWidth="1.2" opacity="0.4" />

      {/* Left Card (Tilted -16deg) */}
      <g transform="rotate(-16 32 44)">
        <rect x="19" y="21" width="24" height="36" rx="3.5" fill="#100D19" stroke="url(#cardGold)" strokeWidth="1.5" />
        {/* Diamond (Rô) */}
        <path d="M31 34L35 39L31 44L27 39L31 34Z" stroke="#D4AF37" strokeWidth="1.3" fill="rgba(212,175,55,0.18)" />
      </g>

      {/* Right Card (Tilted +16deg) */}
      <g transform="rotate(16 48 44)">
        <rect x="37" y="21" width="24" height="36" rx="3.5" fill="#100D19" stroke="url(#cardGold)" strokeWidth="1.5" />
        {/* Spade/Club motif */}
        <circle cx="49" cy="39" r="3.5" stroke="#D4AF37" strokeWidth="1.3" />
      </g>

      {/* Center Primary Card (Ách Cơ - Ace of Hearts) */}
      <rect x="27" y="17" width="26" height="40" rx="4" fill="#161224" stroke="url(#cardGold)" strokeWidth="1.8" />
      <rect x="30" y="20" width="20" height="34" rx="2" stroke="url(#cardGold)" strokeWidth="0.7" opacity="0.5" />
      {/* Sacred Heart (Cơ) */}
      <path
        d="M40 43.5C40 43.5 33.5 38.8 33.5 34.5C33.5 32.3 35.2 30.8 37.2 30.8C38.5 30.8 39.5 31.5 40 32.5C40.5 31.5 41.5 30.8 42.8 30.8C44.8 30.8 46.5 32.3 46.5 34.5C46.5 38.8 40 43.5 40 43.5Z"
        fill="rgba(212,175,55,0.28)"
        stroke="#FFF3C4"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Top & Bottom Ace Marks */}
      <circle cx="33" cy="23.5" r="1.2" fill="#FFF3C4" />
      <circle cx="47" cy="50.5" r="1.2" fill="#FFF3C4" />
    </svg>
  );
}

/**
 * 5. Tinh Bàn Tử Vi 12 Cung (La Kinh Thiên Văn & Lưỡng Nghi)
 */
export function TuViAstrolabeIcon({ className = "", size = 64 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tuviGold" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8E6813" />
        </linearGradient>
      </defs>
      {/* Outer 12-Palace Square Frame (Địa Bàn 12 Cung) */}
      <rect x="13" y="13" width="54" height="54" rx="5" stroke="url(#tuviGold)" strokeWidth="1.6" fill="rgba(212,175,55,0.04)" />
      {/* 12 Houses Grid Ticks on Border */}
      <path
        d="M26.5 13V18M40 13V18M53.5 13V18M26.5 62V67M40 62V67M53.5 62V67M13 26.5H18M13 40H18M13 53.5H18M62 26.5H67M62 40H67M62 53.5H67"
        stroke="url(#tuviGold)"
        strokeWidth="1.2"
        opacity="0.7"
      />
      {/* Thiên Bàn Circle */}
      <circle cx="40" cy="40" r="22" stroke="url(#tuviGold)" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="16" stroke="url(#tuviGold)" strokeWidth="0.9" strokeDasharray="2 3" />

      {/* Thái Cực Âm Dương (Yin Yang) at Center */}
      <circle cx="40" cy="40" r="10" stroke="#FFF3C4" strokeWidth="1.5" />
      <path d="M40 30C45.5 30 45.5 40 40 40C34.5 40 34.5 50 40 50" stroke="#FFF3C4" strokeWidth="1.5" />
      <circle cx="40" cy="35" r="1.5" fill="#FFF3C4" />
      <circle cx="40" cy="45" r="1.5" fill="#D4AF37" />
    </svg>
  );
}

/**
 * 6. Cố Vấn Mệnh Lý AI (Ấn Ngọc Minh Triết & Khai Vấn Tinh Bàn)
 */
export function AICoachOracleIcon({ className = "", size = 64 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="oracleGold" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8E6813" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="34" stroke="url(#oracleGold)" strokeWidth="1.2" opacity="0.4" />
      {/* Sacred Dialogue Cloud / Lotus Frame */}
      <path
        d="M20 38C20 26.954 28.954 18 40 18C51.046 18 60 26.954 60 38C60 49.046 51.046 58 40 58C36.5 58 33.2 57.1 30.3 55.5L21 59L23.8 50.2C21.4 46.7 20 42.5 20 38Z"
        stroke="url(#oracleGold)"
        strokeWidth="1.7"
        fill="rgba(212,175,55,0.06)"
        strokeLinejoin="round"
      />
      {/* Inner 8-Pointed Star of Wisdom */}
      <path
        d="M40 25L43 34L52 37L43 40L40 49L37 40L28 37L37 34L40 25Z"
        stroke="#FFF3C4"
        strokeWidth="1.5"
        fill="rgba(212,175,55,0.2)"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="37" r="2.2" fill="#FFF3C4" />
    </svg>
  );
}

/**
 * 7. Sớ Lụa Lịch Sử (Scroll History Icon)
 */
export function ScrollHistoryIcon({ className = "", size = 24 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 4H17C18.6569 4 20 5.34315 20 7V17C20 19.2091 18.2091 21 16 21H7C5.34315 21 4 19.6569 4 18V6C4 4.89543 4.89543 4 6 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M8 9H16M8 13H16M8 17H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 8. Kim Nguyên Bảo / Đồng Tiền Cổ (Credit Coin Icon)
 */
export function CreditCoinIcon({ className = "", size = 20 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" stroke="#D4AF37" strokeWidth="1.7" fill="rgba(212,175,55,0.15)" />
      <rect x="9" y="9" width="6" height="6" rx="0.8" stroke="#FFF3C4" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * 9. Sao Bắc Đẩu / Điểm Nhấn Linh Quang (Sparkle Icon)
 */
export function SparkleIcon({ className = "", size = 18 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 10. Upload / Tải Ảnh Lên Icon
 */
export function UploadImageIcon({ className = "", size = 18 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 4V15M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 11. Share / Chia Sẻ Icon
 */
export function ShareSealIcon({ className = "", size = 18 }: HuyenCoIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.6 13.5L15.4 17.5M15.4 6.5L8.6 10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
