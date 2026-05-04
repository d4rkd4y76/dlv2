const mainCanvas = document.getElementById("mainCanvas");
const netCanvas = document.getElementById("netCanvas");
const mainCtx = mainCanvas.getContext("2d");
const netCtx = netCanvas.getContext("2d");

const shapeTitle = document.getElementById("shapeTitle");
const shapeDesc = document.getElementById("shapeDesc");
const shapeProps = document.getElementById("shapeProps");
const shapeNote = document.getElementById("shapeNote");
const shapeKidInfo = document.getElementById("shapeKidInfo");
const shapeExamples = document.getElementById("shapeExamples");
const shapeQuestion = document.getElementById("shapeQuestion");
const shapeButtons = document.getElementById("shapeButtons");

const showFaces = document.getElementById("showFaces");
const showEdges = document.getElementById("showEdges");
const showVertices = document.getElementById("showVertices");
const strictMode = document.getElementById("strictMode");

const toggleOpenBtn = document.getElementById("toggleOpenBtn");
const toggleRotateBtn = document.getElementById("toggleRotateBtn");
const toggleExplodeBtn = document.getElementById("toggleExplodeBtn");
const resetBtn = document.getElementById("resetBtn");

const SHAPES = {
  cube: {
    name: "Küp",
    short: "6 kare yüzey",
    desc: "Tüm yüzleri kare olan özel bir kare prizmadır.",
    kidInfo: "Küpün bütün yüzleri aynı büyüklükte karelerden oluşur. Elindeki zar bir küptür.",
    examples: ["Zar", "Küp şeker", "Rubik küp"],
    question: "Bir küpün kaç köşesi vardır?",
    props: { faces: 6, edges: 12, vertices: 8 },
    model: () => prismModel(2, 2, 2),
    net: () => prismNet(110, 110, 110)
  },
  squarePrism: {
    name: "Kare Prizma",
    short: "Taban kare, yan yüzler dikdörtgen",
    desc: "Tabanı kare olan prizmadır. Yüksekliği kenardan farklı olabilir.",
    kidInfo: "Kare prizmanın alt ve üst yüzü karedir. Yan yüzleri ise dikdörtgendir.",
    examples: ["Kare kalem kutusu", "Bazı kolon kutuları", "Kutu oyuncaklar"],
    question: "Kare prizmanın kaç yüzeyi vardır?",
    props: { faces: 6, edges: 12, vertices: 8 },
    model: () => prismModel(2, 3, 2),
    net: () => prismNet(100, 140, 100)
  },
  rectangularPrism: {
    name: "Dikdörtgen Prizma",
    short: "6 dikdörtgen yüzey",
    desc: "Karşılıklı yüzleri eş olan günlük hayattaki kutu şeklidir.",
    kidInfo: "Dikdörtgen prizma kutu gibidir. Karşılıklı yüzleri aynı şekil ve aynı büyüklüktedir.",
    examples: ["Süt kutusu", "Kitap", "Ayakkabı kutusu"],
    question: "Dikdörtgen prizmanın kaç ayrıtı vardır?",
    props: { faces: 6, edges: 12, vertices: 8 },
    model: () => prismModel(3.2, 2, 1.8),
    net: () => prismNet(160, 100, 90)
  },
  triangularPrism: {
    name: "Üçgen Prizma",
    short: "2 üçgen + 3 dikdörtgen",
    desc: "Tabanları üçgen olan, 5 yüzlü bir prizmadır.",
    kidInfo: "Üçgen prizmanın iki tane üçgen tabanı vardır. Yan yüzleri dikdörtgendir.",
    examples: ["Çadır", "Üçgen çikolata kutusu", "Bazı çatı modelleri"],
    question: "Üçgen prizmanın tabanları hangi şekildedir?",
    props: { faces: 5, edges: 9, vertices: 6 },
    model: () => triangularPrismModel(2.8, 2.2, 2.2),
    net: () => triangularPrismNet(120, 90, 110)
  },
  squarePyramid: {
    name: "Kare Piramit",
    short: "1 kare + 4 üçgen",
    desc: "Tabanı kare, yan yüzleri üçgen olan cisimdir.",
    kidInfo: "Kare piramitte bir kare taban ve tepeye birleşen üçgen yüzler vardır.",
    examples: ["Mısır piramitleri modeli", "Dekoratif piramit objeler", "Bazı çadır tipleri"],
    question: "Kare piramitte kaç köşe vardır?",
    props: { faces: 5, edges: 8, vertices: 5 },
    model: () => squarePyramidModel(2.5, 2.8),
    net: () => squarePyramidNet(130, 95)
  },
  cylinder: {
    name: "Silindir",
    short: "2 daire + 1 eğri yan yüz",
    desc: "Alt ve üst tabanı daire olan, yan yüzü eğri cisimdir.",
    kidInfo: "Silindirin iki daire tabanı vardır. Yan kısmı dümdüz değil, eğri bir yüzeydir.",
    examples: ["Konserve kutusu", "Su bardağı", "Pil"],
    question: "Silindirin köşesi var mıdır?",
    props: { faces: 3, edges: 2, vertices: 0 },
    model: () => cylinderModel(1.1, 2.6, 20),
    net: () => cylinderNet(180, 120, 58)
  },
  cone: {
    name: "Koni",
    short: "1 daire + 1 eğri yan yüz",
    desc: "Tabanı daire, tepesi tek bir nokta olan cisimdir.",
    kidInfo: "Koninin altı daire, üstü ise tek bir noktada biter. Bu noktaya tepe deriz.",
    examples: ["Dondurma külahı", "Parti şapkası", "Trafik konisi"],
    question: "Koninin kaç tepe noktası vardır?",
    props: { faces: 2, edges: 1, vertices: 1 },
    model: () => coneModel(1.25, 2.8, 24),
    net: () => coneNet(90, 170, 58)
  },
  sphere: {
    name: "Küre",
    short: "Tamamen eğri yüzey",
    desc: "Kürenin köşesi ve ayrıtı yoktur, tek eğri yüzeyi vardır.",
    kidInfo: "Küre top gibidir. Ne köşesi ne de ayrıtı vardır.",
    examples: ["Futbol topu", "Portakal", "Misket"],
    question: "Kürenin ayrıt sayısı kaçtır?",
    props: { faces: 1, edges: 0, vertices: 0 },
    model: () => sphereModel(1.45, 10, 16),
    net: () => sphereNet(150, 95)
  }
};

