// Accurate Vietnamese Lunar Calendar & Auspicious Almanac (Thiên Cơ Nhật Lịch)
// Based on astronomical algorithms (Ho Ngoc Duc) for UTC+7 (Vietnam Standard Time)

export interface ColorOrb {
  name: string;
  hex: string;
  gradient: string;
  border: string;
}

export interface AuspiciousHour {
  chi: string;
  range: string;
  star: string;
  isPrime?: boolean;
}

export interface DailyAlmanacInfo {
  solarDateStr: string;       // e.g., "Thứ Năm, 05/11/2026"
  shortSolarStr: string;      // e.g., "05/11"
  weekdayShort: string;       // e.g., "T5"
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  lunarDateStr: string;       // e.g., "27 tháng 09, Bính Ngọ"
  dayCanChi: string;          // e.g., "Ất Mùi"
  monthCanChi: string;        // e.g., "Mậu Tuất"
  yearCanChi: string;         // e.g., "Bính Ngọ"
  napAm: string;              // e.g., "Sa Trung Kim (Vàng trong cát)"
  trucName: string;           // e.g., "Trực Thành"
  trucQuality: "good" | "neutral" | "bad";
  luckLevel: "good" | "neutral" | "bad"; // Ngày đẹp | Ngày trung bình | Ngày xấu
  luckScore: number;          // e.g., 88
  luckLabel: string;          // "Ngày Hoàng Đạo (Đại Cát)" | "Ngày Bình Hòa" | "Ngày Hắc Đạo (Cẩn Trọng)"
  primeHours: AuspiciousHour[]; // Top 3 slots for card display
  allGoodHours: AuspiciousHour[]; // All 6 Hoàng Đạo hours
  compatibleAges: string;     // e.g., "Tân Mão (2011, 1951)"
  compatibleAgesFull: string[]; // For detail view
  conflictingAges: string;    // e.g., "Kỷ Sửu (2009, 1949)"
  luckyColors: ColorOrb[];    // 2 gemstone orbs
  travelDirection: string;    // e.g., "Đông Nam"
  wealthDirection: string;    // Tài Thần direction
  joyDirection: string;       // Hỷ Thần direction
  luckyNumber: number;        // e.g., 6
  shouldDo: string;           // Short label for card, e.g., "Cầu phúc, Ký kết"
  shouldAvoid: string;        // Short label for card, e.g., "Kiện tụng, Động thổ"
  shouldDoList: string[];     // Full list for detail modal
  shouldAvoidList: string[];  // Full list for detail modal
  dailyAdvice: string;        // 1-2 sentence spiritual guidance for the day
}

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const WEEKDAYS_VI = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const WEEKDAYS_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const HOUR_RANGES: Record<string, string> = {
  "Tý": "23:00 - 01:00",
  "Sửu": "01:00 - 03:00",
  "Dần": "03:00 - 05:00",
  "Mão": "05:00 - 07:00",
  "Thìn": "07:00 - 09:00",
  "Tỵ": "09:00 - 11:00",
  "Ngọ": "11:00 - 13:00",
  "Mùi": "13:00 - 15:00",
  "Thân": "15:00 - 17:00",
  "Dậu": "17:00 - 19:00",
  "Tuất": "19:00 - 21:00",
  "Hợi": "21:00 - 23:00",
};

