"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "../AuthModal";
import FaceResultClient from "../share/face-result/FaceResultClient";
import { encodeId } from "@/utils/hashId";
import { FaceLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

export default function FaceScanPage() {
  const router = useRouter();
  
  // Camera & Capture states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // MediaPipe
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const detectionStartTimeRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isMirrored, setIsMirrored] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  
  // Processing States
  const [status, setStatus] = useState<"idle" | "capturing" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Tab control in results
  const [activeTab, setActiveTab] = useState<"shape" | "features" | "destiny">("shape");
  
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"unsaved" | "saving" | "saved" | "error">("unsaved");
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        });
      } catch (error) {
        console.error("Failed to initialize MediaPipe FaceLandmarker:", error);
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
    "AI đang định vị ngũ quan (Trán, Mắt, Mũi, Miệng)...",
    "Đang phân tích tỷ lệ Tam Đình để đánh giá sự hài hòa...",
    "Đang giải mã Thiên Thương, Địa Các và định dạng khung xương mặt...",
    "Đang đối chiếu với cơ sở dữ liệu nhân trắc học diện tướng cổ truyền...",
    "Đang tối ưu hóa các điểm tọa độ tỷ lệ vàng để hoàn tất bản đồ..."
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
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);

        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
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
    if (!videoRef.current || !canvasRef.current || !faceLandmarkerRef.current || !cameraActive) return;
    
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
      
      const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
      
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        // Auto-capture logic
        if (detectionStartTimeRef.current === null) {
          detectionStartTimeRef.current = performance.now();
        } else if (performance.now() - detectionStartTimeRef.current > 1500) {
          // If face detected continuously for 1.5s
          if (status === "idle") {
            setTimeout(() => {
              handleCapture();
            }, 0);
          }
        }

        const drawingUtils = new DrawingUtils(ctx);
        for (const landmarks of results.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#d4af37", lineWidth: 0.5 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
            { color: "#FFD700", lineWidth: 1.5 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
            { color: "#FFD700", lineWidth: 1.5 }
          );
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            { color: "#E0E0E0", lineWidth: 1.5 }
          );
        }
      } else {
        // Reset counter if face is lost
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

  const triggerUpload = async (blob: Blob) => {
    setStatus("uploading");
    setErrorMessage("");
    
    const { aiUrl } = getAPIUrls();
    const formData = new FormData();
    formData.append("file", blob, "face_capture.jpg");
    
    try {
      const res = await fetch(`${aiUrl}/analyze-face/?engine=gpt&language=vi`, {
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
      
      if (result && result.analysis) {
        // Map DTO like face.api.ts
        const mapped = convertToFacialAnalysisDto(result, user?.id || "guest");
        setAnalysisData(mapped);
        setAnnotatedImage(result.annotated_image_url);
        setStatus("success");
      } else {
        throw new Error(result.message || "Không thể phân tích khuôn mặt. Vui lòng chụp chính diện rõ nét.");
      }
    } catch (err: any) {
      console.error("Face Analysis failed:", err);
      setErrorMessage(err.message || "Lỗi xử lý hình ảnh.");
      setStatus("error");
    }
  };

  const convertToFacialAnalysisDto = (apiResult: any, uid: any) => {
    const analysis = apiResult.analysis || {};
    
    let faceShape = "Oval";
    let probabilities: Record<string, number> = { "Oval": 100 };
    let harmonyScore = 0.0;
    let harmonyDetails: Record<string, number> = {};
    let metrics: any[] = [];
    let resultText = apiResult.message || "Phân tích nhân tướng hoàn tất.";
    let physiognomyResult: any = {};

    if (analysis.analysisResult) {
      // Template or Hybrid format with CV data
      const face = analysis.analysisResult.face;
      faceShape = face?.shape?.primary ?? "Oval";
      probabilities = face?.shape?.probabilities ?? { [faceShape]: 100 };
      harmonyScore = face?.proportionality?.overallHarmonyScore ?? 0.0;
      harmonyDetails = face?.proportionality?.harmonyScores ?? {};
      metrics = face?.proportionality?.metrics || [];
      
      const resVal = analysis.result;
      if (resVal) {
        if (typeof resVal === "string") {
          resultText = resVal;
        } else if (typeof resVal === "object") {
          physiognomyResult = { ...resVal };
          if (resVal.parts) {
            physiognomyResult = {
              ...physiognomyResult,
              ...resVal.parts
            };
          }
          if (resVal.summary) {
            resultText = resVal.summary;
          }
        }
      }
    } else {
      // Pure GPT vision format (e.g. CV failed to detect face landmarks)
      const gptData = analysis.result || analysis;
      harmonyScore = gptData.harmony_score ?? 0.0;
      resultText = gptData.summary || apiResult.message || "Phân tích nhân tướng hoàn tất.";
      
      // Map GPT structure to standard physiognomyResult structure
      physiognomyResult = {
        forehead: gptData.forehead,
        eyebrows: gptData.eyebrow,
        eyes: gptData.eye,
        nose: gptData.nose,
        lips: gptData.mouth,
        jaw: gptData.chin,
        face_shape: gptData.face_shape_analysis
      };

      // Try to determine the shape from the text/keys
      const desc = (gptData.face_shape_analysis?.description || "").toLowerCase();
      const shapesMap: Record<string, string> = {
        "tròn": "Round",
        "xoan": "Oval",
        "vuông": "Square",
        "tim": "Heart",
        "kim cương": "Diamond",
        "tam giác": "Triangle",
        "oval": "Oval",
        "round": "Round",
        "square": "Square",
        "heart": "Heart",
        "diamond": "Diamond",
        "triangle": "Triangle"
      };
      
      for (const [key, val] of Object.entries(shapesMap)) {
        if (desc.includes(key)) {
          faceShape = val;
          break;
        }
      }
      probabilities = { [faceShape]: 100 };
    }

    return {
      userId: uid.toString(),
      resultText: resultText,
      physiognomyResult: physiognomyResult,
      faceShape: faceShape,
      harmonyScore: harmonyScore,
      probabilities: probabilities,
      harmonyDetails: harmonyDetails,
      metrics: metrics,
      annotatedImage: apiResult.annotated_image_url || "",
      processedAt: new Date().toISOString(),
    };
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
      const payload = {
        ...analysisData,
        userId: user?.id?.toString() || "guest",
      };

      const res = await fetch(`${saveUrl}/facial-analysis`, {
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
    const shareUrl = `${window.location.origin}/huyen-co/share/face-result?id=${hashed}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Đã sao chép liên kết chia sẻ của bạn vào Clipboard!");
  };

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
  };

  // Convert shape to Vietnamese string
  const translateShape = (shape: string) => {
    const map: Record<string, string> = {
      Oval: "Trái xoan",
      Round: "Tròn",
      Square: "Vuông chữ điền",
      Heart: "Trái tim",
      Triangle: "Tam giác",
      Diamond: "Kim cương"
    };
    return map[shape] || shape;
  };

  const getPhysiognomyValue = (key: string) => {
    if (!analysisData?.physiognomyResult) return null;
    const val = analysisData.physiognomyResult[key];
    if (Array.isArray(val)) {
      return val.map((item: any) => item.meaning || item.description || "").filter(Boolean).join("\n");
    }
    if (typeof val === "object" && val !== null) {
      return val.meaning || val.description || JSON.stringify(val);
    }
    return val;
  };

  if (status === "success" && analysisData) {
    return (
      <FaceResultClient
        analysis={analysisData}
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
          AI Face Profiler • Xem Tướng Mặt
        </h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {status === "idle" && (
          <div className="w-full max-w-md flex flex-col items-center gap-6">
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
                  
                  {/* Face Scanner Guide Overlay */}
                  <div className="absolute inset-0 m-6 border-2 border-dashed border-[#d4af37]/30 rounded-[50%/40%] flex items-center justify-center pointer-events-none animate-pulse">
                    <span className="text-[10px] text-[#d4af37] font-bold tracking-widest bg-black/60 px-3 py-1 rounded-full uppercase">
                      Đặt khuôn mặt thẳng hàng
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleCapture}
              disabled={!cameraActive}
              className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 cursor-pointer shadow-lg shadow-white/10 animate-pulse"
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
                  alt="Preview" 
                  className={`w-full h-full object-cover rounded-3xl ${isMirrored ? "scale-x-[-1]" : ""} blur-sm opacity-80`}
                />
              )}
              <div className="absolute inset-0 bg-black/40" />
              
              {/* Scan Line */}
              <div className="animate-scan-line" />
              
              {/* Scanner Guide Overlay */}
              <div className="absolute inset-0 m-6 border-2 border-dashed border-[#d4af37]/20 rounded-[50%/40%] flex items-center justify-center pointer-events-none">
                <span className="text-[10px] text-[#d4af37]/60 font-bold tracking-widest bg-black/40 px-3 py-1 rounded-full uppercase">
                  AI SCANNING...
                </span>
              </div>
            </div>

            <div className="text-center space-y-3 px-4">
              <div className="w-10 h-10 rounded-full border-2 border-t-[#d4af37] border-indigo-500/10 animate-spin mx-auto flex items-center justify-center">
                <span className="text-xs">🔮</span>
              </div>
              <h3 className="text-md font-black tracking-widest text-[#d4af37] uppercase font-serif">
                Đang phân tích nhân tướng mặt...
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
                Chưa Nhận Diện Rõ Nét
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                Mô hình AI cần ảnh chụp rõ các đường nét trên khuôn mặt để lập bản đồ nhân trắc học chính xác nhất.
              </p>
            </div>

            <div className="bg-[#0b0517] border border-indigo-500/10 rounded-2xl p-4 text-left space-y-3">
              <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest border-b border-indigo-500/10 pb-1.5">
                💡 Bí quyết quét thành công:
              </h4>
              <ul className="text-[11px] text-slate-300 space-y-2 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] mt-0.5">✦</span>
                  <span><strong>Đủ ánh sáng:</strong> Hãy đứng gần cửa sổ hoặc dưới ánh đèn sáng rõ. Tránh chụp ngược sáng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] mt-0.5">✦</span>
                  <span><strong>Giữ vững camera:</strong> Giữ điện thoại cố định trong 1-2 giây khi bấm nút để tránh nhòe nét.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] mt-0.5">✦</span>
                  <span><strong>Căn chỉnh chính xác:</strong> Đặt khuôn mặt nằm trọn trong hình bầu dục gợi ý trên màn hình.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37] mt-0.5">✦</span>
                  <span><strong>Lau sạch ống kính:</strong> Đôi khi mồ hôi hoặc bụi bẩn bám trên camera trước làm ảnh bị mờ.</span>
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

        {status === "success" && analysisData && (
          <div className="w-full max-w-4xl bg-[#120a26]/90 border border-[#d4af37]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:grid lg:grid-cols-2">
            
            {/* Column 1: Captured Image Preview with Coordinates */}
            <div className="relative aspect-[4/5] bg-black lg:h-full flex items-center justify-center overflow-hidden">
              <img
                src={annotatedImage || capturedUrl || ""}
                alt="Face Coordinates Map"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/75 border border-[#d4af37]/20 p-3 rounded-xl backdrop-blur">
                <span className="text-[10px] text-[#d4af37] uppercase tracking-widest block font-bold">
                  Bản đồ tỷ lệ vàng ngũ quan
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Hình ảnh kết quả trích xuất tọa độ nhân trung, ấn đường và chân mày.
                </p>
              </div>
            </div>

            {/* Column 2: Mystical Readings Scrollable */}
            <div className="p-6 flex flex-col justify-between max-h-[80vh] overflow-y-auto border-t lg:border-t-0 lg:border-l border-indigo-500/10">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] text-[#22d3ee] font-bold uppercase tracking-widest block mb-1">
                    Cát quả nhân tướng
                  </span>
                  <h3 className="text-xl font-black uppercase text-[#d4af37] font-serif tracking-wider">
                    Luận giải chi tiết AI
                  </h3>
                </div>

                {/* Aspect Selector Tabs */}
                <div className="flex border-b border-indigo-500/10 pb-3 gap-2">
                  <button
                    onClick={() => setActiveTab("shape")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg cursor-pointer text-center ${
                      activeTab === "shape" ? "bg-[#d4af37] text-black" : "bg-[#0d071a] text-slate-400"
                    }`}
                  >
                    Dạng mặt
                  </button>
                  <button
                    onClick={() => setActiveTab("features")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg cursor-pointer text-center ${
                      activeTab === "features" ? "bg-[#d4af37] text-black" : "bg-[#0d071a] text-slate-400"
                    }`}
                  >
                    Chi tiết Ngũ quan
                  </button>
                  <button
                    onClick={() => setActiveTab("destiny")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg cursor-pointer text-center ${
                      activeTab === "destiny" ? "bg-[#d4af37] text-black" : "bg-[#0d071a] text-slate-400"
                    }`}
                  >
                    Vận trình
                  </button>
                </div>

                {/* Content based on Tab */}
                {activeTab === "shape" && (
                  <div className="space-y-4">
                    <div className="bg-[#0b0517] border border-indigo-500/10 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Hình dạng khuôn mặt:</span>
                        <span className="text-xs text-[#d4af37] font-black uppercase tracking-wider">
                          {translateShape(analysisData.faceShape)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-indigo-500/10 pt-2">
                        <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Điểm hài hòa (Harmony Score):</span>
                        <span className="text-xs text-[#d4af37] font-black uppercase tracking-wider">
                          {analysisData.harmonyScore} / 100
                        </span>
                      </div>
                    </div>

                    <div className="border border-indigo-500/10 bg-[#0d071c] rounded-2xl p-4">
                      <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">
                        Luận giải diện tướng
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {getPhysiognomyValue("face_shape") || "Khuôn mặt cân đối thể hiện một bản mệnh hanh thông, nội tâm vững vàng và có khả năng giao thiệp tốt trong cuộc sống xã hội."}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "features" && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#d4af37] uppercase">Nhận xét các cung trên mặt:</h4>
                    <div className="space-y-3">
                      {["forehead", "eyes", "nose", "lips", "eyebrows", "jaw"].map((feature) => {
                        const meaning = getPhysiognomyValue(feature);
                        if (!meaning) return null;
                        
                        const featureLabels: Record<string, string> = {
                          forehead: "Forehead (Trán / Cung Quan Lộc)",
                          eyes: "Eyes (Mắt / Cung Điền Trạch)",
                          nose: "Nose (Mũi / Cung Tài Bạch)",
                          lips: "Lips (Môi / Cung Nô Bộc)",
                          eyebrows: "Eyebrows (Chân mày / Huynh Đệ)",
                          jaw: "Jaw (Cằm / Cung Địa Các)"
                        };

                        return (
                          <div key={feature} className="border border-indigo-500/10 bg-[#0d071c]/50 rounded-xl p-3">
                            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block mb-1">
                              {featureLabels[feature] || feature}
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">{meaning}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "destiny" && (
                  <div className="space-y-4">
                    <div className="border border-indigo-500/10 bg-[#0d071c] rounded-2xl p-4">
                      <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">
                        Tổng hợp vận trình & Khuyên cáo
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed font-serif italic">
                        {analysisData.resultText}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Save & Share */}
              <div className="mt-8 pt-4 border-t border-indigo-500/10 flex flex-col gap-2">
                {saveStatus === "unsaved" && (
                  <button
                    onClick={handleSaveResult}
                    className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] to-yellow-500 hover:from-yellow-400 hover:to-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#d4af37]/10 cursor-pointer"
                  >
                    {token ? "Lưu kết quả" : "Đăng nhập để lưu kết quả"}
                  </button>
                )}
                {saveStatus === "saving" && (
                  <button disabled className="w-full py-2.5 bg-indigo-950 text-slate-400 text-xs font-black uppercase tracking-widest rounded-xl cursor-wait">
                    Đang lưu trữ...
                  </button>
                )}
                {saveStatus === "saved" && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleShareLink}
                      className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-cyan-600/10 cursor-pointer"
                    >
                      Chia sẻ kết quả 🔗
                    </button>
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setSaveStatus("unsaved");
                        setSavedId(null);
                        startCamera();
                      }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Quét mới
                    </button>
                  </div>
                )}
                {saveStatus === "error" && (
                  <button
                    onClick={handleSaveResult}
                    className="w-full py-2.5 bg-red-950 border border-red-500 text-red-300 font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer"
                  >
                    Thử lưu lại (Gặp lỗi)
                  </button>
                )}
              </div>
            </div>

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
        <p>Huyền Cơ AI • Sử dụng mô hình YOLOv11 & Landmark Pose Estimation.</p>
      </footer>
    </div>
  );
}
