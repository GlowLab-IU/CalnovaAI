"use client";

import React, { useState, useEffect, useRef } from "react";

interface RollDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (newDate: string) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

export default function RollDatePicker({
  value,
  onChange,
  minYear = 1930,
  maxYear = new Date().getFullYear(),
  className = "",
}: RollDatePickerProps) {
  // Parse initial YYYY-MM-DD or default to 1995-01-01
  const parseValue = (val: string) => {
    if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split("-").map(Number);
      return {
        year: y || 1995,
        month: m || 1,
        day: d || 1,
      };
    }
    return { year: 1995, month: 1, day: 1 };
  };

  const initial = parseValue(value);
  const [year, setYear] = useState<number>(initial.year);
  const [month, setMonth] = useState<number>(initial.month);
  const [day, setDay] = useState<number>(initial.day);
  const [isWheelOpen, setIsWheelOpen] = useState<boolean>(false);

  const dayListRef = useRef<HTMLDivElement>(null);
  const monthListRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  // Sync if external value changes
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parsed = parseValue(value);
      setYear(parsed.year);
      setMonth(parsed.month);
      setDay(parsed.day);
    } else if (!value) {
      // Ensure parent always gets a valid initial date so registration isn't blocked
      const formatted = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      onChange(formatted);
    }
  }, [value]);

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m, 0).getDate();
  };

  const maxDays = getDaysInMonth(year, month);

  const updateDate = (newY: number, newM: number, newD: number) => {
    const validMaxD = getDaysInMonth(newY, newM);
    const clampedD = Math.min(Math.max(1, newD), validMaxD);
    setYear(newY);
    setMonth(newM);
    setDay(clampedD);
    const formatted = `${newY}-${String(newM).padStart(2, "0")}-${String(clampedD).padStart(2, "0")}`;
    onChange(formatted);
  };

  const stepDay = (delta: number) => {
    let nextD = day + delta;
    if (nextD > maxDays) nextD = 1;
    if (nextD < 1) nextD = maxDays;
    updateDate(year, month, nextD);
  };

  const stepMonth = (delta: number) => {
    let nextM = month + delta;
    if (nextM > 12) nextM = 1;
    if (nextM < 1) nextM = 12;
    updateDate(year, nextM, day);
  };

  const stepYear = (delta: number) => {
    let nextY = year + delta;
    if (nextY > maxYear) nextY = minYear;
    if (nextY < minYear) nextY = maxYear;
    updateDate(nextY, month, day);
  };

  // Auto-scroll active items into center when custom wheel opens
  useEffect(() => {
    if (isWheelOpen) {
      setTimeout(() => {
        const scrollItem = (container: HTMLDivElement | null, targetVal: number) => {
          if (!container) return;
          const el = container.querySelector(`[data-val="${targetVal}"]`) as HTMLElement;
          if (el) {
            container.scrollTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
          }
        };
        scrollItem(dayListRef.current, day);
        scrollItem(monthListRef.current, month);
        scrollItem(yearListRef.current, year);
      }, 50);
    }
  }, [isWheelOpen]);

  const days = Array.from({ length: maxDays }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  return (
    <div className={`w-full select-none ${className}`}>
      {/* 3-Column Roll Up & Down Selector */}
      <div className="grid grid-cols-3 gap-2">
        {/* NGÀY */}
        <div className="bg-[#090514] border border-indigo-500/30 rounded-xl p-1.5 flex flex-col items-center focus-within:border-[#8B5CF6] transition-all">
          <button
            type="button"
            onClick={() => stepDay(1)}
            className="w-full py-1 text-indigo-400 hover:text-white active:scale-95 flex items-center justify-center text-xs"
            aria-label="Tăng ngày"
          >
            ▲
          </button>
          <div className="relative w-full flex items-center justify-center">
            <select
              value={day}
              onChange={(e) => updateDate(year, month, Number(e.target.value))}
              className="w-full bg-transparent text-center font-bold text-base sm:text-sm text-white outline-none appearance-none py-1 cursor-pointer"
            >
              {days.map((d) => (
                <option key={d} value={d} className="bg-[#0f0724] text-white">
                  Ngày {String(d).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => stepDay(-1)}
            className="w-full py-1 text-indigo-400 hover:text-white active:scale-95 flex items-center justify-center text-xs"
            aria-label="Giảm ngày"
          >
            ▼
          </button>
        </div>

        {/* THÁNG */}
        <div className="bg-[#090514] border border-indigo-500/30 rounded-xl p-1.5 flex flex-col items-center focus-within:border-[#8B5CF6] transition-all">
          <button
            type="button"
            onClick={() => stepMonth(1)}
            className="w-full py-1 text-indigo-400 hover:text-white active:scale-95 flex items-center justify-center text-xs"
            aria-label="Tăng tháng"
          >
            ▲
          </button>
          <div className="relative w-full flex items-center justify-center">
            <select
              value={month}
              onChange={(e) => updateDate(year, Number(e.target.value), day)}
              className="w-full bg-transparent text-center font-bold text-base sm:text-sm text-white outline-none appearance-none py-1 cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m} className="bg-[#0f0724] text-white">
                  Tháng {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => stepMonth(-1)}
            className="w-full py-1 text-indigo-400 hover:text-white active:scale-95 flex items-center justify-center text-xs"
            aria-label="Giảm tháng"
          >
            ▼
          </button>
        </div>

        {/* NĂM */}
        <div className="bg-[#090514] border border-indigo-500/30 rounded-xl p-1.5 flex flex-col items-center focus-within:border-[#8B5CF6] transition-all">
          <button
            type="button"
            onClick={() => stepYear(1)}
            className="w-full py-1 text-indigo-400 hover:text-white active:scale-95 flex items-center justify-center text-xs"
            aria-label="Tăng năm"
          >
            ▲
          </button>
          <div className="relative w-full flex items-center justify-center">
            <select
              value={year}
              onChange={(e) => updateDate(Number(e.target.value), month, day)}
              className="w-full bg-transparent text-center font-bold text-base sm:text-sm text-white outline-none appearance-none py-1 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-[#0f0724] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => stepYear(-1)}
            className="w-full py-1 text-indigo-400 hover:text-white active:scale-95 flex items-center justify-center text-xs"
            aria-label="Giảm năm"
          >
            ▼
          </button>
        </div>
      </div>

      {/* Quick toggle for In-App Browser Touch Drum Roll Wheel */}
      <div className="mt-1.5 flex items-center justify-between px-1">
        <span className="text-[11px] text-slate-400">
          Đã chọn: <strong className="text-violet-300">{String(day).padStart(2, "0")}/{String(month).padStart(2, "0")}/{year}</strong>
        </span>
        <button
          type="button"
          onClick={() => setIsWheelOpen(!isWheelOpen)}
          className="text-[11px] text-violet-400 hover:text-violet-300 underline cursor-pointer"
        >
          {isWheelOpen ? "Đóng bảng cuộn" : "Mở bảng cuộn nhanh"}
        </button>
      </div>

      {/* Pure HTML Touch Scrollable Drum-Roll Wheel (Fallback for QR / Zalo / FB WebViews where native <select> may not pop up) */}
      {isWheelOpen && (
        <div className="mt-2 p-3 bg-[#090514] border border-violet-500/40 rounded-2xl shadow-xl">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-1.5">
            <div>Ngày</div>
            <div>Tháng</div>
            <div>Năm</div>
          </div>
          <div className="grid grid-cols-3 gap-2 h-36 relative">
            {/* Day Scroll Column */}
            <div
              ref={dayListRef}
              className="h-36 overflow-y-auto snap-y snap-mandatory scrollbar-thin rounded-lg bg-[#12092b]/80 border border-indigo-500/20 py-10"
            >
              {days.map((d) => (
                <button
                  key={d}
                  type="button"
                  data-val={d}
                  onClick={() => updateDate(year, month, d)}
                  className={`w-full py-2 text-center snap-center transition-all text-sm ${
                    d === day
                      ? "bg-violet-600/40 text-white font-black border-y border-violet-400/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {String(d).padStart(2, "0")}
                </button>
              ))}
            </div>

            {/* Month Scroll Column */}
            <div
              ref={monthListRef}
              className="h-36 overflow-y-auto snap-y snap-mandatory scrollbar-thin rounded-lg bg-[#12092b]/80 border border-indigo-500/20 py-10"
            >
              {months.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-val={m}
                  onClick={() => updateDate(year, m, day)}
                  className={`w-full py-2 text-center snap-center transition-all text-sm ${
                    m === month
                      ? "bg-violet-600/40 text-white font-black border-y border-violet-400/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tháng {String(m).padStart(2, "0")}
                </button>
              ))}
            </div>

            {/* Year Scroll Column */}
            <div
              ref={yearListRef}
              className="h-36 overflow-y-auto snap-y snap-mandatory scrollbar-thin rounded-lg bg-[#12092b]/80 border border-indigo-500/20 py-10"
            >
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  data-val={y}
                  onClick={() => updateDate(y, month, day)}
                  className={`w-full py-2 text-center snap-center transition-all text-sm ${
                    y === year
                      ? "bg-violet-600/40 text-white font-black border-y border-violet-400/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
