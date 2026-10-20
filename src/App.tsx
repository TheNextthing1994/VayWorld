import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Terminal, Plus, CheckCircle2, Circle, Target, Briefcase, Newspaper, MessageSquare, Send, Zap, Info, ChevronRight, ChevronDown, LayoutDashboard, Brain, Compass, Users, Sun, Moon, Hammer, Sparkles, Sword, Flame, Wind, Lock, Unlock, Zap as Lightning, X, CornerRightUp, ZoomIn, ZoomOut, Eye, EyeOff, Hourglass
} from 'lucide-react';
import { GameSave, PlayerStats, Task, Project, Officer, Room, WORLD, COLORS, IdeaPillar, LootCore, Skill, DecorativeLandscapeElement } from './types';
import { chatWithOfficer, refineIdea, judgeIdea, IdeaScore } from './services/geminiService';
import BueroSzene from './components/BueroSzene';
import UplinkOverview from './components/UplinkOverview';
import { DesktopDashboard, BoardMode } from './components/DesktopDashboard';

const SAVE_KEY = 'konferenz_hub_v1';
const ROOMS: Room[] = [
  { id: 'ops', name: 'ZENTRALE', x: 20, y: 20, w: 432, h: 432, color: '#f1f5f9' },
  { id: 'strat', name: 'STRATEGIE', x: 480, y: 80, w: 240, h: 240, color: '#f0f9ff' },
  { id: 'intel', name: 'AUFKLÄRUNG', x: 80, y: 480, w: 240, h: 240, color: '#fdf4ff' },
  { id: 'core', name: 'KREATION', x: 480, y: 480, w: 240, h: 240, color: '#fffbeb' },
];
const OFFICERS: Officer[] = [
  { id: 'ops', name: 'Zentrale-Agent', role: 'Zentrale', description: 'Taktische Ausführung & Workflow-Automation.', room: 'ops', x: 236, y: 236, color: '#3b82f6', prompt: 'Du bist der Zentrale-Agent. Fokussiert auf Workflow-Automatisierung und taktische Ausführung.' },
  { id: 'strat', name: 'Strategie-Agent', role: 'Strategie', description: 'Roadmap, OKRs, Marktanalyse.', room: 'strat', x: 600, y: 200, color: '#a855f7', prompt: 'Du bist der Strategie-Agent. Dein Fokus liegt auf Roadmaps, OKRs und Marktanalyse.' },
  { id: 'intel', name: 'Aufklärungs-Agent', role: 'Aufklärung', description: 'Trend-Scout & Wettbewerbsanalyse.', room: 'intel', x: 200, y: 600, color: '#06b6d4', prompt: 'Du bist der Aufklärungs-Agent. Du informierst über Trends und Wettbewerbsanalysen.' },
  { id: 'core', name: 'Kreations-Agent', role: 'Kreation', description: 'Bildgenerierung & Asset-Erstellung.', room: 'core', x: 600, y: 600, color: '#eab308', prompt: 'Du bist der Kreations-Agent. Spezialist für Bildgenerierung und Asset-Erstellung.' }
];

const isInsideGarden = (x: number, y: number) => {
  // Garden A: x in [-700, -150], y in [50, 750]
  if (x >= -705 && x <= -145 && y >= 45 && y <= 755) return true;
  // Garden B (Aligned along fence): x in [-5, 805], y in [-955, -15]
  if (x >= -5 && x <= 805 && y >= -955 && y <= -15) return true;
  // Garden C: x in [945, 1555], y in [45, 755]
  if (x >= 945 && x <= 1555 && y >= 45 && y <= 755) return true;
  return false;
};

const IDEA_ENGINE = {
  audiences: [
    "Lokale Handwerker", "Remote Software-Teams", "E-Sport-Athleten", "Biohacking-Enthusiasten", 
    "Solo-Founders", "Tiny House-Besitzer", "Senioren in Wohngemeinschaften", "Vegane Sportler",
    "Independent Game Devs", "Minimalistische Reisende", "E-Learning Plattformen", "Krypto-Anleger",
    "Urban Gardeners", "Pet Tech Owner", "Nachhaltige Mode-Labels", "Mental Health Coaches",
    "Retro-Gaming Communities", "Smart-Home Automatisierer", "Boutique-Hotels", "Food-Truck-Besitzer"
  ],
  problems: [
    "Ineffiziente Terminplanung", "Mangelnde Datentransparenz", "Hohe Energiekosten", 
    "Fragmentierter Workflow", "Fehlende Community-Anbindung", "Komplexe Compliance-Hürden",
    "Mentaler Burnout", "Rohstoffversand-Verzögerungen", "Veraltete Legacy-Software",
    "Mangelndes Kundenfeedback-Loop", "Überwältigende Content-Erstellung", "Sicherheitslücken in IoT-Geräten",
    "Unorganisiertes Wissensmanagement", "Hohe Kundenfluktuation (Churn)", "Ineffektive Lead-Generierung"
  ],
  solutions: [
    "KI-gestütztes Dashboard", "Automatisierte Supply-Chain", "Peer-to-Peer Marktplatz",
    "Hyper-lokale Logistik-Lösung", "Nischen-SaaS Cloud-Dienst", "White-Label Whitepapers",
    "Echtzeit-Analyse-Tool", "Low-Code Automatisierung", "Dezentrales Validierungs-Netzwerk",
    "Gamifizierte Lern-App", "Predicitive Maintenance Sensorik", "Bio-Feedback Integration",
    "Community-Driven Wiki", "Virtueller VIP-Concierge-Dienst", "Smart-Contract Escrow-Service"
  ],
  methods: [
    "Deep-Arbitrage", "API-Integration", "SaaS-Abonnement", "Pay-per-Use Modell",
    "Freemium-Scale-Up", "Hebel-Strategie", "Open-Source Monetarisierung", "Direct-to-Consumer",
    "Drop-Servicing", "Micro-SaaS Injektion", "B2B-Partnerschaft", "Productized Service"
  ],
  colors: ["#3b82f6", "#a855f7", "#06b6d4", "#22c55e", "#f59e0b", "#f43f5e", "#ffffff", "#ec4899", "#8b5cf6"]
};

function generateIdeakern(): Partial<LootCore> {
  const audience = IDEA_ENGINE.audiences[Math.floor(Math.random() * IDEA_ENGINE.audiences.length)];
  const problem = IDEA_ENGINE.problems[Math.floor(Math.random() * IDEA_ENGINE.problems.length)];
  const solution = IDEA_ENGINE.solutions[Math.floor(Math.random() * IDEA_ENGINE.solutions.length)];
  const method = IDEA_ENGINE.methods[Math.floor(Math.random() * IDEA_ENGINE.methods.length)];
  
  const title = `${solution} für ${audience}`;
  const description = `${method}: Löst ${problem} durch ein ${solution}.`;
  const serendipity = 0.4 + Math.random() * 0.6; // High base serendipity
  const strength = 0.5 + Math.random() * 1.5;
  const color = IDEA_ENGINE.colors[Math.floor(Math.random() * IDEA_ENGINE.colors.length)];

  return { title, description, serendipity, strength, color };
}

const SKILL_TREE: Skill[] = [
  { id: 'bash', name: 'Hammer-Meister', description: 'Schnelleres Abbauen von Ideensäulen.', cost: 1, unlocked: false, parents: [], icon: 'Hammer' },
  { id: 'speed', name: 'Schnelle Füße', description: 'Erhöht die Bewegungsgeschwindigkeit um 15%.', cost: 1, unlocked: false, parents: [], icon: 'Wind' },
  { id: 'flow', name: 'Flow-Zustand', description: 'Erhöht die Fokuskapazität auf 4 gleichzeitige Projekte.', cost: 1, unlocked: false, parents: [], icon: 'Brain' },
  { id: 'storage', name: 'Neuronaler Link', description: 'Erlaubt das Tragen von zwei Beutestücken gleichzeitig.', cost: 2, unlocked: false, parents: ['bash'], icon: 'Zap' },
  { id: 'vision', name: 'Adlerauge', description: 'Zeigt alle Säulen auf der Minimap an.', cost: 2, unlocked: false, parents: ['speed'], icon: 'Compass' },
  { id: 'twin', name: 'Digitaler Zwilling', description: 'KI-Assistent übernimmt Logik. Kapazität steigt auf 6.', cost: 3, unlocked: false, parents: ['flow'], icon: 'Users' },
  { id: 'alpha', name: 'Alpha-Arbitrage', description: 'Ideensäulen lassen zwei Kerne fallen.', cost: 3, unlocked: false, parents: ['storage'], icon: 'Sparkles' },
  { id: 'zen', name: 'Zen-Geist', description: 'Regeneriert TP langsam über Zeit.', cost: 3, unlocked: false, parents: ['vision'], icon: 'Shield' },
  { id: 'overclock', name: 'Neuronale Übertaktung', description: 'Maximale mentale Bandbreite. Kapazität steigt auf 10.', cost: 5, unlocked: false, parents: ['twin'], icon: 'Lightning' },
];

// Retro Sci-Fi Synthesizer Engine using Web Audio API
const playSynthSound = (type: 'collect' | 'upload' | 'levelUp' | 'click' | 'unlock') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'collect') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.1, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.12);
      });
    } else if (type === 'upload') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'unlock') {
      [523.25, 659.25].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.setValueAtTime(freq * 1.5, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } else if (type === 'levelUp') {
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = idx * 0.04;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 2, now + delay + 0.4);
        gain.gain.setValueAtTime(0.07, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.65);
      });
    }
  } catch (err) {
    console.error("Audio synth error:", err);
  }
};

// --- Isometric A* Pathfinding and Dynamic AI Engine ---
const PATH_COLS = 20;
const PATH_ROWS = 20;
const PATH_CELL_SIZE = 40;

interface PathNode {
  col: number;
  row: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export const isCellBlockedInGrid = (col: number, row: number): boolean => {
  if (col < 0 || col >= PATH_COLS || row < 0 || row >= PATH_ROWS) return true;
  
  const cx = col * PATH_CELL_SIZE + PATH_CELL_SIZE / 2;
  const cy = row * PATH_CELL_SIZE + PATH_CELL_SIZE / 2;
  
  // Portals or Doorway coordinates
  if (col === 7 && (row === 4 || row === 5)) return false;
  if (col === 12 && (row === 4 || row === 5)) return false;
  if (col === 7 && (row === 14 || row === 15)) return false;
  if (col === 12 && (row === 14 || row === 15)) return false;
  
  // Solid boundaries for the interior offices
  if (cx >= 80 && cx <= 320 && cy >= 80 && cy <= 320) return true;
  if (cx >= 480 && cx <= 720 && cy >= 80 && cy <= 320) return true;
  if (cx >= 80 && cx <= 320 && cy >= 480 && cy <= 720) return true;
  if (cx >= 480 && cx <= 720 && cy >= 480 && cy <= 720) return true;
  
  return false;
};

export const findAStarPath = (startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] => {
  const startCol = Math.max(0, Math.min(PATH_COLS - 1, Math.floor(startX / PATH_CELL_SIZE)));
  const startRow = Math.max(0, Math.min(PATH_ROWS - 1, Math.floor(startY / PATH_CELL_SIZE)));
  const endCol = Math.max(0, Math.min(PATH_COLS - 1, Math.floor(endX / PATH_CELL_SIZE)));
  const endRow = Math.max(0, Math.min(PATH_ROWS - 1, Math.floor(endY / PATH_CELL_SIZE)));

  if (startCol === endCol && startRow === endRow) {
    return [{ x: endX, y: endY }];
  }

  const openList: PathNode[] = [];
  const closedSet = new Set<string>();

  openList.push({
    col: startCol,
    row: startRow,
    g: 0,
    h: Math.abs(endCol - startCol) + Math.abs(endRow - startRow),
    f: Math.abs(endCol - startCol) + Math.abs(endRow - startRow),
    parent: null,
  });

  let iterations = 0;
  while (openList.length > 0 && iterations++ < 120) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;
    
    if (current.col === endCol && current.row === endRow) {
      const path: { x: number; y: number }[] = [];
      let temp: PathNode | null = current;
      while (temp !== null) {
        path.push({
          x: temp.col * PATH_CELL_SIZE + PATH_CELL_SIZE / 2,
          y: temp.row * PATH_CELL_SIZE + PATH_CELL_SIZE / 2,
        });
        temp = temp.parent;
      }
      path.reverse();
      if (path.length > 0) {
        path[path.length - 1] = { x: endX, y: endY };
      }
      return path;
    }

    const key = `${current.col},${current.row}`;
    closedSet.add(key);

    const directions = [
      { dc: 0, dr: -1, cost: 1 },
      { dc: 0, dr: 1, cost: 1 },
      { dc: -1, dr: 0, cost: 1 },
      { dc: 1, dr: 0, cost: 1 },
      { dc: -1, dr: -1, cost: 1.4 },
      { dc: 1, dr: -1, cost: 1.4 },
      { dc: -1, dr: 1, cost: 1.4 },
      { dc: 1, dr: 1, cost: 1.4 },
    ];

    for (const dir of directions) {
      const nc = current.col + dir.dc;
      const nr = current.row + dir.dr;

      if (nc < 0 || nc >= PATH_COLS || nr < 0 || nr >= PATH_ROWS) continue;
      if (closedSet.has(`${nc},${nr}`)) continue;
      if (isCellBlockedInGrid(nc, nr)) continue;

      const gScore = current.g + dir.cost;
      const hScore = Math.abs(endCol - nc) + Math.abs(endRow - nr);
      const fScore = gScore + hScore;

      const existingInOpen = openList.find(n => n.col === nc && n.row === nr);
      if (existingInOpen) {
        if (gScore < existingInOpen.g) {
          existingInOpen.g = gScore;
          existingInOpen.f = fScore;
          existingInOpen.parent = current;
        }
      } else {
        openList.push({
          col: nc,
          row: nr,
          g: gScore,
          h: hScore,
          f: fScore,
          parent: current,
        });
      }
    }
  }

  return [{ x: endX, y: endY }];
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [save, setSave] = useState<GameSave>(() => {
    const s = localStorage.getItem(SAVE_KEY);
    return s ? {
      ...JSON.parse(s),
      skillPoints: JSON.parse(s).skillPoints ?? 5,
      unlockedSkills: JSON.parse(s).unlockedSkills ?? [],
      isDayMode: JSON.parse(s).isDayMode ?? true
    } : { day: 1, xp: 0, level: 1, honor: 100, corruption: 0, tasks: [], projects: [], activeTaskId: null, skillPoints: 5, unlockedSkills: [], isDayMode: true };
  });
  const [player, setPlayer] = useState<PlayerStats>({ x: 400, y: 400, r: 15, hp: 100, maxHp: 100, spd: 350 });
  
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [lastLoot, setLastLoot] = useState<LootCore | null>(null);
  
  const projectCapacity = useMemo(() => {
    let capacity = 3;
    if (save.unlockedSkills.includes('flow')) capacity += 1;
    if (save.unlockedSkills.includes('twin')) capacity += 2;
    if (save.unlockedSkills.includes('overclock')) capacity += 4;
    return capacity;
  }, [save.unlockedSkills]);

  const [capacityError, setCapacityError] = useState(false);
  
  const [pillars, setPillars] = useState<IdeaPillar[]>(() => {
    const list: IdeaPillar[] = [];
    const minDistance = 850; // Spacious distance between key towers and landmarks
    const maxAttempts = 1000;
    let attempts = 0;
    const desiredPillarsCount = 8; // Exactly 8 towers across the outer world is a very balanced, reasonable amount
    
    while (list.length < desiredPillarsCount && attempts < maxAttempts) {
      attempts++;
      const px = (Math.random() - 0.5) * 3600 + WORLD.w/2;
      const py = (Math.random() - 0.5) * 3600 + WORLD.h/2;
      
      // Must be outside the immediate center hub area
      if (px >= -200 && px <= WORLD.w + 200 && py >= -200 && py <= WORLD.h + 200) {
        continue;
      }
      if (isInsideGarden(px, py)) {
        continue;
      }
      
      // Must not be too close to any already placed towers to guard against ugly overlapping
      const tooClose = list.some(p => Math.hypot(p.x - px, p.y - py) < minDistance);
      if (tooClose) {
        continue;
      }
      
      const types: ('arbitrage' | 'pod' | 'saas')[] = ['arbitrage', 'pod', 'saas'];
      const assignedType = types[list.length % types.length];
      
      list.push({
        id: `pillar-${list.length}`,
        x: px,
        y: py,
        stability: 100,
        maxStability: 100,
        type: assignedType
      });
    }
    
    // Fallback if tight spacing couldn't be met
    if (list.length < desiredPillarsCount) {
      while (list.length < desiredPillarsCount) {
        const px = (Math.random() - 0.5) * 3600 + WORLD.w/2;
        const py = (Math.random() - 0.5) * 3600 + WORLD.h/2;
        if (!(px >= -200 && px <= WORLD.w + 200 && py >= -200 && py <= WORLD.h + 200) && !isInsideGarden(px, py)) {
          const types: ('arbitrage' | 'pod' | 'saas')[] = ['arbitrage', 'pod', 'saas'];
          const assignedType = types[list.length % types.length];
          list.push({
            id: `pillar-${list.length}`,
            x: px,
            y: py,
            stability: 100,
            maxStability: 100,
            type: assignedType
          });
        }
      }
    }
    
    return list;
  });

  const allPillars = useMemo<IdeaPillar[]>(() => {
    const custom: IdeaPillar[] = save.projects
      .filter((p: Project) => p.refinedData && p.pillarX !== undefined && p.pillarY !== undefined)
      .map((p: Project) => ({
        id: `custom-pillar-${p.id}`,
        x: p.pillarX!,
        y: p.pillarY!,
        stability: 100,
        maxStability: 100,
        type: 'saas',
        isCustomBusinessIdea: true,
        customTitle: p.refinedData?.titel || p.name,
        customIdea: p
      } as IdeaPillar));
    
    // Filter out any pillars (including custom ones) that fall within the central office compound or any garden section
    const margin = 20;
    const filtered = [...pillars, ...custom].filter(p => {
      const insideOffice = p.x >= -margin && p.x <= WORLD.w + margin && p.y >= -margin && p.y <= WORLD.h + margin;
      const insideGarden = isInsideGarden(p.x, p.y);
      return !insideOffice && !insideGarden;
    });

    return filtered;
  }, [pillars, save.projects]);

  const getGardenTreeCoords = (i: number, gardenName: 'A' | 'B' | 'C') => {
    if (gardenName === 'A') {
      const row = Math.floor(i / 3);
      const col = i % 3;
      return {
        x: -280 - (row * 130),
        y: 100 + (col * 150)
      };
    } else if (gardenName === 'B') {
      const row = Math.floor(i / 3);
      const col = i % 3;
      return {
        x: 100 + (col * 290),
        y: -120 - (row * 330)
      };
    } else { // 'C'
      const row = Math.floor(i / 3);
      const col = i % 3;
      return {
        x: 920 + (row * 130),
        y: 100 + (col * 150)
      };
    }
  };

  const getGardenTrees = useCallback(() => {
    return save.projects.map((p) => {
      let garden: 'A' | 'B' | 'C' = 'A';
      if (p.progress >= 30 && p.progress < 100) garden = 'B';
      else if (p.progress === 100) garden = 'C';
      
      const group = save.projects.filter(proj => {
        if (garden === 'A') return proj.progress < 30;
        if (garden === 'B') return proj.progress >= 30 && proj.progress < 100;
        return proj.progress === 100;
      });
      const groupIdx = group.findIndex(proj => proj.id === p.id);
      const coords = getGardenTreeCoords(groupIdx >= 0 ? groupIdx : 0, garden);
      return {
        project: p,
        x: coords.x,
        y: coords.y,
        garden,
        progress: p.progress,
        label: p.refinedData?.titel || p.name
      };
    });
  }, [save.projects]);
  
