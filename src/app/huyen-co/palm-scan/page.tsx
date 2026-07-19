"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "../AuthModal";
import PalmResultClient from "../share/palm-result/PalmResultClient";
import { encodeId } from "@/utils/hashId";
import { HandLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

const LINES_CONFIG: Record<string, { label: string; color: string }> = {
  life_line: { label: "Sinh Đạo", color: "#00FF87" },
  head_line: { label: "Trí Đạo", color: "#00F0FF" },
  heart_line: { label: "Tâm Đạo", color: "#FF4B91" },
  fate_line: { label: "Sự Nghiệp", color: "#FFD700" },
};

export default function PalmScanPage() {
  const router = useRouter();
  
  // Camera & Capture states
  const [isMirrored, setIsMirrored] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // MediaPipe
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const detectionStartTimeRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  
  // Scan parameters
  const [gender, setGender] = useState<"male" | "female">("male");
  const [handSide, setHandSide] = useState<"left" | "right">("left");
  
  // Processing States
  const [status, setStatus] = useState<"idle" | "capturing" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Tab control in results
  const [selectedLine, setSelectedLine] = useState<string>("life_line");
  
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"unsaved" | "saving" | "saved" | "error">("unsaved");
  const [savedId, setSavedId] = useState<string | null>(null);

  // Sync hand side based on gender rules (traditional: Nam tả Nữ hữu)
  useEffect(() => {
    if (gender === "male") {
      setHandSide("left");
    } else {
      setHandSide("right");
    }
  }, [gender]);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
      } catch (error) {
        console.error("Failed to initialize MediaPipe HandLandmarker:", error);
      }
    };
    initMediaPipe();

    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("authUser");
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error(e);
        }
      }
    }
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (status === "success" && analysisData && token && saveStatus === "unsaved") {
      handleSaveResult();
    }
  }, [status, analysisData, token, saveStatus]);

  const loadingMessages = [
    "AI đang định vị các đường chỉ chính (Sinh đạo, Trí đạo, Tâm đạo)...",
    "Đang quét hình thái các gò lòng bàn tay và độ sâu đường chỉ...",
    "Đang giải mã cung Định Mệnh và xu hướng tương lai...",
    "Đang phân tích các giao điểm và dấu hiệu đặc biệt trên lòng bàn tay...",
    "Đang tính toán mức năng lượng sinh trắc học và hoàn thiện sơ đồ..."
  ];

  useEffect(() => {
    let interval: any;
    if (status === "capturing" || status === "uploading") {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    } else {
      setCurrentMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const currentLoadingMessage = loadingMessages[currentMessageIndex];

  const startCamera = async () => {
    setCameraError("");
    try {
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        
        // Dynamically check if the camera is front-facing to apply mirror effect
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        // If facingMode is 'user' or if it's undefined (common for desktop webcams), apply mirror
        const isUserFacing = settings.facingMode === "user" || !settings.facingMode;
        setIsMirrored(isUserFacing);
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Không thể truy cập camera. Vui lòng cấp quyền hoặc kiểm tra thiết bị.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const renderLoop = () => {
    if (!videoRef.current || !canvasRef.current || !handLandmarkerRef.current || !cameraActive) return;
    
    const video = videoRef.current;
    
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      if (status === "idle" && cameraActive) {
        requestRef.current = requestAnimationFrame(renderLoop);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      
      const results = handLandmarkerRef.current.detectForVideo(video, performance.now());
      
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.landmarks && results.landmarks.length > 0) {
        // Evaluate hand size/quality for auto-capture
        const landmarks = results.landmarks[0];
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        for (const lm of landmarks) {
          if (lm.x < minX) minX = lm.x;
          if (lm.x > maxX) maxX = lm.x;
          if (lm.y < minY) minY = lm.y;
          if (lm.y > maxY) maxY = lm.y;
        }
        const handWidth = maxX - minX;
        const handHeight = maxY - minY;
        
        // Hand should occupy a reasonable portion of the screen (at least 30%)
        const isGoodSize = handWidth > 0.3 || handHeight > 0.3;

        // Auto-capture logic
        if (isGoodSize) {
          if (detectionStartTimeRef.current === null) {
            detectionStartTimeRef.current = performance.now();
          } else if (performance.now() - detectionStartTimeRef.current > 2500) { // wait 2.5s
            if (status === "idle") {
              setTimeout(() => {
                handleCapture();
              }, 0);
            }
          }
        } else {
          detectionStartTimeRef.current = null; // Reset if hand moves too far away
        }

        const drawingUtils = new DrawingUtils(ctx);
        for (const drawLandmarks of results.landmarks) {
          // Change color slightly if it's ready vs scanning
          const isScanning = detectionStartTimeRef.current !== null;
          const skeletonColor = isScanning ? "#00FF87" : "#d4af37";
          
          drawingUtils.drawConnectors(
            drawLandmarks,
            HandLandmarker.HAND_CONNECTIONS,
            { color: skeletonColor, lineWidth: 2 }
          );
          drawingUtils.drawLandmarks(drawLandmarks, {
            color: "#FFD700",
            lineWidth: 1,
            radius: 3
          });
        }
      } else {
        // Reset counter if hand is lost
        detectionStartTimeRef.current = null;
      }
      ctx.restore();
    }
    
    if (status === "idle" && cameraActive) {
      requestRef.current = requestAnimationFrame(renderLoop);
    }
  };

  useEffect(() => {
    if (cameraActive && status === "idle") {
      requestRef.current = requestAnimationFrame(renderLoop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (canvasRef.current) {
         const ctx = canvasRef.current.getContext("2d");
         if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [cameraActive, status, isMirrored]);

  const handleCapture = () => {
    if (!videoRef.current || !cameraActive) return;
    
    setStatus("capturing");
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedUrl(URL.createObjectURL(blob));
          stopCamera();
          triggerUpload(blob);
        }
      }, "image/jpeg", 0.9);
    }
  };

  const getAPIUrls = () => {
    let aiUrl = "https://api.calnovaai.com/ai";
    let saveUrl = "https://api.calnovaai.com/glowlab";
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("calnovaai.com")) {
        aiUrl = "https://api.calnovaai.com/ai";
        saveUrl = "https://api.calnovaai.com/glowlab";
      }
    }
    return { aiUrl, saveUrl };
  };

  const convertToPalmAnalysisDto = (apiResult: any): any => {
    if (!apiResult || !apiResult.success || !apiResult.data || !apiResult.data.palms || apiResult.data.palms.length === 0) {
      throw new Error("Không phát hiện được vân tay rõ nét. Vui lòng thử lại.");
    }
    
    const palm = apiResult.data.palms[0];
    const interpretation = palm.interpretation || {};
    const traditional = interpretation.traditional || {};
    const mystical = interpretation.mystical || {};
    
    const interpretations: any[] = [];
    let id = 1;
    if (mystical.life_line) {
      interpretations.push({
        id: id++,
        lineType: "life",
        pattern: mystical.life_line.description || "",
        meaning: mystical.life_line.meaning || "",
        lengthPx: 0,
        confidence: palm.confidence || 0.9,
      });
    }
    if (mystical.head_line) {
      interpretations.push({
        id: id++,
        lineType: "head",
        pattern: mystical.head_line.description || "",
        meaning: mystical.head_line.meaning || "",
        lengthPx: 0,
        confidence: palm.confidence || 0.9,
      });
    }
    if (mystical.heart_line) {
      interpretations.push({
        id: id++,
        lineType: "heart",
        pattern: mystical.heart_line.description || "",
        meaning: mystical.heart_line.meaning || "",
        lengthPx: 0,
        confidence: palm.confidence || 0.9,
      });
    }
    if (mystical.fate_line) {
      interpretations.push({
        id: id++,
        lineType: "fate",
        pattern: mystical.fate_line.description || "",
        meaning: mystical.fate_line.meaning || "",
        lengthPx: 0,
        confidence: palm.confidence || 0.9,
      });
    }

    const lifeAspects: any[] = [];
    let aspectId = 1;
    if (traditional.life_aspects) {
      for (const [key, value] of Object.entries(traditional.life_aspects)) {
        lifeAspects.push({
          id: aspectId++,
          aspect: key,
          content: value,
        });
      }
    }

    return {
      id: 0,
      userId: 0,
      annotatedImage: apiResult.data?.annotated_image_url || "",
      palmLinesDetected: interpretations.length,
      detectedHeartLine: mystical.heart_line ? 1 : 0,
      detectedHeadLine: mystical.head_line ? 1 : 0,
      detectedLifeLine: mystical.life_line ? 1 : 0,
      detectedFateLine: mystical.fate_line ? 1 : 0,
      targetLines: "",
      imageHeight: 0,
      imageWidth: 0,
      summaryText: traditional.overall_assessment || mystical.summary || "",
      interpretations,
      lifeAspects,
      createdAt: new Date().toISOString(),
      originalData: apiResult, // store original API response
    };
  };

  const triggerUpload = async (blob: Blob) => {
    setStatus("uploading");
    setErrorMessage("");
    
    const { aiUrl } = getAPIUrls();
    const formData = new FormData();
    formData.append("file", blob, "palm_capture.jpg");
    
    try {
      const res = await fetch(`${aiUrl}/analyze-palm/?engine=gpt&language=vi&gender=${gender}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = `Lỗi từ máy chủ AI: ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            if (typeof errData.detail === "object") {
              errorMsg = errData.detail.message || errData.detail.suggestion || JSON.stringify(errData.detail);
            } else {
              errorMsg = errData.detail;
            }
          }
        } catch (e) {
          // Ignore JSON parsing error
        }
        throw new Error(errorMsg);
      }

      let result: any = null;
      try {
        result = await res.json();
      } catch (e: any) {
        console.error("JSON parse error, attempting text parse:", e);
        try {
          const text = await res.text();
          console.error("Non-JSON response text:", text.substring(0, 200));
        } catch (textErr) {
          // Ignore
        }
        throw new Error(`Máy chủ AI trả về kết quả không hợp lệ (Mã: ${res.status})`);
      }
      
      if (result && result.success && result.data && result.data.palms && result.data.palms.length > 0) {
        const mappedData = convertToPalmAnalysisDto(result);
        setAnalysisData(mappedData);
        setAnnotatedImage(result.data?.annotated_image_url || "");
        setStatus("success");
      } else {
        throw new Error("Không phát hiện được vân tay rõ nét. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setErrorMessage(err.message || "Lỗi xử lý hình ảnh.");
      setStatus("error");
    }
  };

  const handleSaveResult = async () => {
    if (!analysisData || !capturedBlob) return;
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setSaveStatus("saving");
    const { saveUrl } = getAPIUrls();
    
    try {
      // 1. We must mock the Cloudinary URL since our DB requires originalUrl
      // To bypass uploading to Cloudinary, we pass a mockup url or build formData if backed supports it.
      // Here we map to matches face.api.ts payload schema.
      const interpretation = analysisData.interpretation || {};
      const mystical = interpretation.mystical || {};
      const traditional = interpretation.traditional || {};
      const linesData = analysisData.lines || {};

      const interpretationsArray: any[] = [];
      if (mystical.detailed_insights && Array.isArray(mystical.detailed_insights)) {
        mystical.detailed_insights.forEach((insight: any) => {
          interpretationsArray.push({
            lineType: insight.line.replace("_line", ""),
            pattern: insight.essence || "",
            meaning: insight.narrative || "",
            lengthPx: linesData[insight.line]?.length_px || 0,
            confidence: linesData[insight.line]?.bbox_confidence || 0,
          });
        });
      }

      const lifeAspectsArray: any[] = [];
      const aspectsData = traditional.life_aspects || {};
      for (const [key, val] of Object.entries(aspectsData)) {
        lifeAspectsArray.push({
          aspect: key,
          content: Array.isArray(val) ? val.join("\n") : String(val),
        });
      }

      const payload = {
        userId: user?.id?.toString() || "guest",
        gender,
        handSide,
        originalUrl: analysisData.annotatedImage || "",
        annotatedImage: annotatedImage || "",
        targetLines: JSON.stringify(linesData),
        imageHeight: 1080,
        imageWidth: 1080,
        imageChannels: 3,
        summaryText: traditional.overall_assessment || "Xem chỉ tay trực tiếp trên Web",
        interpretations: interpretationsArray,
        lifeAspects: lifeAspectsArray,
      };

      const res = await fetch(`${saveUrl}/palm-analysis`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          result = await res.json();
        } catch (e) {
          console.error("Failed to parse error JSON:", e);
        }
      }

      if (res.status === 401 || (result && result.code === "EXPIRED_TOKEN")) {
        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        setIsAuthModalOpen(true);
        setSaveStatus("unsaved");
        return;
      }

      if (res.ok && result && (result.code === 0 || result.code === "OPERATION_SUCCESS" || result.data)) {
        setSaveStatus("saved");
        const freshId = result.data?.id || result.id;
        setSavedId(freshId);
      } else {
        const errorText = result?.message || `Lỗi lưu kết quả (Mã: ${res.status})`;
        throw new Error(errorText);
      }
    } catch (err: any) {
      console.error("Save failed:", err);
      setSaveStatus("error");
    }
  };

  const handleShareLink = () => {
    if (!savedId) return;
    const hashed = encodeId(parseInt(savedId.toString(), 10));
    const shareUrl = `${window.location.origin}/huyen-co/share/palm-result?id=${hashed}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Đã sao chép liên kết chia sẻ của bạn vào Clipboard!");
  };

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
  };

  if (status === "success" && analysisData) {
    const mappedAnalysisData = {
      ...analysisData,
      id: savedId ? parseInt(savedId) : 0,
    };
    return (
      <PalmResultClient
        analysis={mappedAnalysisData}
        isScanningPage={true}
        saveStatus={saveStatus}
        onSave={handleSaveResult}
        onShare={handleShareLink}
        onReset={() => {
          setStatus("idle");
          setSaveStatus("unsaved");
          setSavedId(null);
          startCamera();
        }}
        token={token}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#06030d] text-white font-sans relative flex flex-col justify-between">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute top-[20%] left-[-20%] w-[60%] aspect-square rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-20%] w-[60%] aspect-square rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-indigo-500/10 relative z-20 bg-[#06030d]/80 backdrop-blur-md">
        <Link href="/huyen-co" className="flex items-center gap-2 hover:text-[#d4af37] transition-all">
          <span className="text-xl">←</span>
          <span className="text-xs uppercase font-black tracking-widest">Trang chủ</span>
        </Link>
        <h1 className="text-sm font-black tracking-widest text-[#d4af37] uppercase font-serif">
          AI Palm Profiler • Quét Chỉ Tay
        </h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {status === "idle" && (
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            {/* Custom Camera Container */}
            <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden border border-indigo-500/30 relative bg-black shadow-2xl flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-6 space-y-4">
                  <span className="text-4xl block">⚠️</span>
                  <p className="text-xs text-slate-300">{cameraError}</p>
                  <button onClick={startCamera} className="px-4 py-2 bg-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    Thử lại
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} className={`w-full h-full object-cover ${isMirrored ? "scale-x-[-1]" : ""}`} playsInline muted />
                  
                  <canvas ref={canvasRef} className={`absolute top-0 left-0 w-full h-full object-cover pointer-events-none ${isMirrored ? "scale-x-[-1]" : ""}`} />
                  
                  {/* Palm Scanner Guides Overlay */}
                  <div className="absolute inset-0 border-[3px] border-[#d4af37]/20 rounded-3xl pointer-events-none m-4 flex items-center justify-center">
                    {/* Golden Hand silhouette boundary overlay */}
                    <div className="w-4/5 h-4/5 border border-dashed border-[#d4af37]/40 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-[10px] text-[#d4af37] font-bold tracking-widest bg-black/60 px-3 py-1 rounded-full uppercase">
                        Đặt bàn tay vào giữa
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Parameters Controls */}
            <div className="w-full bg-[#120a26]/80 border border-indigo-500/20 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Giới tính:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGender("male")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      gender === "male" ? "bg-cyan-500 text-black shadow" : "bg-[#0d071a] text-slate-400 border border-indigo-500/10"
                    }`}
                  >
                    Nam (Tả)
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      gender === "female" ? "bg-rose-500 text-white shadow" : "bg-[#0d071a] text-slate-400 border border-indigo-500/10"
                    }`}
                  >
                    Nữ (Hữu)
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">Bàn tay quét:</span>
                <span className="text-xs font-bold text-[#d4af37] tracking-widest uppercase">
                  {handSide === "left" ? "Tay Trái (Tả)" : "Tay Phải (Hữu)"}
                </span>
              </div>
            </div>

            {/* Capture triggers */}
            <button
              onClick={handleCapture}
              disabled={!cameraActive}
              className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer shadow-lg shadow-white/10"
            >
              <div className="w-16 h-16 rounded-full bg-white hover:bg-slate-200 transition-colors" />
            </button>
          </div>
        )}

        {(status === "capturing" || status === "uploading") && (
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            <style>{`
              @keyframes scan-line-movement {
                0% { top: 0%; opacity: 0.3; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0.3; }
              }
              .animate-scan-line {
                position: absolute;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, transparent, #d4af37, transparent);
                box-shadow: 0 0 15px #d4af37, 0 0 5px #d4af37;
                animation: scan-line-movement 3s linear infinite;
                z-index: 10;
              }
            `}</style>
            
            <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden border border-[#d4af37]/30 relative bg-black shadow-2xl flex items-center justify-center">
              {capturedUrl && (
                <img 
                  src={capturedUrl} 
                  alt="Captured palm"
                  className={`w-full h-full object-cover rounded-3xl ${isMirrored ? "scale-x-[-1]" : ""} blur-sm opacity-80`}
                />
              )}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Scan Line */}
              <div className="animate-scan-line" />
              
              {/* Scanner Guide Overlay */}
              <div className="absolute inset-0 border-[3px] border-[#d4af37]/10 rounded-3xl pointer-events-none m-4 flex items-center justify-center">
                <div className="w-4/5 h-4/5 border border-dashed border-[#d4af37]/20 rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-[#d4af37]/60 font-bold tracking-widest bg-black/40 px-3 py-1 rounded-full uppercase">
                    AI SCANNING...
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3 px-4">
              <div className="w-10 h-10 rounded-full border-2 border-t-[#d4af37] border-indigo-500/10 animate-spin mx-auto flex items-center justify-center">
                <span className="text-xs">🔮</span>
              </div>
              <h3 className="text-md font-black tracking-widest text-[#d4af37] uppercase font-serif">
                Đang phân tích vân tay...
              </h3>
              <p className="text-xs text-slate-300 min-h-[40px] leading-relaxed transition-all duration-500">
                {currentLoadingMessage}
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="w-full max-w-md bg-[#120a26] border border-[#d4af37]/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.03))] pointer-events-none" />
            
            <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto border border-[#d4af37]/20">
              <span className="text-3xl">🔮</span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-md font-bold text-[#d4af37] uppercase tracking-widest font-serif">
                Chưa Nhận Diện Rõ Chỉ Tay
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                AI cần nhìn rõ các đường vân chính (Sinh đạo, Trí đạo, Tâm đạo) trong lòng bàn tay để giải mã mệnh lý chính xác.
              </p>
            </div>

            <div className="bg-[#0b0517] border border-indigo-500/10 rounded-2xl p-4 text-left space-y-3">
              <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest border-b border-indigo-500/10 pb-1.5">
                💡 Bí quyết quét bàn tay thành công:
              </h4>
              <ul className="text-[11px] text-slate-300 space-y-2 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] mt-0.5">✦</span>
                  <span><strong>Đủ ánh sáng:</strong> Tránh bóng râm che mất lòng bàn tay. Chụp ở nơi có ánh sáng đồng đều.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] mt-0.5">✦</span>
                  <span><strong>Xòe thẳng các ngón tay:</strong> Giữ bàn tay phẳng và các ngón tay hơi xòe ra để mở rộng lòng bàn tay.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] mt-0.5">✦</span>
                  <span><strong>Tránh rung lắc:</strong> Giữ điện thoại song song với lòng bàn tay và chụp thật chắc tay.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] mt-0.5">✦</span>
                  <span><strong>Khoảng cách vừa phải:</strong> Đặt bàn tay vừa vặn vào vòng tròn hướng dẫn trên camera.</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                startCamera();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-900 hover:to-amber-950 text-white font-bold text-xs tracking-widest uppercase rounded-xl shadow-lg transition-all border border-amber-700/30 cursor-pointer"
            >
              Thử quét lại ngay
            </button>
          </div>
        )}


      </main>

      {/* Auth Modal for Login to Save */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer info */}
      <footer className="px-6 py-4 border-t border-indigo-500/10 text-center text-[10px] text-slate-600">
        <p>Huyền Cơ AI • Sử dụng mô hình YOLOv11 & SAM phân tích hình thái sinh học.</p>
      </footer>
    </div>
  );
}