const state = {
  shapeKey: "cube",
  rotX: -0.6,
  rotY: 0.8,
  autoRotate: false,
  explodeTarget: 0,
  explodeValue: 0,
  openTarget: 0,
  openValue: 0,
  strictMode: true,
  drag: null
};

const OPEN_SPEED = 0.012;
const EXPLODE_SPEED = 0.12;
const OPEN_STAGGER = 0.22;
const OPEN_WINDOW = 0.75;

function prismModel(w, h, d) {
  const x = w / 2;
  const y = h / 2;
  const z = d / 2;
  return {
    vertices: [
      [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
      [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ],
    faces: [
      [4, 5, 6, 7], [0, 1, 2, 3], [1, 5, 6, 2],
      [0, 4, 7, 3], [3, 2, 6, 7], [0, 1, 5, 4]
    ]
  };
}

function triangularPrismModel(base, height, depth) {
  const b = base / 2;
  const h = height / 2;
  const d = depth / 2;
  return {
    vertices: [
      [-b, -h, -d], [b, -h, -d], [0, h, -d],
      [-b, -h, d], [b, -h, d], [0, h, d]
    ],
    edges: [
      [0, 1], [1, 2], [2, 0],
      [3, 4], [4, 5], [5, 3],
      [0, 3], [1, 4], [2, 5]
    ],
    faces: [
      [0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]
    ]
  };
}

function squarePyramidModel(base, height) {
  const b = base / 2;
  return {
    vertices: [
      [-b, -b, -b], [b, -b, -b], [b, -b, b], [-b, -b, b], [0, height / 1.7, 0]
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [0, 4], [1, 4], [2, 4], [3, 4]
    ],
    faces: [
      [0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]
    ]
  };
}

function cylinderModel(radius, height, segments) {
  const vertices = [];
  const edges = [];
  const faces = [];
  const topY = height / 2;
  const botY = -height / 2;

  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    vertices.push([x, topY, z]);
    vertices.push([x, botY, z]);
  }

  for (let i = 0; i < segments; i += 1) {
    const ni = (i + 1) % segments;
    const t0 = i * 2;
    const b0 = i * 2 + 1;
    const t1 = ni * 2;
    const b1 = ni * 2 + 1;
    edges.push([t0, t1], [b0, b1], [t0, b0]);
    faces.push([t0, t1, b1, b0]);
  }

  return { vertices, edges, faces };
}

function coneModel(radius, height, segments) {
  const vertices = [[0, height / 2, 0]];
  const edges = [];
  const faces = [];
  const baseY = -height / 2;

  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    vertices.push([Math.cos(a) * radius, baseY, Math.sin(a) * radius]);
  }

  for (let i = 1; i <= segments; i += 1) {
    const ni = i === segments ? 1 : i + 1;
    edges.push([0, i], [i, ni]);
    faces.push([0, i, ni]);
  }
  return { vertices, edges, faces };
}