  const [loots, setLoots] = useState<LootCore[]>([]);
  const [carriedLoot, setCarriedLoot] = useState<LootCore | null>(null);
  const [activeIdeaDetail, setActiveIdeaDetail] = useState<(LootCore & { projectId?: string }) | null>(null);
  const [selectedIdeationMode, setSelectedIdeationMode] = useState<string>("Gap Attack");
  const [refinementLoading, setRefinementLoading] = useState<boolean>(false);
  const [refinementError, setRefinementError] = useState<string | null>(null);
  const [recentTitles, setRecentTitles] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showUplinkOverview, setShowUplinkOverview] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<BoardMode>('PINNWAND');
  const [zoom, setZoom] = useState(1.0);
  const [hasCameraOffset, setHasCameraOffset] = useState(false);
  const [showDashboards, setShowDashboards] = useState(true);
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [tutorialStep, setTutorialStep] = React.useState(0);
  const [resourcesCollapsed, setResourcesCollapsed] = useState(false);

  const handleRefining = async () => {
    if (!activeIdeaDetail || !activeIdeaDetail.projectId) return;
    setRefinementLoading(true);
    setRefinementError(null);
    playSynthSound('collect');

    const getValidPillarCoords = (p: Project) => {
      if (p.pillarX !== undefined && p.pillarY !== undefined) {
        return { x: p.pillarX, y: p.pillarY };
      }
      const currentX = playerPosRef.current?.x ?? 400;
      const currentY = playerPosRef.current?.y ?? 400;
      for (let att = 0; att < 200; att++) {
        const tx = currentX + (Math.random() > 0.5 ? 240 : -240) + (Math.random() - 0.5) * 120;
        const ty = currentY + (Math.random() > 0.5 ? 240 : -240) + (Math.random() - 0.5) * 120;
        const insideOffice = tx >= -50 && tx <= WORLD.w + 50 && ty >= -50 && ty <= WORLD.h + 50;
        if (!insideOffice && !isInsideGarden(tx, ty)) {
          return { x: tx, y: ty };
        }
      }
      return { x: 1300, y: -450 };
    };

    try {
      const refined = await refineIdea(activeIdeaDetail.title, activeIdeaDetail.description || "", selectedIdeationMode);
      // Stufe 3 + Diversitaets-Waechter: bewerten und Titel merken
      const score = await judgeIdea(refined, recentTitles);
      setRecentTitles(prev => [...prev, (refined && (refined as any).titel) || ""].filter(Boolean).slice(-12));
      
      setSave(s => ({
        ...s,
        projects: s.projects.map(p => {
          if (p.id === activeIdeaDetail.projectId) {
            const coords = getValidPillarCoords(p);
            return {
              ...p,
              ideaScore: score,
              refinedData: refined,
              ideationMode: selectedIdeationMode,
              pillarX: coords.x,
              pillarY: coords.y,
              isImportantIdea: true
            };
          }
          return p;
        })
      }));
      playSynthSound('unlock');
    } catch (err: any) {
      console.error("Gemini refinement failed, applying elegant local fallback:", err);
      // Construct a high-quality human-readable fallback structured in matching format
      const fallbackRefined = {
        titel: `${activeIdeaDetail.title} [SYNTHESE FALLBACK]`,
        kundenproblem: `Die Zielgruppe kämpft mit Ineffizienzen bezüglich ${activeIdeaDetail.description?.split('löst')[1] || "Schnittstellen und fragmentierten Prozessen"}.`,
        loesung: `Aufbau einer robusten, automatisierten Schnittstelle, die das analysierte Problem direkt und ohne Reibung digitalisiert.`,
        zielgruppen_nische: `Early Adopter, die unmittelbar von der Effizienzsteigerung profitieren.`,
        monetarisierung: `Marge aus der Arbitrage-Differenz oder monatliche transaktionszentrierte Lizenzgebühr.`,
        erster_validierungsschritt: `Aufsetzen einer Landingpage mit einem "Request Access"-Button und Führen von 5 structured Nutzerinterviews.`,
        unfair_advantage: `Exklusiver und direkter Zugriff auf vordefinierte, hoch-skalierbare Integrationsmuster.`
      };

      setRefinementError("Synthese-Dienst offline / Kontingent erschöpft. Lokales Ersatz-Modell erzwungen.");

      setSave(s => ({
        ...s,
        projects: s.projects.map(p => {
          if (p.id === activeIdeaDetail.projectId) {
            const coords = getValidPillarCoords(p);
            return {
              ...p,
              refinedData: fallbackRefined,
              ideationMode: selectedIdeationMode,
              pillarX: coords.x,
              pillarY: coords.y,
              isImportantIdea: true
            };
          }
          return p;
        })
      }));
      playSynthSound('unlock');
    } finally {
      setRefinementLoading(false);
    }
  };

  const introStars = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => ({
      left: `${(Math.sin(i * 9128 + 1) * 0.5 + 0.5) * 100}%`,
      top: `${(Math.cos(i * 3242 + 2) * 0.5 + 0.5) * 100}%`,
      size: (i % 4 === 0) ? 2.5 : ((i % 3 === 0) ? 1.8 : 1.0),
      delay: `${(i % 5) * 1.5}s`,
      duration: `${3 + (i % 3) * 2}s`,
    }));
  }, []);

  // Dynamic stateful officers for A* pathfinding and live interactive simulation behaviors
  const [dynamicOfficers, setDynamicOfficers] = useState(() => {
    return OFFICERS.map(o => ({
      ...o,
      targetX: o.x,
      targetY: o.y,
      path: [] as { x: number; y: number }[],
      state: 'idle' as 'idle' | 'patrolling' | 'watching' | 'following',
      timer: Math.random() * 2 + 1,
      isMoving: false,
    }));
  });
  const officersRef = useRef(dynamicOfficers);
  useEffect(() => { officersRef.current = dynamicOfficers; }, [dynamicOfficers]);

  const [decorElements] = useState<DecorativeLandscapeElement[]>(() => {
    const list: DecorativeLandscapeElement[] = [];
    const types: ('crystal' | 'circuit' | 'monolith' | 'shrub')[] = ['crystal', 'circuit', 'monolith', 'shrub'];
    const colors = ['#10b981', '#34d399', '#06b6d4', '#60a5fa', '#a855f7']; // Sci-fi colors: emerald, mint, cyan, blue, purple
    
    // Generate scattered atmospheric elements across the outer grid
    for (let i = 0; i < 95; i++) {
      const px = (Math.random() - 0.5) * 4400 + WORLD.w/2;
      const py = (Math.random() - 0.5) * 4400 + WORLD.h/2;
      
      // Keep main campus center clear and clean to avoid overlaps
      if (px >= -220 && px <= WORLD.w + 220 && py >= -220 && py <= WORLD.h + 220) {
        continue;
      }
      if (isInsideGarden(px, py)) {
        continue;
      }
      
      const type = types[Math.floor(Math.random() * types.length)];
      list.push({
        id: `decor-${i}`,
        x: px,
        y: py,
        type,
        size: 14 + Math.random() * 22,
        height: type === 'monolith' ? 35 + Math.random() * 45 : (type === 'crystal' ? 18 + Math.random() * 18 : 0),
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
    return list;
  });
  const lootsRef = useRef<LootCore[]>([]);
  const frameCountRef = useRef(0);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const t = localStorage.getItem('sirat_theme');
    return (t as 'dark' | 'light') || 'dark';
  });
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);

  // German Translation for UI
  const t = {
    play: "SPIELEN",
    intro: "Einleitung:",
    level: "STUFE",
    day: "OPERATIONSTAG",
    clearance: "SYSTEM-FREIGABESTUFE",
    dashboard: "ÜBERSICHT",
    tasks: "AUFGABEN",
    projects: "PROJEKTE",
    inventory: "ZENTRALE",
    skills: "SKILLS",
    map: "KARTE",
    settings: "EINSTELLUNGEN",
    operationalStatus: "BETRIEBSBEREIT",
    connection: "VERBINDUNG STABIL",
    activeProject: "AKTIVES PROJEKT",
    noTasks: "KEINE AKTIVEN AUFGABEN",
    start: "Simulation starten",
  };

  useEffect(() => {
    localStorage.setItem('sirat_theme', theme);
  }, [theme]);
  const playerPosRef = useRef(player);
  useEffect(() => { playerPosRef.current = player; }, [player]);

  const cameraOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const [activeOfficer, setActiveOfficer] = useState<Officer | null>(null);
  const [chatInp, setChatInp] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const keysRef = useRef<Record<string, boolean>>({});
  const lastTimeRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  const [showLevelUpOverlay, setShowLevelUpOverlay] = useState(false);

  // Level up detection and sound/chime triggers
  useEffect(() => {
    const xpNeeded = save.level * 800;
    if (save.xp >= xpNeeded) {
      setSave(prev => ({
        ...prev,
        level: prev.level + 1,
        skillPoints: prev.skillPoints + 4, // 4 skill points awarded upon level-up!
        xp: prev.xp - xpNeeded
      }));
      playSynthSound('levelUp');
      setShowLevelUpOverlay(true);
    }
  }, [save.xp, save.level]);

  useEffect(() => localStorage.setItem(SAVE_KEY, JSON.stringify(save)), [save]);

  const update = useCallback((dt: number) => {
    if (showIntro) return;
    if (activeOfficer) return;
    if (activeRoomId) return;
    let mx = 0, my = 0;
    const keys = keysRef.current;
    if (keys['w'] || keys['arrowup']) { mx -= 1; my -= 1; }
    if (keys['s'] || keys['arrowdown']) { mx += 1; my += 1; }
    if (keys['a'] || keys['arrowleft']) { mx -= 1; my += 1; }
    if (keys['d'] || keys['arrowright']) { mx += 1; my -= 1; }
    
    // Simulation for loots with advanced spatial positioning, non-overlapping physics & circular orbit around the central tower
    setLoots(prev => {
      // 1. Move loots using their current velocities and apply friction
      const updated = prev.map(l => ({
        ...l,
        x: l.x + l.vx * dt * 60,
        y: l.y + l.vy * dt * 60,
        vx: l.vx * 0.95,
        vy: l.vy * 0.95,
      }));

      const tx = 400; // Central tower X
      const ty = 950; // Central tower Y/Garden Ideen-Lebensbaum outside south gate

      // We run multiple physics relaxation passes to make sorting extremely stable and prevent overlaps
      const PASSES = 3;
      for (let pass = 0; pass < PASSES; pass++) {
        // A. Handle Central Tower collision and perfect visibility ring distribution if near center
        updated.forEach(l => {
          const dx = l.x - tx;
          const dy = l.y - ty;
          const dist = Math.hypot(dx, dy);

          // If close to the Neural Uplink Tower/Trees base
          if (dist < 220) {
            // Settle in a beautiful visible circle between 135 and 175 world units
            const targetMinRadius = 135;
            const targetMaxRadius = 175;

            if (dist < targetMinRadius) {
              const pushForce = targetMinRadius - dist;
              l.x += (dx / (dist || 1)) * pushForce * 0.8;
              l.y += (dy / (dist || 1)) * pushForce * 0.8;
            } else if (dist > targetMaxRadius) {
              const pullForce = dist - targetMaxRadius;
              l.x -= (dx / (dist || 1)) * pullForce * 0.2;
              l.y -= (dy / (dist || 1)) * pullForce * 0.2;
            }

            // B. Avoid the "behind-tower" shadow where the tall model hides the ring
            // In isometric space, the rear/north of the tower (y < ty - 20) is obscured.
            // Using atan2 to detect rear sector angles (roughly between -2.6 and -0.5 radians)
            const angle = Math.atan2(l.y - ty, l.x - tx);
            if (angle > -Math.PI * 0.8 && angle < -Math.PI * 0.2) {
              // Gently rotate the idea position to the visible sides (West/East)
              const shiftDir = angle < -Math.PI * 0.5 ? -0.06 : 0.06;
              const newAngle = angle + shiftDir;
              const currentR = Math.max(targetMinRadius, Math.min(targetMaxRadius, dist));
              l.x = tx + Math.cos(newAngle) * currentR;
              l.y = ty + Math.sin(newAngle) * currentR;
            }
          }
        });

        // C. Mutual Repulsion (Separation) between individual idea rings so they never stack on top of each other
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const dx = updated[i].x - updated[j].x;
            const dy = updated[i].y - updated[j].y;
            const dist = Math.hypot(dx, dy);
            // Minimum distance to prevent overlapping/touching (about 44 units)
            const minAllowedDist = 44 * (updated[i].strength + updated[j].strength) * 0.5;
            
            if (dist < minAllowedDist) {
              const overlap = minAllowedDist - dist;
              const pushX = (dx / (dist || 1)) * overlap * 0.5;
              const pushY = (dy / (dist || 1)) * overlap * 0.5;

              updated[i].x += pushX;
              updated[i].y += pushY;
              updated[j].x -= pushX;
              updated[j].y -= pushY;

              // Dampen velocities in the push direction to stop infinite jittering
              updated[i].vx += pushX * 0.05;
              updated[i].vy += pushY * 0.05;
              updated[j].vx -= pushX * 0.05;
              updated[j].vy -= pushY * 0.05;
            }
          }
        }
      }

      lootsRef.current = updated;
      return updated;
    });

    // -------------------------------------------------------------------------
    // CORE DEEP WORK FOCUS & TELEMETRY SIMULATION
    // -------------------------------------------------------------------------
    const isPlayerMoving = mx !== 0 || my !== 0;
    const centerDist = Math.hypot(playerPosRef.current.x - 400, playerPosRef.current.y - 950);
    const inNeuralUplink = centerDist < 120;

    setPlayer(p => {
      let nextHp = p.hp;
      if (isPlayerMoving) {
        // Moving consumes deep work focus. If zen skill is unlocked, drain is 35% slower!
        const drainMultiplier = save.unlockedSkills.includes('zen') ? 0.65 : 1.0;
        nextHp = Math.max(10, p.hp - dt * 2.5 * drainMultiplier);
      } else if (inNeuralUplink) {
        // Uplink station replenishes focus rapidly
        nextHp = Math.min(p.maxHp, p.hp + dt * 14.0);
      } else {
        // Idle elsewhere regenerates focus moderately
        const regenMultiplier = save.unlockedSkills.includes('zen') ? 1.5 : 1.0;
        nextHp = Math.min(p.maxHp, p.hp + dt * 4.5 * regenMultiplier);
      }
      return { ...p, hp: nextHp };
    });

    // Frame-throttled telemetry calculation to simulate real productivity dynamics without lag
    frameCountRef.current = (frameCountRef.current || 0) + 1;
    if (frameCountRef.current % 30 === 0) {
      setSave(s => {
        const openTasksCount = s.tasks.filter(t => !t.done).length;
        
        // --- 1. Chaos & Ablenkung (Korruption) ---
        // Steigt durch offene Aufgaben (Chaos), sinkt bei vollendeten Aufgaben (Ordnung)
        let corrChange = 0;
        if (openTasksCount > 0) {
          corrChange = openTasksCount * 0.35; // drift up
        } else {
          corrChange = -1.5; // clear mindset
        }
        const nextCorruption = Math.max(0, Math.min(100, s.corruption + corrChange));

        // --- 2. System-Integrität (Moralische / Qualitative Ausführung) ---
        // Sinkt bei hohem Chaos (Korruption > 40), steigt im reinen optimierten System
        let honorChange = 0;
        if (nextCorruption > 40) {
          honorChange = -0.55; 
        } else if (nextCorruption < 15 && s.projects.length > 0) {
          honorChange = 0.28;
        }
        const nextHonor = Math.max(0, Math.min(100, s.honor + honorChange));

        return {
          ...s,
          corruption: nextCorruption,
          honor: nextHonor
        };
      });
    }

    if (mx || my) {
      const len = Math.hypot(mx, my);
      let spd = playerPosRef.current.spd;
      if (save.unlockedSkills.includes('speed')) spd *= 1.15;
      const nx = playerPosRef.current.x + (mx/len) * spd * dt;
      const ny = playerPosRef.current.y + (my/len) * spd * dt;
      
      const isBlocked = (nx: number, ny: number) => {
          const px = playerPosRef.current.x;
          const py = playerPosRef.current.y;

          // 1. Hard perimeter limits of the entire outdoor canvas to avoid walking off-map to infinity
          if (nx < -2200 || nx > 2200 + WORLD.w || ny < -2200 || ny > 2200 + WORLD.h) {
              return true;
          }

          // 2. West Wall collision (x = 0, 0 <= y <= WORLD.h)
          if (((px >= 0 && nx < 0) || (px < 0 && nx >= 0)) && (ny >= 0 && ny <= WORLD.h)) {
              return true;
          }

          // 3. East Wall collision (x = WORLD.w, 0 <= y <= WORLD.h)
          if (((px <= WORLD.w && nx > WORLD.w) || (px > WORLD.w && nx <= WORLD.w)) && (ny >= 0 && ny <= WORLD.h)) {
              return true;
          }

          // 4. North Wall collision (y = 0, 0 <= x <= WORLD.w)
          if (((py >= 0 && ny < 0) || (py < 0 && ny >= 0)) && (nx >= 0 && nx <= WORLD.w)) {
              return true;
          }

          // 5. South Wall collision (y = WORLD.h, 0 <= x <= WORLD.w, except the portal gate)
          const inPortalX = nx >= WORLD.w/2 - 50 && nx <= WORLD.w/2 + 50;
          const isCrossingSouth = (py <= WORLD.h && ny > WORLD.h) || (py > WORLD.h && ny <= WORLD.h);
          if (isCrossingSouth && nx >= 0 && nx <= WORLD.w && !inPortalX) {
              return true;
          }

          return false;
      };

      if (!isBlocked(nx, ny)) {
          // Update ref directly for the next frame's physics/logic
          playerPosRef.current.x = nx;
          playerPosRef.current.y = ny;
          // Trigger React render for UI less aggressively if needed, but for now we keep it to ensure HUD/Minimap sync
          setPlayer({ ...playerPosRef.current, x: nx, y: ny });
      }
    }

    // -------------------------------------------------------------------------
    // A* PATHFINDING & AI STEERING FOR SIMULATION OFFICERS
    // -------------------------------------------------------------------------
    setDynamicOfficers(prev => {
      return prev.map(o => {
        // Zentrale-Agent (ops) stands completely still as an authoritative chief personality!
        if (o.id === 'ops') {
          return {
            ...o,
            x: o.x,
            y: o.y,
            state: 'idle',
            isMoving: false,
            path: []
          };
        }

        const dx = playerPosRef.current.x - o.x;
        const dy = playerPosRef.current.y - o.y;
        const distToPlayer = Math.hypot(dx, dy);

        let nState = o.state;
        let nTimer = o.timer - dt;
        let nPath = [...o.path];
        let nx = o.x;
        let ny = o.y;
        let nTargetX = o.targetX;
        let nTargetY = o.targetY;
        let isMoving = false;

        // Player proximity greeting logic (Following/watching)
        if (distToPlayer < 75) {
          nState = 'following';
          isMoving = distToPlayer > 42; 
          if (isMoving) {
            const angle = Math.atan2(dy, dx);
            nx += Math.cos(angle) * 72 * dt;
            ny += Math.sin(angle) * 72 * dt;
          }
        } else {
          if (o.state === 'following') {
            nState = 'idle';
            nTimer = Math.random() * 2 + 1;
            nPath = [];
          }

          if (nState === 'idle') {
            if (nTimer <= 0) {
              nState = 'patrolling';
              let rx = o.x;
              let ry = o.y;
              if (o.room === 'ops') {
                rx = 100 + Math.random() * 200;
                ry = 100 + Math.random() * 200;
              } else if (o.room === 'strat') {
                rx = 500 + Math.random() * 200;
                ry = 100 + Math.random() * 200;
              } else if (o.room === 'intel') {
                rx = 100 + Math.random() * 200;
                ry = 500 + Math.random() * 200;
              } else if (o.room === 'core') {
                rx = 500 + Math.random() * 200;
                ry = 500 + Math.random() * 200;
              }
              nTargetX = rx;
              nTargetY = ry;
              nPath = findAStarPath(o.x, o.y, rx, ry);
            }
          } else if (nState === 'patrolling') {
            if (nPath.length > 0) {
              const currentWaypoint = nPath[0];
              const wdx = currentWaypoint.x - o.x;
              const wdy = currentWaypoint.y - o.y;
              const distToWaypoint = Math.hypot(wdx, wdy);

              if (distToWaypoint < 12) {
                nPath.shift();
              } else {
                isMoving = true;
                const angle = Math.atan2(wdy, wdx);
                nx += Math.cos(angle) * 65 * dt;
                ny += Math.sin(angle) * 65 * dt;
              }
            } else {
              nState = 'idle';
              nTimer = Math.random() * 4 + 2;
            }
          }
        }

        return {
          ...o,
          x: nx,
          y: ny,
          targetX: nTargetX,
          targetY: nTargetY,
          path: nPath,
          state: nState,
          timer: nTimer,
          isMoving
        };
      });
    });

    // Handlers for "Attack" (Space) and "Interact" (E)
    if (keys[' ']) {
      // Hammer attack
      setPillars(prev => prev.map(p => {
        const dist = Math.hypot(p.x - playerPosRef.current.x, p.y - playerPosRef.current.y);
        const prob = save.unlockedSkills.includes('bash') ? 0.25 : 0.1;
        if (dist < 100 && Math.random() < prob) {
          // Drop loot!
          const dropCount = save.unlockedSkills.includes('alpha') ? 2 : 1;
          const newDrops: LootCore[] = [];
          
          for(let i=0; i<dropCount; i++) {
            const idea = generateIdeakern();
            newDrops.push({
              id: `loot-${Date.now()}-${Math.random()}`,
              x: p.x, y: p.y,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              title: idea.title!,
              description: idea.description,
              serendipity: idea.serendipity!,
              strength: idea.strength!,
              color: idea.color!,
              collected: false
            });
          }
          
          setLoots(l => [...l, ...newDrops]);
          return { ...p, stability: Math.max(0, p.stability - 5) };
        }
        return p;
      }));
    }

    if (keys['m']) {
      setShowMap(prev => !prev);
      keysRef.current['m'] = false;
    }

    if (keys['k']) {
      setShowSkillTree(prev => !prev);
      keysRef.current['k'] = false;
    }

    if (keys['e']) {
      if (!carriedLoot) {
        // Find nearest loot
        const nearest = lootsRef.current.find(l => !l.collected && Math.hypot(l.x - playerPosRef.current.x, l.y - playerPosRef.current.y) < 50);
        if (nearest) {
          setCarriedLoot(nearest);
          setLoots(ls => ls.filter(x => x.id !== nearest.id));
          playSynthSound('collect');
        }
      } else {
        // Check if near the external terminal
        const termX = 300, termY = 300;
        const distToTerminal = Math.hypot(playerPosRef.current.x - termX, playerPosRef.current.y - termY);
        
        if (distToTerminal < 80) {
          if (save.projects.length >= projectCapacity) {
            setCapacityError(true);
            setTimeout(() => setCapacityError(false), 3000);
            return;
          }
          // Feed into terminal!
          setLastLoot(carriedLoot);
          const newProjectId = `arb-${Date.now()}`;
          setSave(s => ({
             ...s,
             xp: s.xp + Math.floor(carriedLoot.strength * 100),
             projects: [...s.projects, { 
               id: newProjectId, 
               name: carriedLoot.title, 
               progress: 0, 
               status: 'active',
               descriptionSnippet: carriedLoot.description,
               ideationMode: "Gap Attack" 
             }]
          }));
          setActiveIdeaDetail({ ...carriedLoot, projectId: newProjectId });
          setCarriedLoot(null);
          playSynthSound('upload');
        } else {
           // Fallback Room planting logic
           const currentRoom = ROOMS.find(r => 
             playerPosRef.current.x > r.x && playerPosRef.current.x < r.x + r.w &&
             playerPosRef.current.y > r.y && playerPosRef.current.y < r.y + r.h
           );
           if (currentRoom) {
             setLastLoot(carriedLoot);
             setSave(s => ({
                ...s,
                xp: s.xp + Math.floor(carriedLoot.strength * 50),
                tasks: [...s.tasks, { id: `arb-${Date.now()}`, text: `Arbitrage: ${carriedLoot.title}`, done: false, category: 'work', pinned: true }]
             }));
             setCarriedLoot(null);
             playSynthSound('upload');
           }
        }
      }
      keysRef.current['e'] = false; // Prevent rapid firing
    }
  }, [showIntro, activeOfficer, activeRoomId, carriedLoot, save, projectCapacity]);


  const toIsoX = (x: number, y: number) => x - y;
  const toIsoY = (x: number, y: number) => (x + y) / 2;

  const drawIsoBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, z: number, color: string, alpha: number = 1) => {
    const ix = toIsoX(x, y);
    const iy = toIsoY(x, y);
    const isDark = document.documentElement.classList.contains('dark') || (ctx.canvas.parentElement?.classList.contains('dark-theme')) || false;
    
    const shade = (col: string, p: number) => {
      if (!col.startsWith('#')) return col;
      let R = parseInt(col.substring(1, 3), 16);
      let G = parseInt(col.substring(3, 5), 16);
      let B = parseInt(col.substring(5, 7), 16);
      R = Math.min(255, Math.floor(R * (100 + p) / 100));
      G = Math.min(255, Math.floor(G * (100 + p) / 100));
      B = Math.min(255, Math.floor(B * (100 + p) / 100));
      return `rgba(${R}, ${G}, ${B}, ${alpha})`;
    };

    // Sub-pixel antialiasing gap-filler helper
    const fillAndStroke = (c: string) => {
      ctx.fillStyle = c;
      ctx.strokeStyle = c;
      ctx.lineWidth = 0.5;
      ctx.fill();
      ctx.stroke();
    };

    // 1. Soft Ambient Occlusion shadow under the block on the ground (Z=0)
    if (z > 5 && w > 4 && h > 4 && alpha > 0.5) {
      ctx.save();
      ctx.fillStyle = isDark ? 'rgba(2, 6, 23, 0.45)' : 'rgba(15, 23, 42, 0.12)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = isDark ? 'rgba(2, 6, 23, 0.6)' : 'rgba(15, 23, 42, 0.15)';
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ix + w, iy + w/2);
      ctx.lineTo(ix + w - h, iy + (w+h)/2);
      ctx.lineTo(ix - h, iy + h/2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Front-Left Face (facing viewer along the X-axis, at y + h)
    ctx.beginPath();
    ctx.moveTo(ix - h, iy + h/2 - z);
    ctx.lineTo(ix + w - h, iy + (w+h)/2 - z);
    ctx.lineTo(ix + w - h, iy + (w+h)/2);
    ctx.lineTo(ix - h, iy + h/2);
    ctx.closePath();
    fillAndStroke(shade(color, -20));

    // 3. Front-Right Face (facing viewer along the Y-axis, at x + w)
    ctx.beginPath();
    ctx.moveTo(ix + w, iy + w/2 - z);
    ctx.lineTo(ix + w - h, iy + (w+h)/2 - z);
    ctx.lineTo(ix + w - h, iy + (w+h)/2);
    ctx.lineTo(ix + w, iy + w/2);
    ctx.closePath();
    fillAndStroke(shade(color, -8));

    // 4. Top Face
    ctx.beginPath();
    ctx.moveTo(ix, iy - z);
    ctx.lineTo(ix + w, iy + w/2 - z);
    ctx.lineTo(ix + w - h, iy + (w+h)/2 - z);
    ctx.lineTo(ix - h, iy + h/2 - z);
    ctx.closePath();
    fillAndStroke(color.startsWith('#') ? shade(color, 8) : color);

    // 5. Bright Bevel Highlight ("Lichtkante") on top edges facing light (top-left and top-right)
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(ix - h, iy + h/2 - z);
    ctx.lineTo(ix, iy - z);
    ctx.lineTo(ix + w, iy + w/2 - z);
    ctx.stroke();
    ctx.restore();
  };

  // Dedicated helper to draw a block starting at a specific floating height (startZ) and extending upward by height (h)
  const drawFloatingIsoBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, d: number, startZ: number, h: number, color: string, alpha: number = 1) => {
    const ix = toIsoX(x, y);
    const iy = toIsoY(x, y);
    const isDark = document.documentElement.classList.contains('dark') || (ctx.canvas.parentElement?.classList.contains('dark-theme')) || false;

    const shade = (col: string, p: number) => {
      if (!col.startsWith('#')) return col;
      let R = parseInt(col.substring(1, 3), 16);
      let G = parseInt(col.substring(3, 5), 16);
      let B = parseInt(col.substring(5, 7), 16);
      R = Math.min(255, Math.floor(R * (100 + p) / 100));
      G = Math.min(255, Math.floor(G * (100 + p) / 100));
      B = Math.min(255, Math.floor(B * (100 + p) / 100));
      return `rgba(${R}, ${G}, ${B}, ${alpha})`;
    };

    const fillAndStroke = (c: string) => {
      ctx.fillStyle = c;
      ctx.strokeStyle = c;
      ctx.lineWidth = 0.5;
      ctx.fill();
      ctx.stroke();
    };

    const topZ = startZ + h;

    // 1. Bottom Ambient Shadow (Only if starting near the ground)
    if (startZ < 10 && w > 4 && d > 4 && alpha > 0.5) {
      ctx.save();
      ctx.fillStyle = isDark ? 'rgba(2, 6, 23, 0.4)' : 'rgba(15, 23, 42, 0.1)';
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ix + w, iy + w/2);
      ctx.lineTo(ix + w - d, iy + (w+d)/2);
      ctx.lineTo(ix - d, iy + d/2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Front-Left Face: from startZ to topZ
    ctx.beginPath();
    ctx.moveTo(ix - d, iy + d/2 - topZ);
    ctx.lineTo(ix + w - d, iy + (w+d)/2 - topZ);
    ctx.lineTo(ix + w - d, iy + (w+d)/2 - startZ);
    ctx.lineTo(ix - d, iy + d/2 - startZ);
    ctx.closePath();
    fillAndStroke(shade(color, -20));

    // 3. Front-Right Face: from startZ to topZ
    ctx.beginPath();
    ctx.moveTo(ix + w, iy + w/2 - topZ);
    ctx.lineTo(ix + w - d, iy + (w+d)/2 - topZ);
    ctx.lineTo(ix + w - d, iy + (w+d)/2 - startZ);
    ctx.lineTo(ix + w, iy + w/2 - startZ);
    ctx.closePath();
    fillAndStroke(shade(color, -8));

    // 4. Top Face: at topZ
    ctx.beginPath();
    ctx.moveTo(ix, iy - topZ);
    ctx.lineTo(ix + w, iy + w/2 - topZ);
    ctx.lineTo(ix + w - d, iy + (w+d)/2 - topZ);
    ctx.lineTo(ix - d, iy + d/2 - topZ);
    ctx.closePath();
    fillAndStroke(color.startsWith('#') ? shade(color, 8) : color);

    // 5. Highlight on top-facing edges
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(ix - d, iy + d/2 - topZ);
    ctx.lineTo(ix, iy - topZ);
    ctx.lineTo(ix + w, iy + w/2 - topZ);
    ctx.stroke();
    ctx.restore();
  };

  // 1. Digital Circuit Terminal Patterns on the floor
  const drawCircuitJunction = (ctx: CanvasRenderingContext2D, el: DecorativeLandscapeElement, t: number, isDark: boolean) => {
    const ix = toIsoX(el.x, el.y);
    const iy = toIsoY(el.x, el.y);
    const s = el.size;
    const alpha = 0.22 + Math.sin(t * 1.5 + el.pulseOffset) * 0.12;
    
    ctx.save();
    ctx.strokeStyle = el.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.25;
    
    // Draw a quiet isometric hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = toIsoX(el.x + Math.cos(angle) * (s * 0.5), el.y + Math.sin(angle) * (s * 0.5));
      const hy = toIsoY(el.x + Math.cos(angle) * (s * 0.5), el.y + Math.sin(angle) * (s * 0.5));
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Branching lines
    const branches = [
      { dx: s * 1.2, dy: 0 },
      { dx: -s * 1.2, dy: 0 },
      { dx: 0, dy: s * 1.2 },
      { dx: 0, dy: -s * 1.2 },
    ];
    
    branches.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(toIsoX(el.x + b.dx * 0.6, el.y + b.dy * 0.6), toIsoY(el.x + b.dx * 0.6, el.y + b.dy * 0.6));
      ctx.lineTo(toIsoX(el.x + b.dx, el.y + b.dy), toIsoY(el.x + b.dx, el.y + b.dy));
      ctx.stroke();
      
      // Node point
      ctx.fillStyle = el.color;
      ctx.beginPath();
      ctx.arc(toIsoX(el.x + b.dx, el.y + b.dy), toIsoY(el.x + b.dx, el.y + b.dy), 2.0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  // 2. Dual Stack Floating Cyber Crystals
  const drawCyberCrystal = (ctx: CanvasRenderingContext2D, el: DecorativeLandscapeElement, t: number, isDark: boolean) => {
    const s = el.size;
    const h = el.height || 22;
    const pulse = Math.sin(t * 2.2 + el.pulseOffset) * 4.5;
    
    // Foundation glow of the crystal
    drawFloatingIsoBlock(ctx, el.x - s/2, el.y - s/2, s, s, 0, 3, isDark ? '#111827' : '#e2e8f0', 0.8);
    drawFloatingIsoBlock(ctx, el.x - (s * 0.75)/2, el.y - (s * 0.75)/2, s * 0.75, s * 0.75, 3, 2, el.color, 0.4);
    
    // Crystalline structure: double tapered diamonds
    const floatH = 12 + pulse;
    const layers = 5;
    const shardMaxW = s * 0.58;
    for (let i = 0; i < layers; i++) {
      const progress = i / (layers - 1); // 0 to 1
      const scale = 1.0 - Math.abs(progress - 0.5) * 1.35; // diamond form
      const layerW = shardMaxW * Math.max(0.2, scale);
      const layerZ = floatH + i * (h / layers);
      
      drawFloatingIsoBlock(ctx, el.x - layerW/2, el.y - layerW/2, layerW, layerW, layerZ, h / layers, el.color, 0.85);
    }
  };

  // 3. Cyber Obelisks / Data Slabs
  const drawCyberMonolith = (ctx: CanvasRenderingContext2D, el: DecorativeLandscapeElement, t: number, isDark: boolean) => {
    const s = el.size;
    const h = el.height || 45;
    const pulse = 0.75 + Math.sin(t * 2.8 + el.pulseOffset) * 0.25;
    
    const obeliskColor = isDark ? '#1e293b' : '#475569';
    const baseColor = isDark ? '#0f172a' : '#cbd5e1';
    
    // Symmetrical base plinth
    drawFloatingIsoBlock(ctx, el.x - s/2, el.y - s/2, s, s, 0, 4, baseColor, 1.0);
    
    // Core pillar
    const ms = s * 0.62;
    drawFloatingIsoBlock(ctx, el.x - ms/2, el.y - ms/2, ms, ms, 4, h, obeliskColor, 1.0);
    
    // Neon crown glowing cap
    const cs = ms * 0.38;
    drawFloatingIsoBlock(ctx, el.x - cs/2, el.y - cs/2, cs, cs, 4 + h, 5, el.color, 0.9 * pulse);
    
    // Glowing laser stripe on core face (Front-Left)
    drawFloatingIsoBlock(ctx, el.x - ms/2 - 0.5, el.y - 1.2, 0.5, 2.4, 8, h - 12, el.color, 0.85 * pulse);
  };

  // 4. Digital Cyber Shrubs / Geometry Pine Trees
  const drawCyberShrub = (ctx: CanvasRenderingContext2D, el: DecorativeLandscapeElement, t: number, isDark: boolean) => {
    const s = el.size;
    const trunkColor = isDark ? '#334155' : '#64748b';
    const leafColor = el.color;
    const windOffset = Math.sin(t * 1.3 + el.x) * 2.2;
    
    // Sinking structural trunk
    drawFloatingIsoBlock(ctx, el.x - 2, el.y - 2, 4, 4, 0, 12, trunkColor, 1.0);
    
    // Layer 1 (Base wide cone)
    const t1s = s;
    drawFloatingIsoBlock(ctx, el.x - t1s/2 + windOffset * 0.3, el.y - t1s/2, t1s, t1s, 8, 7, leafColor, 0.9);
    
    // Layer 2 (Middle cone)
    const t2s = s * 0.72;
    drawFloatingIsoBlock(ctx, el.x - t2s/2 + windOffset * 0.6, el.y - t2s/2, t2s, t2s, 14, 6, leafColor, 0.85);
    
    // Layer 3 (Spire cap)
    const t3s = s * 0.42;
    drawFloatingIsoBlock(ctx, el.x - t3s/2 + windOffset, el.y - t3s/2, t3s, t3s, 19, 6, leafColor, 0.8);
  };

  const drawCharacter = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, name: string, role: string = '', isPlayer: boolean = false, isMoving: boolean = false) => {
    const ix = toIsoX(x, y), iy = toIsoY(x, y);
    const isZentrale = role?.toLowerCase() === 'zentrale' || name === 'Zentrale-Agent';
    const scale = isPlayer ? 1.25 : (isZentrale ? 1.85 : 1.15);
    
    // Animation Phase
    const t = Date.now() / 1000;
    const walkFreq = 11; 
    const legPhase = isMoving ? Math.sin(t * walkFreq) : 0;
    const bob = isMoving ? Math.abs(Math.sin(t * walkFreq)) * 3.5 : 0;
    
    const isDark = document.documentElement.classList.contains('dark') || (ctx.canvas.parentElement?.classList.contains('dark-theme')) || false;
    
    // 1. Premium Animated Holographic Double Halo Ring under the character
    const haloColor = isPlayer ? '#10b981' : color; // Emerald for player, matched colors for officers
    const pulseScale = (1.0 + Math.sin(t * 3.5) * 0.07) * scale;
    
    // Outer diffuse selection shadow
    ctx.save();
    ctx.fillStyle = isDark ? 'rgba(2, 6, 23, 0.35)' : 'rgba(15, 23, 42, 0.12)';
    ctx.beginPath();
    ctx.ellipse(ix, iy, 28 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Concentric Neon Aura (Double rings)
    ctx.save();
    ctx.shadowBlur = isDark ? 10 : 0;
    ctx.shadowColor = haloColor;
    
    // Ring 1 (Inner glow halo)
    ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.09)' : 'rgba(16, 185, 129, 0.05)';
    if (!isPlayer) {
      // Base low-opacity match to color
      ctx.fillStyle = color + '0F'; 
    }
    ctx.beginPath();
    ctx.ellipse(ix, iy, 20 * pulseScale, 10 * pulseScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ring 2 (Fine outer neon tracer)
    ctx.strokeStyle = haloColor + 'BF'; // 75% opacity
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(ix, iy, 21 * pulseScale, 10.5 * pulseScale, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Outer Target Brackets if close or active
    const dist = Math.hypot(x - playerPosRef.current.x, y - playerPosRef.current.y);
    if (isPlayer || dist < 65) {
      ctx.strokeStyle = haloColor;
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 12]);
      ctx.lineDashOffset = -t * 12;
      ctx.beginPath();
      ctx.ellipse(ix, iy, 26 * scale, 13 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Micro Legs/Feet (Round-capsule feet)
    const legW = 3.8 * scale;
    const legH = 9 * scale;
    const legSpread = 4.2 * scale;
    ctx.fillStyle = isDark ? '#1e293b' : '#475569';
    
    // Left leg
    const lLegY = iy - legH - bob + (isMoving && legPhase > 0 ? legPhase * 5 : 0);
    ctx.beginPath();
    ctx.roundRect(ix - legSpread - legW/2, lLegY, legW, legH, legW/2);
    ctx.fill();
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
 
    // Right leg
    const rLegY = iy - legH - bob + (isMoving && legPhase < 0 ? -legPhase * 5 : 0);
    ctx.beginPath();
    ctx.roundRect(ix + legSpread - legW/2, rLegY, legW, legH, legW/2);
    ctx.fill();
    ctx.stroke();

    // 3. Body (Volumetric Glossy Capsule)
    const bodyH = 26 * scale;
    const bodyW = 13.5 * scale;
    const bodyY = iy - legH - bob;
    
    // Core body gradient with highlight shoulder & dark shadow bottom
    const grd = ctx.createLinearGradient(ix, bodyY - bodyH, ix, bodyY);
    grd.addColorStop(0, isDark ? '#ffffff' : '#ffffff'); // pure top glossy shine
    grd.addColorStop(0.12, color);                        // main bright tone
    grd.addColorStop(0.55, color);                        // base body color
    grd.addColorStop(0.88, isDark ? '#090d16' : '#1e1c2a'); // deep ambient bottom shading
    grd.addColorStop(1.0, '#000000');
    
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(ix, bodyY - bodyW/2, bodyW/2, 0, Math.PI);
    ctx.lineTo(ix - bodyW/2, bodyY - (bodyH - bodyW/2));
    ctx.arc(ix, bodyY - (bodyH - bodyW/2), bodyW/2, Math.PI, 0);
    ctx.lineTo(ix + bodyW/2, bodyY - bodyW/2);
    ctx.closePath();
    ctx.fill();

    // Glass Shimmer Overlay (High-tech transparent shine reflection)
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    const glossGrd = ctx.createLinearGradient(ix - bodyW/2, bodyY - bodyH, ix, bodyY);
    glossGrd.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    glossGrd.addColorStop(0.3, 'rgba(255, 255, 255, 0.08)');
    glossGrd.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = glossGrd;
    ctx.beginPath();
    ctx.arc(ix - 0.8, bodyY - (bodyH - bodyW/2), bodyW/3, Math.PI, Math.PI * 1.5);
    ctx.lineTo(ix - 1.2, bodyY - bodyW/2 - 2);
    ctx.arc(ix - 0.8, bodyY - bodyW/2, bodyW/4, Math.PI, Math.PI * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3b. Crossed Arms (arme verschränkt) for the authoritative Zentrale-Agent
    if (isZentrale) {
      const armLevelY = bodyY - bodyH * 0.55; 
      const armThickness = 5.2 * scale;
      const armColor = isDark ? '#fbbf24' : '#d97706'; // Gold/authoritative amber color
      const shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';
      
      ctx.save();
      ctx.lineCap = 'round';
      
      // 3D Shadow under crossed arms
      ctx.strokeStyle = shadowColor;
      ctx.lineWidth = armThickness + 2.5;
      
      // Left arm offset shadow
      ctx.beginPath();
      ctx.moveTo(ix - bodyW * 0.45, armLevelY - 2 * scale);
      ctx.lineTo(ix + bodyW * 0.45, armLevelY + 1 * scale);
      ctx.stroke();

      // Right arm offset shadow
      ctx.beginPath();
      ctx.moveTo(ix + bodyW * 0.45, armLevelY - 2 * scale);
      ctx.lineTo(ix - bodyW * 0.45, armLevelY + 1 * scale);
      ctx.stroke();

      // Metallic Gold cybernetic crossed arms
      const armGrd = ctx.createLinearGradient(ix - bodyW/2, armLevelY, ix + bodyW/2, armLevelY);
      armGrd.addColorStop(0, '#fef08a');
      armGrd.addColorStop(0.5, armColor);
      armGrd.addColorStop(1, isDark ? '#b45309' : '#92400e');
      ctx.strokeStyle = armGrd;
      ctx.lineWidth = armThickness;
      
      // Underlying folded arm (Left side)
      ctx.beginPath();
      ctx.moveTo(ix - bodyW * 0.45, armLevelY - 1.5 * scale);
      ctx.lineTo(ix + bodyW * 0.35, armLevelY + 1.5 * scale);
      ctx.stroke();
      
      // Overlapping folded arm (Right side)
      ctx.beginPath();
      ctx.moveTo(ix + bodyW * 0.45, armLevelY - 1.5 * scale);
      ctx.lineTo(ix - bodyW * 0.35, armLevelY + 1.5 * scale);
      ctx.stroke();
      
      // Central commander cyan micro-fusion reactor core/command emblem
      ctx.fillStyle = '#22d3ee';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      ctx.arc(ix, armLevelY + 1.5 * scale, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }

    // 4. Head (Futuristic Mirror-Spec chrome sphere)
    const headY = bodyY - bodyH - (4.5 * scale);
    const headR = 7.5 * scale;
    
    const hGrd = ctx.createRadialGradient(
      ix - headR * 0.35, 
      headY - headR * 0.38, 
      headR * 0.06, // shiny hot highlight pin
      ix, 
      headY, 
      headR // overall capsule outer radius
    );
    hGrd.addColorStop(0, '#ffffff'); // hot direct specular shine point
    hGrd.addColorStop(0.18, '#f8fafc'); // soft bright falloff
    hGrd.addColorStop(0.52, '#94a3b8'); // pristine metallic mid-grey
    hGrd.addColorStop(0.85, '#475569'); // rich perimeter shadow
    hGrd.addColorStop(1.0, '#1e293b');  // bounce illumination edge

    ctx.fillStyle = hGrd;
    ctx.beginPath();
    ctx.arc(ix, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Subtle dark shadow outline around head to separate it from background
    ctx.strokeStyle = isDark ? 'rgba(15,23,42,0.45)' : 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 0.55;
    ctx.stroke();

    // 4b. Floating royal crown above his head for Zentrale to signify unmatched authority
    if (isZentrale) {
      ctx.save();
      const cy = headY - headR - 8 * scale;
      const cw = 11 * scale;
      const ch = 7 * scale;
      
      // Radiant golden glow outline
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#fbbf24';
      
      ctx.fillStyle = '#fbbf24'; // Solid gold crown base
      ctx.beginPath();
      ctx.moveTo(ix - cw/2, cy);
      ctx.lineTo(ix - cw/2, cy - ch);
      ctx.lineTo(ix - cw * 0.18, cy - ch * 0.4);
      ctx.lineTo(ix, cy - ch * 1.15); // middle high point
      ctx.lineTo(ix + cw * 0.18, cy - ch * 0.4);
      ctx.lineTo(ix + cw/2, cy - ch);
      ctx.lineTo(ix + cw/2, cy);
      ctx.closePath();
      ctx.fill();
      
      // Floating white diamond crown highlights on peaks
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ix, cy - ch * 1.15, 1.3 * scale, 0, Math.PI * 2); // Center Peak
      ctx.arc(ix - cw/2, cy - ch, 1.1 * scale, 0, Math.PI * 2); // Left Peak
      ctx.arc(ix + cw/2, cy - ch, 1.1 * scale, 0, Math.PI * 2); // Right Peak
      ctx.fill();
      
      ctx.restore();
    }

    // 5. High-fidelity floating dynamic nameplate text
    if (isZentrale) {
      ctx.save();
      ctx.fillStyle = '#fbbf24'; // Glowing Gold
      ctx.font = '900 12px Inter';
      try {
        // @ts-ignore
        ctx.letterSpacing = '1.8px';
      } catch (e) {}
      ctx.textAlign = 'center';
      ctx.fillText('ZENTRALE-AGENT', ix, headY - headR - 25 * scale);
      
      ctx.fillStyle = isDark ? 'rgba(34, 211, 238, 0.9)' : 'rgba(8, 145, 178, 0.95)';
      ctx.font = '900 8px JetBrains Mono';
      try {
        // @ts-ignore
        ctx.letterSpacing = '1px';
      } catch (e) {}
      ctx.fillText('COMMANDER IN CHIEF', ix, headY - headR - 16 * scale);
      ctx.restore();
    } else if (isPlayer) {
      ctx.save();
      ctx.fillStyle = '#10b981';
      ctx.font = '900 11px Inter';
      try {
        // @ts-ignore
        ctx.letterSpacing = '1.3px';
      } catch (e) {}
      ctx.textAlign = 'center';
      ctx.fillText(name.toUpperCase(), ix, headY - headR - 16);
      
      if (role) {
        ctx.fillStyle = isDark ? 'rgba(248,250,252,0.42)' : 'rgba(30,41,59,0.55)';
        ctx.font = '800 8px JetBrains Mono';
        ctx.fillText(role.toUpperCase(), ix, headY - headR - 6);
      }
      ctx.restore();
    }
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    const px = playerPosRef.current.x;
    const py = playerPosRef.current.y;
    ctx.translate(canvas.width / 2 + cameraOffsetRef.current.x, canvas.height / 2 + cameraOffsetRef.current.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-toIsoX(px, py), -toIsoY(px, py));
    
    const isDark = theme === 'dark';
    const wallH = 45;
    const wallT = 12;
    const baseCol = isDark ? '#1e293b' : '#e2e8f0';
    const glassCol = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(148, 163, 184, 0.2)';
    const pillarS = 18;
    const pillarH = 60;

    const drawFenceSegment = (x: number, y: number, w: number, h: number, hasPortal: boolean = false) => {
      if (hasPortal) {
        const pSize = 100;
        const s1 = (w - pSize) / 2;
        // Segment before portal
        drawIsoBlock(ctx, x, y, s1, h, 10, baseCol);
        drawIsoBlock(ctx, x + 2, y + 2, s1 - 4, h - 4, wallH, glassCol);
        // Portal Floor Glow
        ctx.save();
        const pix = toIsoX(x + s1 + pSize/2, y + h/2), piy = toIsoY(x + s1 + pSize/2, y + h/2);
        const grd = ctx.createRadialGradient(pix, piy, 0, pix, piy, 40);
        grd.addColorStop(0, 'rgba(34, 197, 94, 0.4)'); grd.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.ellipse(pix, piy, 60, 30, 0, 0, Math.PI*2); ctx.fill();
        ctx.restore();
        // Segment after portal
        drawIsoBlock(ctx, x + s1 + pSize, y, s1, h, 10, baseCol);
        drawIsoBlock(ctx, x + s1 + pSize + 2, y + 2, s1 - 4, h - 4, wallH, glassCol);
        return;
      }
      // Base
      drawIsoBlock(ctx, x, y, w, h, 10, baseCol);
      // "Glass" panel
      drawIsoBlock(ctx, x + 2, y + 2, w - 4, h - 4, wallH, glassCol);
      
      // Calculate coordinates for thin, centered rails
      const railT = 4;
      let rx = x;
      let ry = y;
      let rw = w;
      let rh = h;
      
      if (w > h) {
        // Runs along X-axis, make it thin along Y-axis
        ry = y + (h - railT) / 2;
        rh = railT;
      } else {
        // Runs along Y-axis, make it thin along X-axis
        rx = x + (w - railT) / 2;
        rw = railT;
      }

      // Thin Top/Bottom Rails (Perfect alignment with pillar face centerlines)
      drawIsoBlock(ctx, rx, ry, rw, rh, 2, '#475569');
      ctx.save();
      ctx.translate(0, -wallH);
      drawIsoBlock(ctx, rx, ry, rw, rh, 4, '#64748b');
      ctx.restore();
    };

    const drawPillar = (px: number, py: number) => {
      drawIsoBlock(ctx, px - pillarS/2, py - pillarS/2, pillarS, pillarS, pillarH, isDark ? '#1e293b' : '#cbd5e1');
      // Glowing cap (perfectly anchored and inset, matching the second image)
      ctx.save();
      const pix = toIsoX(px, py), piy = toIsoY(px, py);
      const pulse = (Math.sin(Date.now()/500) + 1) / 2;
      ctx.fillStyle = `rgba(34, 197, 94, ${0.65 + pulse * 0.25})`;
      ctx.beginPath(); 
      // Horizontal radius 6.5, vertical radius 3.25 centered on the top face
      ctx.ellipse(pix, piy - pillarH, 6.5, 3.25, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = `rgba(16, 185, 129, ${0.85 + pulse * 0.15})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();
    };

    const drawGardenPlot = (label: string, points: {x: number, y: number}[], fillColor: string, strokeColor: string) => {
      ctx.save();
      ctx.beginPath();
      const first = points[0];
      ctx.moveTo(toIsoX(first.x, first.y), toIsoY(first.x, first.y));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(toIsoX(points[i].x, points[i].y), toIsoY(points[i].x, points[i].y));
      }
      ctx.closePath();
      
      ctx.fillStyle = fillColor;
      ctx.fill();
      
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = strokeColor;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
      
      ctx.save();
      let sumX = 0, sumY = 0;
      points.forEach(p => { sumX += p.x; sumY += p.y; });
      const cx = sumX / points.length;
      const cy = sumY / points.length;
      
      const pix = toIsoX(cx, cy);
      const piy = toIsoY(cx, cy);
      
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.65)' : 'rgba(71, 85, 105, 0.65)';
      ctx.textAlign = 'center';
      ctx.fillText(label, pix, piy);
      ctx.restore();
    };

    const drawGardenTree = (pX: number, pY: number, label: string, progress: number, p: Project) => {
      const t = Date.now() / 1000;
      const pix = toIsoX(pX, pY);
      const piy = toIsoY(pX, pY);
      const isDark = theme === 'dark';
      
      if (progress < 30) {
        // --- STAGE A: SEEDLING / SPROUT ---
        const h = 45 + Math.sin(t * 3) * 2;
        const color = '#10b981';
        
        ctx.save();
        ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.06)';
        ctx.beginPath();
        ctx.ellipse(pix, piy, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.stroke();
        
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.moveTo(pix, piy);
        ctx.quadraticCurveTo(pix - 5, piy - h/2, pix, piy - h);
        ctx.stroke();
        
        // Left leaf
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(pix - 4, piy - h/2, 9, 4, -Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        // Right leaf
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.ellipse(pix + 4, piy - h/2, 7, 3.5, Math.PI/6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pix, piy - h, 4.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = isDark ? '#10b981' : '#047857';
        ctx.textAlign = 'center';
        ctx.fillText(`${progress}%`, pix, piy - h - 14);
        
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
        ctx.fillText(label.slice(0, 16).toUpperCase() + (label.length > 16 ? '..' : ''), pix, piy - h - 5);
        ctx.restore();
        
      } else if (progress < 100) {
        // --- STAGE B: ACTIVE PROGRESS CYBER TREE ---
        const h = 85 + Math.sin(t * 1.5) * 4;
        
        ctx.save();
        ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(59, 130, 246, 0.08)';
        ctx.beginPath();
        ctx.ellipse(pix, piy, 36, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
        ctx.stroke();
        
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(pix, piy);
        ctx.lineTo(pix, piy - h * 0.4);
        ctx.stroke();
        
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pix, piy - h * 0.4);
        ctx.quadraticCurveTo(pix - 15, piy - h * 0.6, pix - 20, piy - h * 0.72);
        ctx.moveTo(pix, piy - h * 0.4);
        ctx.quadraticCurveTo(pix + 15, piy - h * 0.6, pix + 20, piy - h * 0.72);
        ctx.stroke();
        
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(pix, piy - h * 0.4);
        ctx.lineTo(pix, piy - h);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(168, 85, 247, 0.65)';
        ctx.shadowColor = '#a855f7';
        ctx.beginPath();
        ctx.ellipse(pix - 20, piy - h * 0.72, 14, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(pix + 20, piy - h * 0.72, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.shadowColor = '#3b82f6';
        ctx.beginPath();
        ctx.ellipse(pix, piy - h, 20, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pix, piy - h, 3, 0, Math.PI * 2);
        ctx.arc(pix - 20, piy - h * 0.72, 2.5, 0, Math.PI * 2);
        ctx.arc(pix + 20, piy - h * 0.72, 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#60a5fa';
        ctx.textAlign = 'center';
        ctx.fillText(`${progress}%`, pix, piy - h - 14);
        
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
        ctx.fillText(label.slice(0, 18).toUpperCase() + (label.length > 18 ? '..' : ''), pix, piy - h - 5);
        ctx.restore();
        
      } else {
        // --- STAGE C: MAJESTIC MATURE GOLDEN PYRAMID WORLD TREE ---
        const h = 120 + Math.sin(t * 1.2) * 5;
        
        ctx.save();
        const grad = ctx.createRadialGradient(pix, piy, 2, pix, piy, 50);
        grad.addColorStop(0, 'rgba(234, 179, 8, 0.28)');
        grad.addColorStop(1, 'rgba(234, 179, 8, 0.0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(pix, piy, 54, 27, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI / 2) + t * 0.2;
          ctx.beginPath();
          ctx.moveTo(pix, piy);
          ctx.lineTo(pix + Math.cos(angle) * 32, piy + Math.sin(angle) * 16);
          ctx.stroke();
        }
        
        ctx.lineWidth = 6.5;
        ctx.strokeStyle = '#d97706';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#eab308';
        ctx.beginPath();
        ctx.moveTo(pix, piy);
        ctx.lineTo(pix, piy - h * 0.35);
        ctx.stroke();
        
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pix, piy - h * 0.35);
        ctx.quadraticCurveTo(pix - 20, piy - h * 0.5, pix - 35, piy - h * 0.65);
        ctx.moveTo(pix, piy - h * 0.35);
        ctx.quadraticCurveTo(pix + 20, piy - h * 0.5, pix + 35, piy - h * 0.65);
        ctx.moveTo(pix, piy - h * 0.35);
        ctx.lineTo(pix, piy - h * 0.8);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(234, 179, 8, 0.78)';
        ctx.shadowColor = '#eab308';
        ctx.beginPath();
        ctx.ellipse(pix, piy - h * 0.8, 28, 15, 0, 0, Math.PI * 2);
        ctx.ellipse(pix - 35, piy - h * 0.7, 22, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(pix + 35, piy - h * 0.7, 22, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.ellipse(pix, piy - h, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const fruitTCount = 3;
        for (let i = 0; i < fruitTCount; i++) {
          const fAngle = t * 2 + (i * Math.PI * 2 / fruitTCount);
          const fX = pix + Math.cos(fAngle) * 35;
          const fY = piy - h * 0.75 + Math.sin(fAngle) * 12;
          
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#fbbf24';
          ctx.beginPath();
          ctx.arc(fX, fY, 4.5, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(fX, fY, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.fillStyle = '#fef08a';
        ctx.shadowBlur = 6;
        for (let idx = 0; idx < 4; idx++) {
          const pOffset = (t * 20 + idx * 25) % 60;
          const pxPos = pix + Math.sin(idx * 4 + t) * 25;
          const pyPos = piy - h * 0.5 - pOffset;
          ctx.fillRect(pxPos, pyPos, 2, 2);
        }
        
        ctx.shadowBlur = 0;
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center';
        ctx.fillText(`ERTRAGS-REICH`, pix, piy - h - 16);
        
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#eab308';
        ctx.fillText(label.slice(0, 20).toUpperCase() + (label.length > 20 ? '..' : ''), pix, piy - h - 5);
        ctx.restore();
      }
    };
    
    // Boundary Floor
    const pad = 3000;
    ctx.fillStyle = isDark ? '#020617' : '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(toIsoX(-pad, -pad), toIsoY(-pad, -pad));
    ctx.lineTo(toIsoX(WORLD.w+pad, -pad), toIsoY(WORLD.w+pad, -pad));
    ctx.lineTo(toIsoX(WORLD.w+pad, WORLD.h+pad), toIsoY(WORLD.w+pad, WORLD.h+pad));
    ctx.lineTo(toIsoX(-pad, WORLD.h+pad), toIsoY(-pad, WORLD.h+pad));
    ctx.closePath(); ctx.fill();

    // A. Wide-Area Digital Grid (Cyber-traces spanning to the horizon)
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(5, 150, 105, 0.038)';
    ctx.lineWidth = 1.1;
    const gridSpacing = 160;
    const tVal = Date.now() / 1000;

    for (let i = -pad; i <= WORLD.w + pad; i += gridSpacing) {
      // Parallel to X axis
      ctx.beginPath();
      ctx.moveTo(toIsoX(i, -pad), toIsoY(i, -pad));
      ctx.lineTo(toIsoX(i, WORLD.h + pad), toIsoY(i, WORLD.h + pad));
      ctx.stroke();

      // Parallel to Y axis
      ctx.beginPath();
      ctx.moveTo(toIsoX(-pad, i), toIsoY(-pad, i));
      ctx.lineTo(toIsoX(WORLD.w + pad, i), toIsoY(WORLD.w + pad, i));
      ctx.stroke();
    }
    ctx.restore();

    // B. Animated Digital Data Streams running along certain paths
    ctx.save();
    ctx.lineWidth = 1.6;
    const trunks = [
      { startX: -1500, startY: 400, endX: 2300, endY: 400, color: '#10b981' },
      { startX: 400, startY: -1500, endX: 400, endY: 2300, color: '#3b82f6' },
      { startX: -1000, startY: -1000, endX: 1800, endY: 1800, color: '#a855f7' },
      { startX: 1800, startY: -1000, endX: -1000, endY: 1800, color: '#06b6d4' }
    ];

    trunks.forEach(trunk => {
      // Draw quiet tracer path underneath
      ctx.strokeStyle = isDark ? trunk.color + '25' : trunk.color + '1a';
      ctx.beginPath();
      ctx.moveTo(toIsoX(trunk.startX, trunk.startY), toIsoY(trunk.startX, trunk.startY));
      ctx.lineTo(toIsoX(trunk.endX, trunk.endY), toIsoY(trunk.endX, trunk.endY));
      ctx.stroke();

      // Draw sliding packets
      const totalLen = Math.hypot(trunk.endX - trunk.startX, trunk.endY - trunk.startY);
      const packetSpeed = 180; // faster flow
      const packetCount = 4;
      
      ctx.fillStyle = trunk.color;
      ctx.shadowBlur = isDark ? 8 : 0;
      ctx.shadowColor = trunk.color;
      
      for (let j = 0; j < packetCount; j++) {
        const progress = ((tVal * packetSpeed + j * (totalLen / packetCount)) % totalLen) / totalLen;
        const curX = trunk.startX + (trunk.endX - trunk.startX) * progress;
        const curY = trunk.startY + (trunk.endY - trunk.startY) * progress;
        
        const pix = toIsoX(curX, curY);
        const piy = toIsoY(curX, curY);
        
        ctx.beginPath();
        ctx.moveTo(pix, piy - 4.5);
        ctx.lineTo(pix + 7, piy);
        ctx.lineTo(pix, piy + 4.5);
        ctx.lineTo(pix - 7, piy);
        ctx.closePath();
        ctx.fill();
      }
    });
    ctx.restore();

    // Grid Floor
    ctx.strokeStyle = isDark ? 'rgba(34,197,94,0.05)' : 'rgba(0,0,0,0.03)'; ctx.lineWidth = 1;
    for(let i=0; i<=WORLD.w; i+=40) {
      ctx.beginPath(); ctx.moveTo(toIsoX(i, 0), toIsoY(i, 0)); ctx.lineTo(toIsoX(i, WORLD.h), toIsoY(i, WORLD.h)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(toIsoX(0, i), toIsoY(0, i)); ctx.lineTo(toIsoX(WORLD.w, i), toIsoY(WORLD.w, i)); ctx.stroke();
    }

    // Render the three Garden sections on the ground (A, B, C)
    const colorA = isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)';
    const strokeA = isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)';
    drawGardenPlot("GARTENSEKTION A: IDEEN-SICHTUNG & ENTWICKLUNG (FORTSCHRITT < 30%)", [
      { x: -700, y: 50 },
      { x: -150, y: 50 },
      { x: -150, y: 750 },
      { x: -700, y: 750 }
    ], colorA, strokeA);

    const colorB = isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)';
    const strokeB = isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)';
    drawGardenPlot("GARTENSEKTION B: IDEEN IM PROZESS (FORTSCHRITT 30% - 99%)", [
      { x: 0, y: -950 },
      { x: 800, y: -950 },
      { x: 800, y: -15 },
      { x: 0, y: -15 }
    ], colorB, strokeB);

    const colorC = isDark ? 'rgba(234, 179, 8, 0.05)' : 'rgba(234, 179, 8, 0.03)';
    const strokeC = isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.15)';
    drawGardenPlot("GARTENSEKTION C: HISTORIE & FINANZIELLE ERTRÄGE (FORTSCHRITT = 100%)", [
      { x: 950, y: 50 },
      { x: 1550, y: 50 },
      { x: 1550, y: 750 },
      { x: 950, y: 750 }
    ], colorC, strokeC);

    // Background Fences & NW Pillar (drawn first in isometric depth sorting)
    drawPillar(-6, -6);                                 // NW Corner Pillar
    drawFenceSegment(0, -wallT, WORLD.w, wallT);        // North Wall
    drawFenceSegment(-wallT, 0, wallT, WORLD.h);        // West Wall

    // Utility to draw a high-fidelity watchtower (from user's design)
    const drawWatchtower = (p: IdeaPillar) => {
      const t = Date.now() / 1000;
      const size = 65 + Math.sin(t * 1.5 + p.x) * 1.5;
      const h = 210 + Math.cos(t * 0.4) * 8;
      
      const pix = toIsoX(p.x, p.y), piy = toIsoY(p.x, p.y);
      const isDark = theme === 'dark';
      
      // Dynamic high-glow color mapping based on whether this is a custom-created Neural Nexus/Wissens-Turm
      const glowColor = p.isCustomBusinessIdea ? '#facc15' : '#10b981';
      const secondaryGlowColor = p.isCustomBusinessIdea ? '#fde047' : '#34d399';
      const tertiaryGlowColor = p.isCustomBusinessIdea ? '#ca8a04' : '#059669';
      const ringOpacityColor = p.isCustomBusinessIdea ? 'rgba(250, 204, 21, 0.75)' : 'rgba(52, 211, 153, 0.75)';
      const shadowColor = p.isCustomBusinessIdea ? '#eab308' : '#10b981';

      // Theme-appropriate slate masonry colors
      const stoneColor = isDark ? '#334155' : '#64748b'; // Darker slate bricks
      const darkStoneColor = isDark ? '#1e293b' : '#334155'; // Deep recesses
      const lightStoneColor = isDark ? '#475569' : '#94a3b8'; // Highlighted bricks
      
      // 1. Translucent Glassy Neon Base Platter (Z = 0)
      const basePlatSize = size * 1.35;
      const baseColor = p.isCustomBusinessIdea ? (isDark ? '#eab308' : '#ca8a04') : (isDark ? '#10b981' : '#059669');
      drawFloatingIsoBlock(ctx, p.x - basePlatSize/2, p.y - basePlatSize/2, basePlatSize, basePlatSize, 0, 8, baseColor, 0.45);
      
      // Bright neon jade/gold accent strip on the plate
      const jadeSize = size * 1.25;
      drawFloatingIsoBlock(ctx, p.x - jadeSize/2, p.y - jadeSize/2, jadeSize, jadeSize, 5, 3, secondaryGlowColor, 0.85);

      // 2. TIER 1: Heavy Buttressed Stone Base (z: 8 -> h * 0.3)
      const tier1Z = 8;
      const tier1Height = h * 0.3;
      drawFloatingIsoBlock(ctx, p.x - size/2, p.y - size/2, size, size, tier1Z, tier1Height, stoneColor, 1.0);
      
      // Tier 1 corner buttress blocks matching the tapering image profile
      const butt1 = size * 0.25;
      // NW corner
      drawFloatingIsoBlock(ctx, p.x - size/2 - 2, p.y - size/2 - 2, butt1, butt1, tier1Z, tier1Height * 0.75, darkStoneColor, 1.0);
      // NE corner
      drawFloatingIsoBlock(ctx, p.x + size/2 - butt1 + 2, p.y - size/2 - 2, butt1, butt1, tier1Z, tier1Height * 0.75, darkStoneColor, 1.0);
      // SW corner
      drawFloatingIsoBlock(ctx, p.x - size/2 - 2, p.y + size/2 - butt1 + 2, butt1, butt1, tier1Z, tier1Height * 0.75, darkStoneColor, 1.0);
      // SE corner
      drawFloatingIsoBlock(ctx, p.x + size/2 - butt1 + 2, p.y + size/2 - butt1 + 2, butt1, butt1, tier1Z, tier1Height * 0.75, darkStoneColor, 1.0);

      // 3. TIER 2: Tapered Middle Body (z: 8 + tier1Height -> h * 0.6)
      const tier2Z = tier1Z + tier1Height;
      const tier2Size = size * 0.82;
      const tier2Height = h * 0.3;
      drawFloatingIsoBlock(ctx, p.x - tier2Size/2, p.y - tier2Size/2, tier2Size, tier2Size, tier2Z, tier2Height, stoneColor, 1.0);
      
      // Tier 2 smaller corner buttresses 
      const butt2 = tier2Size * 0.22;
      // NW
      drawFloatingIsoBlock(ctx, p.x - tier2Size/2 - 1, p.y - tier2Size/2 - 1, butt2, butt2, tier2Z, tier2Height * 0.7, darkStoneColor, 1.0);
      // NE
      drawFloatingIsoBlock(ctx, p.x + tier2Size/2 - butt2 + 1, p.y - tier2Size/2 - 1, butt2, butt2, tier2Z, tier2Height * 0.7, darkStoneColor, 1.0);
      // SW
      drawFloatingIsoBlock(ctx, p.x - tier2Size/2 - 1, p.y + tier2Size/2 - butt2 + 1, butt2, butt2, tier2Z, tier2Height * 0.7, darkStoneColor, 1.0);
      // SE
      drawFloatingIsoBlock(ctx, p.x + tier2Size/2 - butt2 + 1, p.y + tier2Size/2 - butt2 + 1, butt2, butt2, tier2Z, tier2Height * 0.7, darkStoneColor, 1.0);

      // 4. TIER 3: Upper Watch Cabin & Arched Windows (z: tier2Z + tier2Height -> h * 0.88)
      const tier3Z = tier2Z + tier2Height;
      const tier3Size = size * 0.68;
      const tier3Height = h * 0.28;
      drawFloatingIsoBlock(ctx, p.x - tier3Size/2, p.y - tier3Size/2, tier3Size, tier3Size, tier3Z, tier3Height, lightStoneColor, 1.0);
      
      // Traditional narrow medieval window slots recessed in the stone face
      // Recessed slot on the front-left face: flat vertical block at X-edge
      drawFloatingIsoBlock(ctx, p.x - tier3Size/2, p.y - 3, 0.5, 6, tier3Z + tier3Height * 0.35, tier3Height * 0.45, '#111827', 1.0);
      // Recessed slot on the front-right face: flat vertical block at Y-edge
      drawFloatingIsoBlock(ctx, p.x - 3, p.y + tier3Size/2, 6, 0.5, tier3Z + tier3Height * 0.35, tier3Height * 0.45, '#111827', 1.0);

      // 5. MACHICOLATIONS: Castle-like Corbelled Promenade Rim (z: tier3Z + tier3Height -> h * 0.94)
      const rimZ = tier3Z + tier3Height;
      const rimSize = size * 0.74; // Slightly wider than tier3 to represent overhang
      const rimHeight = h * 0.06;
      drawFloatingIsoBlock(ctx, p.x - rimSize/2, p.y - rimSize/2, rimSize, rimSize, rimZ, rimHeight, stoneColor, 1.0);
      
      // Mini crenellation blocks on top of the overhang to emphasize fortification
      const crSize = rimSize * 0.15;
      drawFloatingIsoBlock(ctx, p.x - rimSize/2, p.y - rimSize/2, crSize, crSize, rimZ + rimHeight, 4, darkStoneColor, 1.0);
      drawFloatingIsoBlock(ctx, p.x + rimSize/2 - crSize, p.y - rimSize/2, crSize, crSize, rimZ + rimHeight, 4, darkStoneColor, 1.0);
      drawFloatingIsoBlock(ctx, p.x - rimSize/2, p.y + rimSize/2 - crSize, crSize, crSize, rimZ + rimHeight, 4, darkStoneColor, 1.0);
      drawFloatingIsoBlock(ctx, p.x + rimSize/2 - crSize, p.y + rimSize/2 - crSize, crSize, crSize, rimZ + rimHeight, 4, darkStoneColor, 1.0);

      // 6. PYRAMID MASONRY ROOF: 6-level stacked tapering stone tiles with precise geometry (top spire)
      const roofStart = rimZ + rimHeight + 2;
      const roofLayers = 6;
      const roofBaseSize = size * 0.73;
      for(let i = 0; i < roofLayers; i++) {
        const layerSize = roofBaseSize - (i * (roofBaseSize / roofLayers));
        if (layerSize < 2) break;
        const layerZ = roofStart + (i * 6);
        const layerThickness = 8;
        // Dark slate shingles
        drawFloatingIsoBlock(ctx, p.x - layerSize/2, p.y - layerSize/2, layerSize, layerSize, layerZ, layerThickness, isDark ? '#111827' : '#1e293b', 1.0);
      }

      // 7. HIGH-TECH GLOWING NEON CORNER COLUMN (Signature design element from image)
      // Pulsing brightness
      const pulseVal = 0.85 + Math.sin(t * 3.5 + p.y) * 0.15;
      ctx.save();
      ctx.shadowBlur = 18 * pulseVal;
      ctx.shadowColor = shadowColor;
      // Recessed laser chamber: embedded into the front-most corner of tiers 1 and 2
      const beamX = p.x + size * 0.42;
      const beamY = p.y + size * 0.42;
      const beamW = size * 0.08;
      const beamH = size * 0.08;
      const beamZ = tier1Z + 10;
      const beamLen = tier1Height + tier2Height - 12;
      
      // Outer bright neon jade/gold jacket
      drawFloatingIsoBlock(ctx, beamX - beamW/2, beamY - beamH/2, beamW, beamH, beamZ, beamLen, glowColor, 0.85);
      // Inner hot mercury-white core
      drawFloatingIsoBlock(ctx, beamX - (beamW * 0.5)/2, beamY - (beamH * 0.5)/2, beamW * 0.5, beamH * 0.5, beamZ, beamLen, '#ffffff', 0.95 * pulseVal);
      ctx.restore();

      // 8. SCI-FI TRACKING SYSTEMS: Glowing neon holographic arcs circulating around (replaces crude plain ring)
      ctx.save();
      // Translate to center height of the central core
      const hCenterY = piy - (tier2Z + tier2Height/2);
      ctx.shadowBlur = 12;
      ctx.shadowColor = shadowColor;
      
      // A. Main rotating holographic ring 
      ctx.strokeStyle = secondaryGlowColor;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(pix, hCenterY, size * 1.25, size * 0.62, 0, t * 1.1, t * 1.1 + Math.PI * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(pix, hCenterY, size * 1.25, size * 0.62, 0, t * 1.1 + Math.PI, t * 1.1 + Math.PI * 1.4);
      ctx.stroke();

      // B. Inner secondary fast-rotating dotted neon line
      ctx.strokeStyle = tertiaryGlowColor;
      ctx.lineWidth = 1.0;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(pix, hCenterY, size * 0.95, size * 0.48, 0, -t * 1.8, -t * 1.8 + Math.PI * 2);
      ctx.stroke();

      // C. Outer glowing targeting brackets hovering statically on the sides
      ctx.strokeStyle = ringOpacityColor;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([]);
      // Left bracket
      ctx.beginPath();
      ctx.ellipse(pix, hCenterY, size * 1.5, size * 0.75, 0, Math.PI * 0.85, Math.PI * 1.15);
      ctx.stroke();
      // Right bracket
      ctx.beginPath();
      ctx.ellipse(pix, hCenterY, size * 1.5, size * 0.75, 0, -Math.PI * 0.15, Math.PI * 0.15);
      ctx.stroke();
      
      ctx.restore();

      // 8B. SPECIAL ADDITION: For Custom Business Idea Nexuses, render a spinning golden gem and hovering billboard!
      if (p.isCustomBusinessIdea && p.customTitle) {
        const topSpireZ = roofStart + (roofLayers * 6) + 12;
        const crystalYOffset = Math.sin(t * 2.5) * 6;
        const crystalHeight = topSpireZ + 15 + crystalYOffset;
        
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#eab308';
        
        // 3D looking floating diamond
        drawFloatingIsoBlock(ctx, p.x - 4, p.y - 4, 8, 8, crystalHeight, 16, '#facc15', 0.9);
        drawFloatingIsoBlock(ctx, p.x - 1.5, p.y - 1.5, 3, 3, crystalHeight + 4, 8, '#ffffff', 0.95);
        
        // Orbital golden halo
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(pix, piy - crystalHeight - 8, size * 0.6, size * 0.3, 0, t * 1.5, t * 1.5 + Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();

        // Glowing billboard
        ctx.save();
        ctx.font = "900 9px 'JetBrains Mono', monospace";
        const labelText = `✦ NEXUS: ${p.customTitle.toUpperCase()} ✦`;
        const textWidth = ctx.measureText(labelText).width;
        const labelY = piy - crystalHeight - 40;
        
        // Custom background pill card
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        
        const padX = 10, padY = 5;
        const bx = pix - textWidth/2 - padX;
        const by = labelY - 7 - padY;
        const bw = textWidth + padX * 2;
        const bh = 14 + padY * 2;
        
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(bx, by, bw, bh, 6);
        } else {
          ctx.rect(bx, by, bw, bh);
        }
        ctx.fill();
        ctx.stroke();
        
        // Golden text
        ctx.fillStyle = '#facc15';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#eab308';
        ctx.fillText(labelText, pix - textWidth/2, labelY + 2);
        
        ctx.restore();
      }

      // Floating ambient data particles elevating upwards from the glowing base
      const particleColor = p.isCustomBusinessIdea ? '#fef08a' : '#10b981';
      ctx.fillStyle = particleColor;
      ctx.globalAlpha = 0.35;
      for(let i = 0; i < 4; i++) {
        const off = (t * 45 + i * 80) % (h + 30);
        const rx = Math.sin(p.id.length + i * 2) * (size * 0.6);
        const ry = Math.cos(p.id.length + i * 2.5) * (size * 0.6);
        ctx.fillRect(pix + rx - ry, piy + (rx + ry)/2 - off, 2, 6);
      }
      ctx.globalAlpha = 1.0;
    };

    // Draw background watchtowers (NW and NE backgrounds, with depth smaller than the center of compound)
    const midCompoundDepth = WORLD.w/2 + WORLD.h/2;
    allPillars.filter(p => (p.x + p.y) < midCompoundDepth).forEach(drawWatchtower);

    // Draw background Garden Trees
    const backgroundGardenTrees = getGardenTrees().filter(t => (t.x + t.y) < midCompoundDepth);
    backgroundGardenTrees.forEach(t => drawGardenTree(t.x, t.y, t.label, t.progress, t.project));

    // Render sorted Ambient Landscape Cyber Elements (filtered to never sit inside any garden)
    const sortedDecor = decorElements
      .filter(el => !isInsideGarden(el.x, el.y))
      .sort((a, b) => (a.x + a.y) / 2 - (b.x + b.y) / 2);
    
    sortedDecor.forEach(el => {
      // Optimise rendering: only paint elements within viewport radius of camera (1800px)
      const dist = Math.hypot(el.x - px, el.y - py);
      if (dist > 1800) return;

      const tSec = Date.now() / 1000;
      switch (el.type) {
        case 'circuit':
          drawCircuitJunction(ctx, el, tSec, isDark);
          break;
        case 'crystal':
          drawCyberCrystal(ctx, el, tSec, isDark);
          break;
        case 'monolith':
          drawCyberMonolith(ctx, el, tSec, isDark);
          break;
        case 'shrub':
          drawCyberShrub(ctx, el, tSec, isDark);
          break;
      }
    });

    // Loot Cores (Dropped items - Halo Style)
    loots.forEach(l => {
      const pix = toIsoX(l.x, l.y), piy = toIsoY(l.x, l.y);
      const t = Date.now() / 1000;
      const float = Math.sin(t * 5 + l.x) * 5;
      const s = l.strength;
      
      ctx.save();
      
      // Outer Glow
      const grd = ctx.createRadialGradient(pix, piy - 25 + float, 0, pix, piy - 25 + float, 35 * s);
      grd.addColorStop(0, l.color);
      grd.addColorStop(0.5, l.color + '44');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(pix, piy - 25 + float, 35 * s, 0, Math.PI * 2);
      ctx.fill();

      // The "Neural Ring" (Halos from image)
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4 * s;
      ctx.shadowBlur = 15;
      ctx.shadowColor = l.color;
      ctx.beginPath();
      // Draw the torus-like shape
      ctx.ellipse(pix, piy - 25 + float, 18 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Solid Core
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.ellipse(pix, piy - 25 + float, 8 * s, 4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Horizontal flare
      ctx.strokeStyle = '#ffffff88';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pix - 30 * s, piy - 25 + float);
      ctx.lineTo(pix + 30 * s, piy - 25 + float);
      ctx.stroke();

      ctx.restore();
    });

    // Rooms
    ROOMS.forEach(r => {
      const scale = r.id === 'ops' ? 1.8 : 1.0;

      // 3D Plunder base plaque / float shadow for the entire office slab to float above the world grid (matching paper-board look)
      ctx.save();
      ctx.fillStyle = isDark ? 'rgba(2, 6, 23, 0.45)' : 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = isDark ? 'rgba(2,6,23,0.5)' : 'rgba(15,23,42,0.12)';
      ctx.beginPath();
      ctx.moveTo(toIsoX(r.x, r.y), toIsoY(r.x, r.y) + 3);
      ctx.lineTo(toIsoX(r.x + r.w, r.y), toIsoY(r.x + r.w, r.y) + 3);
      ctx.lineTo(toIsoX(r.x + r.w, r.y + r.h), toIsoY(r.x + r.w, r.y + r.h) + 3);
      ctx.lineTo(toIsoX(r.x, r.y + r.h), toIsoY(r.x, r.y + r.h) + 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Room floor with premium solid white-porcelain / obsidian marble style
      ctx.fillStyle = isDark ? '#080d1a' : '#eceaf0';
      ctx.beginPath();
      ctx.moveTo(toIsoX(r.x, r.y), toIsoY(r.x, r.y));
      ctx.lineTo(toIsoX(r.x+r.w, r.y), toIsoY(r.x+r.w, r.y));
      ctx.lineTo(toIsoX(r.x+r.w, r.y+r.h), toIsoY(r.x+r.w, r.y+r.h));
      ctx.lineTo(toIsoX(r.x, r.y+r.h), toIsoY(r.x, r.y+r.h));
      ctx.closePath(); ctx.fill();

      // Flat floor edge border highlights (Clean pristine 3D model framing look)
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // BRANDING GRAPHICS FLAT ON THE FLOOR: Isometric department text stenciled directly on floor (Matching "T AGENT" in the reference)
      ctx.save();
      const fX = toIsoX(r.x + 130 * scale, r.y + 195 * scale);
      const fY = toIsoY(r.x + 130 * scale, r.y + 195 * scale);
      ctx.translate(fX, fY);
      // Align 2D text into perspective of isometric floor
      ctx.scale(1.2 * scale, 0.6 * scale);
      ctx.rotate(-Math.PI / 6);
      ctx.font = `900 ${Math.max(9, Math.round(13 * scale))}px Inter`;
      try {
        // @ts-ignore
        ctx.letterSpacing = '1.8px';
      } catch (e) {}
      ctx.textAlign = 'center';
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 41, 59, 0.045)';
      ctx.fillText(r.name.toUpperCase() + ' UNIT', 0, 0);
      ctx.restore();

      // --- Volumetric Shaded Concrete / Porcelain Wall Setup ---
      const wColor = isDark ? '#1e293b' : '#eae9f0';

      // 1. Back-Right Wall Face (with exquisite top bevel highlights already in helper)
      drawIsoBlock(ctx, r.x + 60 * scale, r.y + 60 * scale, 115 * scale, 14 * scale, 68 * scale, wColor);

      // 2. Back-Left Wall Face (Drawn second to overlay corners perfectly)
      drawIsoBlock(ctx, r.x + 60 * scale, r.y + 74 * scale, 14 * scale, 96 * scale, 68 * scale, wColor);

      // 3. Floating Minimalist Cantilever Desk Bench (flushed against the backwall as single wide floating block)
      // Bottom support mount board
      drawFloatingIsoBlock(ctx, r.x + 72 * scale, r.y + 74 * scale, 90 * scale, 12 * scale, 0, 17 * scale, isDark ? '#111827' : '#cbd5e1');
      // Thick marble Tabletop board
      drawFloatingIsoBlock(ctx, r.x + 68 * scale, r.y + 68 * scale, 96 * scale, 20 * scale, 17 * scale, 5 * scale, isDark ? '#334155' : '#ffffff');

      // 4. Wide Blueprint Cyber Monitor (Mounted flush and wide over the console desk)
      ctx.save();
      const sY = r.y + 74 * scale; // Wall plane
      const sL = r.x + 76 * scale;
      const sW = 80 * scale; // wide screen format
      const sH = 33 * scale;
      const sZ = 28 * scale; // desk height offset

      const tLX = toIsoX(sL, sY), tLY = toIsoY(sL, sY) - (sZ + sH);
      const tRX = toIsoX(sL + sW, sY), tRY = toIsoY(sL + sW, sY) - (sZ + sH);
      const bRX = toIsoX(sL + sW, sY), bRY = toIsoY(sL + sW, sY) - sZ;
      const bLX = toIsoX(sL, sY), bLY = toIsoY(sL, sY) - sZ;

      // Dark slate backing of the monitor
      ctx.fillStyle = '#0a0d17';
      ctx.strokeStyle = '#06b6d4'; // bright glowing cyan border
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tLX, tLY);
      ctx.lineTo(tRX, tRY);
      ctx.lineTo(bRX, bRY);
      ctx.lineTo(bLX, bLY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Advanced Cyber UI HUD Overlays inside the terminal
      const midXC = toIsoX(sL + 40 * scale, sY);
      const midYC = toIsoY(sL + 40 * scale, sY) - (sZ + sH/2);

      // Radial coordinate grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(midXC, midYC, 13 * scale, 6.5 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.beginPath();
      ctx.ellipse(midXC, midYC, 7 * scale, 3.5 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Sweeping radar beam indicator rotating actively
      const rAngle = (Date.now() / 1000) % (Math.PI * 2);
      ctx.strokeStyle = '#22c55e'; // green sweep
      ctx.beginPath();
      ctx.moveTo(midXC, midYC);
      ctx.lineTo(midXC + Math.cos(rAngle) * 11 * scale, midYC + Math.sin(rAngle) * 5.5 * scale);
      ctx.stroke();

      // Left monitoring grids / horizontal bars
      ctx.strokeStyle = 'rgba(6,182,212,0.4)';
      ctx.beginPath();
      ctx.moveTo(toIsoX(sL + 8 * scale, sY), toIsoY(sL + 8 * scale, sY) - (sZ + 9 * scale));
      ctx.lineTo(toIsoX(sL + 24 * scale, sY), toIsoY(sL + 24 * scale, sY) - (sZ + 9 * scale));
      ctx.moveTo(toIsoX(sL + 8 * scale, sY), toIsoY(sL + 8 * scale, sY) - (sZ + 14 * scale));
      ctx.lineTo(toIsoX(sL + 20 * scale, sY), toIsoY(sL + 20 * scale, sY) - (sZ + 14 * scale));
      ctx.stroke();

      // Right monitoring data waves
      ctx.strokeStyle = '#a855f7'; // Purple audio/code stream signals
      ctx.beginPath();
      for (let wx = 12; wx <= 26; wx += 2) {
        const wy = Math.sin(wx * 0.7 + Date.now()/120) * 2 * scale;
        ctx.lineTo(toIsoX(sL + (50 + wx) * scale, sY), toIsoY(sL + (50 + wx) * scale, sY) - (sZ + 16 * scale + wy));
      }
      ctx.stroke();

      ctx.restore();

      // 5. Solid Right-Hand Wall with cutout for glass pane
      // Segment 5a: Tall back segment
      drawIsoBlock(ctx, r.x + 161 * scale, r.y + 74 * scale, 14 * scale, 30 * scale, 68 * scale, wColor);

      // Segment 5b: Low wall sill
      drawIsoBlock(ctx, r.x + 161 * scale, r.y + 104 * scale, 14 * scale, 56 * scale, 24 * scale, wColor);

      // Glass recess slot: a thin dark slot on top of Segment 5b (Z: 22 to 24) to frame glass
      drawFloatingIsoBlock(ctx, r.x + 166 * scale, r.y + 104 * scale, 4 * scale, 56 * scale, 22 * scale, 2.2 * scale, isDark ? '#020617' : '#94a3b8');

      // 6. Holographic Cyan Glass Partition Screen
      ctx.save();
      ctx.beginPath();
      const glassBaseX = r.x + 168 * scale; 
      const glassBaseY1 = r.y + 160 * scale;
      const glassBaseY2 = r.y + 104 * scale;
      
      const p1X = toIsoX(glassBaseX, glassBaseY1);
      const p1Y = toIsoY(glassBaseX, glassBaseY1) - 24 * scale;
      const p2X = toIsoX(glassBaseX, glassBaseY2);
      const p2Y = toIsoY(glassBaseX, glassBaseY2) - 24 * scale;
      const glassH = 34 * scale;

      ctx.moveTo(p1X, p1Y);
      ctx.lineTo(p2X, p2Y);
      ctx.lineTo(p2X, p2Y - glassH);
      ctx.lineTo(p1X, p1Y - glassH);
      ctx.closePath();
      
      // Beautiful glass face with shimmer reflection
      const glassGrd = ctx.createLinearGradient(p1X, p1Y, p2X, p2Y - glassH);
      glassGrd.addColorStop(0, isDark ? 'rgba(6, 182, 212, 0.28)' : 'rgba(14, 116, 144, 0.22)');
      glassGrd.addColorStop(0.35, 'rgba(255, 255, 255, 0.25)'); // rich light shimmer highlight
      glassGrd.addColorStop(0.65, isDark ? 'rgba(6, 182, 212, 0.35)' : 'rgba(14, 116, 144, 0.24)');
      glassGrd.addColorStop(1, isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(14, 116, 144, 0.16)');
      ctx.fillStyle = glassGrd;
      ctx.fill();

      // Glowing neon cyan glass edges
      ctx.strokeStyle = isDark ? 'rgba(34, 211, 238, 0.85)' : 'rgba(8, 145, 178, 0.72)';
      ctx.lineWidth = 1.35;
      ctx.stroke();

      // Draw high-tech micro dots code streams on glass (Dense streams matching the reference)
      ctx.fillStyle = isDark ? 'rgba(34, 211, 238, 0.8)' : 'rgba(8, 145, 178, 0.65)';
      const tSecs = Date.now() / 1000;
      for (let gy = glassBaseY2 + 5 * scale; gy <= glassBaseY1 - 5 * scale; gy += 4.5 * scale) {
        // Draw vertical columns of streams
        const speed = 1.5 + (gy % 3) * 0.5;
        const offset = Math.floor(tSecs * speed + gy) % 6;
        for (let gz = 5 * scale; gz <= 28 * scale; gz += 4.5 * scale) {
          // Skip certain dots to simulate scrolling matrix binary streams
          if (Math.floor(gz + offset) % 5 === 0) continue;
          ctx.beginPath();
          ctx.arc(toIsoX(glassBaseX, gy), toIsoY(glassBaseX, gy) - (24 * scale + gz), 0.75 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // Segment 5c: Tall front stub wall (Drawn after glass partition so it overlays the glass edge correctly in 3D perspective space)
      drawIsoBlock(ctx, r.x + 161 * scale, r.y + 160 * scale, 14 * scale, 18 * scale, 68 * scale, wColor);

      // Unique High-Tech furniture for ZENTRALE (Command & Automation Office)
      if (r.id === 'ops') {
        // 1. High-Tech Cyber Network Server Tower Cabinet (drawn against the back-left wall plane)
        const srX = r.x + 74 * scale;
        const srY = r.y + 195 * scale;
        const srW = 20 * scale;
        const srD = 32 * scale;
        const srH = 80 * scale;
        
        drawFloatingIsoBlock(ctx, srX, srY, srW, srD, 0, srH, isDark ? '#020617' : '#0f172a');
        
        ctx.save();
        const tSecs = Date.now() / 1000;
        for (let sz = 10 * scale; sz < srH - 5 * scale; sz += 11 * scale) {
          const pFrontXX = srX + srW;
          const pFrontY1 = srY;
          const pFrontY2 = srY + srD;
          
          ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.18)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(toIsoX(pFrontXX, pFrontY1), toIsoY(pFrontXX, pFrontY1) - sz);
          ctx.lineTo(toIsoX(pFrontXX, pFrontY2), toIsoY(pFrontXX, pFrontY2) - sz);
          ctx.stroke();
          
          const blink = Math.sin(tSecs * 6 + sz) > 0;
          ctx.fillStyle = blink ? '#22c55e' : '#ef4444';
          ctx.beginPath();
          ctx.arc(toIsoX(pFrontXX + 1.2, pFrontY1 + srD * 0.25), toIsoY(pFrontXX + 1.2, pFrontY1 + srD * 0.25) - (sz + 4), 1.5, 0, Math.PI * 2);
          ctx.arc(toIsoX(pFrontXX + 1.2, pFrontY1 + srD * 0.55), toIsoY(pFrontXX + 1.2, pFrontY1 + srD * 0.55) - (sz + 4), 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 2. Elegant central Holographic System Projection Pedestal (stands in the spacious center-foreground)
        const pX = r.x + 280;
        const pY = r.y + 280;
        const baseSize = 35;
        
        drawFloatingIsoBlock(ctx, pX - baseSize/2, pY - baseSize/2, baseSize, baseSize, 0, 10, isDark ? '#1e293b' : '#cbd5e1');
        drawFloatingIsoBlock(ctx, pX - (baseSize * 0.72)/2, pY - (baseSize * 0.72)/2, baseSize * 0.72, baseSize * 0.72, 10, 4, '#06b6d4', 0.85);

        // Animated floating holographic orb
        ctx.save();
        const hZ = 45; 
        const hPixX = toIsoX(pX, pY);
        const hPixY = toIsoY(pX, pY) - hZ;
        const t = Date.now() / 1000;
        
        const rad = 24;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#06b6d4';
        const grd = ctx.createRadialGradient(hPixX, hPixY, 2, hPixX, hPixY, rad);
        grd.addColorStop(0, '#ffffff');
        grd.addColorStop(0.3, isDark ? 'rgba(34, 211, 238, 0.45)' : 'rgba(14, 116, 144, 0.35)');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(hPixX, hPixY, rad, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(hPixX, hPixY, rad * 1.3, rad * 0.5, t * 1.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(hPixX, hPixY, rad * 1.15, rad * 0.45, -t * 1.6, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        const pulse = 1.0 + Math.sin(t * 8) * 0.25;
        ctx.beginPath();
        ctx.arc(hPixX + Math.sin(t * 4) * 3, hPixY + Math.cos(t * 4) * 2, 4 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      // 8. Dynamic Hovering Room Label Box
      ctx.save();
      const lx_ground = r.x - 12;
      const ly_ground = r.y + r.h / 2;
      const ix_ground = toIsoX(lx_ground, ly_ground);
      const iy_ground = toIsoY(lx_ground, ly_ground);
      const z_height = 55;

      // Vertical holographic leader line from floor to indicator
      ctx.strokeStyle = isDark ? 'rgba(96, 165, 250, 0.4)' : 'rgba(37, 99, 235, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ix_ground, iy_ground);
      ctx.lineTo(ix_ground, iy_ground - z_height);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Hologram glowing platform node on the ground
      ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
      ctx.beginPath();
      ctx.arc(ix_ground, iy_ground, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Top floating pill label box
      ctx.font = 'bold 11px Inter';
      try {
        // @ts-ignore
        ctx.letterSpacing = '1.2px';
      } catch (e) {}
      
      const textWidth = ctx.measureText(r.name).width + 18;
      const rectX = ix_ground - textWidth / 2;
      const rectY = iy_ground - z_height - 12;

      // Outer glassy capsule badge
      ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = isDark ? '#3b82f6' : '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(rectX, rectY, textWidth, 22, 5);
      } else {
        ctx.rect(rectX, rectY, textWidth, 22);
      }
      ctx.fill();
      ctx.stroke();

      // Text inside the badge-pill
      ctx.fillStyle = isDark ? '#ffffff' : '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText(r.name.toUpperCase(), ix_ground, iy_ground - z_height + 3);
      ctx.restore();
    });

    // Officers (dynamic stateful AI pathfinding agents)
    officersRef.current.forEach(o => drawCharacter(ctx, o.x, o.y, o.color, o.name, o.role, false, o.isMoving));

    // Player
    const keys = keysRef.current;
    const isMoving = !!(keys['w'] || keys['s'] || keys['a'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright']);
    drawCharacter(ctx, px, py, '#22c55e', 'COMMANDER', '', true, isMoving);

    // Draw carried item
    if (carriedLoot) {
      const pix = toIsoX(px, py), piy = toIsoY(px, py);
      const bob = Math.sin(Date.now() / 200) * 5;
      
      ctx.fillStyle = carriedLoot.color;
      ctx.shadowBlur = 15; ctx.shadowColor = carriedLoot.color;
      ctx.beginPath();
      ctx.ellipse(pix, piy - 80 + bob, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = isDark ? '#fff' : '#000';
      ctx.font = 'bold 10px Inter';
      ctx.fillText(carriedLoot.title.toUpperCase(), pix, piy - 100 + bob);
    }

    // Draw foreground fences & remaining corner pillars (depth-sorted to sit in front of players/rooms)
    drawFenceSegment(WORLD.w, 0, wallT, WORLD.h);       // East Wall (perfect alignment, no protrusion)
    drawFenceSegment(0, WORLD.h, WORLD.w, wallT, true); // South Wall (Portal) (perfect alignment, no protrusion)
    drawPillar(WORLD.w + 6, -6);                        // NE Corner Pillar
    drawPillar(-6, WORLD.h + 6);                        // SW Corner Pillar
    drawPillar(WORLD.w + 6, WORLD.h + 6);              // SE Corner Pillar

    // Draw foreground watchtowers so they lay perfectly on top of any fences / rooms / players in the foreground
    allPillars.filter(p => (p.x + p.y) >= midCompoundDepth).forEach(drawWatchtower);

    // Draw foreground Garden Trees
    const foregroundGardenTrees = getGardenTrees().filter(t => (t.x + t.y) >= midCompoundDepth);
    foregroundGardenTrees.forEach(t => drawGardenTree(t.x, t.y, t.label, t.progress, t.project));

    ctx.restore();
  }, [theme, pillars, allPillars, loots, carriedLoot, zoom]);

  const updateRef = useRef(update);
  const renderRef = useRef(render);
  useEffect(() => { updateRef.current = update; }, [update]);
  useEffect(() => { renderRef.current = render; }, [render]);

  useEffect(() => {
    const loop = (t: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = t;
        frameRef.current = requestAnimationFrame(loop);
        return;
      }
      const dt = (t - lastTimeRef.current) / 1000;
      lastTimeRef.current = t;
      
      updateRef.current(Math.min(0.05, dt));
      renderRef.current();
      
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);

    const kd = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;
      if (key === 'escape') {
        setActiveIdeaDetail(null);
        // ESC fuer das Uplink-Dashboard wird komplett von DesktopDashboard
        // verwaltet (erst Agenten-Detail schliessen, dann das ganze Board
        // via onClose). Daher hier KEIN setShowUplinkOverview(false), sonst
        // wuerde das Board immer sofort komplett geschlossen.
      }
      if (key === 'e') {
        // Check if near any garden tree
        const trees = getGardenTrees();
        const nearTree = trees.find(t => Math.hypot(t.x - playerPosRef.current.x, t.y - playerPosRef.current.y) < 110);
        if (nearTree) {
          playSynthSound('click');
          setSelectedIdeationMode(nearTree.project.ideationMode || "Gap Attack");
          setActiveIdeaDetail({
            id: nearTree.project.id,
            x: 0, y: 0, vx: 0, vy: 0,
            title: nearTree.project.name,
            description: nearTree.project.descriptionSnippet || "Neurales Keim-Saatgut.",
            strength: nearTree.project.refinedData ? 1.5 : 1.0,
            serendipity: nearTree.project.refinedData ? 0.95 : 0.60,
            color: "#3b82f6",
            collected: true,
            projectId: nearTree.project.id
          });
          keysRef.current['e'] = false;
          return;
        }

        // First check for 3D room entry
        const room = ROOMS.find(r => 
           playerPosRef.current.x > r.x && playerPosRef.current.x < r.x + r.w &&
           playerPosRef.current.y > r.y && playerPosRef.current.y < r.y + r.h
        );
        if (room && !carriedLoot) {
           if (room.id === 'ops') {
             setShowUplinkOverview(true);
           } else {
             setActiveRoomId(room.id);
           }
           keysRef.current['e'] = false;
           return;
        }

        const o = dynamicOfficers.find(off => Math.hypot(off.x - playerPosRef.current.x, off.y - playerPosRef.current.y) < 60);
        if (o) { setActiveOfficer(o); setMessages([]); }
      }
      if (key === 'f') {
        const termX = 300, termY = 300;
        const nearTerminal = Math.hypot(playerPosRef.current.x - termX, playerPosRef.current.y - termY) < 100;
        if (nearTerminal) {
          setShowUplinkOverview(true);
          keysRef.current['f'] = false;
        }
      }
    };
    const ku = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    return () => { 
      window.removeEventListener('keydown', kd); 
      window.removeEventListener('keyup', ku); 
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(prev => {
        const delta = -e.deltaY * 0.0012;
        const nextZoom = Math.max(0.4, Math.min(2.2, prev + delta));
        return nextZoom;
      });
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || e.button === 2) {
        e.preventDefault();
        isDraggingRef.current = true;
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      cameraOffsetRef.current.x += dx * 1.4;
      cameraOffsetRef.current.y += dy * 1.4;
      
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      
      if (!hasCameraOffset) {
        setHasCameraOffset(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1 || e.button === 2) {
        isDraggingRef.current = false;
        canvas.style.cursor = 'default';
      }
    };

    const handleAuxClick = (e: MouseEvent) => {
      if (e.button === 1 || e.button === 2) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDoubleClick = (e: MouseEvent) => {
      cameraOffsetRef.current = { x: 0, y: 0 };
      setHasCameraOffset(false);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('auxclick', handleAuxClick);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('auxclick', handleAuxClick);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [hasCameraOffset]);


  const handleChat = async () => {
    if (!chatInp.trim() || !activeOfficer) return;
    const msg = chatInp; setChatInp('');
    const newHistory = [...messages, { role: 'user', parts: [{ text: msg }] }];
    setMessages(newHistory); setIsTyping(true);
    try {
      const res = await chatWithOfficer(activeOfficer.prompt, newHistory.slice(0, -1), msg);
      setMessages([...newHistory, { role: 'model', parts: [{ text: res }] }]);
    } catch (e) { console.error(e); }
    setIsTyping(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`w-full h-screen font-sans selection:bg-green-500/30 overflow-hidden relative transition-colors duration-700 ${isDark ? 'bg-[#020617] text-[#f8fafc] dark-theme' : 'bg-[#fcfcfd] text-[#0f172a] light-theme'}`}>
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#020512] p-8 select-none flex flex-col items-center justify-center text-center overflow-hidden"
          >
            <style>{`
              @keyframes twinkle {
                0%, 100% { opacity: 0.15; transform: scale(0.75); }
                50% { opacity: 1; transform: scale(1.3); }
              }
              @keyframes nebulaDriftA {
                0%, 100% { transform: translate(0px, 0px) scale(1); }
                50% { transform: translate(40px, -30px) scale(1.1); }
              }
              @keyframes nebulaDriftB {
                0%, 100% { transform: translate(0px, 0px) scale(1.2); }
                50% { transform: translate(-35px, 20px) scale(0.95); }
              }
              @keyframes shootingStarRun {
                0% { transform: translate(-300px, -300px) rotate(45deg); opacity: 0; }
                5% { opacity: 1; }
                15% { transform: translate(800px, 800px) rotate(45deg); opacity: 0; }
                100% { transform: translate(800px, 800px) rotate(45deg); opacity: 0; }
              }
              @keyframes shineGlance {
                0% { left: -150%; }
                40% { left: 150%; }
                100% { left: 150%; }
              }
              .shiny-btn-glow {
                animation: shineGlance 4.5s infinite linear;
              }
            `}</style>

            {/* Glowing Cosmic Nebulae Backgrounds */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#020512] transition-all">
              <div 
                className="absolute -top-[10%] -left-[10%] w-[65%] h-[65%] rounded-full bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.4)_0%,transparent_70%)] blur-[90px]"
                style={{ animation: 'nebulaDriftA 25s infinite ease-in-out' }}
              />
              <div 
                className="absolute -bottom-[15%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.35)_0%,transparent_70%)] blur-[110px]"
                style={{ animation: 'nebulaDriftB 30s infinite ease-in-out' }}
              />
              <div 
                className="absolute top-[30%] left-[35%] w-[55%] h-[55%] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_75%)] blur-[95px]"
                style={{ animation: 'nebulaDriftA 20s infinite ease-in-out' }}
              />

              {/* Perspective Cyber Grid */}
              <div 
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: '45px 45px',
                  transform: 'perspective(500px) rotateX(70deg) scale(2.2) translateY(-80px)',
                  transformOrigin: 'top center',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 80%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 80%)',
                }}
              />

              {/* Twinkling Stars */}
              {introStars.map((star, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white opacity-40 shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                  style={{
                    left: star.left,
                    top: star.top,
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    animation: `twinkle ${star.duration} infinite ease-in-out`,
                    animationDelay: star.delay,
                  }}
                />
              ))}

              {/* Shooting Stars */}
              <div 
                className="absolute top-[15%] left-[15%] w-[130px] h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-white transform rotate-[42deg] blur-[0.5px] opacity-0"
                style={{
                  animation: 'shootingStarRun 14s infinite linear',
                  animationDelay: '1s'
                }}
              />
              <div 
                className="absolute top-[35%] left-[55%] w-[160px] h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-white transform rotate-[42deg] blur-[0.5px] opacity-0"
                style={{
                  animation: 'shootingStarRun 19s infinite linear',
                  animationDelay: '7.5s'
                }}
              />
            </div>

            <motion.div initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="flex flex-col items-center relative z-10 w-full max-w-4xl px-4">
              {introStep === 0 ? (
                <div className="flex flex-col items-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                  <h1 className="text-8xl md:text-9xl font-black text-white tracking-tighter filter drop-shadow-[0_0_40px_rgba(59,130,246,0.35)] mb-3 animate-pulse">
                    VayWorld
                  </h1>
                  <div className="text-xl md:text-2xl font-mono text-blue-400 tracking-[0.3em] uppercase mb-12 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">
                    DIGITAL OFFICE EDITION
                  </div>
                  
                  <div className="max-w-md text-slate-300 font-medium leading-relaxed mb-14 italic text-sm md:text-base border-y border-white/5 py-4 px-6 bg-slate-950/20 backdrop-blur-xs rounded-xl">
                    Deine Ideenwelt. Deine Räume. Deine Agenten.
                  </div>
     
                  <div className="flex flex-col gap-4 items-center w-full max-w-xs">
                    {/* Primary Button: Welt Betreten */}
                    <button 
                      onClick={() => {
                        playSynthSound('unlock');
                        setPlayer(p => ({ ...p, x: 400, y: 400 }));
                        setShowIntro(false);
                      }}
                      className="group relative w-full px-12 py-4.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 border border-blue-400/80 rounded-2xl cursor-pointer overflow-hidden shadow-[0_0_25px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_50px_rgba(29,78,216,0.6)] hover:border-blue-300 active:scale-[0.97]"
                    >
                      {/* Shimmer sweeping beam */}
                      <div className="absolute inset-y-0 top-0 h-[100%] w-[35%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none shiny-btn-glow" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25)_0%,transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="absolute inset-0 -m-0.5 rounded-2.5xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-300" />
                      
                      <span className="relative z-10 text-white font-black text-lg tracking-[0.1em] uppercase italic flex items-center justify-center gap-3">
                        WELT BETRETEN
                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="inline-block">➔</motion.span>
                      </span>
                    </button>

                    {/* Secondary Button: Einführung */}
                    <button 
                      onClick={() => {
                        playSynthSound('click');
                        setIntroStep(1);
                      }}
                      className="group relative w-full px-12 py-3.5 bg-slate-950/60 hover:bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_35px_rgba(16,185,129,0.25)] active:scale-[0.98]"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <span className="relative z-10 text-emerald-400 font-bold text-xs tracking-[0.1em] uppercase flex items-center justify-center gap-2">
                        💡 EINFÜHRUNG
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-slate-950/75 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 flex flex-col items-center justify-between shadow-[0_25px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
                  {/* Decorative corner wireframes */}
                  <div className="absolute top-4 left-4 font-mono text-[9px] text-blue-500/60 tracking-wider">ONBOARDING // SCENE_0{introStep}</div>
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${introStep === step ? 'bg-emerald-400 scale-125 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-700'}`} />
                    ))}
                  </div>

                  {/* Dynamic Abstract Artports / Artworks */}
                  <div className="h-44 md:h-52 w-full flex items-center justify-center relative mb-6">
                    {/* Scene 1 Artwork: The Seed of Idea */}
                    {introStep === 1 && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-24 h-24 rounded-full border border-emerald-500/20 animate-spin" style={{ animationDuration: '8s' }} />
                        <div className="absolute w-32 h-32 rounded-full border-dashed border-cyan-400/30 animate-spin" style={{ animationDuration: '14s' }} />
                        <div className="absolute w-40 h-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] blur-md" />
                        
                        {/* Glowing core seed capsule */}
                        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 shadow-[0_0_35px_rgba(16,185,129,0.8)] flex items-center justify-center animate-pulse">
                          <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_12px_white] animate-ping" />
                        </div>
                        {/* Orbiting particles */}
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                          <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_8px_#facc15] animate-bounce" style={{ transform: 'translateX(-40px) translateY(-20px)' }} />
                          <div className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_#c084fc] animate-bounce" style={{ transform: 'translateX(35px) translateY(15px)', animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    )}

                    {/* Scene 2 Artwork: The Digital Sprout seedling */}
                    {introStep === 2 && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-36 h-36 rounded-full border border-purple-500/25 animate-spin" style={{ animationDuration: '10s' }} />
                        <div className="absolute w-28 h-28 rounded-full border-dashed border-purple-400/20" />
                        <div className="absolute w-48 h-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] blur-md" />
                        
                        {/* Vector Sprout */}
                        <div className="relative flex flex-col items-center">
                          {/* Left sprout leaf branch */}
                          <div className="absolute -left-10 top-2 w-8 h-8 rounded-bl-3xl border-b-2 border-l-2 border-emerald-400/85 transform rotate-12 flex items-start justify-start">
                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full -mt-1.5 -ml-1.5 shadow-[0_0_8px_#10b981]" />
                          </div>
                          {/* Right sprout leaf branch */}
                          <div className="absolute -right-10 top-0 w-8 h-8 rounded-br-3xl border-b-2 border-r-2 border-cyan-400/85 transform -rotate-12 flex items-start justify-end">
                            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full -mt-1.5 -mr-1.5 shadow-[0_0_8px_#06b6d4]" />
                          </div>
                          {/* Main cord stem */}
                          <div className="w-1.5 h-20 bg-gradient-to-t from-purple-800 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] flex items-start justify-center">
                            <div className="w-6 h-6 rounded-t-full rounded-bl-full bg-gradient-to-br from-white to-emerald-400 shadow-[0_0_20px_#10b981] transform rotate-45 -mt-3 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scene 3 Artwork: Majestic Mature Idea World Tree */}
                    {introStep === 3 && (
                      <div className="relative flex items-center justify-center animate-pulse">
                        <div className="absolute w-48 h-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25)_0%,transparent_80%)] blur-xl" />
                        
                        {/* Foliage spheres cluster */}
                        <div className="absolute -top-6 flex gap-1 justify-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/40 blur-xs shadow-[0_0_25px_#10b981]" />
                          <div className="w-12 h-12 rounded-full bg-cyan-500/40 blur-xs shadow-[0_0_25px_#06b6d4] -mt-3" />
                          <div className="w-10 h-10 rounded-full bg-purple-500/40 blur-xs shadow-[0_0_25px_#a855f7]" />
                        </div>
                        
                        {/* Sprout and Orbiting Spark Rings */}
                        <div className="relative flex flex-col items-center">
                          <div className="absolute -top-4 w-32 h-10 rounded-full border border-white/20 transform rotate-[-12deg] skew-x-12" />
                          <div className="w-3.5 h-24 bg-gradient-to-t from-slate-950 via-purple-600 to-emerald-400 rounded-full shadow-[0_0_14px_rgba(168,85,247,0.4)] flex justify-center items-start">
                            <div className="absolute w-2.5 h-2.5 bg-yellow-400 rounded-full -mt-2 -ml-8 shadow-[0_0_10px_#facc15] animate-bounce" />
                            <div className="absolute w-2.5 h-2.5 bg-rose-400 rounded-full -mt-4 ml-8 shadow-[0_0_10px_#f43f5e] animate-bounce" />
                          </div>
                        </div>
                        
                        {/* Sparkling pollen particle rain */}
                        <div className="absolute w-full h-full font-mono text-[8px] text-yellow-300 flex justify-center items-center pointer-events-none">
                          <div className="absolute animate-ping text-emerald-400 text-sm" style={{ transform: 'translateX(-60px) translateY(40px)', animationDuration: '3s' }}>✦</div>
                          <div className="absolute animate-ping text-yellow-300 text-xs" style={{ transform: 'translateX(65px) translateY(-25px)', animationDuration: '2.5s' }}>✧</div>
                          <div className="absolute animate-ping text-cyan-300 text-sm" style={{ transform: 'translateX(-30px) translateY(-50px)', animationDuration: '4s' }}>✦</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scene Title */}
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase mb-4 text-center">
                    {introStep === 1 && "SZENE 1: AUS EINER IDEE WIRD EIN SYSTEM"}
                    {introStep === 2 && "SZENE 2: DEINE ARBEIT BEKOMMT STRUKTUR"}
                    {introStep === 3 && "SZENE 3: FORTSCHRITT WIRD SICHTBAR"}
                  </h2>

                  {/* Screen Text Block */}
                  <p className="max-w-2xl text-slate-300 text-sm md:text-base leading-relaxed text-center font-medium border-t border-white/10 pt-6 px-4 mb-8">
                    {introStep === 1 && "Viele gute Ideen gehen im Alltag verloren: zwischen Nachrichten, Aufgaben, Ablenkung und offenen Projekten. VayWorld ist der Ort, an dem du ein Vorhaben nicht nur notierst, sondern in ein klares System überführst. Aus einem Gedanken wird ein Projekt. Aus einem Projekt wird ein nächster Schritt."}

                    {introStep === 2 && "Deine reale Arbeit wird hier strukturiert abgebildet. Projekte, Ziele und Aufgaben werden in Bereiche übersetzt, die du steuern kannst: Strategie, Recherche, Umsetzung und Auswertung. KI-Agenten helfen dir dabei, Informationen zu ordnen, Entscheidungen vorzubereiten und aus offenen Ideen konkrete Arbeitsaufträge zu machen."}

                    {introStep === 3 && "VayWorld zeigt dir, was sonst unsichtbar bleibt: Fortschritt, offene Baustellen, wiederkehrende Muster und nächste sinnvolle Schritte. Du bekommst klare Analysen, bessere Übersicht und eine Arbeitsumgebung, die dich dabei unterstützt, aus Ideen echte Ergebnisse zu machen."}
                  </p>


                  {/* Slideshow Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                    <button 
                      onClick={() => {
                        playSynthSound('click');
                        setIntroStep(prev => Math.max(0, prev - 1));
                      }}
                      className="px-6 py-2 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all"
                    >
                      zurück
                    </button>

                    {introStep < 3 ? (
                      <button 
                        onClick={() => {
                          playSynthSound('unlock');
                          setIntroStep(prev => prev + 1);
                        }}
                        className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all font-black text-sm tracking-wider uppercase flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
                      >
                        {introStep === 1 && "SZENE 2 ANSEHEN"}
                        {introStep === 2 && "SZENE 3 ANSEHEN"}
                        <span>➔</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          playSynthSound('unlock');
                          setPlayer(p => ({ ...p, x: 400, y: 400 })); // Spawn in center of Office compound
                          setShowIntro(false);
                        }}
                        className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 rounded-xl cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all font-black text-sm tracking-wider uppercase flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
                      >
                        WELT BETRETEN!
                        <span>➔</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
            
            <div className="absolute bottom-8 text-[9px] font-mono text-slate-500 tracking-[0.5em] uppercase z-10 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              SYSTEM READY // NODE CLUSTER 49
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Zoom-Steuerung (Rechte Seite über Minimap) */}
      {showDashboards && (
        <div className="absolute right-8 bottom-[285px] flex flex-col items-center gap-2 pointer-events-auto z-30">
          <div className={`p-2.5 rounded-2xl border shadow-2xl flex flex-col items-center gap-2.5 transition-all ${isDark ? 'bg-slate-900/90 backdrop-blur-md border-slate-700/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-white/90 backdrop-blur-md border-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.15)]'}`}>
            <button
              onClick={() => setZoom(z => Math.min(2.2, z + 0.15))}
              title="Vergrößern (Scrollen)"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 border-slate-200 text-blue-600 hover:bg-slate-100 hover:text-black'}`}
            >
              <ZoomIn size={18} />
            </button>
            
            <div className="flex flex-col items-center select-none font-black font-mono text-[10px] leading-none">
              <span className={isDark ? 'text-slate-300' : 'text-slate-800'}>{Math.round(zoom * 100)}%</span>
              <span className="text-[7px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Zoom</span>
            </div>
            
            <button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              title="Verkleinern (Scrollen)"
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700 hover:text-white' : 'bg-slate-50 border-slate-200 text-blue-600 hover:bg-slate-100 hover:text-black'}`}
            >
              <ZoomOut size={18} />
            </button>
            
            <button
              onClick={() => setZoom(1.0)}
              title="Zoom zurücksetzen"
              className={`w-10 py-1 rounded text-[8px] font-black font-mono tracking-tighter transition-all border ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 hover:bg-white text-slate-600 hover:text-black'}`}
            >
              RESET
            </button>

            {hasCameraOffset && (
              <button
                onClick={() => {
                  cameraOffsetRef.current = { x: 0, y: 0 };
                  setHasCameraOffset(false);
                }}
                title="Kamera auf Spieler zentrieren (Doppelklick auf Karte)"
                className={`w-10 h-10 mt-1 rounded-xl border flex flex-col items-center justify-center transition-all animate-pulse ${isDark ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500 hover:text-black hover:border-green-500' : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-500 hover:text-white'}`}
              >
                <Target size={18} />
                <span className="text-[6px] font-black uppercase tracking-tighter mt-0.5">Focus</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Minimap (Bottom Right) */}
      {showDashboards && (
        <div className="absolute bottom-8 right-8 flex items-end gap-4 z-30">
          <button 
            onClick={() => setShowSkillTree(true)}
            className={`group flex flex-col items-center justify-center w-20 h-20 rounded-2xl border backdrop-blur-md transition-all shadow-2xl ${isDark ? 'bg-slate-950/80 border-slate-700 hover:border-yellow-500/50' : 'bg-white/80 border-slate-200 hover:border-yellow-500/50'}`}
          >
             <Lightning className={`transition-transform group-hover:scale-110 ${isDark ? 'text-yellow-500/50 group-hover:text-yellow-500' : 'text-yellow-600/50 group-hover:text-yellow-500'}`} size={32} />
             <span className="text-[8px] font-black uppercase tracking-widest mt-2">Skills [K]</span>
          </button>
          <button
            onClick={() => { setTutorialStep(0); setShowTutorial(true); }}
            title="Anleitung / Tutorial"
            className={`group flex flex-col items-center justify-center w-20 h-20 rounded-2xl border backdrop-blur-md transition-all shadow-2xl ${isDark ? 'bg-slate-950/80 border-slate-700 hover:border-cyan-500/50' : 'bg-white/80 border-slate-200 hover:border-cyan-500/50'}`}
          >
             <Info className={`transition-transform group-hover:scale-110 ${isDark ? 'text-cyan-500/50 group-hover:text-cyan-400' : 'text-cyan-600/50 group-hover:text-cyan-500'}`} size={32} />
             <span className="text-[8px] font-black uppercase tracking-widest mt-2">Hilfe</span>
          </button>

          <div className={`w-48 h-48 rounded-2xl border backdrop-blur-md overflow-hidden transition-all shadow-2xl ${isDark ? 'bg-slate-950/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
            <div className="absolute inset-0 p-4">
               <div className="w-full h-full relative border border-slate-700/20 bg-black/5 rounded">
                  {/* HQ Marker */}
                  <div className="absolute left-1/2 top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white/40 border border-white/50 rounded-sm" />
                  {/* Pillar Dots */}
                  {(save.unlockedSkills.includes('vision') ? allPillars : []).map(p => (
                    <div key={p.id} className={`absolute rounded-full ${p.isCustomBusinessIdea ? 'w-1.5 h-1.5 bg-yellow-400 border border-yellow-300 shadow-[0_0_5px_#eab308]' : 'w-1 h-1 bg-green-500'}`} 
                         style={{ 
                           left: `${Math.max(0, Math.min(100, (p.x + 1500)/5000 * 100))}%`, 
                           top: `${Math.max(0, Math.min(100, (p.y + 1500)/5000 * 100))}%` 
                         }} />
                  ))}
                  {/* Player Dot */}
                  <div className="absolute w-2 h-2 bg-blue-500 rounded-full border border-white shadow-[0_0_10px_#3b82f6]" 
                       style={{ 
                         left: `${Math.max(0, Math.min(100, (player.x + 1500)/5000 * 100))}%`, 
                         top: `${Math.max(0, Math.min(100, (player.y + 1500)/5000 * 100))}%` 
                       }} />
               </div>
            </div>
            <div className="absolute bottom-2 left-0 right-0 text-center text-[8px] font-bold text-slate-500 tracking-[0.2em]">RADAR [M]</div>
          </div>
        </div>
      )}

      {/* Decorative Background Glow */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isDark ? 'opacity-40' : 'opacity-10'}`} 
           style={{ background: `radial-gradient(circle at 50% 50%, ${isDark ? '#1e293b' : '#e2e8f0'} 0%, transparent 70%)` }} />
      
      {/* Background scanline effect */}
      <div className={`absolute inset-0 pointer-events-none z-10 opacity-[0.03] ${isDark ? '' : 'hidden'}`} style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%' }} />
      
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} className="absolute inset-0 opacity-90 transition-opacity" style={{ zIndex: 1 }} />
      
      {/* Top Console */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-20">
        {showDashboards ? (
          <div className={`p-1 rounded-2xl border shadow-2xl pointer-events-auto transition-all duration-300 ${isDark ? 'bg-slate-900/80 backdrop-blur-md border-slate-700' : 'bg-white/80 backdrop-blur-md border-slate-200'}`}>
            <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-600/50' : 'bg-slate-50 border-slate-200'}`}>
               <div className="p-3 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"><Shield size={24} /></div>
               <div>
                  <h1 className={`font-black text-xl tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>VayWorld <span className="text-blue-500 font-mono ml-2 text-xs">DIGITAL_OFFICE</span></h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <div className={`text-[10px] font-mono font-bold border-r pr-3 transition-colors ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-200'}`}>{t.day} {String(save.day).padStart(3, '0')}</div>
                    <div className="text-[10px] font-mono font-bold text-blue-500">STUFE {save.level}</div>
                    
                    {/* Glowing, high-fidelity XP progress indicator */}
                    <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-700/20">
                      <span className="text-[8px] font-extrabold font-mono text-slate-500 tracking-wider">XP</span>
                      <div className={`w-32 h-1.5 rounded-full overflow-hidden relative border transition-colors ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (save.xp / (save.level * 800)) * 100)}%` }}
                          transition={{ type: 'spring', stiffness: 85 }}
                        />
                      </div>
                      <span className="text-[9px] font-black font-mono text-slate-400">{save.xp} / {save.level * 800}</span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="pointer-events-none" />
        )}

        <div className="flex gap-4 pointer-events-none">
          {/* Immersive HUD toggle button (Dashboard toggle) placed perfectly between panels */}
          <button 
            onClick={() => {
              playSynthSound('click');
              setShowDashboards(v => !v);
            }}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl transition-all flex items-center justify-center ${
              isDark 
                ? 'bg-slate-900/80 backdrop-blur-md border-slate-700 text-blue-400 hover:bg-slate-800' 
                : 'bg-white/80 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title={showDashboards ? "Dashboards ausblenden" : "Dashboards einblenden"}
          >
            {showDashboards ? <Eye size={24} /> : <EyeOff size={24} />}
          </button>

          <button 
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl transition-all flex items-center justify-center ${isDark ? 'bg-slate-900/80 backdrop-blur-md border-slate-700 text-yellow-400 hover:bg-slate-800' : 'bg-white/80 backdrop-blur-md border-slate-200 text-slate-900 hover:bg-slate-50'}`}
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          
          {showDashboards && (
            <div className={`px-6 py-4 rounded-2xl border shadow-2xl pointer-events-auto flex items-center gap-6 transition-all ${isDark ? 'bg-slate-900/80 backdrop-blur-md border-slate-700' : 'bg-white/80 backdrop-blur-md border-slate-200'}`}>
               {save.tasks.filter(t => !t.done).length > 0 ? (
                 <div className="flex items-center gap-3">
                    <div className="animate-pulse w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                    <span className={`text-sm font-black tracking-tight transition-colors ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>ACTIVE ANWEISUNG: <span className="text-yellow-500 ml-1">{save.tasks.find(t => t.pinned && !t.done)?.text || "BEREITSCHAFT"}</span></span>
                 </div>
               ) : <span className={`text-xs font-black flex items-center gap-2 transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}><CheckCircle2 size={14}/> ALLE ZIELE ERREICHT</span>}
            </div>
          )}
        </div>
      </div>

      {/* Strategic Overview & Productive Resources HUD (Bottom Left) */}
      {showDashboards && (
        <div className="absolute bottom-8 left-8 w-[420px] max-h-[550px] overflow-y-auto pointer-events-none z-20 scrollbar-none">
          <div className={`p-6 rounded-[32px] border shadow-2xl pointer-events-auto transition-all flex flex-col gap-6 ${isDark ? 'bg-slate-900/90 backdrop-blur-md border-slate-700/80 shadow-[0_15px_40px_rgba(0,0,0,0.5)]' : 'bg-white/95 backdrop-blur-md border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.12)]'}`}>
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 border-slate-700/10">
              <div>
                <h2 className={`font-black text-[13px] uppercase tracking-[0.2em] flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <LayoutDashboard size={15} className="text-blue-500 animate-pulse"/> Operationszentrale
                </h2>
                <p className="text-[9px] text-slate-500 font-mono tracking-wider mt-0.5">TELEMETRISCHE PRODUKTIVITÄTS-MATRIX</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[8px] font-black uppercase tracking-wider ${isDark ? 'bg-slate-840 border border-slate-700 text-slate-400' : 'bg-slate-100 border border-slate-200 text-slate-600'}`}>
                LIVE_FEED_01
              </span>
            </div>

            {/* SECTION 1: Productive Resource HUD */}
            <div className="space-y-4">
              <div 
                className="flex justify-between items-center cursor-pointer select-none group" 
                onClick={() => { 
                  playSynthSound('click'); 
                  setResourcesCollapsed(!resourcesCollapsed); 
                }}
                title={resourcesCollapsed ? "Ressourcen anzeigen" : "Ressourcen einklappen"}
              >
                <h3 className={`font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  <Brain size={12} className="text-purple-400"/> System-Ressourcen
                </h3>
                <div className={`p-1 rounded-md transition-shadow flex items-center justify-center ${isDark ? 'text-slate-400 group-hover:text-slate-250 bg-slate-800/20' : 'text-slate-500 group-hover:text-slate-800 bg-slate-50'}`}>
                  {resourcesCollapsed ? (
                    <span className="text-[8px] font-mono tracking-wider flex items-center gap-1 font-bold">
                      EINBLENDEN <ChevronRight size={12} />
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono tracking-wider flex items-center gap-1 font-bold">
                      EINKLAPPEN <ChevronDown size={12} />
                    </span>
                  )}
                </div>
              </div>
              
              <motion.div
                initial={false}
                animate={{ 
                  height: resourcesCollapsed ? 0 : 'auto', 
                  opacity: resourcesCollapsed ? 0 : 1
                }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  {/* Resource A: Deep-Work-Fokus (Energie) */}
                  <div className={`p-3 rounded-2xl border transition-colors ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-extrabold tracking-wider text-slate-500 uppercase flex items-center gap-1"><Brain size={11} className="text-purple-400" /> Deep-Work</span>
                      <span className={`text-[11px] font-black font-mono ${player.hp < 30 ? 'text-red-500 animate-pulse' : (isDark ? 'text-purple-400' : 'text-purple-600')}`}>
                        {Math.round(player.hp)}%
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden relative border transition-colors ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-200/60 border-slate-300'}`}>
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${player.hp < 30 ? 'from-red-500 to-orange-400' : 'from-purple-500 to-indigo-400'} rounded-full`}
                        animate={{ width: `${player.hp}%` }}
                        transition={{ type: 'spring', stiffness: 75 }}
                      />
                    </div>
                    <p className="text-[7.5px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                      Sinkt bei Aktivität. Standby o. Uplink lädt auf.
                    </p>
                  </div>

                  {/* Resource B: Projekt-Bandbreite (Bandwidth) */}
                  <div className={`p-3 rounded-2xl border transition-colors ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-extrabold tracking-wider text-slate-500 uppercase flex items-center gap-1"><Compass size={11} className="text-blue-400" /> Bandbreite</span>
                      <span className="text-[11px] font-black font-mono text-blue-500">
                        {save.projects.length}/{projectCapacity}
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden relative border transition-colors ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-200/60 border-slate-300'}`}>
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        animate={{ width: `${Math.min(100, (save.projects.length / projectCapacity) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[7.5px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                      Maximale Kapazität parallel laufender Projekte.
                    </p>
                  </div>

                  {/* Resource C: System-Integrität (Qualitative moralische Ausführung) */}
                  <div className={`p-3 rounded-2xl border transition-colors ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-extrabold tracking-wider text-slate-500 uppercase flex items-center gap-1"><Shield size={11} className="text-emerald-400" /> Integrität</span>
                      <span className={`text-[11px] font-black font-mono ${save.honor < 40 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                        {Math.round(save.honor)}%
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden relative border transition-colors ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-200/60 border-slate-300'}`}>
                      <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                        animate={{ width: `${save.honor}%` }}
                      />
                    </div>
                    <p className="text-[7.5px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                      Qualität des Systems. Sinkt bei hohem Chaos.
                    </p>
                  </div>

                  {/* Resource D: Chaos & Ablenkung (Korruption) */}
                  <div className={`p-3 rounded-2xl border transition-colors ${isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-extrabold tracking-wider text-slate-500 uppercase flex items-center gap-1"><Flame size={11} className="text-red-400" /> Ablenkung</span>
                      <span className={`text-[11px] font-black font-mono ${save.corruption > 40 ? 'text-red-500 animate-pulse animate-bounce' : 'text-slate-500'}`}>
                        {Math.round(save.corruption)}%
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden relative border transition-colors ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-200/60 border-slate-300'}`}>
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${save.corruption > 40 ? 'from-red-600 to-orange-500 shadow-[0_0_8px_red]' : 'from-slate-500 to-slate-400'} rounded-full`}
                        animate={{ width: `${save.corruption}%` }}
                      />
                    </div>
                    <p className="text-[7.5px] text-slate-400 mt-1.5 font-sans leading-relaxed">
                      Chaos durch offene Aufgaben. Minderung via Erledigung.
                    </p>
                  </div>
                </div>

                {/* Resource E: Datenfragmente & Quellen */}
                <div className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${isDark ? 'bg-slate-800/20 border-slate-700/30' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-amber-500/10 text-amber-500"><Terminal size={12} /></div>
                    <div>
                      <span className="text-[8.5px] font-black tracking-widest text-slate-500 uppercase block">Datenfragmente (Substanz)</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Gesammelte / Transportierte Ideen</span>
                    </div>
                  </div>
                  {carriedLoot ? (
                    <span className="px-2 py-0.5 rounded-md text-[8px] font-black bg-amber-500/10 text-amber-500 animate-pulse uppercase tracking-wider">
                      AKTIV: {carriedLoot.title.slice(0, 14)}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[8px] font-semibold bg-slate-500/10 text-slate-500 uppercase tracking-wider">
                      RESERVOIR LEER
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* SECTION 2: Strategic Progress List */}
            <div className="space-y-4 border-t pt-4 border-slate-700/10">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  <LayoutDashboard size={12} className="text-blue-400"/> Laufende Projekte
                </h3>
                <span className="text-[8px] font-mono text-slate-500">
                  BELEGUNG: {Math.round((save.projects.length / projectCapacity) * 100)}%
                </span>
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {save.projects.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      playSynthSound('click');
                      setSelectedIdeationMode(p.ideationMode || "Gap Attack");
                      setActiveIdeaDetail({
                        id: p.id,
                        x: 0, y: 0, vx: 0, vy: 0,
                        title: p.name,
                        description: p.descriptionSnippet || "Neurales Keim-Saatgut.",
                        strength: p.refinedData ? 1.5 : 1.0,
                        serendipity: p.refinedData ? 0.95 : 0.60,
                        color: "#3b82f6",
                        collected: true,
                        projectId: p.id
                      });
                    }}
                    className={`p-3.5 rounded-2xl border group cursor-pointer hover:border-blue-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 ${isDark ? 'bg-slate-800/40 border-slate-700/40 text-slate-200' : 'bg-slate-50 border-slate-200/80 text-slate-700'}`}
                  >
                    <div className="flex justify-between items-center text-xs font-black mb-1.5 tracking-tight">
                      <span className="truncate max-w-[160px]">{p.name.toUpperCase()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-mono tracking-widest text-[10px]">{p.progress}%</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            playSynthSound('click');
                            setSave(s => ({...s, projects: s.projects.filter(proj => proj.id !== p.id)}));
                          }}
                          className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-red-500/20 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}
                          title="Projekt abbrechen"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                    <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    </div>
                  </div>
                ))}
                {save.projects.length === 0 && (
                  <div className={`text-center py-5 text-[10px] font-black border-2 border-dashed rounded-2xl italic tracking-widest ${isDark ? 'text-slate-600 border-slate-800' : 'text-slate-400 border-slate-200'}`}>
                    KEINE AKTIVEN KAMPAGNEN
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Task Matrix (System Tray Right) */}
      {showDashboards && (
        <div className="absolute top-32 right-8 w-80 pointer-events-none z-20">
          <div className={`p-6 rounded-[32px] border shadow-2xl pointer-events-auto transition-all ${isDark ? 'bg-slate-900/80 backdrop-blur-md border-slate-700' : 'bg-white/80 backdrop-blur-md border-slate-200'}`}>
            <h2 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2 italic"><Target size={14} className="text-red-400"/> Aufgabenmatrix</h2>
            <div className="space-y-3">
              {save.tasks.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => {
                    const nextDone = !t.done;
                    playSynthSound(nextDone ? 'levelUp' : 'click');
                    setSave(s => {
                      const updatedTasks = s.tasks.map(x => x.id === t.id ? {...x, done: nextDone} : x);
                      
                      // XP reward: +150 for finishing a productive action
                      const xpBonus = nextDone ? 150 : 0;
                      
                      // Integrität & Korruption modify instantly for responsive game feel
                      const honorDiff = nextDone ? 8 : -8;
                      const nextHonor = Math.max(0, Math.min(100, s.honor + honorDiff));
                      
                      const corrDiff = nextDone ? -12 : 12;
                      const nextCorruption = Math.max(0, Math.min(100, s.corruption + corrDiff));

                      return {
                        ...s,
                        tasks: updatedTasks,
                        xp: s.xp + xpBonus,
                        honor: nextHonor,
                        corruption: nextCorruption
                      };
                    });
                  }} 
                  className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${t.done ? (isDark ? 'bg-green-500/5 border-green-500/20 opacity-50' : 'bg-green-50 border-green-200 opacity-50') : (isDark ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-500' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-300')}`}
                >
                  <div className={`transition-colors ${t.done ? 'text-green-500' : (isDark ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-500')}`}>
                    {t.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                  <span className={`text-[13px] font-bold tracking-tight ${t.done ? 'line-through text-slate-500' : (isDark ? 'text-slate-200' : 'text-slate-700')}`}>{t.text}</span>
                </div>
              ))}
              <button onClick={() => {
                const text = prompt('NEUE DIREKTIVE?');
                if (text) setSave(s => ({...s, tasks: [...s.tasks, { id: Date.now().toString(), text, done: false, category: 'work', pinned: true }]}));
              }} className={`w-full p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black tracking-widest transition-all ${isDark ? 'border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300' : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}>
                <Plus size={16} /> DIREKTIVE HINZUFÜGEN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Hint */}
      <div className="absolute left-1/2 bottom-12 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none z-20">
         {(() => {
            const trees = getGardenTrees();
            const nearTree = trees.find(t => Math.hypot(t.x - playerPosRef.current.x, t.y - playerPosRef.current.y) < 110);
            if (nearTree) {
              return (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center px-8 py-4 rounded-2xl font-black text-sm gap-4 shadow-2xl border border-yellow-500/50 bg-slate-950/90 text-yellow-400 pointer-events-auto">
                  <div className="px-2 py-1 rounded bg-yellow-400 text-slate-950 font-mono text-xs font-black">[E] ANSEHEN</div>
                  <span className="tracking-tighter uppercase italic text-xs font-bold text-slate-200">
                    IDEE IN GARTEN {nearTree.garden}: "{nearTree.label?.toUpperCase()}" ({nearTree.progress}% FORTCHRITT)
                  </span>
                </motion.div>
              );
            }

            const pillar = allPillars.find(p => Math.hypot(p.x - playerPosRef.current.x, p.y - playerPosRef.current.y) < 100);
            if (pillar) {
              if (pillar.isCustomBusinessIdea) {
                return (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center px-8 py-4 rounded-2xl font-black text-sm gap-4 shadow-2xl border border-yellow-500/50 bg-slate-950/90 text-yellow-400">
                    <Sparkles size={18} className="text-yellow-400 animate-pulse" />
                    <span className="tracking-tighter uppercase italic text-xs font-bold text-slate-200">
                      NEURAL-NEXUS: "{pillar.customTitle?.toUpperCase()}" — Wissens-Turm aktiv
                    </span>
                  </motion.div>
                );
              }
              return (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`flex items-center px-8 py-4 rounded-2xl font-black text-sm gap-4 shadow-2xl border-b-4 transition-all ${isDark ? 'bg-white text-black border-slate-300' : 'bg-slate-900 text-white border-slate-700'}`}>
                  <div className={`px-2 py-1 rounded-lg font-mono text-xs ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>[LEERTASTE] HALTEN</div>
                  <span className="tracking-tighter uppercase italic">Ideensäule bearbeiten - Arbitrage extrahieren</span>
                </motion.div>
              );
            }
            const termX = 300, termY = 300;
            const nearTerminal = Math.hypot(playerPosRef.current.x - termX, playerPosRef.current.y - termY) < 100;
            if (nearTerminal) {
              return (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col sm:flex-row items-center gap-3">
                  <div 
                    onClick={() => setShowUplinkOverview(true)}
                    className="flex items-center px-6 py-3 rounded-2xl font-black text-xs gap-3 shadow-2xl border-b-4 pointer-events-auto cursor-pointer select-none transition-all bg-emerald-950/90 text-emerald-400 border-emerald-800 hover:bg-emerald-900 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <div className="px-2 py-0.5 bg-emerald-500 text-white rounded-md font-mono text-[10px]">[F] ANSEHEN</div>
                    <span className="tracking-tighter uppercase italic">ZENTRALE-STATUS ANSEHEN</span>
                  </div>
                  {carriedLoot && (
                    <div className={`flex items-center px-6 py-3 rounded-2xl font-black text-xs gap-3 shadow-2xl border-b-4 transition-all ${isDark ? 'bg-white text-black border-slate-300' : 'bg-slate-900 text-white border-slate-700'}`}>
                      <div className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>[E] DRÜCKEN</div>
                      <span className="tracking-tighter uppercase italic">{capacityError ? 'BANDBREITE ÜBERSCHRITTEN - FOKUS VOLL' : 'ZUR DATEN-ZENTRALE ÜBERTRAGEN'}</span>
                    </div>
                  )}
                </motion.div>
              );
            }
            const nearestLoot = loots.find(l => Math.hypot(l.x - playerPosRef.current.x, l.y - playerPosRef.current.y) < 60);
            if (nearestLoot && !carriedLoot) {
              return (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`flex items-center px-8 py-4 rounded-2xl font-black text-sm gap-4 shadow-2xl border-b-4 transition-all ${isDark ? 'bg-white text-black border-slate-300' : 'bg-slate-900 text-white border-slate-700'}`}>
                   <div className={`px-2 py-1 rounded-lg font-mono text-xs ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>[E] DRÜCKEN</div>
                   <span className="tracking-tighter uppercase italic">SAMMELN: {nearestLoot.title}</span>
                </motion.div>
              );
            }
            if (carriedLoot) {
              const inRoom = ROOMS.some(r => playerPosRef.current.x > r.x && playerPosRef.current.x < r.x + r.w && playerPosRef.current.y > r.y && playerPosRef.current.y < r.y + r.h);
              const roomName = ROOMS.find(r => playerPosRef.current.x > r.x && playerPosRef.current.x < r.x + r.w && playerPosRef.current.y > r.y && playerPosRef.current.y < r.y + r.h)?.name;

              return (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`flex items-center px-8 py-4 rounded-2xl font-black text-sm gap-4 shadow-2xl border-b-4 transition-all ${isDark ? 'bg-white text-black border-slate-300' : 'bg-slate-900 text-white border-slate-700'}`}>
                  <div className={`px-2 py-1 rounded-lg font-mono text-xs ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>[E] DRÜCKEN</div>
                  <span className="tracking-tighter uppercase italic">{capacityError ? 'BANDBREITE ÜBERSCHRITTEN - FOKUS VOLL' : (inRoom ? `IDEE PFLANZEN IN ${roomName}` : 'ZUM DATENZENTRUM TRAGEN')}</span>
                </motion.div>
              );
            }
            const inRoom = ROOMS.find(r => playerPosRef.current.x > r.x && playerPosRef.current.x < r.x + r.w && playerPosRef.current.y > r.y && playerPosRef.current.y < r.y + r.h);
            if (inRoom && !carriedLoot) {
               const actionText = inRoom.id === 'ops' ? 'Zentrale-Dashboard öffnen' : `Büro betreten: ${inRoom.name}`;
               return (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`flex items-center px-8 py-4 rounded-2xl font-black text-sm gap-4 shadow-2xl border-b-4 transition-all ${isDark ? 'bg-white text-black border-slate-300' : 'bg-slate-900 text-white border-slate-700'}`}>
                  <div className={`px-2 py-1 rounded-lg font-mono text-xs ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>[E] DRÜCKEN</div>
                  <span className="tracking-tighter uppercase italic">{actionText}</span>
                </motion.div>
               );
            }
            const o = dynamicOfficers.find(o => Math.hypot(o.x - playerPosRef.current.x, o.y - playerPosRef.current.y) < 60);
           if (o) {
             return (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`flex items-center px-8 py-4 rounded-2xl font-black text-sm gap-4 shadow-2xl border-b-4 transition-all ${isDark ? 'bg-white text-black border-slate-300' : 'bg-slate-900 text-white border-slate-700'}`}>
                 <div className={`px-2 py-1 rounded-lg font-mono text-xs ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>[E] DRÜCKEN</div>
                 <span className="tracking-tighter">KOMMUNIKATION AUFBAUEN MIT {o.role.toUpperCase()}</span>
               </motion.div>
             );
           }
           return null;
         })()}
         {showDashboards && (
           <div className={`px-4 py-1.5 backdrop-blur rounded-full border text-[10px] font-black uppercase tracking-[0.3em] shadow-inner transition-all ${isDark ? 'bg-slate-900/50 border-slate-700/50 text-slate-500' : 'bg-white/50 border-slate-200 text-slate-400'}`}>Steuerung: WASD Matrix</div>
         )}
      </div>

      {/* Interaction Interface */}
      <AnimatePresence>
        {showSkillTree && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`absolute inset-0 z-50 flex items-center justify-center p-20 ${isDark ? 'bg-slate-950/95' : 'bg-white/95'}`}
          >
            <div className={`w-full max-w-5xl rounded-[48px] border relative overflow-hidden flex flex-col p-12 transition-all ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
                    <Lightning className="text-yellow-500" size={32} /> NEURONALE VERBESSERUNGEN
                  </h2>
                  <p className="text-slate-500 font-mono text-xs mt-2 uppercase tracking-[0.2em]">Gib Skillpunkte aus, um deine Fähigkeiten zu verbessern</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className={`px-6 py-4 rounded-2xl border flex flex-col items-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="text-[10px] font-black text-slate-500 mb-1">AVAILABLE POINTS</span>
                    <span className="text-2xl font-black text-yellow-500">{save.skillPoints}</span>
                  </div>
                  <button onClick={() => setShowSkillTree(false)} className={`p-4 rounded-xl border font-bold transition-all ${isDark ? 'bg-slate-800 hover:bg-red-500 text-white border-slate-700' : 'bg-white border-slate-200 hover:bg-red-50 text-slate-900'}`}>DRÜCKE [K] ZUM SCHLIESSEN</button>
                </div>
              </div>

              {/* Grid Layout for Skills */}
              <div className="grid grid-cols-2 gap-8 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                {SKILL_TREE.map(s => {
                  const isUnlocked = save.unlockedSkills.includes(s.id);
                  const parentsUnlocked = s.parents.every(p => save.unlockedSkills.includes(p));
                  const canAfford = save.skillPoints >= s.cost;
                  const canUnlock = !isUnlocked && parentsUnlocked && canAfford;

                  const getIcon = (name: string) => {
                    if (name === 'Hammer') return <Hammer size={32} />;
                    if (name === 'Wind') return <Wind size={32} />;
                    if (name === 'Zap') return <Lightning size={32} />;
                    if (name === 'Compass') return <Compass size={32} />;
                    if (name === 'Sparkles') return <Sparkles size={32} />;
                    if (name === 'Shield') return <Shield size={32} />;
                    return <Brain size={32} />;
                  };

                  return (
                    <div 
                      key={s.id} 
                      className={`p-8 rounded-[32px] border relative transition-all group ${isUnlocked ? 'bg-blue-600/10 border-blue-500' : (parentsUnlocked ? (isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300') : 'bg-slate-900/50 border-transparent opacity-40 grayscale pointer-events-none')}`}
                    >
                      <div className="flex gap-6 items-start">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-all ${isUnlocked ? 'bg-blue-500 text-white' : (isDark ? 'bg-slate-950 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                          {getIcon(s.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className={`text-xl font-black tracking-tight ${isUnlocked ? 'text-blue-400' : (isDark ? 'text-white' : 'text-slate-900')}`}>{s.name.toUpperCase()}</h3>
                            {!isUnlocked && (
                              <div className="flex items-center gap-1 font-mono text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                {s.cost} PT
                              </div>
                            )}
                          </div>
                          <p className={`text-sm leading-relaxed mb-6 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{s.description}</p>
                               {isUnlocked ? (
                            <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest">
                               <CheckCircle2 size={16} /> Verbesserung Aktiv
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                if (canUnlock) {
                                  setSave(prev => ({
                                    ...prev,
                                    skillPoints: prev.skillPoints - s.cost,
                                    unlockedSkills: [...prev.unlockedSkills, s.id]
                                  }));
                                  playSynthSound('unlock');
                                }
                              }}
                              disabled={!canUnlock}
                              className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${canUnlock ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                            >
                              {canAfford ? 'Verbesserung Freischalten' : 'Unzureichende Punkte'}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {!parentsUnlocked && !isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-[32px] pointer-events-none">
                           <div className="flex flex-col items-center gap-2 text-white/60">
                              <Lock size={24} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Voraussetzung Erforderlich</span>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* [Port] Neural Uplink oeffnet jetzt das volle Digital-Buero-Dashboard.
            UplinkOverview bleibt als Datei erhalten, ist hier nur entkoppelt:
            <UplinkOverview isOpen={showUplinkOverview} onClose={() => setShowUplinkOverview(false)} isDark={isDark} /> */}
        <DesktopDashboard
          isOpen={showUplinkOverview}
          onClose={() => setShowUplinkOverview(false)}
          activeTab={dashboardTab}
          setActiveTab={setDashboardTab}
        />

        {activeIdeaDetail && (() => {
          const matchProject = save.projects.find(p => p.id === activeIdeaDetail.projectId);
          const hasRefined = !!matchProject?.refinedData;
          return (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-slate-950/90 backdrop-blur-md"
            >
               <motion.div 
                 initial={{ scale: 0.95, y: 20 }} 
                 animate={{ scale: 1, y: 0 }} 
                 exit={{ scale: 0.95, y: 20 }}
                 className={`w-full max-w-5xl h-[85vh] rounded-[36px] border flex flex-col overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.25)] ${isDark ? 'bg-slate-900 border-green-500/30 text-white' : 'bg-slate-50 border-green-200 text-slate-900'}`}
               >
                  {/* Header Panel */}
                  <div className={`p-6 sm:px-10 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white/60'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-500 text-white'}`}>
                        <Brain size={24} className="animate-pulse" />
                      </div>
                      <div className="text-left">
                        <h1 className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-2">
                          IDEEN-VEREDELUNGSKANAL <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 border border-green-500/20">STAGE 2: KI-VEREDELUNG</span>
                        </h1>
                        <p className="text-xs text-slate-400 font-mono uppercase tracking-[0.15em] mt-0.5">Veredelung des Projekts: "{activeIdeaDetail.title?.toUpperCase()}"</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveIdeaDetail(null)}
                      className={`p-2.5 rounded-full border transition-colors ${isDark ? 'hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-black'}`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Core Content Area */}
                  <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left Column (58%): Synthesis parameters */}
                    <div className={`p-8 lg:w-[58%] border-r overflow-y-auto flex flex-col justify-between ${isDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200 bg-white'}`}>
                      
                      <div className="space-y-6">
                        {/* Project Seed Information */}
                        <div className={`p-5 rounded-2xl border text-left ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-blue-500 font-bold flex items-center gap-1">
                              <Target size={11} /> STUFE 1: AKTIVE PROJEKT-KEIM (SEED)
                            </span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-black uppercase tracking-wider">
                              Stärke: {(activeIdeaDetail.strength * 100).toFixed(0)}%
                            </div>
                          </div>
                          <div className="text-md font-extrabold text-blue-400 tracking-tight mb-2 uppercase">
                            {activeIdeaDetail.title}
                          </div>
                          <p className={`text-xs leading-relaxed italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            "{activeIdeaDetail.description}"
                          </p>
                        </div>

                        {/* Ideation Mode Selector List */}
                        <div className="text-left">
                          <label className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-400 mb-2 block">
                            STUFE 2: WÄHLE SYNTHESE-MEDULATION (IDEATION MODE)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                            {["Gap Attack", "Analoge Märkte", "First Principles", "Inversion", "Trend-Intersection", "Blue Ocean", "Jobs-to-be-Done"].map(m => {
                              const active = selectedIdeationMode === m;
                              return (
                                <button
                                  key={m}
                                  onClick={() => {
                                    setSelectedIdeationMode(m);
                                    playSynthSound('click');
                                  }}
                                  className={`px-3 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-300 border ${
                                    active 
                                    ? 'bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                                    : isDark ? 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                                  }`}
                                >
                                  {m}
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Mode Prompt Description snippet */}
                          <div className={`p-4 rounded-xl text-xs border font-mono ${isDark ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' : 'bg-slate-100/50 border-slate-200 text-slate-600'}`}>
                            <span className="font-extrabold text-green-500 uppercase tracking-widest text-[9px] block mb-1">PROMPT-MODELL:</span>
                            {selectedIdeationMode === "Gap Attack" && "Gap Attack: Identifiziert versteckte Asymmetrien, ungenutzte Schnittstellen oder Prozessklüfte zwischen Systemen."}
                            {selectedIdeationMode === "Analoge Märkte" && "Analoge Märkte: Transferiert etablierte, branchenfremde Erfolgsmuster passgenau in diese Nische."}
                            {selectedIdeationMode === "First Principles" && "First Principles: Reduziert das Szenario auf elementare Wahrheiten und gestaltet die Lösung frei von Annahmen neu."}
                            {selectedIdeationMode === "Inversion" && "Inversion: Denkt das Problem vom maximalen Scheitern aus und deduziert Schutzbarrieren hinein."}
                            {selectedIdeationMode === "Trend-Intersection" && "Trend-Intersection: Kreuzt den operativen Sektor mit einem technologischen oder demografischen Megatrend."}
                            {selectedIdeationMode === "Blue Ocean" && "Blue Ocean: Eliminiert/reduziert Standard-Kostentreiber radikal, um konkurrenzfreie Marktnischen zu erschließen."}
                            {selectedIdeationMode === "Jobs-to-be-Done" && "Jobs-to-be-Done: Definiert den tiefen funktionalen, sozialen und emotionalen Fortschritt, den der Kunde anmietet."}
                          </div>
                        </div>

                        {/* Error Handling if any */}
                        {!refinementLoading && refinementError && (
                          <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-mono tracking-tight flex items-center gap-2">
                            <Info size={14} className="flex-shrink-0 animate-bounce" />
                            <span>{refinementError}</span>
                          </div>
                        )}
                      </div>

                      {/* Trigger Veredeln Button Panel */}
                      <div className="mt-8">
                        <button
                          onClick={handleRefining}
                          disabled={refinementLoading}
                          className={`w-full py-4 px-6 font-black uppercase text-xs tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-green-950/20 hover:shadow-green-950/40 active:scale-95 disabled:opacity-50`}
                        >
                          <Sparkles size={16} className={`text-green-200 ${refinementLoading ? 'animate-spin' : 'animate-pulse'}`} />
                          {refinementLoading ? "SYNTHESE-PIPELINE AKTIVIERT..." : (hasRefined ? "PROJEKT RE-VEREDELN (AI SYNTHESE)" : "PROJEKT VEREDELN (STAGE 2 STARTEN)")}
                        </button>
                      </div>

                    </div>

                    {/* Right Column (42%): Outputs / Refinement Results */}
                    <div className={`p-8 lg:w-[42%] flex flex-col justify-between overflow-y-auto ${isDark ? 'bg-slate-900/40' : 'bg-slate-100/60'}`}>
                      
                      {/* If Loading, display glowing processing UI */}
                      {refinementLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                          <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-t-green-500 border-r-emerald-500 rounded-full animate-spin"></div>
                            <span className="absolute inset-2 bg-slate-950/80 rounded-full flex items-center justify-center text-green-400 font-mono text-[10px]">AI</span>
                          </div>
                          <div>
                            <span className="block text-xs font-mono uppercase tracking-[0.2em] text-green-400">Synthese-Pipeline Aktiv...</span>
                            <span className="block text-[9px] font-mono text-slate-500 mt-1 uppercase">MODUS: {selectedIdeationMode}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 italic max-w-xs leading-relaxed">
                            "Analysiere Problemstrukturen im Workspace, quantisiere Innovationsmuster und baue robustes 7-Phasen Protokoll..."
                          </p>
                        </div>
                      ) : matchProject?.refinedData ? (
                        /* Display 7 fields structured results scrollbox */
                        <div className="flex-1 flex flex-col h-full justify-between">
                          <div className="space-y-4 mb-4">
                            <span className="text-[10px] font-mono text-green-500 tracking-[0.25em] font-extrabold uppercase block">VEREDELTES PRODUKT-DIAGRAMM</span>
                            
                            {/* Title Block */}
                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950 border-green-500/20' : 'bg-white border-green-200'} shadow-md`}>
                              <div className="text-[9px] uppercase font-mono tracking-widest text-green-500 mb-1 flex items-center gap-1 font-bold">
                                <Sparkles size={11} className="text-green-400" /> 1. TITEL (MODUS: {matchProject.ideationMode})
                              </div>
                              <div className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {matchProject.refinedData.titel.toUpperCase()}
                              </div>
                            </div>

                            {/* Scroll Area of other 6 keys */}
                            <div className="space-y-3 max-h-[46vh] overflow-y-auto pr-1">
                              {[
                                { label: "2. KUNDENPROBLEM / JTBD", text: matchProject.refinedData.kundenproblem, color: "text-purple-400" },
                                { label: "3. LÖSUNGSVERSPRECHEN", text: matchProject.refinedData.loesung, color: "text-emerald-400" },
                                { label: "4. ZIELGRUPPEN-NISCHE", text: matchProject.refinedData.zielgruppen_nische, color: "text-pink-400" },
                                { label: "5. MONETARISIERUNG", text: matchProject.refinedData.monetarisierung, color: "text-yellow-500" },
                                { label: "6. ERSTER VALIDIERUNGSSCHRITT", text: matchProject.refinedData.erster_validierungsschritt, color: "text-cyan-400" },
                                { label: "7. UNFAIR ADVANTAGE (BURGGRABEN)", text: matchProject.refinedData.unfair_advantage, color: "text-orange-400" }
                              ].map((item, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/40 border-slate-800/80 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                                  <div className={`text-[9px] uppercase font-mono tracking-widest ${item.color} mb-1 flex items-center gap-1.5 font-bold`}>
                                    {item.label}
                                  </div>
                                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                                    {item.text}
                                  </p>
                                </div>
                              ))}
                            {(matchProject as any).ideaScore && (() => {
                              const sc = (matchProject as any).ideaScore;
                              const bar = (label, val, col) => (
                                <div className="mb-2">
                                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider opacity-80">
                                    <span>{label}</span><span>{val}/100</span>
                                  </div>
                                  <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                                    <div className="h-1.5 rounded-full" style={{ width: `${val}%`, background: col }} />
                                  </div>
                                </div>
                              );
                              return (
                                <div className={`mt-4 p-4 rounded-2xl border ${isDark ? 'border-cyan-400/30 bg-cyan-500/5' : 'border-cyan-600/30 bg-cyan-50'}`}>
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Qualitaets-Score (Stufe 3)</p>
                                    <span className="text-[9px] font-mono opacity-50">{sc.source === 'fallback' ? 'OFFLINE-JUDGE' : 'GEMINI-JUDGE'}</span>
                                  </div>
                                  {bar('Novelty', sc.novelty, '#22d3ee')}
                                  {bar('Feasibility', sc.feasibility, '#34d399')}
                                  {bar('Impact', sc.impact, '#a78bfa')}
                                  {bar('Specificity', sc.specificity, '#fbbf24')}
                                  <div className={`mt-3 text-[11px] leading-snug ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                                    <span className="font-bold">Groesstes Risiko: </span>{sc.biggest_risk}
                                  </div>
                                  <div className={`mt-2 text-[11px] leading-snug ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                                    <span className="font-bold">Verbesserung: </span>{sc.improvement}
                                  </div>
                                </div>
                              );
                            })()}
                            </div>
                          </div>

                          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'} text-center mt-auto`}>
                            <div className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">PROJEKT GELIEFERT & AKTIVIERT</div>
                            <p className="text-[9px] text-slate-500 font-medium">Boden-Uplink stabilisiert. Der Wissens-Turm ist permanent auf der Karte verankert.</p>
                          </div>
                        </div>
                      ) : (
                        /* Inactive/Ready empty state block */
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                          <div className={`p-5 rounded-full ${isDark ? 'bg-slate-950 border border-slate-800 text-slate-500' : 'bg-white border border-slate-200 text-slate-400'}`}>
                            <Hourglass size={32} className="animate-spin duration-3000" />
                          </div>
                          <div>
                            <span className="block text-xs font-mono uppercase tracking-[0.2em] text-slate-400">Pipeline Inaktiv</span>
                            <span className="block text-[10px] font-mono text-slate-500 mt-1 uppercase">Warte auf Trigger...</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic max-w-xs leading-relaxed">
                            "Stufe-2 Veredelungs-Prozess ist bereit zum Empfang. Wählen Sie links Ihre Wunschdimension und klicken Sie auf 'PROJEKT VEREDELN'."
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
               </motion.div>
            </motion.div>
          );
        })()}

        {showMap && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`absolute inset-0 z-50 flex items-center justify-center p-20 ${isDark ? 'bg-slate-950/95' : 'bg-white/95'}`}
          >
            <div className={`w-full h-full rounded-[48px] border relative overflow-hidden flex flex-col p-12 transition-all ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                  <Compass className="text-green-500" size={32} /> WORLD TOPOGRAPHY DATA
                </h2>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="w-3 h-3 bg-white border border-slate-400" /> Headquarters
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="w-3 h-3 bg-green-500" /> Idea Pillar
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="w-3 h-3 bg-yellow-400 animate-pulse shadow-[0_0_8px_#eab308] rounded-full" /> Wissens-Turm
                  </div>
                  <button onClick={() => setShowMap(false)} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-red-500 transition-colors">DRÜCKE [M] ZUM SCHLIESSEN</button>
                </div>
              </div>

              {/* Map grid */}
              <div className={`flex-1 relative rounded-3xl border overflow-hidden ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-200/50 border-slate-300'}`}>
                {/* 1:1 Scale Representation */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-[1000px] h-[1000px] border-2 border-dashed border-slate-700/30 relative scale-[0.3] md:scale-[0.5] lg:scale-[0.7]">
                      {/* HQ */}
                      <div className="absolute left-[50%] top-[50%] w-[160px] h-[160px] -translate-x-1/2 -translate-y-1/2 bg-white/20 border-2 border-white rounded shadow-[0_0_20px_white]" />
                      
                      {/* Pillars - coordinates normalized to -2000 to 2000 range */}
                      {allPillars.map(p => (
                        <div 
                          key={p.id} 
                          className={`absolute rounded-full animate-pulse flex items-center justify-center ${p.isCustomBusinessIdea ? 'w-16 h-16 bg-yellow-400 shadow-[0_0_25px_#eab308] border-2 border-yellow-300' : 'w-12 h-12 bg-green-500 shadow-[0_0_15px_#22c55e]'}`} 
                          style={{ left: `${(p.x + 1500)/5000 * 100}%`, top: `${(p.y + 1500)/5000 * 100}%` }}
                        >
                          {p.isCustomBusinessIdea && p.customTitle && (
                            <div className="absolute text-[8px] font-bold text-yellow-300 bg-slate-950/95 border border-yellow-500/50 px-2 py-0.5 rounded uppercase tracking-tighter text-center whitespace-nowrap -bottom-8 shadow-2xl z-20">
                              {p.customTitle}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Player */}
                      <div className="absolute w-16 h-16 bg-blue-500 rounded-full border-4 border-white shadow-[0_0_30px_#3b82f6] z-10 transition-all duration-300" style={{ left: `${(player.x + 1500)/5000 * 100}%`, top: `${(player.y + 1500)/5000 * 100}%` }} />
                   </div>
                </div>
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)', backgroundSize: '100% 8px' }} />
              </div>
            </div>
          </motion.div>
        )}

        {activeOfficer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`absolute inset-0 backdrop-blur-2xl z-50 flex items-center justify-center p-8 transition-colors ${isDark ? 'bg-slate-950/90' : 'bg-slate-100/90'}`}>
             <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} className={`w-full max-w-5xl rounded-[48px] border overflow-hidden flex h-[750px] relative transition-colors ${isDark ? 'bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-slate-700' : 'bg-white shadow-[0_0_100px_rgba(0,0,0,0.1)] border-slate-200'}`}>
                {/* Visual Glitch Frame border */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-opacity ${isDark ? 'opacity-50' : 'opacity-20'}`} />
                
                {/* Profile Section */}
                <div className={`w-96 border-r p-12 flex flex-col items-center text-center transition-colors ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                   <div className={`w-32 h-32 rounded-[40px] shadow-2xl flex items-center justify-center mb-8 border relative group transition-colors ${isDark ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                      <div className={`absolute inset-0 rounded-[40px] animate-pulse ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/5'}`} />
                      <Users size={48} className="text-blue-400 relative z-10" />
                   </div>
                   <h2 className={`text-3xl font-black mb-2 tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeOfficer.name}</h2>
                   <div className="px-4 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20 mb-8">{activeOfficer.role}</div>
                   
                   <p className={`text-sm leading-relaxed mb-12 font-medium px-4 transition-colors ${isDark ? 'text-slate-400 opacity-80' : 'text-slate-600'}`}>{activeOfficer.description}</p>
                   
                   <div className="mt-auto w-full">
                     <button onClick={() => setActiveOfficer(null)} className={`group w-full p-5 font-black rounded-3xl transition-all flex items-center justify-center gap-3 border ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border-slate-700' : 'bg-white text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 border-slate-200'}`}>
                        <Zap size={18} /> TERMINATE CHANNEL
                     </button>
                   </div>
                </div>

                {/* Comms Feed */}
                <div className={`flex-1 flex flex-col p-10 transition-colors ${isDark ? 'bg-slate-900/30' : 'bg-white'}`}>
                   <div className="flex-1 overflow-y-auto space-y-8 pb-8 pr-6 custom-scrollbar">
                      {messages.length === 0 && (
                        <div className={`h-full flex flex-col items-center justify-center gap-4 opacity-50 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                          <MessageSquare size={48} />
                          <p className="font-mono text-xs tracking-widest uppercase">Encryption Established. Awaiting input...</p>
                        </div>
                      )}
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[85%] p-6 rounded-[32px] text-sm font-bold leading-relaxed shadow-lg border transition-all ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none border-blue-400/30 shadow-blue-900/20' : (isDark ? 'bg-slate-800 text-slate-200 rounded-tl-none border-slate-700 shadow-slate-950' : 'bg-slate-50 text-slate-700 rounded-tl-none border-slate-100 shadow-slate-200')}`}>
                              {m.parts[0].text}
                           </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce" />
                          </div>
                          <span className="text-[10px] font-black text-green-500 tracking-widest uppercase opacity-70">Synthesizing response...</span>
                        </div>
                      )}
                   </div>
                   
                   <div className={`pt-8 border-t transition-colors ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="relative group">
                        <input 
                          value={chatInp} 
                          onChange={e => setChatInp(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && handleChat()} 
                          placeholder={`ENTER COMMAND TO ${activeOfficer.role.toUpperCase()}...`} 
                          className={`w-full border px-8 py-6 rounded-3xl outline-none font-bold transition-all shadow-inner placeholder:italic ${isDark ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-700 focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-300'}`} 
                        />
                        <button onClick={handleChat} className="absolute right-3 top-3 bottom-3 aspect-square bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95">
                           <Send size={24}/>
                        </button>
                      </div>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}

        {showLevelUpOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.8, y: 50 }}
              className={`p-10 rounded-[40px] border max-w-lg text-center flex flex-col items-center shadow-2xl relative transition-all ${isDark ? 'bg-slate-900 border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.15)] text-white' : 'bg-white border-green-200 shadow-[0_0_50px_rgba(34,197,94,0.1)] text-slate-900'}`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
              
              <div className="relative w-20 h-20 bg-green-500/10 text-green-400 rounded-3xl flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.25)] mb-8 animate-bounce">
                <Sparkles size={40} />
              </div>

              <h2 className="text-4xl font-extrabold tracking-tighter mb-1 bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent leading-none">
                KOMMANDER LEVEL UP!
              </h2>
              
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.25em] mb-6">
                ZUR STUFE GEKOMMEN
              </div>

              <div className="text-7xl font-black text-center text-green-500 tracking-tighter mb-6 font-mono select-none drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                {save.level}
              </div>

              <p className={`text-xs leading-relaxed mb-8 max-w-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Glückwunsch, Commander! Deine neuronale Prozessorkonfiguration erweitert sich. Du erhältst **+4 Skill-Punkte** zur Freischaltung neuer Upgrades!
              </p>

              <button 
                onClick={() => {
                  playSynthSound('click');
                  setShowLevelUpOverlay(false);
                }}
                className="px-10 py-3.5 bg-green-600 hover:bg-green-500 border border-green-400/50 rounded-2xl shadow-[0_10px_25px_rgba(34,197,94,0.25)] text-white font-extrabold text-[10px] tracking-[0.2em] uppercase cursor-pointer active:scale-95 transition-all"
              >
                AUFTRAG BESTÄTIGEN
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeRoomId && (
        <BueroSzene 
          officerId={activeRoomId}
          officerName={OFFICERS.find(o => o.room === activeRoomId)?.name || ''}
          officerRole={OFFICERS.find(o => o.room === activeRoomId)?.role || ''}
          roomTitle={ROOMS.find(r => r.id === activeRoomId)?.name || ''}
          isDayMode={save.isDayMode ?? true}
          onToggleDayMode={() => setSave(s => ({ ...s, isDayMode: !s.isDayMode }))}
          onExit={() => setActiveRoomId(null)}
          hologramLoot={lastLoot}
        />
      )}

      {/* ===== ANIMIERTES TUTORIAL / ONBOARDING OVERLAY (Stufe 1-2-3 Erklaerung) ===== */}
      <AnimatePresence>
      {showTutorial && (() => {
        const STEPS = [
          {
            icon: <Compass size={46} className="text-cyan-400" />,
            tag: "UEBERSICHT",
            title: "Die Ideen-Pipeline",
            text: "VayWorld verwandelt rohe Einfaelle in geschaerfte Geschaeftsideen – in drei Stufen. Du erntest Saatkoerner, veredelst sie mit KI und bekommst eine ehrliche Bewertung. Wische dich Schritt fuer Schritt durch.",
            accent: "cyan"
          },
          {
            icon: <Sparkles size={46} className="text-emerald-400" />,
            tag: "STUFE 1",
            title: "Saatkorn",
            text: "Lokal & sofort: Der Kombinator erzeugt aus deinen Bausteinen ein rohes Ideen-Saatkorn. Du waehlst einen von 7 Denk-Modi (z.B. Gap Attack, First Principles, Blue Ocean, Inversion). Der Modus bestimmt die Richtung – gratis und blitzschnell.",
            accent: "emerald"
          },
          {
            icon: <Brain size={46} className="text-violet-400" />,
            tag: "STUFE 2",
            title: "Veredelung",
            text: "Druecke VEREDELN: Das Saatkorn geht an Gemini und kommt geschaerft zurueck – mit klarem Titel, echtem Kundenproblem, Loesungsskizze, Zielgruppen-Nische, Monetarisierung, erstem Validierungs-Schritt und deinem Unfair Advantage.",
            accent: "violet"
          },
          {
            icon: <Target size={46} className="text-amber-400" />,
            tag: "STUFE 3",
            title: "Bewertung & Selbstkritik",
            text: "Die KI bewertet die Idee als Juror: Neuheit, Machbarkeit, Impact und Praezision (je 0–100), nennt das groesste Risiko und einen Verbesserungs-Tipp. Der Diversitaets-Waechter sorgt dafuer, dass sich Ideen nicht wiederholen.",
            accent: "amber"
          },
          {
            icon: <Zap size={46} className="text-cyan-400" />,
            tag: "LOS GEHT\u2019S",
            title: "So benutzt du es",
            text: "1. Oeffne ein Projekt unter LAUFENDE PROJEKTE.  2. Waehle einen Denk-Modus.  3. Druecke VEREDELN.  4. Lies die 7 Felder + den Qualitaets-Score. Faellt die KI mal aus, springt automatisch der lokale Kombinator ein – das Spiel blockiert nie.",
            accent: "cyan"
          }
        ];
        const accentMap = {
          cyan: { ring: "from-cyan-500/30", bar: "bg-cyan-400", dot: "bg-cyan-400", glow: "shadow-[0_0_40px_rgba(34,211,238,0.4)]", border: "border-cyan-500/40" },
          emerald: { ring: "from-emerald-500/30", bar: "bg-emerald-400", dot: "bg-emerald-400", glow: "shadow-[0_0_40px_rgba(52,211,153,0.4)]", border: "border-emerald-500/40" },
          violet: { ring: "from-violet-500/30", bar: "bg-violet-400", dot: "bg-violet-400", glow: "shadow-[0_0_40px_rgba(167,139,250,0.4)]", border: "border-violet-500/40" },
          amber: { ring: "from-amber-500/30", bar: "bg-amber-400", dot: "bg-amber-400", glow: "shadow-[0_0_40px_rgba(251,191,36,0.4)]", border: "border-amber-500/40" }
        };
        const step = STEPS[tutorialStep] || STEPS[0];
        const ac = accentMap[step.accent];
        const isLast = tutorialStep === STEPS.length - 1;
        return (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`absolute inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-md ${isDark ? 'bg-black/70' : 'bg-slate-900/40'}`}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className={`relative w-full max-w-2xl rounded-[32px] border overflow-hidden ${ac.glow} ${isDark ? 'bg-slate-950/95 ' : 'bg-white/95 '} ${ac.border}`}
            >
              <div className={`pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[240px] rounded-full blur-3xl bg-gradient-to-b ${ac.ring} to-transparent`} />
              <button onClick={() => setShowTutorial(false)} className={`absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500'}`}>
                <X size={18} />
              </button>
              <div className="relative px-10 pt-12 pb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tutorialStep}
                    initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.28 }}
                    className="flex flex-col items-center text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                      className={`mb-5 w-24 h-24 rounded-3xl flex items-center justify-center border ${ac.border} ${isDark ? 'bg-slate-900/80' : 'bg-slate-50'} ${ac.glow}`}
                    >
                      {step.icon}
                    </motion.div>
                    <span className={`text-[10px] font-black tracking-[0.3em] px-3 py-1 rounded-full mb-3 ${ac.dot} text-black/80`}>{step.tag}</span>
                    <h2 className={`text-3xl font-black tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{step.title}</h2>
                    <p className={`text-sm leading-relaxed max-w-md ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{step.text}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="mt-7 flex items-center justify-center gap-2">
                  {[0,1,2,3,4].map((i) => (
                    <button key={i} onClick={() => setTutorialStep(i)} className="group p-1">
                      <motion.div
                        animate={{ width: i === tutorialStep ? 28 : 8, opacity: i === tutorialStep ? 1 : 0.4 }}
                        className={`h-2 rounded-full ${i === tutorialStep ? ac.bar : (isDark ? 'bg-slate-600' : 'bg-slate-300')}`}
                      />
                    </button>
                  ))}
                </div>
                <div className={`mt-6 h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <motion.div
                    animate={{ width: `${((tutorialStep + 1) / 5) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    className={`h-full rounded-full ${ac.bar}`}
                  />
                </div>
                <div className="mt-7 flex items-center justify-between">
                  <button
                    onClick={() => tutorialStep === 0 ? setShowTutorial(false) : setTutorialStep(s => s - 1)}
                    className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {tutorialStep === 0 ? "Ueberspringen" : "Zurueck"}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => isLast ? setShowTutorial(false) : setTutorialStep(s => s + 1)}
                    className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest px-6 py-3 rounded-xl text-black ${ac.bar} ${ac.glow}`}
                  >
                    {isLast ? "Verstanden" : "Weiter"}
                    {!isLast && <ChevronRight size={18} />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })()}
      </AnimatePresence>
    </div>
  );
}