// 6 Sao Hoàng Đạo theo từng cặp Địa Chi ngày
const HOANG_DAO_MAP: Record<number, { idx: number; star: string }[]> = {
  // Dần (2), Thân (8)
  2: [{ idx: 0, star: "Thanh Long" }, { idx: 1, star: "Minh Đường" }, { idx: 4, star: "Kim Quỹ" }, { idx: 5, star: "Thiên Đức" }, { idx: 7, star: "Ngọc Đường" }, { idx: 10, star: "Tư Mệnh" }],
  8: [{ idx: 0, star: "Thanh Long" }, { idx: 1, star: "Minh Đường" }, { idx: 4, star: "Kim Quỹ" }, { idx: 5, star: "Thiên Đức" }, { idx: 7, star: "Ngọc Đường" }, { idx: 10, star: "Tư Mệnh" }],
  // Mão (3), Dậu (9)
  3: [{ idx: 2, star: "Thanh Long" }, { idx: 3, star: "Minh Đường" }, { idx: 6, star: "Kim Quỹ" }, { idx: 7, star: "Thiên Đức" }, { idx: 9, star: "Ngọc Đường" }, { idx: 0, star: "Tư Mệnh" }],
  9: [{ idx: 2, star: "Thanh Long" }, { idx: 3, star: "Minh Đường" }, { idx: 6, star: "Kim Quỹ" }, { idx: 7, star: "Thiên Đức" }, { idx: 9, star: "Ngọc Đường" }, { idx: 0, star: "Tư Mệnh" }],
  // Thìn (4), Tuất (10)
  4: [{ idx: 4, star: "Thanh Long" }, { idx: 5, star: "Minh Đường" }, { idx: 8, star: "Kim Quỹ" }, { idx: 9, star: "Thiên Đức" }, { idx: 11, star: "Ngọc Đường" }, { idx: 2, star: "Tư Mệnh" }],
  10: [{ idx: 4, star: "Thanh Long" }, { idx: 5, star: "Minh Đường" }, { idx: 8, star: "Kim Quỹ" }, { idx: 9, star: "Thiên Đức" }, { idx: 11, star: "Ngọc Đường" }, { idx: 2, star: "Tư Mệnh" }],
  // Tỵ (5), Hợi (11)
  5: [{ idx: 6, star: "Thanh Long" }, { idx: 7, star: "Minh Đường" }, { idx: 10, star: "Kim Quỹ" }, { idx: 11, star: "Thiên Đức" }, { idx: 1, star: "Ngọc Đường" }, { idx: 4, star: "Tư Mệnh" }],
  11: [{ idx: 6, star: "Thanh Long" }, { idx: 7, star: "Minh Đường" }, { idx: 10, star: "Kim Quỹ" }, { idx: 11, star: "Thiên Đức" }, { idx: 1, star: "Ngọc Đường" }, { idx: 4, star: "Tư Mệnh" }],
  // Tý (0), Ngọ (6)
  0: [{ idx: 8, star: "Thanh Long" }, { idx: 9, star: "Minh Đường" }, { idx: 0, star: "Kim Quỹ" }, { idx: 1, star: "Thiên Đức" }, { idx: 3, star: "Ngọc Đường" }, { idx: 6, star: "Tư Mệnh" }],
  6: [{ idx: 8, star: "Thanh Long" }, { idx: 9, star: "Minh Đường" }, { idx: 0, star: "Kim Quỹ" }, { idx: 1, star: "Thiên Đức" }, { idx: 3, star: "Ngọc Đường" }, { idx: 6, star: "Tư Mệnh" }],
  // Sửu (1), Mùi (7)
  1: [{ idx: 10, star: "Thanh Long" }, { idx: 11, star: "Minh Đường" }, { idx: 2, star: "Kim Quỹ" }, { idx: 3, star: "Thiên Đức" }, { idx: 5, star: "Ngọc Đường" }, { idx: 8, star: "Tư Mệnh" }],
  7: [{ idx: 10, star: "Thanh Long" }, { idx: 11, star: "Minh Đường" }, { idx: 2, star: "Kim Quỹ" }, { idx: 3, star: "Thiên Đức" }, { idx: 5, star: "Ngọc Đường" }, { idx: 8, star: "Tư Mệnh" }],
};

