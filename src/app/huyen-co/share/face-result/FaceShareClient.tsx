"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { decodeId } from "@/utils/hashId";
import FaceResultClient from "./FaceResultClient";

export default function FaceShareClient() {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") || "";
  const refCode = searchParams?.get("ref") || "";

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchAnalysis = async () => {
      try {
        let realId = parseInt(id);
        if (isNaN(realId)) {
          const decoded = decodeId(id);
          if (decoded === null) {
            setLoading(false);
            return;
          }
          realId = decoded;
        }

        let baseUrl = "https://api.calnovaai.com/glowlab";
        if (typeof window !== "undefined") {
          const hostname = window.location.hostname;
          if (hostname.includes("calnovaai.com")) {
            baseUrl = "https://api.calnovaai.com/glowlab";
          }
        }

        const res = await fetch(`${baseUrl}/facial-analysis/shared/${realId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.code === "OPERATION_SUCCESS" || json.code === 0 || json.success) {
            setAnalysis(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch facial analysis:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090514] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-[#fcd34d] border-indigo-500/10 animate-spin mb-4" />
        <p className="text-xs text-slate-400">Đang tải kết quả khuôn mặt...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#090514] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-[#fcd34d]">🔮 Không tìm thấy kết quả</h1>
        <p className="text-slate-400 mb-8 max-w-md">Liên kết chia sẻ không tồn tại hoặc đã hết hạn.</p>
        <Link href="/huyen-co" className="px-6 py-2 bg-indigo-600 rounded-full hover:bg-indigo-700 font-bold transition-all">
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  return <FaceResultClient analysis={analysis} refCode={refCode} />;
}
