import test from 'node:test';
import assert from 'node:assert/strict';
import { makeCouncilDecision } from './councilService.ts';
import type { GameSave } from '../types';

const empty: GameSave = {
  day: 1, xp: 0, level: 1, honor: 100, corruption: 0,
  tasks: [], projects: [], activeTaskId: null, skillPoints: 0, unlockedSkills: [],
};

test('never invents a speaker when all departments lack evidence', () => {
  const decision = makeCouncilDecision(empty);
  assert.equal(decision.winner, null);
  assert.equal(decision.isVerifiedLive, false);
  assert.equal(decision.briefs.length, 4);
  assert.ok(decision.briefs.every(brief => brief.score === null));
});

test('a pinned open task can take priority and points to the actual task', () => {
  const decision = makeCouncilDecision({
    ...empty,
    tasks: [{ id: 't1', text: 'Vorprüfung abschließen', done: false, pinned: true, category: 'work' }],
    projects: [{ id: 'p1', name: 'ISA', progress: 40, status: 'active' }],
  });
  assert.equal(decision.winner?.id, 'ops');
  assert.match(decision.winner?.nextAction || '', /Vorprüfung abschließen/);
  assert.equal(decision.winner?.source, 'VayWorld local save');
});

test('two paused projects outrank an ordinary open task', () => {
  const decision = makeCouncilDecision({
    ...empty,
    tasks: [{ id: 't1', text: 'Dokument lesen', done: false, category: 'work' }],
    projects: [
      { id: 'p1', name: 'ISA', progress: 40, status: 'on-hold' },
      { id: 'p2', name: 'VayWorld', progress: 10, status: 'on-hold' },
    ],
  });
  assert.equal(decision.winner?.id, 'strat');
  assert.match(decision.winner?.summary || '', /2 pausiert/);
});

test('completed tasks and projects do not create false priorities', () => {
  const decision = makeCouncilDecision({
    ...empty,
    tasks: [{ id: 't1', text: 'Erledigt', done: true, category: 'work' }],
    projects: [{ id: 'p1', name: 'Fertig', progress: 100, status: 'completed' }],
  });
  assert.equal(decision.winner, null);
});
