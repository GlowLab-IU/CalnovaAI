"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "../AuthModal";
import FaceResultClient from "../share/face-result/FaceResultClient";
import HuyenCoHeader from "../components/HuyenCoHeader";
import ScanWaitingOverlay from "../components/ScanWaitingOverlay";
import {
  FacePhysiognomyIcon,
  UploadImageIcon,
  SparkleIcon,
} from "../components/HuyenCoIcons";
import { encodeId } from "@/utils/hashId";
import { FaceLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

export default function FaceScanPage() {
  const router = useRouter();
  
  // Camera & Capture states
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [scanWarning, setScanWarning] = useState<string>("");
  const scanWarningRef = useRef<string>("");
  
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
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    
    // Nếu MediaPipe chưa load xong, vẫn phải giữ vòng lặp chờ
    if (!faceLandmarkerRef.current) {
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
      
      const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());
      
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        let isQualityGood = true;
        let currentWarning = "";

        // 1. Check Face Angle (Yaw)
        if (landmarks.length >= 454) {
          const nose = landmarks[1];
          const leftCheek = landmarks[234];
          const rightCheek = landmarks[454];
          
          // Using normalized coordinates
          const distLeft = Math.abs(nose.x - leftCheek.x);
          const distRight = Math.abs(rightCheek.x - nose.x);
          
          if (distRight > 0) {
            const ratio = distLeft / distRight;
            if (ratio < 0.6 || ratio > 1.6) {
               isQualityGood = false;
               currentWarning = "Góc mặt lệch. Vui lòng nhìn thẳng.";
            }
          }
        }

        // 2. Check Brightness (only if angle is good)
        if (isQualityGood) {
            const tempC = document.createElement("canvas");
            tempC.width = 64; tempC.height = 64;
            const tempCtx = tempC.getContext("2d", { willReadFrequently: true });
            if (tempCtx) {
                tempCtx.drawImage(video, 0, 0, 64, 64);
                const data = tempCtx.getImageData(0, 0, 64, 64).data;
                let colorSum = 0;
                for (let i = 0; i < data.length; i += 4) {
                    colorSum += (data[i] + data[i+1] + data[i+2]) / 3;
                }
                const brightness = colorSum / (64 * 64);
                if (brightness < 40) {
                    isQualityGood = false;
                    currentWarning = "Thiếu sáng. Hãy di chuyển ra nơi sáng hơn.";
                } else if (brightness > 240) {
                    isQualityGood = false;
                    currentWarning = "Quá chói. Vui lòng giảm ánh sáng.";
                }
            }
        }

        // Update warning state if changed
        if (currentWarning !== scanWarningRef.current) {
           scanWarningRef.current = currentWarning;
           setScanWarning(currentWarning);
        }

        // Auto-capture logic
        if (isQualityGood) {
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
        } else {
           detectionStartTimeRef.current = null;
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
        if (scanWarningRef.current !== "Không tìm thấy khuôn mặt.") {
           scanWarningRef.current = "Không tìm thấy khuôn mặt.";
           setScanWarning("Không tìm thấy khuôn mặt.");
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
        fd.append("file", normalizedBlob, "face_capture.jpg");
        return fd;
      };

      let res: Response;
      try {
        res = await fetch(`${aiUrl}/analyze-face/?engine=gpt&language=vi`, {
          method: "POST",
          body: buildFormData(),
        });
      } catch (networkErr) {
        // Retry once with template engine if GPT endpoint timed out or dropped connection
        res = await fetch(`${aiUrl}/analyze-face/?engine=template&language=vi`, {
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
      
      if (result && result.analysis) {
        // Map DTO like face.api.ts
        const mapped = convertToFacialAnalysisDto(result, user?.id || "guest");
        setAnalysisData(mapped);
        setAnnotatedImage(result.annotated_image_url);
        setStatus("success");
      } else {
        throw new Error(result?.message || "Không thể phân tích khuôn mặt. Vui lòng chụp chính diện rõ nét.");
      }
    } catch (err: any) {
      console.error("Face Analysis failed:", err);
      const rawMsg = String(err?.message || "");
      const friendlyMsg =
        rawMsg.includes("Failed to fetch") || rawMsg.includes("NetworkError") || rawMsg.includes("Load failed")
          ? "Không thể kết nối đến máy chủ phân tích AI hoặc ảnh tải lên quá lớn. Vui lòng chọn ảnh rõ mặt (định dạng JPG/PNG) và thử lại."
          : rawMsg || "Lỗi xử lý hình ảnh.";
      setErrorMessage(friendlyMsg);
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
          if (!harmonyScore && resVal.harmony_score) {
            harmonyScore = resVal.harmony_score;
          }
          physiognomyResult = {
            ...resVal,
            forehead: resVal.forehead || resVal.parts?.forehead,
            eyebrows: resVal.eyebrows || resVal.eyebrow || resVal.parts?.eyebrows,
            eyes: resVal.eyes || resVal.eye || resVal.parts?.eyes,
            nose: resVal.nose || resVal.parts?.nose,
            lips: resVal.lips || resVal.mouth || resVal.parts?.lips,
            jaw: resVal.jaw || resVal.chin || resVal.parts?.jaw,
            face_shape: resVal.face_shape || resVal.face_shape_analysis,
            life_phases: resVal.life_phases,
            key_points: resVal.key_points,
          };
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
        ...gptData,
        forehead: gptData.forehead,
        eyebrows: gptData.eyebrow || gptData.eyebrows,
        eyes: gptData.eye || gptData.eyes,
        nose: gptData.nose,
        lips: gptData.mouth || gptData.lips,
        jaw: gptData.chin || gptData.jaw,
        face_shape: gptData.face_shape_analysis || gptData.face_shape,
        life_phases: gptData.life_phases,
        key_points: gptData.key_points,
      };

      // Try to determine the shape from the text/keys
      const desc = (gptData.face_shape_analysis?.description || gptData.face_shape_analysis?.shape || "").toLowerCase();
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
      annotatedImage: apiResult.annotated_image_url || capturedUrl || "",
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
        userId: String(user?.id || user?.userId || 1),
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

  const handleShareLink = async () => {
    if (!savedId) return;
    const hashed = encodeId(parseInt(savedId.toString(), 10));
    const refParam = user?.referralCode ? `&ref=${user.referralCode}` : "";
    const shareUrl = `${window.location.origin}/huyen-co/share/face-result?id=${hashed}${refParam}`;
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
      await fetch(`${saveUrl}/facial-analysis/shared/${savedId}`);
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
      <>
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
        subtitle="Pháp Môn Diện Tướng Học & Ngũ Quan AI"
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        {status === "idle" && (
          <div className="w-full max-w-md flex flex-col items-center gap-5">
            {/* Concise Guidance Header */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120F1D] border border-[#D4AF37]/25 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8C96A]">
                <SparkleIcon size={12} />
                <span>Tam Đình • Ngũ Quan • Lưu Niên</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Soi Chiếu Diện Tướng
              </h1>
              <p className="text-xs text-[#C5B386] max-w-xs mx-auto">
                Đặt khuôn mặt chính diện trong khung ngắm hoặc tải lên một bức ảnh chân dung rõ nét.
              </p>
            </div>

            <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden border border-[#D4AF37]/35 relative bg-[#0B0912] shadow-[0_20px_50px_rgba(0,0,0,0.75)] flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-7 space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#120F1D] border border-[#D4AF37]/30 mx-auto">
                    <FacePhysiognomyIcon size={40} />
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

                  {/* Face Scanner Guide Overlay */}
                  <div
                    className={`absolute inset-0 m-6 border-2 border-dashed ${
                      scanWarning ? "border-red-500/60" : "border-[#D4AF37]/45"
                    } rounded-[50%/40%] flex items-end justify-center pb-5 pointer-events-none transition-colors`}
                  >
                    <span
                      className={`text-[10px] font-bold tracking-widest bg-[#07060B]/80 border px-3.5 py-1.5 rounded-full uppercase backdrop-blur-md ${
                        scanWarning
                          ? "text-red-300 border-red-500/40"
                          : "text-[#FFF3C4] border-[#D4AF37]/35"
                      }`}
                    >
                      {scanWarning || "Giữ khuôn mặt chính diện & đủ sáng"}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 w-full justify-center">
              <button
                onClick={handleCapture}
                disabled={!cameraActive}
                title="Chụp ảnh khuôn mặt"
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
                <span>Tải Ảnh Chân Dung</span>
              </button>
            </div>
          </div>
        )}

        {(status === "capturing" || status === "uploading") && (
          <ScanWaitingOverlay
            mode="face"
            capturedUrl={capturedUrl}
            isMirrored={isMirrored}
          />
        )}

        {status === "error" && (
          <div className="w-full max-w-md hc-card rounded-3xl p-7 sm:p-8 text-center space-y-6 relative overflow-hidden">
            <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto border border-[#D4AF37]/30">
              <FacePhysiognomyIcon size={42} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-[#FFF3C4] uppercase tracking-wider">
                Chưa Nhận Diện Rõ Ngũ Quan
              </h3>
              {errorMessage ? (
                <div className="bg-amber-950/40 border border-[#D4AF37]/35 rounded-xl p-3.5 text-xs text-[#FFF3C4] leading-relaxed">
                  {errorMessage}
                </div>
              ) : (
                <p className="text-xs text-[#C5B386] leading-relaxed max-w-xs mx-auto">
                  Hệ thống cần ảnh chụp rõ nét các bộ vị trên khuôn mặt để lập bản đồ nhân tướng chính xác nhất.
                </p>
              )}
            </div>

            <div className="bg-[#0B0912]/90 border border-[#D4AF37]/15 rounded-2xl p-4 text-left space-y-2.5">
              <h4 className="text-[10px] font-bold text-[#E8C96A] uppercase tracking-widest border-b border-[#D4AF37]/15 pb-1.5">
                Chỉ dẫn chụp ảnh chuẩn diện tướng:
              </h4>
              <ul className="text-xs text-[#C5B386] space-y-2 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-0.5">✦</span>
                  <span>
                    <strong className="text-[#EFECE6]">Ánh sáng hài hòa:</strong> Chụp nơi đủ sáng, tránh ngược sáng làm tối vùng Ấn Đường và Sơn Căn.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4AF37] mt-0.5">✦</span>
                  <span>
                    <strong className="text-[#EFECE6]">Góc mặt chính diện:</strong> Nhìn thẳng vào ống kính, không đeo kính râm hoặc che khuất vầng trán.
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
        <p>Huyền Cơ Các • Tinh Hoa Diện Tướng Học Đông Phương & Sinh Trắc Học AI</p>
      </footer>
    </div>
  );
}