const TRUC_LIST: {
  name: string;
  quality: "good" | "neutral" | "bad";
  shouldDo: string;
  shouldAvoid: string;
  shouldDoList: string[];
  shouldAvoidList: string[];
}[] = [
  {
    name: "Trực Kiến",
    quality: "good",
    shouldDo: "Khởi sự, Xuất hành",
    shouldAvoid: "Động thổ, Mở kho",
    shouldDoList: ["Khởi công việc mới", "Xuất hành cầu tài", "Nhậm chức, ký kết", "Thăm hỏi quý nhân"],
    shouldAvoidList: ["Động thổ đào đất", "Mở kho xuất vốn lớn"],
  },
  {
    name: "Trực Trừ",
    quality: "good",
    shouldDo: "Cầu phúc, Giải hạn",
    shouldAvoid: "Đầu tư mạo hiểm",
    shouldDoList: ["Cầu phúc, dâng hương", "Thanh lọc không gian sống", "Khám chữa bệnh", "Chốt kế hoạch"],
    shouldAvoidList: ["Đi xa mạo hiểm", "Cho vay mượn lớn"],
  },
  {
    name: "Trực Mãn",
    quality: "good",
    shouldDo: "Khai trương, Cầu tài",
    shouldAvoid: "Kiện tụng, Tranh chấp",
    shouldDoList: ["Khai trương cửa hàng", "Cầu tài lộc, ký hợp đồng", "Sum họp gia đạo", "Tích lũy tài sản"],
    shouldAvoidList: ["Tranh cãi, kiện tụng", "Nhậm chức mới"],
  },
  {
    name: "Trực Bình",
    quality: "neutral",
    shouldDo: "Giao dịch, Hòa giải",
    shouldAvoid: "Khiếu nại, Nóng vội",
    shouldDoList: ["Bàn bạc hợp tác ôn hòa", "Tu sửa nhà cửa nhỏ", "Cân bằng công việc"],
    shouldAvoidList: ["Tranh chấp pháp lý", "Thay đổi đột ngột"],
  },
  {
    name: "Trực Định",
    quality: "good",
    shouldDo: "Ký kết, Cầu danh",
    shouldAvoid: "Thay đổi chỗ ở",
    shouldDoList: ["Ký kết văn bản dài hạn", "Nhập học, cầu công danh", "Lập kế hoạch tài chính"],
    shouldAvoidList: ["Kiện tụng", "Xuất hành đường xa bất ngờ"],
  },
  {
    name: "Trực Chấp",
    quality: "neutral",
    shouldDo: "Tu tạo, Tuyển dụng",
    shouldAvoid: "Xuất tiền lớn",
    shouldDoList: ["Củng cố nội bộ", "Tu sửa trang thiết bị", "Giữ vững định hướng"],
    shouldAvoidList: ["Mở kho xuất tiền lớn", "Di chuyển chỗ ở"],
  },
  {
    name: "Trực Phá",
    quality: "bad",
    shouldDo: "Dọn dẹp, Chữa trị",
    shouldAvoid: "Khai trương, Cưới hỏi",
    shouldDoList: ["Phá dỡ công trình cũ", "Giải quyết dứt điểm việc tồn đọng", "Chăm sóc sức khỏe"],
    shouldAvoidList: ["Khai trương, mở hàng", "Ký kết hợp đồng lớn", "Cưới hỏi"],
  },
  {
    name: "Trực Nguy",
    quality: "bad",
    shouldDo: "Cầu cúng, Tĩnh tâm",
    shouldAvoid: "Cầu an, Mạo hiểm",
    shouldDoList: ["Cầu cúng, lễ Phật", "Tĩnh tâm chiêm nghiệm", "Làm việc thiện lành"],
    shouldAvoidList: ["Đầu tư mạo hiểm", "Đi thuyền hoặc leo cao", "Tranh thắng thua"],
  },
  {
    name: "Trực Thành",
    quality: "good",
    shouldDo: "Khai trương, Giao dịch",
    shouldAvoid: "Kiện tụng, Đấu tố",
    shouldDoList: ["Khai trương, mở rộng kinh doanh", "Ký kết hợp đồng", "Nhập học, nhậm chức", "Cầu tài lộc"],
    shouldAvoidList: ["Kiện tụng, tranh chấp", "Nói lời quá khích"],
  },
  {
    name: "Trực Thu",
    quality: "neutral",
    shouldDo: "Thu hồi vốn, Tích lũy",
    shouldAvoid: "Khởi công lớn",
    shouldDoList: ["Thu hồi công nợ", "Đóng quỹ tiết kiệm", "Tổng kết dự án", "Làm việc thiện"],
    shouldAvoidList: ["Khởi công dự án mới", "Du lịch xa"],
  },
  {
    name: "Trực Khai",
    quality: "good",
    shouldDo: "Khai mở, Cầu tài",
    shouldAvoid: "An táng, Chia rẽ",
    shouldDoList: ["Ra mắt sản phẩm mới", "Khai trương, xuất hành", "Gặp gỡ đối tác chiến lược", "Cầu phúc"],
    shouldAvoidList: ["Động đất sâu", "Tranh cãi nội bộ"],
  },
  {
    name: "Trực Bế",
    quality: "bad",
    shouldDo: "Tu dưỡng, Lập kế hoạch",
    shouldAvoid: "Khai trương, Xuất hành",
    shouldDoList: ["Nghỉ ngơi tái tạo năng lượng", "Kiểm toán nội bộ", "Học tập nghiên cứu"],
    shouldAvoidList: ["Khai trương cửa hàng", "Xuất hành đi xa", "Đầu tư lớn"],
  },
];

