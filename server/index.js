// ============================================
// OMIX Live Sound Archive — server
// 원본: https://github.com/ssbin020306-boop/Test (live-sound-archive)
// 변경점: /card 의 서버 렌더 HTML 템플릿 제거 -> JSON API로 전환
//         (QR은 index.html?card=<id> 를 가리키고, card-overlay.js가
//          메인 페이지 위에 오버레이로 카드를 띄운다)
// 설치: npm install (server/ 폴더 안에서)
// 실행: npm start
// ============================================

const express = require("express");
const multer = require("multer");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// ========== 설정 (환경변수, 없으면 로컬 기본값) ==========
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "omix-secret-key";
// OMIX 정적 사이트가 서비스되는 주소. QR에 담길 카드 URL을 만들 때 사용.
// 배포 주소가 정해지면 이 값만 바꾸면 됨 (serve.ps1 기본 포트는 3700).
const SITE_BASE_URL = process.env.SITE_BASE_URL || "http://localhost:3700";
const UPLOAD_DIR = path.join(__dirname, "uploads");
// ========================================================

const PREFIX = ["법", "혜", "선", "지", "묘", "대", "청", "원", "진", "광", "정", "인", "명", "화", "덕", "승", "연", "보", "자", "무"];
const SUFFIX = ["음", "광", "현", "수", "성", "진", "원", "화", "연", "명", "심", "선", "도", "운", "천", "지", "해", "봉", "일", "공"];
function randomDJName() {
  return `DJ ${PREFIX[Math.floor(Math.random() * PREFIX.length)]}${SUFFIX[Math.floor(Math.random() * SUFFIX.length)]}`;
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    // busboy/multer는 멀티파트 파일명을 latin1로 디코딩하므로 한글 파일명이 깨진다 -> utf8로 재변환
    const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
    const ext = path.extname(originalName);
    const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9가-힣_-]/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, [".wav", ".mp3", ".aif", ".aiff", ".flac"].includes(path.extname(file.originalname).toLowerCase()));
  },
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "init", cards: loadCards() }));
});

const CARDS_DB = path.join(__dirname, "cards.json");
function loadCards() {
  try {
    return JSON.parse(fs.readFileSync(CARDS_DB, "utf8"));
  } catch {
    return [];
  }
}
function saveCard(card) {
  const cards = loadCards();
  cards.unshift(card);
  fs.writeFileSync(CARDS_DB, JSON.stringify(cards, null, 2));
}

// ── 카드 조회 API (card.html이 ?id= 로 이 값을 가져와 렌더링) ──
app.get("/api/cards/:id", (req, res) => {
  const card = loadCards().find((c) => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: "카드를 찾을 수 없습니다" });
  res.json(card);
});

app.get("/api/cards", (req, res) => res.json(loadCards()));

// ── 업로드 (Ableton/DJ 부스에서 녹음 완료 시 호출) ──
app.post("/upload", (req, res) => {
  if (req.headers["x-api-key"] !== API_KEY) return res.status(401).json({ error: "인증 실패" });
  upload.single("audio")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "파일 없음" });

    // busboy/multer는 멀티파트 파일명을 latin1로 디코딩하므로 한글 파일명이 깨진다 -> utf8로 재변환
    const originalName = Buffer.from(req.file.originalname, "latin1").toString("utf8");

    const cards = loadCards();
    const id = genId();
    const ext = path.extname(originalName).slice(1);
    const trackName = path
      .basename(originalName, path.extname(originalName))
      .replace(/^\d+_/, "")
      .replace(/_/g, " ");

    const card = {
      id,
      cardNumber: cards.length + 1,
      djName: randomDJName(),
      trackName,
      filename: req.file.filename,
      audioUrl: `/uploads/${req.file.filename}`,
      ext,
      size: req.file.size,
      createdAt: Date.now(),
      cardUrl: `${SITE_BASE_URL}/index.html?card=${id}`,
    };
    saveCard(card);
    broadcast({ type: "new_card", card });
    console.log("🎵 " + card.djName + " — " + trackName);
    res.json({ ok: true, card });
  });
});

server.listen(PORT, () => console.log("🚀 OMIX live-sound-archive server: http://localhost:" + PORT));
