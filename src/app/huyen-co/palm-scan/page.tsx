"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "../AuthModal";
import PalmResultClient from "../share/palm-result/PalmResultClient";
import HuyenCoHeader from "../components/HuyenCoHeader";
import ScanWaitingOverlay from "../components/ScanWaitingOverlay";
import {
  PalmReadingIcon,
  UploadImageIcon,
  SparkleIcon,
} from "../components/HuyenCoIcons";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [scanWarning, setScanWarning] = useState<string>("");
  const scanWarningRef = useRef<string>("");
  
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
      const storedToken =
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");
      const storedUser = localStorage.getItem("authUser");
      if (storedToken) {
        setToken(storedToken);
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error(e);
          }
        }
        fetch("https://api.calnovaai.com/glowlab/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then((r) => r.json())
          .then((me) => {
            if ((me.code === 0 || me.code === "OPERATION_SUCCESS") && me.data) {
              localStorage.setItem("authToken", storedToken);
              localStorage.setItem("authUser", JSON.stringify(me.data));
              setUser(me.data);
            }
          })
          .catch(() => {});
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
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    
    // Nếu MediaPipe chưa load xong, vẫn phải giữ vòng lặp chờ
    if (!handLandmarkerRef.current) {
      if (status === "idle" && cameraActive) {
        requestRef.current = requestAnimationFrame(renderLoop);
      }
      return;
    }
    
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
        
        let isQualityGood = true;
        let currentWarning = "";
        
        if (!isGoodSize) {
           isQualityGood = false;
           currentWarning = "Đưa bàn tay lại gần camera hơn.";
        }

        // Check Brightness and Sharpness
        if (isQualityGood) {
            const tempC = document.createElement("canvas");
            tempC.width = 128; tempC.height = 128;
            const tempCtx = tempC.getContext("2d", { willReadFrequently: true });
            if (tempCtx) {
                const sx = Math.max(0, minX * video.videoWidth);
                const sy = Math.max(0, minY * video.videoHeight);
                const sw = Math.min(video.videoWidth - sx, handWidth * video.videoWidth);
                const sh = Math.min(video.videoHeight - sy, handHeight * video.videoHeight);
                
                tempCtx.drawImage(video, sx, sy, sw, sh, 0, 0, 128, 128);
                const data = tempCtx.getImageData(0, 0, 128, 128).data;
                
                let colorSum = 0;
                let edgeSum = 0;
                let count = 0;
                
                for (let y = 0; y < 128; y += 2) {
                  for (let x = 0; x < 127; x += 2) {
                     const idx = (y * 128 + x) * 4;
                     const nextIdx = (y * 128 + x + 2) * 4;
                     const g1 = (data[idx] + data[idx+1] + data[idx+2]) / 3;
                     const g2 = (data[nextIdx] + data[nextIdx+1] + data[nextIdx+2]) / 3;
                     colorSum += g1;
                     edgeSum += Math.abs(g1 - g2);
                     count++;
                  }
                }
                const brightness = colorSum / count;
                const sharpness = edgeSum / count;
                
                if (brightness < 40) {
                    isQualityGood = false;
                    currentWarning = "Thiếu sáng. Hãy đưa tay ra nơi sáng hơn.";
                } else if (brightness > 240) {
                    isQualityGood = false;
                    currentWarning = "Quá chói. Vui lòng giảm ánh sáng.";
                } else if (sharpness < 1.5) {
                    isQualityGood = false;
                    currentWarning = "Bị mờ. Vui lòng giữ yên tay.";
                }
            }
        }
        
        if (currentWarning !== scanWarningRef.current) {
           scanWarningRef.current = currentWarning;
           setScanWarning(currentWarning);
        }

        // Auto-capture logic
        if (isQualityGood) {
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
        if (scanWarningRef.current !== "Không tìm thấy bàn tay.") {
           scanWarningRef.current = "Không tìm thấy bàn tay.";
           setScanWarning("Không tìm thấy bàn tay.");
        }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedBlob(file);
    setCapturedUrl(URL.createObjectURL(file));
    stopCamera();
    triggerUpload(file);
    e.target.value = "";
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
    const detailedInsights = Array.isArray(traditional.detailed_insights) ? traditional.detailed_insights : [];
    
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

    // Fallback to template detailed_insights if mystical lines were not populated
    if (interpretations.length === 0 && detailedInsights.length > 0) {
      for (const item of detailedInsights) {
        const rawType = String(item.line_type || "unknown").replace("_line", "").toLowerCase();
        interpretations.push({
          id: id++,
          lineType: rawType,
          pattern: item.pattern || "",
          meaning: item.meaning || "",
          lengthPx: Number(item.length_px || 0),
          confidence: Number(item.confidence || palm.confidence || 0.85),
        });
      }
    }

    const lifeAspects: any[] = [];
    let aspectId = 1;
    const validAspects = ["health", "career", "relationships", "personality"];
    if (traditional.life_aspects) {
      for (const [key, value] of Object.entries(traditional.life_aspects)) {
        if (validAspects.includes(key)) {
          lifeAspects.push({
            id: aspectId++,
            aspect: key,
            content: Array.isArray(value) ? value.join("\n") : String(value || ""),
          });
        }
      }
    }

    const hasLine = (lt: string) =>
      interpretations.some((i) => i.lineType === lt) ? 1 : 0;

    return {
      id: 0,
      userId: 0,
      annotatedImage: apiResult.data?.annotated_image_url || capturedUrl || "",
      palmLinesDetected: interpretations.length,
      detectedHeartLine: hasLine("heart"),
      detectedHeadLine: hasLine("head"),
      detectedLifeLine: hasLine("life"),
      detectedFateLine: hasLine("fate"),
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

  const normalizeImageBlob = async (inputBlob: Blob): Promise<Blob> => {
    if (typeof window === "undefined") return inputBlob;
    return new Promise((resolve) => {
      const img = new Image();
      const objUrl = URL.createObjectURL(inputBlob);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        const MAX_DIM = 960;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(inputBlob);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (compressed) => resolve(compressed || inputBlob),
          "image/jpeg",
          0.82
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve(inputBlob);
      };
      img.src = objUrl;
    });
  };

  const triggerUpload = async (blob: Blob) => {
    setStatus("uploading");
    setErrorMessage("");
    
    const { aiUrl } = getAPIUrls();
    const normalizedBlob = await normalizeImageBlob(blob);
    setCapturedBlob(normalizedBlob);
    
    try {
      const buildFormData = () => {
        const fd = new FormData();
        fd.append("file", normalizedBlob, "palm_capture.jpg");
        return fd;
      };

      let res: Response;
      try {
        res = await fetch(`${aiUrl}/analyze-palm/?engine=gpt&language=vi&gender=${gender}`, {
          method: "POST",
          body: buildFormData(),
        });
      } catch (networkErr) {
        res = await fetch(`${aiUrl}/analyze-palm/?engine=template&language=vi&gender=${gender}`, {
          method: "POST",
          body: buildFormData(),
        });
      }

      if (!res.ok) {
        let errorMsg = `Lỗi từ máy chủ AI: ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            if (typeof errData.detail === "object") {
              const msg = errData.detail.message || "";
              const sug = errData.detail.suggestion || "";
              errorMsg = [msg, sug].filter(Boolean).join(" ") || JSON.stringify(errData.detail);
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
      const rawMsg = String(err?.message || "");
      const friendlyMsg =
        rawMsg.includes("Failed to fetch") || rawMsg.includes("NetworkError") || rawMsg.includes("Load failed")
          ? "Không thể kết nối đến máy chủ phân tích chỉ tay hoặc ảnh tải lên quá lớn. Vui lòng chọn ảnh lòng bàn tay rõ nét (JPG/PNG) và thử lại."
          : rawMsg || "Lỗi xử lý hình ảnh.";
      setErrorMessage(friendlyMsg);
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
      const validLineTypes = ["heart", "head", "life", "fate", "sun", "unknown"];
      const validAspects = ["health", "career", "relationships", "personality"];

      const interpretationsArray = (analysisData.interpretations || []).map((item: any) => {
        const rawType = String(item.lineType || "unknown").replace("_line", "").toLowerCase();
        return {
          lineType: validLineTypes.includes(rawType) ? rawType : "unknown",
          pattern: String(item.pattern || ""),
          meaning: String(item.meaning || ""),
          lengthPx: Number(item.lengthPx || 0),
          confidence: Number(item.confidence || 0.9),
        };
      });

      const lifeAspectsArray = (analysisData.lifeAspects || [])
        .filter((asp: any) => validAspects.includes(String(asp.aspect)))
        .map((asp: any) => ({
          aspect: String(asp.aspect),
          content: Array.isArray(asp.content) ? asp.content.join("\n") : String(asp.content || ""),
        }));

      const payload = {
        userId: Number(user?.id || user?.userId || 1),
        annotatedImage: annotatedImage || analysisData.annotatedImage || "",
        palmLinesDetected: Number(analysisData.palmLinesDetected || interpretationsArray.length),
        detectedHeartLine: Number(analysisData.detectedHeartLine || 0),
        detectedHeadLine: Number(analysisData.detectedHeadLine || 0),
        detectedLifeLine: Number(analysisData.detectedLifeLine || 0),
        detectedFateLine: Number(analysisData.detectedFateLine || 0),
        targetLines: analysisData.targetLines || "[]",
        imageHeight: 1080,
        imageWidth: 1080,
        imageChannels: 3,
        summaryText: analysisData.summaryText || "Xem chỉ tay trực tiếp trên Web",
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

      if (res.ok && result && result.success !== false && (result.code === 0 || result.code === "OPERATION_SUCCESS" || result.data)) {
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

  const handleShareLink = async () => {
    if (!savedId) return;
    const hashed = encodeId(parseInt(savedId.toString(), 10));
    const refParam = user?.referralCode ? `&ref=${user.referralCode}` : "";
    const shareUrl = `${window.location.origin}/huyen-co/share/palm-result?id=${hashed}${refParam}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Fallback if clipboard blocked
    }

    // Trigger share reward & refresh user credits immediately
    const { saveUrl } = getAPIUrls();
    let rewardMsg = "Đã sao chép liên kết chia sẻ vào Clipboard!";
    try {
      const oldCredits = Number(user?.credits ?? 0);
      await fetch(`${saveUrl}/palm-analysis/shared/${savedId}`);
      if (token) {
        const meRes = await fetch(`${saveUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = await meRes.json();
        if (meData?.data) {
          const newCredits = Number(meData.data.credits ?? oldCredits);
          setUser(meData.data);
          localStorage.setItem("authUser", JSON.stringify(meData.data));
          if (newCredits > oldCredits) {
            rewardMsg = `🎉 Đã sao chép liên kết chia sẻ! Bạn vừa nhận được +${newCredits - oldCredits} Tín Chỉ thưởng chia sẻ!`;
          }
        }
      }
    } catch (e) {
      console.error("Share reward check error:", e);
    }
    alert(rewardMsg);
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
      <>
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
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#07060B] text-[#EFECE6] font-sans relative flex flex-col justify-between overflow-x-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Subtle Oriental Celestial Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[65vw] h-[45vw] bg-[#D4AF37]/[0.05] rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#D4AF37_0.75px,transparent_0.75px)] [background-size:48px_48px]" />
      </div>

      {/* Unified Header */}
      <HuyenCoHeader
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        subtitle="Pháp Môn Thủ Tướng Học & Chưởng Pháp AI"
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        {status === "idle" && (
          <div className="w-full max-w-md flex flex-col items-center gap-5">
            {/* Concise Guidance Header */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120F1D] border border-[#D4AF37]/25 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8C96A]">
                <SparkleIcon size={12} />
                <span>Sinh Đạo • Trí Đạo • Tâm Đạo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Soi Chiếu Thủ Tướng
              </h1>
              <p className="text-xs text-[#C5B386] max-w-xs mx-auto">
                Mở phẳng lòng bàn tay dưới ánh sáng rõ nét hoặc tải lên ảnh chụp lòng bàn tay từ thiết bị.
              </p>
            </div>

            {/* Custom Camera Container */}
            <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden border border-[#D4AF37]/35 relative bg-[#0B0912] shadow-[0_20px_50px_rgba(0,0,0,0.75)] flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-7 space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#120F1D] border border-[#D4AF37]/30 mx-auto">
                    <PalmReadingIcon size={40} />
                  </div>
                  <p className="text-xs text-[#C5B386] leading-relaxed">{cameraError}</p>
                  <div className="flex flex-wrap justify-center gap-2.5 pt-1">
                    <button
                      onClick={startCamera}
                      className="px-4 py-2.5 bg-[#120F1D] hover:bg-white/10 border border-[#D4AF37]/30 rounded-full text-xs font-bold text-[#E8C96A] uppercase tracking-wider cursor-pointer"
                    >
                      Bật Lại Camera
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 hc-gold-btn rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadImageIcon size={15} />
                      <span>Tải Ảnh Từ Máy</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className={`w-full h-full object-cover ${isMirrored ? "scale-x-[-1]" : ""}`}
                    playsInline
                    muted
                  />

                  <canvas
                    ref={canvasRef}
                    className={`absolute top-0 left-0 w-full h-full object-cover pointer-events-none ${
                      isMirrored ? "scale-x-[-1]" : ""
                    }`}
                  />

                  {/* Palm Scanner Guides Overlay */}
                  <div
                    className={`absolute inset-0 border-2 ${
                      scanWarning ? "border-red-500/50" : "border-[#D4AF37]/25"
                    } rounded-3xl pointer-events-none m-4 flex items-center justify-center transition-colors`}
                  >
                    <div
                      className={`w-4/5 h-4/5 border-2 border-dashed ${
                        scanWarning ? "border-red-500/50" : "border-[#D4AF37]/45"
                      } rounded-full flex items-end justify-center pb-5`}
                    >
                      <span
                        className={`text-[10px] font-bold tracking-widest bg-[#07060B]/80 border px-3.5 py-1.5 rounded-full uppercase backdrop-blur-md ${
                          scanWarning
                            ? "text-red-300 border-red-500/40"
                            : "text-[#FFF3C4] border-[#D4AF37]/35"
                        }`}
                      >
                        {scanWarning || "Đặt lòng bàn tay vào giữa khung ngắm"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Parameters Controls (Nam Tả / Nữ Hữu) */}
            <div className="w-full hc-card rounded-2xl p-4 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider text-[#C5B386] font-bold">
                  Giới tính bản mệnh:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGender("male")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      gender === "male"
                        ? "hc-gold-btn"
                        : "bg-[#0B0912] text-[#C5B386] border border-[#D4AF37]/20 hover:text-white"
                    }`}
                  >
                    Nam (Tả)
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      gender === "female"
                        ? "hc-gold-btn"
                        : "bg-[#0B0912] text-[#C5B386] border border-[#D4AF37]/20 hover:text-white"
                    }`}
                  >
                    Nữ (Hữu)
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[#D4AF37]/12 pt-3">
                <span className="text-xs uppercase tracking-wider text-[#C5B386] font-bold">
                  Bàn tay soi chiếu:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHandSide("left")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      handSide === "left"
                        ? "bg-[#D4AF37]/25 text-[#FFF3C4] border border-[#D4AF37]/60"
                        : "bg-[#0B0912] text-[#C5B386] border border-[#D4AF37]/20 hover:text-white"
                    }`}
                  >
                    Tay Trái (Tả)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHandSide("right")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      handSide === "right"
                        ? "bg-[#D4AF37]/25 text-[#FFF3C4] border border-[#D4AF37]/60"
                        : "bg-[#0B0912] text-[#C5B386] border border-[#D4AF37]/20 hover:text-white"
                    }`}
                  >
                    Tay Phải (Hữu)
                  </button>
                </div>
              </div>
            </div>

            {/* Capture triggers */}
            <div className="flex items-center gap-4 w-full justify-center">
              <button
                onClick={handleCapture}
                disabled={!cameraActive}
                title="Chụp ảnh lòng bàn tay"
                className="w-18 h-18 rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/15 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer shadow-[0_0_25px_rgba(212,175,55,0.25)]"
              >
                <div className="w-14 h-14 rounded-full hc-gold-btn flex items-center justify-center text-[10px] font-black uppercase tracking-wider">
                  Chụp
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3.5 rounded-2xl hc-card hover:border-[#D4AF37]/60 text-xs font-bold text-[#FFF3C4] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <UploadImageIcon size={16} className="text-[#D4AF37]" />
                <span>Tải Ảnh Bàn Tay</span>
              </button>
            </div>
          </div>
        )}

        {(status === "capturing" || status === "uploading") && (
          <ScanWaitingOverlay
            mode="palm"
            capturedUrl={capturedUrl}
            isMirrored={isMirrored}
          />
        )}

        {status === "error" && (
          <div className="w-full max-w-md hc-card rounded-3xl p-7 sm:p-8 text-center space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#D4AF37]/30">
              <PalmReadingIcon size={42} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-[#FFF3C4] uppercase tracking-wider">
                Chưa Nhận Diện Rõ Đường Chỉ Tay
              </h3>
              {errorMessage ? (
                <div className="bg-amber-950/40 border border-[#D4AF37]/35 rounded-xl p-3.5 text-xs text-[#FFF3C4] leading-relaxed">
                  {errorMessage}
                </div>
              ) : (
                <p className="text-xs text-[#C5B386] leading-relaxed max-w-xs mx-auto">
                  Hệ thống cần nhìn rõ 3 đường vân chính (Sinh đạo, Trí đạo, Tâm đạo) trong lòng bàn tay để giải mã chính xác.
                </p>
              )}
            </div>

            <div className="bg-[#0B0912]/90 border border-[#D4AF37]/15 rounded-2xl p-4 text-left space-y-2.5">
              <h4 className="text-[10px] font-bold text-[#E8C96A] uppercase tracking-widest border-b border-[#D4AF37]/15 pb-1.5">
                Chỉ dẫn chụp lòng bàn tay chuẩn xác:
              </h4>
              <ul className="text-xs text-[#C5B386] space-y-2 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-0.5">✦</span>
                  <span>
                    <strong className="text-[#EFECE6]">Đủ ánh sáng:</strong> Tránh bóng râm che khuất lòng bàn tay, chụp dưới ánh sáng tự nhiên hoặc đèn đều.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-0.5">✦</span>
                  <span>
                    <strong className="text-[#EFECE6]">Mở phẳng lòng bàn tay:</strong> Duỗi thẳng tự nhiên các ngón tay để lộ rõ Tam Đạo.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setStatus("idle");
                  startCamera();
                }}
                className="flex-1 py-3 hc-gold-btn font-bold text-xs tracking-widest uppercase rounded-xl cursor-pointer"
              >
                Quét Lại Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 bg-[#0B0912] hover:bg-white/10 text-[#E8C96A] font-bold text-xs tracking-widest uppercase rounded-xl border border-[#D4AF37]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UploadImageIcon size={15} />
                <span>Tải Ảnh Khác</span>
              </button>
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
      <footer className="px-6 py-4 border-t border-[#D4AF37]/15 text-center text-[11px] text-[#C5B386]/70 relative z-10">
        <p>Huyền Cơ Các • Tinh Hoa Thủ Tướng Học Đông Phương & Sinh Trắc Học AI</p>
      </footer>
    </div>
  );
}