const COLOR_PALETTES: Record<string, ColorOrb[]> = {
  Kim: [
    { name: "Bạch Kim", hex: "#E2E8F0", gradient: "radial-gradient(circle at 30% 30%, #FFFFFF, #94A3B8 65%, #475569)", border: "#CBD5E1" },
    { name: "Hoàng Kim", hex: "#F59E0B", gradient: "radial-gradient(circle at 30% 30%, #FEF08A, #D4AF37 65%, #78350F)", border: "#FCD34D" },
  ],
  Thủy: [
    { name: "Lam Ngọc", hex: "#60A5FA", gradient: "radial-gradient(circle at 30% 30%, #DBEAFE, #3B82F6 60%, #1E3A8A)", border: "#93C5FD" },
    { name: "Băng Tinh", hex: "#94A3B8", gradient: "radial-gradient(circle at 30% 30%, #F1F5F9, #64748B 65%, #1E293B)", border: "#CBD5E1" },
  ],
  Mộc: [
    { name: "Ngọc Bích", hex: "#34D399", gradient: "radial-gradient(circle at 30% 30%, #D1FAE5, #10B981 60%, #064E3B)", border: "#6EE7B7" },
    { name: "Lam Thủy", hex: "#38BDF8", gradient: "radial-gradient(circle at 30% 30%, #E0F2FE, #0284C7 60%, #0C4A6E)", border: "#7DD3FC" },
  ],
  Hỏa: [
    { name: "Chu Sa", hex: "#F87171", gradient: "radial-gradient(circle at 30% 30%, #FEE2E2, #EF4444 60%, #7F1D1D)", border: "#FCA5A5" },
    { name: "Tử Tinh", hex: "#C084FC", gradient: "radial-gradient(circle at 30% 30%, #F3E8FF, #9333EA 60%, #4C1D95)", border: "#D8B4FE" },
  ],
  Thổ: [
    { name: "Hổ Phách", hex: "#FBBF24", gradient: "radial-gradient(circle at 30% 30%, #FEF3C7, #D97706 60%, #78350F)", border: "#FDE68A" },
    { name: "Hồng Ngọc", hex: "#FB7185", gradient: "radial-gradient(circle at 30% 30%, #FFE4E6, #E11D48 60%, #881337)", border: "#FDA4AF" },
  ],
};

// --- ASTRONOMICAL LUNAR CALENDAR FUNCTIONS (Ho Ngoc Duc) ---