function sphereModel(radius, latSeg, lonSeg) {
  const vertices = [];
  const edges = [];
  const faces = [];

  for (let lat = 0; lat <= latSeg; lat += 1) {
    const v = lat / latSeg;
    const phi = v * Math.PI;
    const y = Math.cos(phi) * radius;
    const r = Math.sin(phi) * radius;
    for (let lon = 0; lon < lonSeg; lon += 1) {
      const u = lon / lonSeg;
      const theta = u * Math.PI * 2;
      vertices.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
    }
  }

  const row = lonSeg;
  for (let lat = 0; lat < latSeg; lat += 1) {
    for (let lon = 0; lon < lonSeg; lon += 1) {
      const nextLon = (lon + 1) % lonSeg;
      const a = lat * row + lon;
      const b = lat * row + nextLon;
      const c = (lat + 1) * row + nextLon;
      const d = (lat + 1) * row + lon;
      edges.push([a, b], [a, d]);
      faces.push([a, b, c, d]);
    }
  }
  return { vertices, edges, faces };
}

function prismNet(w, h, d) {
  const gap = Math.max(w, h, d) * 0.45;
  return [
    { closed: rect(0, 0, w, h), open: rect(0, 0, w, h), color: "#a9c3ff" },
    { closed: rect(0, 0, w, h), open: rect(w + gap, 0, d, h), color: "#8fb1ff" },
    { closed: rect(0, 0, w, h), open: rect(w + d + gap * 2, 0, w, h), color: "#a9c3ff" },
    { closed: rect(0, 0, w, h), open: rect(-(d + gap), 0, d, h), color: "#8fb1ff" },
    { closed: rect(0, 0, w, h), open: rect(0, -(d + gap), w, d), color: "#c2d5ff" },
    { closed: rect(0, 0, w, h), open: rect(0, h + gap, w, d), color: "#c2d5ff" }
  ];
}

function triangularPrismNet(edge, triH, len) {
  const gap = Math.max(edge, len) * 0.35;
  const triA = [[0, 0], [edge, 0], [edge / 2, -triH]];
  const triB = [[0, 0], [edge, 0], [edge / 2, triH]];
  const closedRectA = rect(0, 0, edge, len);
  const closedRectB = rect(edge * 0.08, -len * 0.05, edge, len);
  const closedRectC = rect(edge * 0.16, len * 0.05, edge, len);
  const closedTriA = offsetPolygon(triA, -edge * 0.02, 0);
  const closedTriB = offsetPolygon(triB, edge * 1.14, len);
  return [
    { closed: closedRectA, open: rect(0, 0, edge, len), color: "#8fc5ff" },
    { closed: closedRectB, open: rect(edge + gap, 0, edge, len), color: "#a7d4ff" },
    { closed: closedRectC, open: rect((edge * 2) + (gap * 2), 0, edge, len), color: "#8fc5ff" },
    { closed: closedTriA, open: offsetPolygon(triA, 0, -(gap * 0.9)), color: "#d2ecff" },
    { closed: closedTriB, open: offsetPolygon(triB, (edge * 2) + (gap * 2), len + (gap * 0.9)), color: "#d2ecff" }
  ];
}

