"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Type definitions for window-attached libraries
declare global {
  interface Window {
    THREE: any;
    TWEEN: any;
    Hands: any;
    Camera: any;
  }
}

// Spread configurations matching the mobile app
const SPREADS: Record<string, { id: string, name: string, count: number, labels: string[], sub: string, desc: string, icon: string }> = {
  tam_da: {
    id: "tam_da",
    name: "CHIÊM NGHIỆM TAM ĐA",
    sub: "Quá Khứ - Hiện Tại - Tương Lai",
    desc: "Phân tích năng lượng cá nhân, môi trường xung quanh và động lực phát triển.",
    count: 3,
    labels: ["Quá Khứ", "Hiện Tại", "Tương Lai"],
    icon: "🎴",
  },
  that_tinh: {
    id: "that_tinh",
    name: "ĐA DIỆN CUỘC SỐNG",
    sub: "7 Khía Cạnh Cuộc Sống",
    desc: "Đánh giá 7 khía cạnh cảm xúc, tài nguyên, sự nghiệp, xã hội, năng lượng, trở ngại và cơ hội hỗ trợ.",
    count: 7,
    labels: ["Cảm Xúc", "Tài Nguyên", "Sự Nghiệp", "Định Hướng", "Năng Lượng", "Trở Ngại", "Cơ Hội Hỗ Trợ"],
    icon: "⭐",
  },
  thoi_van: {
    id: "thoi_van",
    name: "CHU KỲ NĂNG LƯỢNG 12 THÁNG",
    sub: "Nhịp Sinh Học Hàng Tháng",
    desc: "Phân tích xu hướng năng lượng và lời khuyên tối ưu cho 12 tháng.",
    count: 12,
    labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
    icon: "⏳",
  }
};

const VIETNAMESE_MAP: Record<string, string> = {
  "Que Tam Da": "CHIÊM NGHIỆM TAM ĐA",
  "Que That Tinh": "ĐA DIỆN CUỘC SỐNG",
  "Que Thoi Van": "CHU KỲ NĂNG LƯỢNG 12 THÁNG",
  "Bon Mang": "Bổn Mạng",
  "Gia Dao": "Gia Đạo",
  "Tai Loc": "Tài Lộc",
  "Tinh": "Cảm Xúc",
  "Tien": "Tài Nguyên",
  "Danh": "Sự Nghiệp",
  "Loi": "Định Hướng",
  "Suc": "Năng Lượng",
  "Tieu Nhan": "Trở Ngại",
  "Quy Nhan": "Cơ Hội Hỗ Trợ",
  "Dai Cat - Que rat tot": "Đại Cát - Quẻ Rất Tốt 🌟",
  "Cat - Que tot": "Cát - Quẻ Tốt 👍",
  "Binh - Que trung binh": "Bình Hòa - Trung Bình ⚖️",
  "Hung - Que can can trong": "Hung - Cần Thận Trọng ⚠️",
  "Dai Hung - Que xau, can de phong": "Đại Hung - Cần Đề Phòng 🚨",
};

