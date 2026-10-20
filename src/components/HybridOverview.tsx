import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Brain, Compass, Home, LayoutDashboard, ListTodo, Network, RotateCcw, Sparkles, X } from 'lucide-react';
import type { GameSave } from '../types';
import type { BoardMode } from './DesktopDashboard';
import SpatialMissionScene from './SpatialMissionScene';
import {
  DEPARTMENTS, makeCouncilDecision,
  type DepartmentId,
} from '../services/councilService';

interface Props {
  save: GameSave;
  onExplore: () => void;
  onOpenRoom: (id: DepartmentId) => void;
  onOpenDashboard: (tab: BoardMode) => void;
}

const iconStyle = { width: 16, height: 16 };

export default function HybridOverview({ save, onExplore, onOpenRoom, onOpenDashboard }: Props) {
  const [selected, setSelected] = useState<DepartmentId>('ops');
  const [council, setCouncil] = useState(false);
  const [councilReady, setCouncilReady] = useState(false);
  const decision = useMemo(() => makeCouncilDecision(save), [save]);
  const brief = decision.briefs.find(department => department.id === selected)!;

  useEffect(() => {
    if (!council) { setCouncilReady(false); return; }
    const timeout = window.setTimeout(() => setCouncilReady(true), 1050);
    return () => window.clearTimeout(timeout);
  }, [council]);

  const closeCouncil = () => setCouncil(false);

  return (
    <div className="fixed inset-0 z-[120] flex flex-col overflow-hidden bg-[#07111f] text-slate-100" aria-label="VayWorld Hybrid Mission Control">
      <header className="relative z-20 flex items-center justify-between gap-3 border-b border-sky-400/15 bg-[#071321]/80 px-4 py-3 backdrop-blur-xl lg:px-7">
        <div>
          <div className="text-lg font-black tracking-[.18em] text-slate-100">VAY <span className="text-sky-400">WORLD</span></div>
          <div className="text-[10px] uppercase tracking-[.23em] text-slate-400">Hybrid Mission Control</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200 sm:block">Lokaler Spielstand · kein Live-DTOS</span>
          <button onClick={onExplore} className="flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-900/35 px-3 py-2 text-xs font-semibold hover:bg-sky-800/50" title="Unveränderte VayWorld-Spielwelt öffnen">
            <Compass size={16} /> <span>Explore-Welt</span>
          </button>
          <button onClick={onExplore} aria-label="Hybrid-Modus schließen" className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav className="hidden w-[168px] shrink-0 flex-col gap-2 border-r border-sky-400/15 bg-[#0c1b2c]/80 p-3 xl:flex" aria-label="VayWorld Navigation">
          <div className="rounded-xl border border-sky-300/20 bg-sky-700/30 px-3 py-3 text-xs font-bold text-sky-100"><Home style={iconStyle} className="mr-2 inline"/> Übersicht</div>
          <button onClick={() => onOpenDashboard('AGENTEN')} className="rounded-xl px-3 py-3 text-left text-xs text-slate-300 hover:bg-white/10"><Brain style={iconStyle} className="mr-2 inline"/> Agenten</button>
          <button onClick={() => onOpenDashboard('ROADMAP')} className="rounded-xl px-3 py-3 text-left text-xs text-slate-300 hover:bg-white/10"><ListTodo style={iconStyle} className="mr-2 inline"/> Projekte</button>
          <button onClick={() => onOpenDashboard('VAYBOARD')} className="rounded-xl px-3 py-3 text-left text-xs text-slate-300 hover:bg-white/10"><Network style={iconStyle} className="mr-2 inline"/> Wissen</button>
          <div className="mt-auto border-t border-slate-700/60 pt-3 text-[10px] leading-relaxed text-slate-500">Die bisherige VayWorld bleibt als eigene Spielwelt vollständig erhalten.</div>
        </nav>

        <main className="relative flex min-w-0 flex-1 flex-col lg:flex-row">
          <section className="relative min-h-[52%] flex-1 overflow-hidden bg-[#0a1422] bg-[radial-gradient(ellipse_at_48%_49%,rgba(255,149,84,.17)_0%,transparent_34%),radial-gradient(ellipse_at_70%_22%,rgba(71,155,241,.14)_0%,transparent_39%),radial-gradient(ellipse_at_20%_86%,rgba(250,133,177,.09)_0%,transparent_34%),linear-gradient(145deg,#0d1b2b,#091320_70%)]" aria-label="Interaktive Abteilungsinseln">
            <SpatialMissionScene selected={selected} council={council} onChoose={setSelected} onCouncil={() => setCouncil(true)} />
            <div className="pointer-events-none absolute left-4 top-4 max-w-[250px] rounded-2xl border border-sky-300/15 bg-slate-950/35 p-3 backdrop-blur-xl">
              <div className="text-xs font-bold uppercase tracking-[.17em] text-sky-200">Abteilungen</div>
              <p className="mt-1 text-[11px] text-slate-400">Insel wählen oder die Energiekugel für deinen Wiedereinstiegsrat anklicken.</p>
            </div>
            <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 rounded-2xl border border-sky-300/25 bg-[#071423]/85 p-3 shadow-2xl backdrop-blur-xl xl:hidden">
              <span className="text-[10px] uppercase tracking-[.13em] text-slate-400">Aktueller Bereich</span>
              <span className="text-sm font-bold" style={{ color: brief.accent }}>{brief.title}</span>
              <button onClick={() => onOpenRoom(selected)}
                className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500">
                Bereich öffnen →
              </button>
            </div>
            <div className="pointer-events-none absolute bottom-[76px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-orange-300/25 bg-slate-950/55 px-4 py-2 text-center text-[10px] text-amber-100 shadow-xl backdrop-blur-xl">
              <Sparkles className="mr-2 inline" size={15} /> ENERGIEKUGEL · RAT EINBERUFEN
            </div>
            <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 rounded-xl border border-sky-400/20 bg-[#071423]/75 p-2 shadow-[0_16px_40px_rgba(0,0,0,.35)] backdrop-blur-xl sm:top-28 sm:bottom-auto">
              {DEPARTMENTS.map(d => (
                <button key={d.id} onClick={() => setSelected(d.id)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] hover:bg-white/10" aria-pressed={selected === d.id}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.accent }} /> <span className={selected === d.id ? 'text-white font-bold' : 'text-slate-400'}>{d.title}</span>
                </button>
              ))}
            </div>
          </section>
          <aside className="relative z-10 hidden w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-sky-400/15 bg-[#0b1a2b]/90 p-4 backdrop-blur-xl xl:flex xl:w-[315px] xl:border-l xl:border-t-0 xl:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Abteilungsdetail</div>
                <h2 className="mt-1 text-xl font-black" style={{ color: brief.accent }}>{brief.title}</h2>
                <p className="text-xs text-slate-400">{brief.subtitle}</p>
              </div>
              <span className="rounded-full border border-sky-400/25 px-2 py-1 text-[10px] text-sky-200">LOKAL</span>
            </div>
            <div className="relative h-32 overflow-hidden rounded-2xl border border-sky-300/15 bg-gradient-to-br from-slate-600/40 via-[#19334c] to-[#0b1627]">
              <div className="absolute inset-x-8 bottom-4 h-10 skew-x-[-20deg] rounded-xl border border-sky-300/40 bg-sky-500/15 shadow-[0_0_30px_rgba(56,189,248,.12)]" />
              <div className="absolute left-[38%] top-7 h-16 w-20 rotate-[-7deg] rounded border border-sky-300/35 bg-slate-800/90 shadow-lg">
                <div className="m-2 h-8 rounded bg-gradient-to-br from-sky-500/80 to-slate-800" />
              </div>
              <div className="absolute bottom-3 right-4 text-[10px] uppercase tracking-widest text-sky-200">VayWorld Studio</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-sky-300/15 bg-white/5 p-3"><div className="text-xl font-bold">{brief.evidenceCount}</div><div className="text-[10px] text-slate-400">Lokale Hinweise</div></div>
              <div className="rounded-xl border border-sky-300/15 bg-white/5 p-3"><div className="text-lg font-bold">{brief.score === null ? 'Unbekannt' : brief.score}</div><div className="text-[10px] text-slate-400">Rat-Signal (intern)</div></div>
            </div>
            <div className="rounded-2xl border border-sky-300/15 bg-white/5 p-4">
              <h3 className="text-xs font-bold text-sky-200">Bekannter Stand</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">{brief.summary}</p>
              <p className="mt-2 text-[10px] text-slate-500">Quelle: lokaler VayWorld-Spielstand. Kein Echtzeit-Agentenbericht.</p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              <button onClick={() => onOpenRoom(selected)} className="flex-1 rounded-xl bg-sky-600 px-3 py-3 text-xs font-bold hover:bg-sky-500">Bereich öffnen</button>
              <button onClick={() => setCouncil(true)} className="rounded-xl border border-sky-400/40 px-3 py-3 text-xs font-bold text-sky-200 hover:bg-sky-400/10">Rat</button>
            </div>
          </aside>
        </main>
      </div>
      <footer className="absolute bottom-4 left-1/2 z-20 flex w-max max-w-[95vw] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-sky-300/25 bg-[#081727]/90 p-2 shadow-[0_18px_40px_rgba(0,0,0,.6)] backdrop-blur-xl">
        <button className="rounded-lg bg-sky-700/40 px-3 py-2 text-[11px] font-bold text-sky-100" onClick={() => setSelected('ops')}><LayoutDashboard size={14} className="mr-1 inline"/> Übersicht</button>
        <button className="rounded-lg px-3 py-2 text-[11px] text-slate-300 hover:bg-white/10" onClick={onExplore}><Compass size={14} className="mr-1 inline"/> Explore</button>
        <button className="rounded-lg px-3 py-2 text-[11px] text-slate-300 hover:bg-white/10" onClick={() => onOpenDashboard('AGENTEN')}><Brain size={14} className="mr-1 inline"/> Agenten</button>
        <button className="rounded-lg px-3 py-2 text-[11px] text-slate-300 hover:bg-white/10" onClick={() => onOpenDashboard('ROADMAP')}><ListTodo size={14} className="mr-1 inline"/> Roadmap</button>
      </footer>

      <AnimatePresence>
        {council && (
          <motion.div className={councilReady ? 'absolute inset-0 z-30 flex items-center justify-center bg-[#06101c]/78 p-4 backdrop-blur-[3px]' : 'absolute inset-0 z-30 flex items-center justify-center bg-[#06101c]/25 p-4'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.section initial={{ scale: .92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .95, opacity: 0 }} className="w-full max-w-xl rounded-[28px] border border-sky-300/30 bg-[#10243a]/95 p-5 shadow-[0_0_100px_rgba(53,145,244,.23)] sm:p-8" role="dialog" aria-modal="true" aria-labelledby="council-title">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[.26em] text-sky-300">VayWorld · Re-Entry Council</div>
                  <h2 id="council-title" className="mt-2 text-2xl font-black">Der Rat</h2>
                </div>
                <button onClick={closeCouncil} className="self-start rounded-lg p-2 hover:bg-white/10" aria-label="Rat schließen"><X size={20}/></button>
              </div>
              {!councilReady ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <RotateCcw size={40} className="animate-spin text-sky-300"/>
                  <p className="text-sm text-slate-200">Die Abteilungen kommen zusammen …</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {decision.briefs.map(d => (
                      <div key={d.id} className="rounded-xl border border-white/10 bg-white/5 p-2 text-center">
                        <span className="mx-auto mb-2 block h-2 w-2 rounded-full" style={{ backgroundColor: d.accent }}/>
                        <span className="block text-[10px]">{d.title}</span>
                        <span className="mt-1 block text-[10px] text-slate-500">{d.score === null ? 'Keine Daten' : 'Signal ' + d.score}</span>
                      </div>
                    ))}
                  </div>
                  {decision.winner ? (
                    <div className="rounded-2xl border border-sky-400/30 bg-sky-400/5 p-5">
                      <div className="text-[10px] uppercase tracking-widest text-sky-200">Empfohlener erster Sprecher</div>
                      <h3 className="mt-2 text-xl font-bold" style={{color: decision.winner.accent}}>{decision.winner.title}</h3>
                      <p className="mt-3 text-sm text-slate-200">{decision.winner.summary}</p>
                      <p className="mt-2 text-xs text-slate-300">{decision.winner.whyFirst}</p>
                      <div className="mt-4 rounded-xl bg-black/20 p-3 text-sm text-white">{decision.winner.nextAction}</div>
                      <button className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold hover:bg-sky-500" onClick={() => { const id = decision.winner!.id; closeCouncil(); onOpenRoom(id); }}>Jetzt zum Bereich</button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
                      <h3 className="text-lg font-bold text-amber-200">Noch kein belegter Vorrang</h3>
                      <p className="mt-2 text-sm text-slate-200">Der lokale Spielstand enthält keine aktiven Projekte oder offenen Aufgaben. Es wäre erfunden, einen Sprecher zu bestimmen. Wähle eine Abteilung oder ergänze zuerst echte Statusdaten.</p>
                    </div>
                  )}
                  <div className="text-[11px] leading-relaxed text-slate-400">Prototyp: regelbasierte Auswertung lokaler Daten, keine echte Agentenkonferenz. Keine externen Aktionen oder Zustandsänderungen.</div>
                  <button onClick={closeCouncil} className="w-full rounded-xl border border-slate-600 py-2 text-xs font-semibold hover:bg-white/10">Zur Übersicht zurück</button>
                </div>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