function squarePyramidNet(base, triH) {
  const gap = base * 0.5;
  const square = rect(0, 0, base, base);
  const topTri = [[0, 0], [base, 0], [base / 2, -triH]];
  const rightTri = [[0, 0], [base, 0], [base / 2, -triH]];
  const bottomTri = [[0, 0], [base, 0], [base / 2, triH]];
  const leftTri = [[0, 0], [base, 0], [base / 2, -triH]];
  const topClosed = [[0, 0], [base, 0], [base / 2, base / 2]];
  const rightClosed = [[base, 0], [base, base], [base / 2, base / 2]];
  const bottomClosed = [[0, base], [base, base], [base / 2, base / 2]];
  const leftClosed = [[0, 0], [0, base], [base / 2, base / 2]];
  return [
    { closed: square, open: square, color: "#ffd084" },
    { closed: topClosed, open: offsetPolygon(topTri, 0, -gap), color: "#ffc06a" },
    { closed: rightClosed, open: rotateAndOffset(rightTri, Math.PI / 2, base + gap, 0), color: "#ffc06a" },
    { closed: bottomClosed, open: offsetPolygon(bottomTri, 0, base + gap), color: "#ffc06a" },
    { closed: leftClosed, open: rotateAndOffset(leftTri, -Math.PI / 2, -gap, base), color: "#ffc06a" }
  ];
}

