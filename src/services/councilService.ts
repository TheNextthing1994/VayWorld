import type { GameSave } from '../types';

/**
 * Read-only re-entry projection of the existing VayWorld save.
 * This is NOT an agent deliberation or DTOS live status. Never invent activity,
 * deadlines, agent health, or project ownership that the source cannot prove.
 */
export type DepartmentId = 'ops' | 'strat' | 'intel' | 'core';

export interface DepartmentBrief {
  id: DepartmentId;
  title: string;
  subtitle: string;
  accent: string;
  evidenceCount: number;
  score: number | null;
  summary: string;
  whyFirst: string;
  nextAction: string | null;
  source: 'VayWorld local save';
}

export interface CouncilDecision {
  briefs: DepartmentBrief[];
  winner: DepartmentBrief | null;
  isVerifiedLive: false;
}

export const DEPARTMENTS: ReadonlyArray<Pick<DepartmentBrief, 'id' | 'title' | 'subtitle' | 'accent'>> = [
  { id: 'strat', title: 'Strategie', subtitle: 'Pläne & Entscheidungen', accent: '#56dfa9' },
  { id: 'intel', title: 'Aufklärung', subtitle: 'Recherche & Wissen', accent: '#66c8ff' },
  { id: 'core', title: 'Kreation', subtitle: 'Ideen & Entwürfe', accent: '#d58bff' },
  { id: 'ops', title: 'Zentrale', subtitle: 'Aufgaben & Ausführung', accent: '#ffba69' },
];

export function makeCouncilDecision(save: GameSave): CouncilDecision {
  const tasks = Array.isArray(save.tasks) ? save.tasks : [];
  const projects = Array.isArray(save.projects) ? save.projects : [];
  const openTasks = tasks.filter(task => !task.done);
  const pinned = openTasks.filter(task => task.pinned);
  const held = projects.filter(project => project.status === 'on-hold');
  const active = projects.filter(project => project.status === 'active');

  const briefs: DepartmentBrief[] = DEPARTMENTS.map(department => {
    const base = { ...department, source: 'VayWorld local save' as const };
    if (department.id === 'strat') {
      const meaningful = held.length + active.length;
      const first = held[0] || active[0];
      return {
        ...base,
        evidenceCount: meaningful,
        score: meaningful ? held.length * 6 + active.length * 2 : null,
        summary: meaningful
          ? projects.length + ' Projekte gespeichert, davon ' + held.length + ' pausiert und ' + active.length + ' aktiv.'
          : 'Keine aktiven oder pausierten Projekte im lokalen Spielstand.',
        whyFirst: held.length
          ? 'Ein pausiertes Projekt benötigt möglicherweise eine Entscheidung; Ursache und Dringlichkeit sind noch zu prüfen.'
          : 'Es gibt aktive Projekte; die Reihenfolge benötigt einen Abgleich mit den echten Projektständen.',
        nextAction: first ? 'Projekt prüfen: ' + first.name : null,
      };
    }
    if (department.id === 'ops') {
      const next = pinned[0] || openTasks[0];
      return {
        ...base,
        evidenceCount: openTasks.length,
        score: openTasks.length ? pinned.length * 5 + openTasks.length * 2 : null,
        summary: openTasks.length
          ? openTasks.length + ' offene Aufgaben im lokalen Spielstand, davon ' + pinned.length + ' angeheftet.'
          : 'Keine offenen Aufgaben im lokalen Spielstand.',
        whyFirst: pinned.length
          ? 'Eine bewusst angeheftete offene Aufgabe erhält Vorrang gegenüber gewöhnlichen Aufgaben.'
          : 'Offene Aufgaben sind vorhanden; Fälligkeit und tatsächliche Dringlichkeit sind nicht bekannt.',
        nextAction: next ? 'Aufgabe prüfen: ' + next.text : null,
      };
    }
    return {
      ...base,
      evidenceCount: 0,
      score: null,
      summary: 'Für diesen Bereich fehlen im Spielstand belastbare Status- und Aktivitätsdaten.',
      whyFirst: 'Keine Priorisierung ohne nachprüfbare Aufgaben- und Zustandsdaten.',
      nextAction: null,
    };
  });

  // No artificial winner when all departments have unknown or empty states.
  const eligible = briefs.filter((brief): brief is DepartmentBrief & { score: number } => brief.score !== null);
  eligible.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return { briefs, winner: eligible[0] || null, isVerifiedLive: false };
}
