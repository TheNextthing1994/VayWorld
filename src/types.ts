/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  text: string;
  done: boolean;
  category: 'duty' | 'work' | 'spiritual';
  pinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  status: 'active' | 'on-hold' | 'completed';
  refinedData?: {
  ideaScore?: { novelty: number; feasibility: number; impact: number; specificity: number; biggest_risk: string; improvement: string; source?: string; };
    titel: string;
    kundenproblem: string;
    loesung: string;
    zielgruppen_nische: string;
    monetarisierung: string;
    erster_validierungsschritt: string;
    unfair_advantage: string;
  };
  ideationMode?: string;
  descriptionSnippet?: string;
  pillarX?: number;
  pillarY?: number;
  isImportantIdea?: boolean;
}

export interface Officer {
  id: string;
  name: string;
  role: string;
  description: string;
  prompt: string;
  room: string;
  x: number;
  y: number;
  color: string;
}

export interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface IdeaPillar {
  id: string;
  x: number;
  y: number;
  stability: number; // 0 to 100
  maxStability: number;
  type: 'arbitrage' | 'pod' | 'saas';
  isCustomBusinessIdea?: boolean;
  customTitle?: string;
  customIdea?: Project;
}

export interface DecorativeLandscapeElement {
  id: string;
  x: number;
  y: number;
  type: 'crystal' | 'circuit' | 'monolith' | 'shrub';
  size: number;
  color: string;
  height?: number;
  pulseOffset: number;
}

export interface LootCore {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  title: string;
  description?: string;
  strength: number; // size and glow multiplier
  serendipity: number; // 0.0 to 1.0 uniqueness score
  color: string;
  collected: boolean;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  parents: string[]; // IDs of prerequisite skills
  icon: string;
}

export interface GameSave {
  day: number;
  xp: number;
  level: number;
  honor: number;
  corruption: number;
  tasks: Task[];
  projects: Project[];
  activeTaskId: string | null;
  skillPoints: number;
  unlockedSkills: string[];
  isDayMode?: boolean;
}

export interface PlayerStats {
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  spd: number;
}

export const WORLD = { w: 800, h: 800 };

export const COLORS = {
  bg: '#f5f3e7',
  ink: '#454d48',
  muted: '#8a928e',
  green: '#37e184',
  red: '#ff5d68',
  blue: '#78a7ff',
  violet: '#ad7bff',
  gold: '#f2c65b',
  panel: 'rgba(255,255,255,0.9)',
  line: 'rgba(0,0,0,0.05)',
};


// ===== VayBoard types (ported from Digital Büro) =====
export interface VayBoardCard {
  id: string;
  title: string;
  sourceType: 'YOUTUBE' | 'PDF' | 'TEXT' | 'VOICE' | 'TEAM';
  sourceUrl?: string;
  rawText?: string;
  summary: string;
  tags: string[];
  roles: ('STRATEGY' | 'CREATIVE' | 'OPERATIONS')[];
  projectRelevance?: string;
  nextActions: string[];
  status: 'NEW' | 'PROCESSED' | 'ARCHIVED';
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

export interface VayBoardBoard {
  id: string;
  name: string;
  createdAt: string;
}

export interface VayBoardBoardItem {
  id: string; // matches Card ID, or visual element ID
  boardId: string;
  cardId?: string; // optional if item is just a text block / group container
  x: number;
  y: number;
  width?: number;
  height?: number;
  groupId?: string; // if grouped under a Milanote column or section
  groupColor?: string; // if groupId belongs to this item (means it is a group/section container)
  groupTitle?: string; // if it is a section container
  connectedTo?: string[]; // IDs of other items connected with a visual node line
}

export interface VayBoardAgentEvent {
  id: string;
  agent: 'STRATEGY' | 'CREATIVE' | 'OPERATIONS';
  triggerType: string;
  cardId: string;
  description: string;
  status: 'PENDING' | 'PROCESSED';
  createdAt: string;
}
