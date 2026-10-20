export async function chatWithOfficer(systemPrompt: string, history: any[], message: string): Promise<string> {
  try {
    const response = await fetch("/api/chat-officer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ systemPrompt, history, message }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP-Fehler ${response.status}`);
    }

    const data = await response.json();
    return data.text || "Keine Antwort erhalten.";
  } catch (error: any) {
    console.error("Fehler beim Chat mit dem Officer:", error);
    throw error;
  }
}

export interface RefinedIdea {
  titel: string;
  kundenproblem: string;
  loesung: string;
  zielgruppen_nische: string;
  monetarisierung: string;
  erster_validierungsschritt: string;
  unfair_advantage: string;
}

export async function refineIdea(seedTitle: string, seedDescription: string, modus: string): Promise<RefinedIdea> {
  try {
    const response = await fetch("/api/refine-idea", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seedTitle, seedDescription, modus }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP-Fehler ${response.status}`);
    }

    const data = await response.json();
    if (!data.refined) {
      throw new Error("Ungültiges Antwortformat der Synthese-Unit.");
    }
    return data.refined as RefinedIdea;
  } catch (error: any) {
    console.error("Fehler bei der Ideen-Veredelung:", error);
    throw error;
  }
}


export interface IdeaScore {
  novelty: number;
  feasibility: number;
  impact: number;
  specificity: number;
  biggest_risk: string;
  improvement: string;
  source?: string;
}

// Stufe 3: laesst die veredelte Idee serverseitig bewerten (Novelty/Feasibility/Impact/Specificity).
export async function judgeIdea(idea: any, recentTitles: string[] = []): Promise<IdeaScore> {
  try {
    const res = await fetch('/api/judge-idea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea, recentTitles }),
    });
    if (!res.ok) throw new Error('judge http ' + res.status);
    return await res.json();
  } catch (e) {
    // Client-Fallback, damit das Spiel nie blockiert.
    const titel = String((idea && idea.titel) || '');
    const len = JSON.stringify(idea || {}).length;
    const dup = recentTitles.some(t => typeof t === 'string' && t.trim().toLowerCase() === titel.trim().toLowerCase());
    const seed = (len * 7 + titel.length * 13) % 31;
    const base = (o: number) => Math.max(30, Math.min(92, 55 + ((seed + o) % 30) - 12));
    return {
      novelty: dup ? 28 : base(3),
      feasibility: base(11),
      impact: base(19),
      specificity: Math.min(95, 40 + Math.floor(len / 18)),
      biggest_risk: 'Offline-Bewertung: reale Zahlungsbereitschaft und Markt sind ungeprueft.',
      improvement: 'Fuehre 5 Problem-Interviews mit der Zielgruppe durch.',
      source: 'fallback',
    };
  }
}

// ============================================================
// VayBoard KI-Funktionen — SICHERE STUBS (Variante Y)
// Liefern formkorrekte Fallback-Daten ohne KI-Aufruf / ohne API-Key.
// Spaeter an /api/-Server verdrahten (analog chatWithOfficer).
// ============================================================

export interface VayBoardCardAnalysis {
  title: string;
  summary: string;
  tags: string[];
  roles: ('STRATEGY' | 'CREATIVE' | 'OPERATIONS')[];
  projectRelevance: string;
  nextActions: string[];
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface InboxQueryResponse {
  answer: string;
  relevantCardIds: string[];
}

export const analyzeKnowledgeInput = async (
  rawText: string,
  sourceType: 'YOUTUBE' | 'PDF' | 'TEXT' | 'VOICE' | 'TEAM',
  sourceUrl?: string
): Promise<VayBoardCardAnalysis> => {
  const firstLine = (rawText || '').split('\n').map(s => s.trim()).find(Boolean) || 'Neue Wissens-Karte';
  const title = firstLine.slice(0, 80);
  return {
    title,
    summary: 'KI-Analyse momentan nicht verfuegbar. Rohinhalt wurde gespeichert und kann manuell bearbeitet werden.',
    tags: [sourceType.toLowerCase()],
    roles: ['STRATEGY'],
    projectRelevance: 'Noch nicht bewertet (KI offline).',
    nextActions: ['Manuell pruefen und Rollen/Tags ergaenzen.'],
    importance: 'MEDIUM',
  };
};

export const generateAgentCommentary = async (
  cardTitle: string,
  cardSummary: string,
  projectRelevance: string,
  agent: 'STRATEGY' | 'CREATIVE' | 'OPERATIONS'
): Promise<string> => {
  return `[${agent}] Kommentar momentan nicht verfuegbar (KI offline). Karte: "${cardTitle}".`;
};

export const queryInboxWithQuestion = async (
  question: string,
  cards: any[]
): Promise<InboxQueryResponse> => {
  return {
    answer: 'Die KI-gestuetzte Inbox-Abfrage ist momentan nicht verfuegbar (offline). Bitte spaeter erneut versuchen.',
    relevantCardIds: [],
  };
};