function circlePolygon(cx, cy, r, steps = 28) {
  const pts = [];
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function sectorPolygon(cx, cy, r, startA, endA, steps = 28) {
  const pts = [[cx, cy]];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const a = startA + (endA - startA) * t;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function cylinderNet(w, h, r) {
  const gap = h * 0.45;
  const closedRect = rect(0, 0, w, h);
  const closedCircle = circlePolygon(w / 2, h / 2, r);
  return [
    { closed: closedRect, open: rect(0, 0, w, h), color: "#a7d4ff" },
    { closed: closedCircle, open: circlePolygon(w * 0.5, -(r + gap * 0.6), r), color: "#d2ecff" },
    { closed: closedCircle, open: circlePolygon(w * 0.5, h + (r + gap * 0.6), r), color: "#d2ecff" }
  ];
}

function coneNet(_baseRadius, sectorRadius, baseCircleR) {
  const gap = sectorRadius * 0.3;
  const sector = sectorPolygon(0, 0, sectorRadius, -Math.PI * 0.62, Math.PI * 0.62, 36);
  const collapsedSector = sectorPolygon(0, -baseCircleR * 0.35, sectorRadius * 0.42, -Math.PI * 0.33, Math.PI * 0.33, 24);
  const closedCircle = circlePolygon(0, 0, baseCircleR, 36);
  return [
    { closed: collapsedSector, open: sector, color: "#ffc06a" },
    { closed: closedCircle, open: circlePolygon(0, sectorRadius + baseCircleR + gap, baseCircleR), color: "#ffd084" }
  ];
}

function sphereNet(width, height) {
  const strips = 6;
  const closedR = Math.min(width, height) * 0.23;
  const openGap = width * 0.18;
  const faces = [];
  for (let i = 0; i < strips; i += 1) {
    const x = (i - (strips - 1) / 2) * openGap;
    const strip = [
      [x - width * 0.08, -height * 0.46],
      [x + width * 0.08, -height * 0.46],
      [x + width * 0.12, 0],
      [x + width * 0.08, height * 0.46],
      [x - width * 0.08, height * 0.46],
      [x - width * 0.12, 0]
    ];
    const closedStrip = strip.map((_, k) => {
      const a = (k / strip.length) * Math.PI * 2;
      return [Math.cos(a) * closedR, Math.sin(a) * closedR];
    });
    faces.push({
      closed: closedStrip,
      open: strip,
      color: i % 2 === 0 ? "#a9c3ff" : "#8fb1ff"
    });
  }
  return faces;
}

function rect(x, y, w, h) {
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

function offsetPolygon(poly, ox, oy) {
  return poly.map(([x, y]) => [x + ox, y + oy]);
}

function rotateAndOffset(poly, rad, ox, oy) {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return poly.map(([x, y]) => [x * c - y * s + ox, x * s + y * c + oy]);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function smoothStep01(t) {
  const k = clamp(t, 0, 1);
  return k * k * (3 - 2 * k);
}

function moveTowards(current, target, speed) {
  if (Math.abs(target - current) <= speed) return target;
  return current + Math.sign(target - current) * speed;
}

function getOpenTargetMax() {
  const faceCount = SHAPES[state.shapeKey].net().length;
  return 1 + Math.max(0, faceCount - 1) * OPEN_STAGGER;
}

function canShowEdges(shape) {
  if (!state.strictMode) return true;
  if (["cylinder", "cone", "sphere"].includes(state.shapeKey)) return false;
  return shape.props.edges > 0;
}

function canShowVertices(shape) {
  if (!state.strictMode) return true;
  if (["cylinder", "sphere"].includes(state.shapeKey)) return false;
  return shape.props.vertices > 0;
}

function setupButtons() {
  shapeButtons.innerHTML = "";
  Object.entries(SHAPES).forEach(([key, data]) => {
    const btn = document.createElement("button");
    btn.className = "shape-btn";
    btn.innerHTML = `${data.name}<small>${data.short}</small>`;
    btn.addEventListener("click", () => {
      state.shapeKey = key;
      state.openTarget = 0;
      state.openValue = 0;
      state.explodeTarget = 0;
      state.explodeValue = 0;
      toggleOpenBtn.textContent = "Açılımı Aç";
      syncActiveButtons();
      updateInfo();
    });
    btn.dataset.key = key;
    shapeButtons.appendChild(btn);
  });
  syncActiveButtons();
}

function syncActiveButtons() {
  shapeButtons.querySelectorAll(".shape-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.key === state.shapeKey);
  });
}

function updateInfo() {
  const shape = SHAPES[state.shapeKey];
  shapeTitle.textContent = shape.name;
  shapeDesc.textContent = shape.desc;
  shapeProps.innerHTML = [
    `<li>Yüzey Sayısı: ${shape.props.faces}</li>`,
    `<li>Ayrıt Sayısı: ${shape.props.edges}</li>`,
    `<li>Köşe Sayısı: ${shape.props.vertices}</li>`
  ].join("");
  if (state.strictMode) {
    shapeNote.textContent = `${shape.name} için matematiksel doğru gösterim açık.`;
  } else {
    shapeNote.textContent = "Serbest görselleştirme açık (ders için Öğretmen Modu önerilir).";
  }
  shapeKidInfo.textContent = shape.kidInfo;
  shapeExamples.innerHTML = shape.examples.map((item) => `<li>${item}</li>`).join("");
  shapeQuestion.textContent = shape.question;
}

function resizeCanvas(canvas) {
  const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = Math.round(canvas.clientWidth * ratio);
  const h = Math.round(canvas.clientHeight * ratio);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { w, h, ratio };
}

function rotatePoint([x, y, z], ax, ay) {
  const cosY = Math.cos(ay);
  const sinY = Math.sin(ay);
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;

  const cosX = Math.cos(ax);
  const sinX = Math.sin(ax);
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;
  return [x1, y2, z2];
}

function projectPoint([x, y, z], w, h, scale) {
  const cam = 7.5;
  const p = cam / (cam - z);
  return [w / 2 + x * scale * p, h / 2 - y * scale * p, z];
}

function drawEllipse(ctx, x, y, rx, ry, fill, stroke) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function projectRotatedPoint(x, y, z, w, h, scale) {
  const rotated = rotatePoint([x, y, z], state.rotX, state.rotY);
  const projected = projectPoint(rotated, w, h, scale);
  return { x: projected[0], y: projected[1], z: projected[2] };
}

function drawPathFromPoints(ctx, points, closePath) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  if (closePath) ctx.closePath();
}

function renderCylinderMain(w, h) {
  const radius = 1.25;
  const halfH = 1.35;
  const scale = Math.min(w, h) * 0.2;
  const seg = 30;
  const top = [];
  const bottom = [];
  const faces = [];

  for (let i = 0; i < seg; i += 1) {
    const a = (i / seg) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    top.push(projectRotatedPoint(x, halfH, z, w, h, scale));
    bottom.push(projectRotatedPoint(x, -halfH, z, w, h, scale));
  }

  for (let i = 0; i < seg; i += 1) {
    const ni = (i + 1) % seg;
    const quad = [top[i], top[ni], bottom[ni], bottom[i]];
    const avgZ = quad.reduce((s, p) => s + p.z, 0) / quad.length;
    faces.push({ quad, avgZ, shade: i / seg });
  }
  const topAvgZ = top.reduce((s, p) => s + p.z, 0) / top.length;
  const bottomAvgZ = bottom.reduce((s, p) => s + p.z, 0) / bottom.length;
  faces.sort((a, b) => a.avgZ - b.avgZ);

  if (showFaces.checked) {
    faces.forEach((f) => {
      const shade = 0.55 + 0.35 * Math.sin(f.shade * Math.PI * 2 + state.rotY);
      mainCtx.fillStyle = `rgba(${Math.round(120 + shade * 50)}, ${Math.round(170 + shade * 40)}, 255, 0.75)`;
      drawPathFromPoints(mainCtx, f.quad, true);
      mainCtx.fill();
    });

    const caps = [
      { pts: top, z: topAvgZ, fill: "#d8ecffdd" },
      { pts: bottom, z: bottomAvgZ, fill: "#b8d8ffdd" }
    ].sort((a, b) => a.z - b.z);
    caps.forEach((cap) => {
      drawPathFromPoints(mainCtx, cap.pts, true);
      mainCtx.fillStyle = cap.fill;
      mainCtx.fill();
    });
  }

  if (showEdges.checked && !state.strictMode) {
    mainCtx.strokeStyle = "#2240b6";
    mainCtx.lineWidth = 1.6;
    drawPathFromPoints(mainCtx, top, true);
    mainCtx.stroke();
    drawPathFromPoints(mainCtx, bottom, true);
    mainCtx.stroke();
  }
}

function renderConeMain(w, h) {
  const radius = 1.35;
  const height = 2.8;
  const scale = Math.min(w, h) * 0.2;
  const seg = 34;
  const apex = projectRotatedPoint(0, height / 2, 0, w, h, scale);
  const base = [];
  const faces = [];

  for (let i = 0; i < seg; i += 1) {
    const a = (i / seg) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const z = Math.sin(a) * radius;
    base.push(projectRotatedPoint(x, -height / 2, z, w, h, scale));
  }

  for (let i = 0; i < seg; i += 1) {
    const ni = (i + 1) % seg;
    const tri = [apex, base[i], base[ni]];
    const avgZ = tri.reduce((s, p) => s + p.z, 0) / tri.length;
    faces.push({ tri, shade: i / seg, avgZ });
  }
  faces.sort((a, b) => a.avgZ - b.avgZ);

  if (showFaces.checked) {
    faces.forEach((f) => {
      const shade = 0.5 + 0.4 * Math.sin(f.shade * Math.PI * 2 + state.rotY * 0.8);
      mainCtx.fillStyle = `rgba(${Math.round(240 + shade * 10)}, ${Math.round(170 + shade * 45)}, ${Math.round(90 + shade * 35)}, 0.78)`;
      drawPathFromPoints(mainCtx, f.tri, true);
      mainCtx.fill();
    });
  }

  if (showEdges.checked && !state.strictMode) {
    mainCtx.strokeStyle = "#2240b6";
    mainCtx.lineWidth = 1.6;
    drawPathFromPoints(mainCtx, base, true);
    mainCtx.stroke();
  }

  if (showVertices.checked) {
    mainCtx.fillStyle = "#ef476f";
    mainCtx.beginPath();
    mainCtx.arc(apex.x, apex.y, 4.6, 0, Math.PI * 2);
    mainCtx.fill();
  }
}

function renderSphereMain(w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.205;

  const hlx = cx + Math.cos(state.rotY + Math.PI) * r * 0.35;
  const hly = cy + Math.sin(state.rotX) * r * 0.25 - r * 0.25;
  if (showFaces.checked) {
    const grad = mainCtx.createRadialGradient(hlx, hly, r * 0.08, cx, cy, r);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.5, "#a9c6ff");
    grad.addColorStop(1, "#6f91df");
    mainCtx.fillStyle = grad;
    mainCtx.beginPath();
    mainCtx.arc(cx, cy, r, 0, Math.PI * 2);
    mainCtx.fill();
  }

  const ring1 = [];
  const ring2 = [];
  const step = 56;
  for (let i = 0; i < step; i += 1) {
    const a = (i / step) * Math.PI * 2;
    ring1.push(projectRotatedPoint(Math.cos(a), 0.28, Math.sin(a), w, h, r));
    ring2.push(projectRotatedPoint(Math.cos(a) * 0.66, Math.sin(a), 0, w, h, r));
  }
  mainCtx.strokeStyle = "#3357c377";
  mainCtx.lineWidth = 1.5;
  drawPathFromPoints(mainCtx, ring1, true);
  mainCtx.stroke();
  drawPathFromPoints(mainCtx, ring2, true);
  mainCtx.stroke();
}

function renderMain() {
  const { w, h } = resizeCanvas(mainCanvas);
  mainCtx.clearRect(0, 0, w, h);

  const shape = SHAPES[state.shapeKey];
  if (state.shapeKey === "cylinder") {
    renderCylinderMain(w, h);
    return;
  }
  if (state.shapeKey === "cone") {
    renderConeMain(w, h);
    return;
  }
  if (state.shapeKey === "sphere") {
    renderSphereMain(w, h);
    return;
  }

  const model = shape.model();
  const explode = state.explodeValue * 0.55;
  const scale = Math.min(w, h) * 0.2;
  const shapeHasEdges = canShowEdges(shape);
  const shapeHasVertices = canShowVertices(shape);

  const facesWithDepth = model.faces.map((face) => {
    const center = face.reduce((acc, idx) => {
      const v = model.vertices[idx];
      acc[0] += v[0];
      acc[1] += v[1];
      acc[2] += v[2];
      return acc;
    }, [0, 0, 0]).map((n) => n / face.length);

    const pushed = center.map((c) => c * explode);

    const pts3d = face.map((idx) => {
      const [x, y, z] = model.vertices[idx];
      return [x + pushed[0], y + pushed[1], z + pushed[2]];
    });

    const rotated = pts3d.map((p) => rotatePoint(p, state.rotX, state.rotY));
    const pts2d = rotated.map((p) => projectPoint(p, w, h, scale));
    const avgZ = rotated.reduce((sum, p) => sum + p[2], 0) / rotated.length;
    return { pts2d, avgZ };
  });

  facesWithDepth.sort((a, b) => a.avgZ - b.avgZ);

  if (showFaces.checked) {
    mainCtx.fillStyle = "#8fb1ff88";
    facesWithDepth.forEach((f) => {
      drawPolygon(mainCtx, f.pts2d.map((p) => [p[0], p[1]]), true, false);
    });
  }

  if (showEdges.checked && shapeHasEdges) {
    mainCtx.lineWidth = 2.2;
    mainCtx.strokeStyle = "#2240b6";
    model.edges.forEach(([a, b]) => {
      const va = rotatePoint(model.vertices[a], state.rotX, state.rotY);
      const vb = rotatePoint(model.vertices[b], state.rotX, state.rotY);
      const pa = projectPoint([
        va[0] * (1 + explode),
        va[1] * (1 + explode),
        va[2] * (1 + explode)
      ], w, h, scale);
      const pb = projectPoint([
        vb[0] * (1 + explode),
        vb[1] * (1 + explode),
        vb[2] * (1 + explode)
      ], w, h, scale);
      mainCtx.beginPath();
      mainCtx.moveTo(pa[0], pa[1]);
      mainCtx.lineTo(pb[0], pb[1]);
      mainCtx.stroke();
    });
  }

  if (showVertices.checked && shapeHasVertices) {
    mainCtx.fillStyle = "#ef476f";
    model.vertices.forEach((v) => {
      const rv = rotatePoint(v, state.rotX, state.rotY);
      const p = projectPoint([
        rv[0] * (1 + explode),
        rv[1] * (1 + explode),
        rv[2] * (1 + explode)
      ], w, h, scale);
      mainCtx.beginPath();
      mainCtx.arc(p[0], p[1], 4.5, 0, Math.PI * 2);
      mainCtx.fill();
    });
  }
}

function drawPolygon(ctx, points, fill, stroke) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function renderNet() {
  const { w, h } = resizeCanvas(netCanvas);
  netCtx.clearRect(0, 0, w, h);
  const shape = SHAPES[state.shapeKey];
  if (state.shapeKey === "sphere") {
    netCtx.fillStyle = "#eef3ff";
    netCtx.fillRect(0, 0, w, h);
    netCtx.fillStyle = "#6f91df";
    netCtx.beginPath();
    netCtx.arc(w / 2, h / 2 - 18, Math.min(w, h) * 0.12, 0, Math.PI * 2);
    netCtx.fill();
    netCtx.fillStyle = "#243782";
    netCtx.font = `${Math.max(16, Math.round(w * 0.027))}px Segoe UI`;
    netCtx.textAlign = "center";
    netCtx.fillText("Kürenin açılım animasyonu yoktur.", w / 2, h / 2 + 24);
    netCtx.fillStyle = "#4e5f9f";
    netCtx.font = `${Math.max(13, Math.round(w * 0.02))}px Segoe UI`;
    netCtx.fillText("Çünkü küre tek, kesintisiz eğri yüzeyden oluşur.", w / 2, h / 2 + 48);
    return;
  }

  const faces = shape.net();
  const t = state.openValue;
  const shapeHasEdges = canShowEdges(shape);
  const shapeHasVertices = canShowVertices(shape);
  const allPts = [];
  const interpolated = faces.map((f, i) => {
    const localRaw = (t - i * OPEN_STAGGER) / OPEN_WINDOW;
    const localT = smoothStep01(localRaw);
    const points = f.closed.map((c, i2) => [
      lerp(c[0], f.open[i2][0], localT),
      lerp(c[1], f.open[i2][1], localT)
    ]);
    allPts.push(...points);
    return { points, color: f.color, localT };
  });

  const xs = allPts.map((p) => p[0]);
  const ys = allPts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const scale = Math.min((w * 0.86) / width, (h * 0.78) / height);
  const offsetX = w / 2 - ((minX + maxX) / 2) * scale;
  const offsetY = h / 2 - ((minY + maxY) / 2) * scale;

  interpolated.forEach((face) => {
    const transformed = face.points.map(([x, y]) => [x * scale + offsetX, y * scale + offsetY]);

    if (showFaces.checked) {
      netCtx.fillStyle = `${face.color}cc`;
      drawPolygon(netCtx, transformed, true, false);
    }
    if (showEdges.checked && shapeHasEdges) {
      netCtx.lineWidth = 2;
      netCtx.strokeStyle = "#2240b6";
      drawPolygon(netCtx, transformed, false, true);
    }
    if (showVertices.checked && shapeHasVertices) {
      netCtx.fillStyle = "#ef476f";
      transformed.forEach(([x, y]) => {
        netCtx.beginPath();
        netCtx.arc(x, y, 3.6, 0, Math.PI * 2);
        netCtx.fill();
      });
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  state.openValue = moveTowards(state.openValue, state.openTarget, OPEN_SPEED);
  state.openValue = clamp(state.openValue, 0, getOpenTargetMax());
  state.explodeValue = lerp(state.explodeValue, state.explodeTarget, EXPLODE_SPEED);
  if (state.autoRotate) state.rotY += 0.01;
  renderMain();
  renderNet();
}

function bindEvents() {
  toggleOpenBtn.addEventListener("click", () => {
    state.openTarget = state.openTarget ? 0 : getOpenTargetMax();
    toggleOpenBtn.textContent = state.openTarget ? "Açılımı Kapat" : "Açılımı Aç";
  });

  toggleRotateBtn.addEventListener("click", () => {
    state.autoRotate = !state.autoRotate;
    toggleRotateBtn.textContent = state.autoRotate ? "Döndürme Dursun" : "Otomatik Döndür";
  });

  toggleExplodeBtn.addEventListener("click", () => {
    state.explodeTarget = state.explodeTarget ? 0 : 1;
    toggleExplodeBtn.textContent = state.explodeTarget ? "Parçaları Birleştir" : "Parçalara Ayır";
  });

  resetBtn.addEventListener("click", () => {
    state.rotX = -0.6;
    state.rotY = 0.8;
    state.autoRotate = false;
    state.explodeTarget = 0;
    state.openTarget = 0;
    toggleRotateBtn.textContent = "Otomatik Döndür";
    toggleExplodeBtn.textContent = "Parçalara Ayır";
    toggleOpenBtn.textContent = "Açılımı Aç";
  });

  [showFaces, showEdges, showVertices, strictMode].forEach((el) => {
    el.addEventListener("change", () => {
      state.strictMode = strictMode.checked;
      updateInfo();
      renderMain();
      renderNet();
    });
  });

  const startDrag = (x, y) => {
    state.drag = { x, y, rotX: state.rotX, rotY: state.rotY };
  };
  const moveDrag = (x, y) => {
    if (!state.drag) return;
    const dx = (x - state.drag.x) * 0.01;
    const dy = (y - state.drag.y) * 0.01;
    state.rotY = state.drag.rotY + dx;
    state.rotX = Math.max(-1.5, Math.min(1.5, state.drag.rotX + dy));
  };
  const endDrag = () => {
    state.drag = null;
  };

  mainCanvas.addEventListener("pointerdown", (e) => {
    mainCanvas.setPointerCapture(e.pointerId);
    startDrag(e.clientX, e.clientY);
  });
  mainCanvas.addEventListener("pointermove", (e) => moveDrag(e.clientX, e.clientY));
  mainCanvas.addEventListener("pointerup", endDrag);
  mainCanvas.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", () => {
    renderMain();
    renderNet();
  });
}

setupButtons();
state.strictMode = strictMode.checked;
updateInfo();
bindEvents();
animate();