function INT(d: number): number {
  return Math.floor(d);
}

export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    INT((153 * m + 2) / 5) +
    365 * y +
    INT(y / 4) -
    INT(y / 100) +
    INT(y / 400) -
    32045;
  if (jd < 2299161) {
    jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  }
  return jd;
}

function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  const JdNew = Jd1 + C1 - deltat;
  return INT(JdNew + 0.5 + timeZone / 24);
}

function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - Math.PI * 2 * INT(L / (Math.PI * 2));
  return INT((L / Math.PI) * 6);
}

function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export function convertSolar2Lunar(
  dd: number,
  mm: number,
  yy: number,
  timeZone = 7
): { lunarDay: number; lunarMonth: number; lunarYear: number; isLeap: boolean } {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let isLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        isLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return { lunarDay, lunarMonth, lunarYear, isLeap };
}

function getElementFromCan(canIdx: number): "Kim" | "Thủy" | "Mộc" | "Hỏa" | "Thổ" {
  // Giáp Ất: Mộc (0,1), Bính Đinh: Hỏa (2,3), Mậu Kỷ: Thổ (4,5), Canh Tân: Kim (6,7), Nhâm Quý: Thủy (8,9)
  if (canIdx <= 1) return "Mộc";
  if (canIdx <= 3) return "Hỏa";
  if (canIdx <= 5) return "Thổ";
  if (canIdx <= 7) return "Kim";
  return "Thủy";
}

function getMatchingBirthYears(targetCanIdx: number, targetChiIdx: number): string {
  // Find years between 1945 and 2020 matching (year + 6) % 10 === targetCanIdx && (year + 8) % 12 === targetChiIdx
  const years: number[] = [];
  for (let y = 2018; y >= 1945; y--) {
    if ((y + 6) % 10 === targetCanIdx && (y + 8) % 12 === targetChiIdx) {
      years.push(y);
      if (years.length === 2) break;
    }
  }
  return `${CAN[targetCanIdx]} ${CHI[targetChiIdx]} (${years.join(", ")})`;
}