export default function BoiBaiARPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loadedScripts, setLoadedScripts] = useState({
    three: false,
    tween: false,
    cameraUtils: false,
    controlUtils: false,
    hands: false,
  });

  // State configurations
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const selectedSpreadRef = useRef<string | null>(null);
  const updateSelectedSpread = (spread: string | null) => {
    setSelectedSpread(spread);
    selectedSpreadRef.current = spread;
  };

  const [counter, setCounter] = useState(0);
  const [guideText, setGuideText] = useState("Đang tải các thư viện tâm linh...");
  const [isGameActive, setIsGameActive] = useState(true);
  
  // Pre-drawn cards from server
  const [predeterminedCards, setPredeterminedCards] = useState<any[]>([]);
  const predeterminedCardsRef = useRef<any[]>([]);
  const updatePredeterminedCards = (cards: any[]) => {
    setPredeterminedCards(cards);
    predeterminedCardsRef.current = cards;
  };
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [serverResult, setServerResult] = useState<any>(null);

  // Auth and charts state
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [savedCharts, setSavedCharts] = useState<any[]>([]);
  const [primaryChart, setPrimaryChart] = useState<any | null>(null);
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);
  
  // Chat state inside modal
  const [chatConversationId, setChatConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; suggestions?: string[] }>>([
    {
      role: "assistant",
      text: "Chào bạn, ta là bậc thầy giải mã thẻ bài tây. Bạn vừa gieo được một quẻ bài chứa đầy mật mã năng lượng. Hãy đặt câu hỏi của bạn để cùng ta tháo gỡ nhé.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedCards, setSelectedCards] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  
  // Three.js and game loop refs
  const gameRef = useRef<{
    scene: any;
    camera: any;
    renderer: any;
    cardGroup: any;
    raycaster: any;
    mouse: any;
    starFieldMesh: any;
    explosions: any[];
    storedCards: any[];
    inspectingCard: any;
    handX: number;
    isPinching: boolean;
    cardPickedInCurrentPinch: boolean;
    cursorPosition: any;
    rotationSpeed: number;
    handsDetector: any;
    cameraUtilsInstance: any;
    isGameActive: boolean;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    cardGroup: null,
    raycaster: null,
    mouse: null,
    starFieldMesh: null,
    explosions: [],
    storedCards: [],
    inspectingCard: null,
    handX: 0.5,
    isPinching: false,
    cardPickedInCurrentPinch: false,
    cursorPosition: { x: 0, y: 0 },
    rotationSpeed: 0.002,
    handsDetector: null,
    cameraUtilsInstance: null,
    isGameActive: true,
  });

  const CHAT_API_BASE = typeof window !== "undefined" && window.location.hostname.includes("calnovaai.com")
    ? "https://api.calnovaai.com/api"
    : "https://api.calnovaai.com/api";

  // Dynamic API Base Resolver
  const callRAGBoiBaiAPI = async (path: string, body: any) => {
    let baseUrl = "https://api.calnovaai.com/glowlab";
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("calnovaai.com")) {
        baseUrl = "https://api.calnovaai.com";
      }
    }
    
    // Try primary port
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`Fetch ${baseUrl}${path} failed, trying port 8003 fallback...`, e);
    }

    // Try fallback port for local RAG server dev setup
    try {
      const res = await fetch(`https://api.calnovaai.com${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (e) {
      console.error(`All endpoints failed for ${path}:`, e);
      throw e;
    }
  };

  // Load CDN scripts sequentially on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadScripts = async () => {
      const scripts = [
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
      ];

      for (const src of scripts) {
        if (document.querySelector(`script[src="${src}"]`)) {
          continue;
        }
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.head.appendChild(script);
        });
      }

      setLoadedScripts({
        three: true,
        tween: true,
        cameraUtils: true,
        controlUtils: true,
        hands: true,
      });
    };

    setIsMounted(true);
    
    // Check Auth
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (!storedToken || !storedUser) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    loadScripts().catch((err) => {
      console.error("Error loading scripts:", err);
      setGuideText("Không thể tải các thư viện tâm linh. Vui lòng tải lại trang.");
    });
  }, []);

  // Fetch Saved Charts
  useEffect(() => {
    if (isAuthorized === true && user) {
      const uid = Number(user.id || user.userId || 1);
      const tuviUrl = typeof window !== "undefined" && window.location.hostname.includes("calnovaai.com")
        ? `https://api.calnovaai.com/tuvi/charts/user/${uid}`
        : `https://api.calnovaai.com/tuvi/charts/user/${uid}`;
      fetch(tuviUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data.code === "OPERATION_SUCCESS" && data.data) {
            setSavedCharts(data.data);
            const primary = data.data.find((c: any) => c.isPrimary);
            if (primary) setPrimaryChart(primary);
          }
        })
        .catch((e) => console.error("Error loading saved charts:", e));
    }
  }, [isAuthorized, user]);

  const allScriptsLoaded =
    loadedScripts.three &&
    loadedScripts.tween &&
    loadedScripts.cameraUtils &&
    loadedScripts.controlUtils &&
    loadedScripts.hands;

  // Initialize game when selectedSpread is chosen
  useEffect(() => {
    if (!isMounted || !allScriptsLoaded || !selectedSpread) return;
    
    setGuideText("Đang yêu cầu quyền truy cập camera...");
    
    initThreeGame();
    startCameraAndMediaPipe();

    return () => {
      if (gameRef.current.renderer) {
        gameRef.current.renderer.dispose();
      }
      if (gameRef.current.cameraUtilsInstance) {
        try {
          gameRef.current.cameraUtilsInstance.stop();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [isMounted, allScriptsLoaded, selectedSpread]);

  // Fetch pre-drawn cards when spread changes
  useEffect(() => {
    if (!selectedSpread) return;

    const fetchPredeterminedCards = async () => {
      setIsLoadingCards(true);
      setGuideText("Đang thiết lập quẻ bài từ thiên cơ...");
      try {
        const count = SPREADS[selectedSpread].count;
        const resData = await callRAGBoiBaiAPI("/api/folk-cards/draw", {
          count: count,
          mode: 32, // 32-card mode (7-A)
          user_id: user ? String(user.id || user.userId || "guest") : "guest"
        });

        if (resData && resData.success && resData.data?.cards) {
          updatePredeterminedCards(resData.data.cards);
          setGuideText("Đưa tay lên trước Camera để bắt đầu gieo quẻ");
        } else {
          alert("Lỗi kết nối hoặc không nhận được quẻ bài.");
          updateSelectedSpread(null);
        }
      } catch (e) {
        console.error(e);
        alert("Không thể gieo quẻ bài lúc này. Vui lòng kiểm tra kết nối API.");
        updateSelectedSpread(null);
      } finally {
        setIsLoadingCards(false);
      }
    };

    fetchPredeterminedCards();
  }, [selectedSpread, user]);

  // Card deck configuration
  const SUITS = ["C", "D", "H", "S"];
  const RANK_NAMES = ["7", "8", "9", "10", "J", "Q", "K", "A"];
  const CARD_DATA: any[] = [];
  SUITS.forEach((suit) => {
    RANK_NAMES.forEach((rank) => {
      let name = `${rank} ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;
      if (rank === "J") name = `Bồi ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;
      if (rank === "Q") name = `Đầm ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;
      if (rank === "K") name = `Già ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;
      if (rank === "A") name = `Ách ${suit === "C" ? "Chuồn" : suit === "D" ? "Rô" : suit === "H" ? "Cơ" : "Bích"}`;

      CARD_DATA.push({
        id: `${rank}-${suit}`,
        name: name,
        url: `/static/cards/${rank}-${suit}.png`,
        meaning: `Lá ${name} - Ý nghĩa sẽ được AI luận giải chi tiết.`,
      });
    });
  });

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const CONFIG = {
    cardCount: CARD_DATA.length,
    radius: 6.5,
    cardWidth: 1.4,
    cardHeight: 2.4,
    inspectPos: { x: 0, y: 0, z: 3.8 },
    inspectScale: 0.5,
    storageScale: 0.09,
    storageZ: 3.5,
    storeMarginX: 0.1,
    storeMarginTop: 1.1,
    storeGapY: 0.25,
  };

  // Generate white glow texture
  const generateParticleTexture = (THREE: any) => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.4, "rgba(255, 255, 255, 0.5)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    return tex;
  };

  const initThreeGame = () => {
    const THREE = window.THREE;
    const TWEEN = window.TWEEN;

    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.02);
    gameRef.current.scene = scene;
    gameRef.current.cursorPosition = new THREE.Vector2(0, 0);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 5);
    gameRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);
    gameRef.current.renderer = renderer;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const spotLight = new THREE.SpotLight(0xffffff, 2.0);
    spotLight.position.set(0, 10, 10);
    scene.add(spotLight);

    const textureLoader = new THREE.TextureLoader();
    const particleTexture = generateParticleTexture(THREE);

    // Create background stars
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];
    for (let i = 0; i < starCount; i++) {
      positions.push((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 50 - 10);
      sizes.push(Math.random() * 0.5 + 0.1);
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    starGeo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    const starMat = new THREE.PointsMaterial({
      size: 0.8,
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
    });
    const starFieldMesh = new THREE.Points(starGeo, starMat);
    scene.add(starFieldMesh);
    gameRef.current.starFieldMesh = starFieldMesh;

    shuffleArray(CARD_DATA);
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);
    gameRef.current.cardGroup = cardGroup;

    const cardGeo = new THREE.BoxGeometry(CONFIG.cardWidth, CONFIG.cardHeight, 0.02);
    const backTex = textureLoader.load("/static/cards/BACK.png");
    const matEdge = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });

    CARD_DATA.forEach((data, i) => {
      const frontTex = textureLoader.load(data.url);
      const matFront = new THREE.MeshStandardMaterial({ map: frontTex });
      const matBack = new THREE.MeshStandardMaterial({ map: backTex, color: 0xffffff });
      const materials = [matEdge, matEdge, matEdge, matEdge, matBack, matFront];
      const card = new THREE.Mesh(cardGeo, materials);

      const angle = (i / CONFIG.cardCount) * Math.PI * 2;
      const yPos = (i - CONFIG.cardCount / 2) * 0.08;

      card.position.set(Math.sin(angle) * CONFIG.radius, yPos, Math.cos(angle) * CONFIG.radius);
      card.lookAt(0, yPos * 0.2, 0);
      card.userData = { id: i, data: data, isPicked: false, baseY: yPos };
      cardGroup.add(card);
    });

    gameRef.current.raycaster = new THREE.Raycaster();
    gameRef.current.mouse = new THREE.Vector2();

    const onMouseDown = (event: MouseEvent) => {
      const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];
      if (!gameRef.current.isGameActive || gameRef.current.storedCards.length >= activeConfig.count || predeterminedCardsRef.current.length === 0) return;
      gameRef.current.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      gameRef.current.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      gameRef.current.raycaster.setFromCamera(gameRef.current.mouse, camera);
      const intersects = gameRef.current.raycaster.intersectObjects(cardGroup.children);
      if (intersects.length > 0) {
        triggerPickCard(intersects[0].object);
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("resize", onResize);

    const animate = (time: number) => {
      requestAnimationFrame(animate);
      TWEEN.update(time);
      updateExplosions();

      if (gameRef.current.isGameActive) {
        let targetRotSpeed = 0.002;
        if (gameRef.current.handX < 0.45) targetRotSpeed = -0.005;
        else if (gameRef.current.handX > 0.55) targetRotSpeed = 0.005;

        gameRef.current.rotationSpeed += (targetRotSpeed - gameRef.current.rotationSpeed) * 0.05;
        cardGroup.rotation.y += gameRef.current.rotationSpeed;

        cardGroup.children.forEach((c: any, i: number) => {
          if (!c.userData.isPicked) {
            c.position.y = c.userData.baseY + Math.sin(time * 0.0015 + i) * 0.1;
          }
        });
      }

      if (starFieldMesh) {
        starFieldMesh.rotation.y = time * 0.00005;
        starFieldMesh.material.size = Math.sin(time * 0.002) * 0.1 + 0.9;
      }
      
      renderer.render(scene, camera);
    };

    requestAnimationFrame(animate);
  };

  const onResize = () => {
    const camera = gameRef.current.camera;
    const renderer = gameRef.current.renderer;
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      repositionStoredCards();
    }
  };

  const createExplosion = (position: any) => {
    const THREE = window.THREE;
    const particleCount = 150;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const sizes = [];

    const particleTexture = generateParticleTexture(THREE);

    for (let i = 0; i < particleCount; i++) {
      positions.push(position.x, position.y, position.z);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = Math.random() * 0.03 + 0.01;

      velocities.push(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi)
      );
      sizes.push(Math.random() * 0.15 + 0.05);
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.2,
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
    });

    const points = new THREE.Points(geo, mat);
    gameRef.current.scene.add(points);
    gameRef.current.explosions.push({ mesh: points, velocities: velocities, age: 0 });
  };

  const updateExplosions = () => {
    for (let i = gameRef.current.explosions.length - 1; i >= 0; i--) {
      const ex = gameRef.current.explosions[i];
      const positions = ex.mesh.geometry.attributes.position.array;
      ex.age += 1;
      for (let j = 0; j < ex.velocities.length / 3; j++) {
        positions[j * 3] += ex.velocities[j * 3];
        positions[j * 3 + 1] += ex.velocities[j * 3 + 1];
        positions[j * 3 + 2] += ex.velocities[j * 3 + 2];
      }
      ex.mesh.geometry.attributes.position.needsUpdate = true;
      ex.mesh.material.opacity = 1 - ex.age / 60;
      ex.mesh.scale.setScalar(1 + ex.age * 0.01);
      if (ex.age > 60) {
        gameRef.current.scene.remove(ex.mesh);
        ex.mesh.geometry.dispose();
        gameRef.current.explosions.splice(i, 1);
      }
    }
  };

  const getSafeVerticalLeftPosition = (index: number) => {
    const camera = gameRef.current.camera;
    const dist = camera.position.z - CONFIG.storageZ;
    const vFOV = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
    const visibleWidth = visibleHeight * camera.aspect;

    const leftEdge = -visibleWidth / 2;
    const topEdge = visibleHeight / 2;

    const x = leftEdge + CONFIG.storeMarginX;
    const y = topEdge - CONFIG.storeMarginTop - index * CONFIG.storeGapY;

    return { x, y, z: CONFIG.storageZ };
  };

  const repositionStoredCards = () => {
    const TWEEN = window.TWEEN;
    storedCardsList.forEach((c: any, i: number) => {
      const pos = getSafeVerticalLeftPosition(i);
      new TWEEN.Tween(c.position).to({ x: pos.x, y: pos.y, z: pos.z }, 500).start();
      new TWEEN.Tween(c.scale).to({ x: CONFIG.storageScale, y: CONFIG.storageScale, z: CONFIG.storageScale }, 500).start();
    });
  };

  const storedCardsList: any[] = [];

  const triggerPickCard = (card: any) => {
    const THREE = window.THREE;
    const TWEEN = window.TWEEN;
    const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];

    console.log("🔮 [debug] triggerPickCard called for card index/id:", card.userData?.id);
    console.log("🔮 [debug] current storedCards count:", gameRef.current.storedCards.length, "max count:", activeConfig.count);
    console.log("🔮 [debug] is card already picked:", card.userData.isPicked);
    console.log("🔮 [debug] inspectingCard state:", !!gameRef.current.inspectingCard);

    if (gameRef.current.inspectingCard || gameRef.current.storedCards.length >= activeConfig.count || card.userData.isPicked) {
      console.warn("🔮 [debug] triggerPickCard returned early: checks failed.");
      return;
    }
    
    // Select predetermined card face based on sequence
    const nextCard = predeterminedCardsRef.current[gameRef.current.storedCards.length];
    console.log("🔮 [debug] nextCard resolved:", nextCard);
    if (!nextCard) {
      console.error("🔮 [debug] nextCard is undefined! predeterminedCardsRef.current length:", predeterminedCardsRef.current.length);
      return;
    }

    card.userData.isPicked = true;
    gameRef.current.inspectingCard = card;
    gameRef.current.scene.attach(card);

    // Apply texture loader to update the front face of the 3D card
    const textureLoader = new THREE.TextureLoader();
    const frontTex = textureLoader.load(nextCard.url || `/static/cards/${nextCard.id}.png`);
    frontTex.wrapS = THREE.RepeatWrapping;
    frontTex.repeat.x = -1;
    card.material[5] = new THREE.MeshStandardMaterial({ map: frontTex });

    new TWEEN.Tween(card.position).to(CONFIG.inspectPos, 1000).easing(TWEEN.Easing.Cubic.Out).start();
    new TWEEN.Tween(card.rotation).to({ x: 0, y: Math.PI, z: 0 }, 1000).easing(TWEEN.Easing.Back.Out).start();

    const targetScale = CONFIG.inspectScale;
    new TWEEN.Tween(card.scale)
      .to({ x: targetScale, y: targetScale, z: targetScale }, 1000)
      .onComplete(() => {
        setTimeout(() => {
          createExplosion(card.position);
          setTimeout(() => {
            const stored = gameRef.current.storedCards;
            stored.push(card);
            storedCardsList.push(card);
            gameRef.current.inspectingCard = null;

            const index = stored.length - 1;
            const pos = getSafeVerticalLeftPosition(index);
            const scale = CONFIG.storageScale;

            new TWEEN.Tween(card.position)
              .to({ x: pos.x, y: pos.y, z: pos.z }, 800)
              .easing(TWEEN.Easing.Exponential.Out)
              .onComplete(() => {
                card.visible = false;
              })
              .start();
            new TWEEN.Tween(card.scale).to({ x: scale, y: scale, z: scale }, 800).start();

            setCounter(stored.length);
            setSelectedCards((prev) => [...prev, nextCard]);

            if (stored.length === activeConfig.count) {
              setGuideText("Định mệnh đã an bài...");
              gameRef.current.isGameActive = false;
              setIsGameActive(false);
              setTimeout(() => {
                revealReading(stored);
              }, 2000);
            }
          }, 100);
        }, 1500);
      })
      .start();
  };

  const revealReading = async (stored: any[]) => {
    if (cursorRef.current) cursorRef.current.style.display = "none";
    
    setIsInterpreting(true);
    try {
      const drawnCardsPayload = predeterminedCardsRef.current.map((c) => ({
        id: c.id,
        name: c.name,
      }));
      
      const interpretRes = await callRAGBoiBaiAPI("/api/folk-cards/interpret", {
        spread_type: selectedSpreadRef.current,
        drawn_cards: drawnCardsPayload,
        user_question: "",
        chart: primaryChart
      });

      if (interpretRes && interpretRes.success) {
        setServerResult(interpretRes);
        setShowModal(true);
      } else {
        alert("Lỗi giải nghĩa quẻ bài.");
      }
    } catch (e) {
      console.error(e);
      alert("Không thể kết nối đến server để giải quẻ.");
    } finally {
      setIsInterpreting(false);
    }
  };

  // Start Camera & MediaPipe Hands
  const startCameraAndMediaPipe = async () => {
    const Hands = window.Hands;
    const Camera = window.Camera;

    if (!Hands || !Camera || !videoRef.current) return;

    const handsDetector = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    handsDetector.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    handsDetector.onResults(onHandResults);
    gameRef.current.handsDetector = handsDetector;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      stream.getTracks().forEach((track) => track.stop());

      const cam = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await handsDetector.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      await cam.start();
      gameRef.current.cameraUtilsInstance = cam;
      setGuideText("Đưa tay lên trước Camera để bắt đầu gieo quẻ");
    } catch (err) {
      console.error("Camera access denied:", err);
      setGuideText("⚠️ LỖI: HÃY CẤP QUYỀN TRUY CẬP CAMERA!");
    }
  };

  const onHandResults = (results: any) => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const lm = results.multiHandLandmarks[0];
      if (gameRef.current.storedCards.length === 0) {
        setGuideText("Chụm ngón cái và ngón trỏ để chọn bài");
      }

      gameRef.current.handX = 1 - lm[9].x;
      const x = (lm[8].x + lm[4].x) / 2;
      const y = (lm[8].y + lm[4].y) / 2;
      const screenX = (1 - x) * window.innerWidth;
      const screenY = y * window.innerHeight;

      cursor.style.display = "block";
      cursor.style.left = `${screenX}px`;
      cursor.style.top = `${screenY}px`;

      if (gameRef.current.cursorPosition && typeof gameRef.current.cursorPosition.set === "function") {
        gameRef.current.cursorPosition.set(
          (screenX / window.innerWidth) * 2 - 1,
          -(screenY / window.innerHeight) * 2 + 1
        );
      } else {
        gameRef.current.cursorPosition = {
          x: (screenX / window.innerWidth) * 2 - 1,
          y: -(screenY / window.innerHeight) * 2 + 1
        };
      }

      const distance = Math.hypot(lm[8].x - lm[4].x, lm[8].y - lm[4].y);
      const palmSize = Math.hypot(lm[9].x - lm[0].x, lm[9].y - lm[0].y);
      const pinchRatio = palmSize > 0 ? (distance / palmSize) : 999;
      const isPinchingNow = pinchRatio < 0.45;

      if (isPinchingNow) {
        cursor.classList.add("pinching");
        if (gameRef.current.isGameActive && gameRef.current.renderer && !gameRef.current.cardPickedInCurrentPinch) {
          console.log("🔮 [debug] Pinch Active - NDC Coords:", gameRef.current.cursorPosition.x, gameRef.current.cursorPosition.y, "Ratio:", pinchRatio.toFixed(3));
          console.log("🔮 [debug] Total cardGroup children count:", gameRef.current.cardGroup?.children?.length);
          
          gameRef.current.raycaster.setFromCamera(gameRef.current.cursorPosition, gameRef.current.camera);
          const intersects = gameRef.current.raycaster.intersectObjects(gameRef.current.cardGroup.children, true);
          
          console.log("🔮 [debug] Raycast Intersections found count:", intersects.length);
          if (intersects.length > 0) {
            const hitObject = intersects[0].object;
            console.log("🔮 [debug] Hit detected on mesh:", hitObject.userData);
            triggerPickCard(hitObject);
            gameRef.current.cardPickedInCurrentPinch = true;
          }
        }
      } else {
        cursor.classList.remove("pinching");
        gameRef.current.cardPickedInCurrentPinch = false;
      }
      gameRef.current.isPinching = isPinchingNow;
    } else {
      cursor.style.display = "none";
    }
  };

  const getTuViContext = (chart?: any) => {
    const targetChart = chart || primaryChart;
    if (targetChart) {
      const name = targetChart.extra?.name || targetChart.request?.name || "Vô Danh";
      const date = targetChart.extra?.solar_date || "Chưa rõ";
      const gender = targetChart.extra?.gender || (targetChart.request?.gender === -1 ? "Nữ" : "Nam");
      const menh = targetChart.extra?.menh || "N/A";
      const cuc = targetChart.extra?.cuc || "N/A";
      return `[THÔNG TIN BẢN MỆNH]: Tên ${name}, Giới tính ${gender}, Ngày sinh ${date}, Bản mệnh ngũ hành ${menh}, Cục ${cuc}. `;
    }
    return user ? `[THÔNG TIN USER]: Tên ${[user.lastName, user.firstName].filter(Boolean).join(" ")}, Giới tính ${user.gender === -1 ? "Nữ" : "Nam"}. ` : "";
  };

  // Launch chat inside modal
  const handleStartAIConsultation = () => {
    if (savedCharts.length > 0) {
      setIsSelectorVisible(true);
    } else {
      onConfirmChat(primaryChart);
    }
  };

  const onConfirmChat = async (selectedChart?: any) => {
    setIsSelectorVisible(false);
    setIsSending(true);

    const uid = user ? Number(user.id || user.userId || 1) : 1;
    const activeConfig = SPREADS[selectedSpreadRef.current || "tam_da"];
    
    // Start Chat Session
    try {
      const res = await fetch(`${CHAT_API_BASE}/api/v1/chat/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: uid,
          chart_id: selectedChart?.id || null
        }),
      });
      const startData = await res.json();
      if (startData.success) {
        setChatConversationId(startData.conversation_id);
        
        // Auto-send initial prompt
        const chartContext = getTuViContext(selectedChart);
        const targetName = selectedChart?.extra?.name || selectedChart?.request?.name || "tôi";
        
        const cardsText = predeterminedCardsRef.current.map((c, idx) => {
          const positionName = serverResult?.card_details?.find((d: any) => d.position_index === idx)?.position_name || activeConfig.labels[idx];
          return `${positionName.toUpperCase()}: ${c.name}`;
        }).join("; ");

        const prompt = `[BOI BAI TAY]
Quẻ: ${VIETNAMESE_MAP[serverResult?.spread_name] || serverResult?.spread_name || activeConfig.name} (${predeterminedCards.length} lá)
Bài gieo được: ${cardsText}

User hỏi: Chào Cố Vấn, ${chartContext}hãy kết hợp thông tin bản mệnh của ${targetName} và quẻ bài tây này để phân tích vận mệnh tổng quan nhé.`;

        await handleSendMessage(prompt, startData.conversation_id);
      } else {
        alert("Lỗi khởi tạo chat: " + (startData.error || "Không rõ nguyên nhân"));
      }
    } catch (e) {
      console.error(e);
      alert("Không thể kết nối đến server Chat.");
    } finally {
      setIsSending(false);
    }
  };

  // Chat send message
  const handleSendMessage = async (customText?: string, specificConvId?: number) => {
    const textToSend = customText || inputValue.trim();
    if (!textToSend || isSending) return;

    if (!customText) setInputValue("");
    
    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setIsSending(true);

    try {
      const res = await fetch(`${CHAT_API_BASE}/api/v1/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: specificConvId || chatConversationId || 1234,
          message: textToSend,
          context: "folk_cards",
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Parse suggested questions
        const suggestedRegex = /---SUGGESTED_QUESTION---(.*?)---\/SUGGESTED_QUESTION---/g;
        const suggestions: string[] = [];
        let match;
        while ((match = suggestedRegex.exec(data.answer)) !== null) {
          suggestions.push(match[1].trim());
        }
        
        let cleanText = data.answer.replace(/---SUGGESTED_QUESTION---.*?---\/SUGGESTED_QUESTION---/g, "").trim();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: cleanText, suggestions: suggestions.length > 0 ? suggestions : undefined },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: "Lỗi: " + (data.error || "Không thể tải lời giải.") }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Lỗi kết nối đến server AI Tarot." }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleChatSpecificCard = (card: any) => {
    const prompt = `[BOI BAI TAY]
Lá bài: ${card.name} ở vị trí ${card.position_name}.
Yêu cầu: Xin Cố Vấn giải mã sâu sắc hơn sự ảnh hưởng của lá bài này đến vận thế sắp tới của tôi.`;
    handleSendMessage(prompt);
  };

  const handleReset = () => {
    setCounter(0);
    setSelectedCards([]);
    updatePredeterminedCards([]);
    setServerResult(null);
    setShowModal(false);
    setIsGameActive(true);
    updateSelectedSpread(null);
    setChatConversationId(null);
    setMessages([
      {
        role: "assistant",
        text: "Chào bạn, ta là bậc thầy giải mã thẻ bài tây. Bạn vừa gieo được một quẻ bài chứa đầy mật mã năng lượng. Hãy đặt câu hỏi của bạn để cùng ta tháo gỡ nhé.",
      }
    ]);
  };

  if (!isMounted) return null;

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#090514] text-white flex flex-col items-center justify-center p-6 text-center font-serif relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#090514] to-[#050209] z-0 pointer-events-none" />
        <div className="relative z-10 max-w-md w-full bg-[#120a26]/80 border border-indigo-500/30 p-8 rounded-3xl backdrop-blur-sm shadow-2xl">
          <span className="text-6xl block mb-6 animate-pulse">🔮</span>
          <h2 className="text-2xl font-black uppercase text-[#fcd34d] tracking-widest mb-4 font-serif">
            Yêu Cầu Đăng Nhập
          </h2>
          <p className="text-slate-300 text-sm leading-6 mb-8 font-sans">
            Cổng Huyền Cơ AI yêu cầu bạn đăng nhập để tích lũy tín chỉ, lưu giữ kết quả và trò chuyện chi tiết với Tarot Master.
          </p>
          <Link
            href="/huyen-co?redirect=/huyen-co/boibai"
            className="inline-block px-8 py-3.5 bg-gradient-to-r from-[#d4af37] to-[#b8860b] hover:from-yellow-400 hover:to-[#d4af37] text-black font-black uppercase text-xs tracking-wider transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-full font-sans"
          >
            Về Trang Chủ Đăng Nhập
          </Link>
        </div>
      </div>
    );
  }

  // Selection Screen
  if (selectedSpread === null) {
    return (
      <div className="min-h-screen bg-[#05020c] text-white flex flex-col items-center justify-center p-6 relative font-serif">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#05020c] to-black z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center">
          <header className="text-center mb-12">
            <span className="text-5xl block mb-4 animate-pulse">🔮</span>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#d4af37] tracking-[4px] mb-3 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] font-serif">
              Chiêm Nghiệm Huyền Cơ
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm tracking-widest uppercase font-sans">
              Chọn phương thức gieo quẻ bài tây cổ điển
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
            {Object.values(SPREADS).map((item) => (
              <button
                key={item.id}
                onClick={() => updateSelectedSpread(item.id)}
                className="flex flex-col text-left p-6 rounded-2xl bg-indigo-950/20 border border-[#d4af37]/30 hover:border-[#d4af37] transition-all hover:bg-indigo-950/40 group relative overflow-hidden backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-full bg-black/40 border border-[#d4af37]/50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#d4af37] transition-colors font-serif">
                  {item.name}
                </h3>
                <span className="text-[10px] sm:text-xs text-[#d4af37] font-sans font-semibold uppercase tracking-wider mb-3">
                  {item.sub}
                </span>
                <div className="h-[1px] w-full bg-white/10 mb-3" />
                <p className="text-slate-300 text-xs leading-relaxed mb-4 flex-1 font-sans">
                  {item.desc}
                </p>
                <span className="inline-block px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-sans font-black uppercase tracking-wider rounded-md border border-[#d4af37]/30">
                  {item.count} Lá bài
                </span>
              </button>
            ))}
          </div>

          <Link
            href="/huyen-co"
            className="px-6 py-2 border border-white/20 hover:border-white/50 text-slate-400 hover:text-white rounded-full text-xs tracking-wider uppercase font-sans font-bold transition-all"
          >
            ← Quay Lại Cổng Chính
          </Link>
        </div>
      </div>
    );
  }

  const activeConfig = SPREADS[selectedSpread];

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#050505] text-white relative font-serif">
      <video
        ref={videoRef}
        id="input-video"
        playsInline
        autoPlay
        muted
        className="fixed top-0 left-0 w-full h-full object-cover opacity-0 pointer-events-none -z-50"
      />

      {/* WebGL Canvas container */}
      <div ref={containerRef} className="w-full h-full absolute top-0 left-0 z-10" />

      {/* Virtual Cursor */}
      <div
        ref={cursorRef}
        id="virtual-cursor"
        className="absolute w-[30px] h-[30px] border-2 border-white/90 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 hidden transition-[transform] duration-75 shadow-[0_0_10px_rgba(255,255,255,0.6)]"
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6">
        <header className="flex justify-between items-center w-full">
          <button
            onClick={handleReset}
            className="pointer-events-auto px-4 py-2 bg-black/40 hover:bg-black/60 border border-white/20 rounded-full text-xs tracking-wider uppercase font-sans font-bold flex items-center gap-2 backdrop-blur-md"
          >
            <span>🚪</span> Thoát Quẻ
          </button>
          <div className="px-5 py-1.5 border border-[#d4af37]/50 rounded-full font-sans font-bold text-sm sm:text-base bg-black/60 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.3)] text-[#d4af37] uppercase tracking-wider">
            {activeConfig.name}: {counter} / {activeConfig.count}
          </div>
        </header>

        {/* Bottom Drawn Cards Preview */}
        {!showModal && (
          <div className="w-full bottom-8 absolute left-0 z-20 pointer-events-auto flex flex-col items-center">
            {counter === 0 && <div className="text-sm font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] uppercase tracking-[3px] mb-4 animate-bounce">{guideText}</div>}
            
            <div className="flex gap-4 overflow-x-auto max-w-full px-8 pb-4">
              {selectedCards.map((card, idx) => (
                <div key={idx} className="flex flex-col items-center w-16 sm:w-20 flex-shrink-0">
                  <img
                    src={card.image || card.url || `/static/cards/${card.id}.png`}
                    alt={card.name}
                    className="w-full aspect-[5/8] object-contain rounded-md border border-white/40 shadow-lg bg-white"
                  />
                  <span className="text-[10px] text-slate-300 font-sans uppercase font-bold tracking-wider mt-1 text-center truncate w-full">
                    {activeConfig.labels[idx]}
                  </span>
                </div>
              ))}
              {[...Array(Math.max(0, activeConfig.count - selectedCards.length))].map((_, i) => (
                <div key={`placeholder-${i}`} className="w-16 sm:w-20 aspect-[5/8] rounded-md border border-white/20 border-dashed bg-black/40 flex-shrink-0" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {(isLoadingCards || !allScriptsLoaded) && (
        <div className="absolute inset-0 bg-[#020105] z-50 flex flex-col justify-center items-center text-center">
          <div className="animate-pulse">
            <div className="text-3xl text-yellow-300 mb-2">✦</div>
            <div className="text-[10px] text-slate-400 tracking-[6px] uppercase font-sans">
              {isLoadingCards ? "Đang thiết lập quẻ..." : "Đang kết nối thần điện..."}
            </div>
          </div>
        </div>
      )}

      {/* Interpretation Loading Overlay */}
      {isInterpreting && (
        <div className="absolute inset-0 bg-black/80 z-40 flex flex-col justify-center items-center text-center">
          <span className="text-6xl animate-spin mb-4">🔮</span>
          <div className="text-sm font-bold text-[#d4af37] tracking-[4px] uppercase font-sans">
            Đang giải mã mật tông bài tây...
          </div>
        </div>
      )}

      {/* Result drawer & Chat modal */}
      {showModal && serverResult && (
        <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-[#0c061a] border border-[#d4af37]/60 rounded-3xl flex flex-col md:flex-row overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.2)] relative backdrop-blur-md">
            
            {/* Left Panel: Result analysis */}
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-indigo-500/10 flex flex-col h-1/2 md:h-full overflow-hidden">
              <div className="p-6 border-b border-indigo-500/10 text-center">
                <h2 className="text-lg font-black uppercase text-[#d4af37] tracking-[2px] mb-1 font-serif">
                  Luận Giải {VIETNAMESE_MAP[serverResult.spread_name] || serverResult.spread_name || activeConfig.name}
                </h2>
                <p className="text-[10px] text-slate-400 tracking-wider uppercase font-sans">
                  Chiêm nghiệm quẻ RAG cổ thư
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Score & Assessment */}
                {serverResult.score && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-[#d4af37]/30">
                    <span className="text-sm font-bold text-slate-300 font-sans uppercase">Điểm Số Bản Mệnh:</span>
                    <div className="text-right">
                      <div className="text-lg font-black text-[#d4af37]">{serverResult.score.score}/10</div>
                      <div className="text-xs text-white/70 mt-0.5">{VIETNAMESE_MAP[serverResult.score.assessment] || serverResult.score.assessment}</div>
                    </div>
                  </div>
                )}

                {/* Combos list */}
                {serverResult.combinations && serverResult.combinations.length > 0 && (
                  <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                    <h3 className="text-xs font-black text-emerald-400 tracking-wider uppercase mb-3 flex items-center gap-1.5 font-sans">
                      <span>✨</span> Tổ Hợp Đặc Biệt Phát Hiện
                    </h3>
                    <div className="space-y-4">
                      {serverResult.combinations.map((combo: any, idx: number) => (
                        <div key={idx} className={idx > 0 ? "border-t border-emerald-500/10 pt-3" : ""}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-white font-serif">{combo.name || combo.key}</span>
                            <span className="text-xs text-emerald-400 font-bold">+{combo.score}đ</span>
                          </div>
                          <p className="text-xs text-emerald-200/80 leading-relaxed font-sans">{combo.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual cards reading list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-3 font-sans">
                    Chi Tiết Từng Lá Bài
                  </h3>
                  {selectedCards.map((card, idx) => {
                    const detail = serverResult.card_details?.find((d: any) => d.position_index === idx);
                    const isPositive = detail?.is_positive !== false;
                    return (
                      <div key={idx} className={`p-4 rounded-xl bg-white/5 border-l-4 flex gap-4 ${isPositive ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                        <img
                          src={card.image || card.url || `/static/cards/${card.id}.png`}
                          alt={card.name}
                          className="w-14 aspect-[5/8] object-contain rounded border border-white/20 bg-white flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <div>
                              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-bold uppercase mr-2 font-sans">
                                {detail?.position_name || activeConfig.labels[idx]}
                              </span>
                              <span className="text-sm font-bold text-white font-serif">{card.name}</span>
                            </div>
                            <button
                              onClick={() => handleChatSpecificCard(detail || card)}
                              className="px-2 py-0.5 border border-[#d4af37]/40 text-[9px] text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-black uppercase rounded transition-colors font-sans"
                            >
                              Luận lá này
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{card.meaning}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RAG Folk Readings context */}
                {serverResult.rag_luan_giai && (
                  <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
                    <h3 className="text-xs font-black text-[#d4af37] tracking-wider uppercase mb-2 flex items-center gap-1.5 font-sans">
                      <span>📚</span> Khai Vấn Tri Thức Dân Gian
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans italic whitespace-pre-line">
                      {serverResult.rag_luan_giai}
                    </p>
                  </div>
                )}
              </div>

              {/* Reset/Exit buttons */}
              <div className="p-4 border-t border-indigo-500/10 bg-black/20 flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-[#d4af37] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all font-sans"
                >
                  Gieo Quẻ Mới
                </button>
                <button
                  onClick={() => updateSelectedSpread(null)}
                  className="flex-1 py-3 border border-white/20 hover:border-white/50 text-slate-300 text-xs uppercase tracking-widest rounded-xl transition-all font-sans"
                >
                  Chọn Quẻ Khác
                </button>
              </div>
            </div>

            {/* Right Panel: Chat Consultation */}
            <div className="w-full md:w-1/2 flex flex-col h-1/2 md:h-full overflow-hidden">
              <div className="p-6 border-b border-indigo-500/10 flex justify-between items-center bg-black/20">
                <div>
                  <h3 className="text-sm font-black text-white tracking-widest uppercase font-serif">
                    Tham Vấn Cố Vấn Mệnh Lý AI
                  </h3>
                  <p className="text-[9px] text-[#d4af37] tracking-wider uppercase font-sans mt-0.5">
                    Hỗ trợ phân tích chuyên sâu cùng tinh bàn của bạn
                  </p>
                </div>
                {!chatConversationId && (
                  <button
                    onClick={handleStartAIConsultation}
                    disabled={isSending}
                    className="px-4 py-2 bg-[#d4af37] text-black hover:bg-yellow-400 rounded-full font-black text-[10px] tracking-wider uppercase transition-all shadow-md font-sans"
                  >
                    Bắt đầu kết nối AI
                  </button>
                )}
              </div>

              {/* Chat screen */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col bg-slate-950/20">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border ${
                      msg.role === "user"
                        ? "bg-slate-800 text-white self-end border-slate-700 rounded-br-none font-sans"
                        : "bg-[#160c2b] text-indigo-100 self-start border-[#d4af37]/30 rounded-bl-none font-sans"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    
                    {/* Suggestions buttons */}
                    {msg.suggestions && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-indigo-500/10">
                        {msg.suggestions.map((sug, sIndex) => (
                          <button
                            key={sIndex}
                            onClick={() => handleSendMessage(sug)}
                            disabled={isSending}
                            className="px-2.5 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] rounded-full text-[10px] hover:bg-[#d4af37] hover:text-black font-sans font-semibold transition-all disabled:opacity-50"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="bg-[#160c2b] border border-[#d4af37]/20 text-indigo-300 self-start rounded-2xl p-4 text-xs font-sans animate-pulse">
                    🔮 Đang gieo quẻ luận giải...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-indigo-500/10 bg-black/40 flex gap-3 items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Nhập câu hỏi chiêm nghiệm của bạn..."
                  disabled={isSending || !chatConversationId}
                  className="flex-1 px-4 py-3 bg-[#110724] border border-indigo-500/30 rounded-full text-xs sm:text-sm outline-none text-white focus:border-[#d4af37] transition-all disabled:opacity-50 font-sans"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isSending || !chatConversationId}
                  className="px-5 py-3 bg-[#d4af37] text-black font-black rounded-full text-xs hover:bg-yellow-400 transition-all font-sans uppercase tracking-wider disabled:opacity-50"
                >
                  Gửi
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Chart Selector Modal */}
      {isSelectorVisible && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] w-full max-w-md rounded-3xl p-6 border border-[#d4af37]/30 shadow-2xl backdrop-blur-sm">
            <h3 className="text-base font-black text-[#d4af37] text-center tracking-wider mb-2 font-serif uppercase">
              Chọn Người Chiêm Nghiệm
            </h3>
            <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed font-sans">
              Thông tin cá nhân giúp phân tích xu hướng năng lượng chính xác hơn.
            </p>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {/* Primary User Chart */}
              <button 
                onClick={() => onConfirmChat(primaryChart)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/40 text-left transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-lg">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-[#d4af37] font-sans uppercase">Bản Thân (Chính Chủ)</div>
                  <div className="text-sm font-bold text-white font-serif truncate mt-0.5">{primaryChart?.extra?.name || user?.firstName}</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">{primaryChart?.extra?.solar_date}</div>
                </div>
              </button>

              {/* Guest profiles */}
              {savedCharts.filter(c => !c.isPrimary).map((chart) => (
                <button 
                  key={chart.id}
                  onClick={() => onConfirmChat(chart)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                    👥
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-400 font-sans uppercase">Xem Hộ</div>
                    <div className="text-sm font-bold text-white font-serif truncate mt-0.5">{chart.extra?.name || chart.request?.name}</div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">{chart.extra?.solar_date}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => onConfirmChat(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-300 font-sans uppercase py-2"
              >
                Gieo Quẻ Ẩn Danh
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        #virtual-cursor.pinching {
          background: #ffffff;
          width: 15px !important;
          height: 15px !important;
          border: none !important;
          box-shadow: 0 0 20px #ffffff, 0 0 40px #ffffff;
          transform: translate(-50%, -50%) scale(1.2) !important;
        }
      `}</style>
    </div>
  );
}