export function getDailyAlmanac(date: Date = new Date()): DailyAlmanacInfo {
  const dd = date.getDate();
  const mm = date.getMonth() + 1;
  const yy = date.getFullYear();
  const weekdayIdx = date.getDay();

  const jd = jdFromDate(dd, mm, yy);
  const { lunarDay, lunarMonth, lunarYear } = convertSolar2Lunar(dd, mm, yy, 7);

  // Day Can Chi
  const dayCanIdx = (jd + 9) % 10;
  const dayChiIdx = (jd + 1) % 12;
  const dayCanChi = `${CAN[dayCanIdx]} ${CHI[dayChiIdx]}`;

  // Year Can Chi
  const yearCanIdx = (lunarYear + 6) % 10;
  const yearChiIdx = (lunarYear + 8) % 12;
  const yearCanChi = `${CAN[yearCanIdx]} ${CHI[yearChiIdx]}`;

  // Month Can Chi
  const monthCanIdx = (lunarYear * 12 + lunarMonth + 3) % 10;
  const monthChiIdx = (lunarMonth + 1) % 12;
  const monthCanChi = `${CAN[monthCanIdx]} ${CHI[monthChiIdx]}`;

  // 12 Trực: dựa trên độ lệch giữa Chi Ngày và Chi Tháng
  const trucIdx = (dayChiIdx - monthChiIdx + 12) % 12;
  const truc = TRUC_LIST[trucIdx];

  // Hoàng Đạo / Hắc Đạo check
  const hoangDaoSlots = HOANG_DAO_MAP[dayChiIdx] || HOANG_DAO_MAP[0];
  const allGoodHours: AuspiciousHour[] = hoangDaoSlots
    .slice()
    .sort((a, b) => a.idx - b.idx)
    .map((slot) => ({
      chi: CHI[slot.idx],
      range: HOUR_RANGES[CHI[slot.idx]],
      star: slot.star,
      // Prefer daytime & evening hours (Mão 3, Thìn 4, Tỵ 5, Ngọ 6, Mùi 7, Thân 8, Dậu 9, Tuất 10)
      isPrime: slot.idx >= 3 && slot.idx <= 10,
    }));

  const primeCandidates = allGoodHours.filter((h) => h.isPrime);
  const primeHours = (primeCandidates.length >= 3 ? primeCandidates : allGoodHours).slice(0, 3);

  // Compatible Ages (Lục Hợp & Tam Hợp)
  // Lục Hợp pairs: Tý-Sửu (0-1), Dần-Hợi (2-11), Mão-Tuất (3-10), Thìn-Dậu (4-9), Tỵ-Thân (5-8), Ngọ-Mùi (6-7)
  const LUC_HOP_MAP: Record<number, number> = {
    0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6,
  };
  const tamHop1 = (dayChiIdx + 4) % 12;
  const tamHop2 = (dayChiIdx + 8) % 12;
  const lucHop = LUC_HOP_MAP[dayChiIdx];

  // Compatible Can (Thực Thần / Chính Quan / Chính Ấn)
  const compCan1 = (dayCanIdx + 5) % 10;
  const compCan2 = (dayCanIdx + 2) % 10;
  const compCan3 = (dayCanIdx + 8) % 10;

  const primaryCompatible = getMatchingBirthYears(compCan1, tamHop1);
  const secondaryCompatible = getMatchingBirthYears(compCan2, lucHop);
  const tertiaryCompatible = getMatchingBirthYears(compCan3, tamHop2);

  // Xung tuổi
  const xungChi = (dayChiIdx + 6) % 12;
  const xungCan = (dayCanIdx + 6) % 10;
  const conflictingAges = getMatchingBirthYears(xungCan, xungChi);

  // Element & Colors
  const dayElement = getElementFromCan(dayCanIdx);
  const luckyColors = COLOR_PALETTES[dayElement];

  // Directions (Hỷ Thần & Tài Thần theo Thiên Can ngày)
  const HY_THAN_DIR = [
    "Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam",
    "Đông Bắc", "Tây Bắc", "Tây Nam", "Chính Nam", "Đông Nam",
  ];
  const TAI_THAN_DIR = [
    "Đông Nam", "Đông Nam", "Chính Đông", "Chính Đông", "Chính Bắc",
    "Chính Nam", "Tây Nam", "Tây Nam", "Chính Tây", "Tây Bắc",
  ];
  const joyDirection = HY_THAN_DIR[dayCanIdx];
  const wealthDirection = TAI_THAN_DIR[dayCanIdx];
  const travelDirection = dayCanIdx % 2 === 0 ? wealthDirection : joyDirection;

  // Lucky Number (1..9)
  const LUCKY_NUMBERS = [3, 8, 2, 7, 5, 9, 4, 6, 1, 6];
  const luckyNumber = LUCKY_NUMBERS[dayCanIdx];

  // Overall Luck Level
  const luckLevel = truc.quality;
  const luckScore = luckLevel === "good" ? 86 + (jd % 10) : luckLevel === "neutral" ? 72 + (jd % 8) : 56 + (jd % 9);
  const luckLabel =
    luckLevel === "good"
      ? "Ngày Hoàng Đạo • Cát Khí Vượng"
      : luckLevel === "neutral"
      ? "Ngày Bình Hòa • Thuận Tự Nhiên"
      : "Ngày Hắc Đạo • Nên Tĩnh Tâm";

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const solarDateStr = `${WEEKDAYS_VI[weekdayIdx]}, ${pad2(dd)}/${pad2(mm)}/${yy}`;
  const shortSolarStr = `${pad2(dd)}/${pad2(mm)}`;
  const lunarDateStr = `${pad2(lunarDay)} tháng ${pad2(lunarMonth)}, ${yearCanChi}`;

  const dailyAdvice =
    luckLevel === "good"
      ? `Khí vận ngày ${dayCanChi} (${truc.name}) hanh thông, cát tinh hội chiếu. Rất thích hợp để triển khai mục tiêu quan trọng, mở rộng giao kết và xuất hành hướng ${travelDirection} vào khung giờ ${primeHours[0]?.range.replace(/\s/g, "")}.`
      : luckLevel === "neutral"
      ? `Năng lượng ngày ${dayCanChi} (${truc.name}) ở thế cân bằng ổn định. Nên ưu tiên hoàn thiện các công việc đang dang dở, giữ tâm thế ôn hòa và đón sinh khí từ hướng ${travelDirection}.`
      : `Ngày ${dayCanChi} (${truc.name}) khí trường có sự giao động. Chủ sự nên lấy tĩnh chế động, tránh quyết định vội vàng về tài chính và ưu tiên vun bồi nội lực, tĩnh tâm chiêm nghiệm.`;

  return {
    solarDateStr,
    shortSolarStr,
    weekdayShort: WEEKDAYS_SHORT[weekdayIdx],
    lunarDay,
    lunarMonth,
    lunarYear,
    lunarDateStr,
    dayCanChi,
    monthCanChi,
    yearCanChi,
    napAm: `Hành ${dayElement}`,
    trucName: truc.name,
    trucQuality: truc.quality,
    luckLevel,
    luckScore,
    luckLabel,
    primeHours,
    allGoodHours,
    compatibleAges: primaryCompatible,
    compatibleAgesFull: [primaryCompatible, secondaryCompatible, tertiaryCompatible],
    conflictingAges,
    luckyColors,
    travelDirection,
    wealthDirection,
    joyDirection,
    luckyNumber,
    shouldDo: truc.shouldDo,
    shouldAvoid: truc.shouldAvoid,
    shouldDoList: truc.shouldDoList,
    shouldAvoidList: truc.shouldAvoidList,
    dailyAdvice,
  };
}

let _cachedDateKey = "";
let _cachedSevenDays: DailyAlmanacInfo[] | null = null;

export function getSevenDayForecast(startDate: Date = new Date()): DailyAlmanacInfo[] {
  const key = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
  if (_cachedDateKey === key && _cachedSevenDays) {
    return _cachedSevenDays;
  }
  const days: DailyAlmanacInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(getDailyAlmanac(d));
  }
  _cachedDateKey = key;
  _cachedSevenDays = days;
  return days;
}

// Instant 0-cost personal compatibility check from user's birth year (if available)
export function getPersonalBirthYearNote(birthDateStr?: string | null, dayInfo?: DailyAlmanacInfo): string | null {
  if (!birthDateStr || !dayInfo) return null;
  const yearMatch = String(birthDateStr).match(/(19\d{2}|20\d{2})/);
  if (!yearMatch) return null;
  const birthYear = Number(yearMatch[1]);
  if (!birthYear || birthYear < 1930 || birthYear > 2025) return null;

  const userCanIdx = (birthYear + 6) % 10;
  const userChiIdx = (birthYear + 8) % 12;
  const userCanChi = `${CAN[userCanIdx]} ${CHI[userChiIdx]}`;

  if (dayInfo.compatibleAgesFull.some((item) => item.includes(CHI[userChiIdx]))) {
    return `Tuổi ${userCanChi} (${birthYear}) của bạn thuộc nhóm Tam Hợp / Lục Hợp đón cát khí hôm nay.`;
  }
  if (dayInfo.conflictingAges.includes(CHI[userChiIdx])) {
    return `Tuổi ${userCanChi} (${birthYear}) của bạn hôm nay nên giữ tâm bình hòa, tránh quyết định vội.`;
  }
  return `Tuổi ${userCanChi} (${birthYear}) của bạn hôm nay vận trình bình ổn, thuận lợi theo khung giờ Hoàng Đạo.`;
}
