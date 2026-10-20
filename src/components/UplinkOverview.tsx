import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Cpu, Activity, ShieldAlert, CheckCircle, Zap, RefreshCw, BarChart2, Info, Eye, Compass, Layers, Hourglass
} from 'lucide-react';

interface ComponentDetail {
  id: string;
  name: string;
  nameDe: string;
  coords: { x: number; y: number; r: number };
  status: 'ACTIVE' | 'CALIBRATING' | 'STANDBY';
  telemetry: string;
  specs: { label: string; value: string }[];
  description: string;
}

interface UplinkOverviewProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export default function UplinkOverview({ isOpen, onClose, isDark }: UplinkOverviewProps) {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'process' | 'telemetry'>('blueprint');
  const [selectedCompId, setSelectedCompId] = useState<string>('core');
  
  // Real-time telemetry indicators
  const [coreTemp, setCoreTemp] = useState<number>(0.021);
  const [resonance, setResonance] = useState<number>(82.4);
  const [vacuumPress, setVacuumPress] = useState<number>(1.2);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  
  // Simulation for fluctuations
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCoreTemp(t => +(t + (Math.random() - 0.5) * 0.002).toFixed(4));
      setResonance(r => +(r + (Math.random() - 0.5) * 1.5).toFixed(1));
      setVacuumPress(p => +(p + (Math.random() - 0.5) * 0.05).toFixed(2));
    }, 1500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle Diagnostic execution
  const runDiagnostic = () => {
    if (isDiagnosticRunning) return;
    setIsDiagnosticRunning(true);
    setDiagnosticProgress(0);
    setDiagnosticLogs([
      '[SYS_INIT] Initialisiere Systemdiagnose v4.2...',
      '[CONF_CHECK] Überprüfe Host-Konnektivität zu Haupt-Server...',
      '[SEC_CHECK] Kontrolliere Firewall-Protokolle der Zentrale...'
    ]);

    const logs = [
      '[CAP_VACUUM] Druckstabilität in Glaskapsel: 100% NOMINAL',
      '[CRY_TEMP] Thermale Kryo-Stufen: 0.021K STABIL',
      '[QU_CORE] Quanten-Fluktuationen innerhalb Toleranzgrenze',
      '[HOLO_UI] Laser-Sensoren re-kalibriert und zentriert',
      '[SYS_REP] DIAGNOSE: Klares System. Keine Unstimmigkeiten erkannt.'
    ];

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      setDiagnosticProgress(currentProgress);
      
      if (currentProgress === 30) {
        setDiagnosticLogs(prev => [...prev, logs[0], logs[1]]);
      } else if (currentProgress === 60) {
        setDiagnosticLogs(prev => [...prev, logs[2], logs[3]]);
      } else if (currentProgress === 100) {
        setDiagnosticLogs(prev => [...prev, logs[4]]);
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsDiagnosticRunning(false);
        }, 1000);
      }
    }, 300);
  };

  const components: ComponentDetail[] = [
    {
      id: 'core',
      name: 'Quantum Core',
      nameDe: 'Kryogener Quanten-Kern',
      coords: { x: 150, y: 175, r: 24 },
      status: 'ACTIVE',
      telemetry: 'RES: 82.4 Thz | TEMP: 0.02 K',
      specs: [
        { label: 'Reaktions-Typ', value: 'Ionisations-Analyse' },
        { label: 'Kern-Temperatur', value: '21 mK' },
        { label: 'Laser-Fokus', value: 'Sub-Atomar (0.1 nm)' },
        { label: 'Energiequelle', value: 'Vakuum-Energiegitter' }
      ],
      description: 'Der zentrale Quantenkern ionisiert rohe Gedankenstrukturen durch einen hochenergetischen Laserstrahl. Er transkodiert unvollständige Einfälle (Ideensplitter) in standardisierte neuronale Signale.'
    },
    {
      id: 'capsule',
      name: 'Glass Capsule',
      nameDe: 'Evakuierte Glaskapsel',
      coords: { x: 150, y: 140, r: 40 },
      status: 'ACTIVE',
      telemetry: 'PRESS: 1.2 x 10^-9 mbar',
      specs: [
        { label: 'Umschließung', value: 'Reinraum-Quarzglas' },
        { label: 'Vakuumstufe', value: 'Ultrahochvakuum (UHV)' },
        { label: 'Partikelabsorber', value: 'Magnethalterung' },
        { label: 'Sicherheitsbarriere', value: 'Klasse-5 Schockglas' }
      ],
      description: 'Die evakuierte Zylinder-Glaskapsel stabilisiert rohe Ideensplitter in einem künstlichen Vakuum. Dadurch wird verhindert, dass flüchtige Gedanken entweichen, bevor sie ionisiert und decodiert werden.'
    },
    {
      id: 'pillars',
      name: 'Support Pillars',
      nameDe: 'Dämpfungs-Trägerpfeiler',
      coords: { x: 90, y: 150, r: 16 },
      status: 'STANDBY',
      telemetry: 'CON: 100% | LOAD: 2.1%',
      specs: [
        { label: 'Bauform', value: 'Geometrisches Gitter' },
        { label: 'Material', value: 'Titan-Carbon-Legierung' },
        { label: 'Ausrichtung', value: 'Innere Zaungrenze' },
        { label: 'Schutzfaktor', value: 'Stoßresistent (Lvl-7)' }
      ],
      description: 'Die Dämpfungspfeiler sind physisch so positioniert, dass sie innerhalb der Schienen- und Zaungrenzen verlaufen. Sie absorbieren die dichte Quantenresonanz und verhindern visuelle Bildfehler oder physische Wandrisse.'
    },
    {
      id: 'terminal',
      name: 'Control Console',
      nameDe: 'Holografische Steuerkonsole',
      coords: { x: 150, y: 250, r: 20 },
      status: 'ACTIVE',
      telemetry: 'SYS: ONLINE | BAUD: 1.2M',
      specs: [
        { label: 'UI-Typ', value: 'Holografisches HUD' },
        { label: 'Sensorik', value: 'Infrarot-Handabtastung' },
        { label: 'Verbindungsrate', value: '1.2 Gbps Glasfaser' },
        { label: 'Verschlüsselung', value: 'Quantenschlüssel (AES-Q)' }
      ],
      description: 'Das interaktive holografische Terminal steuert die Energiezufuhr und zeigt aktuelle Kampagnenstufen an. Operatoren können hier direkt Diagnosen starten oder die Ionisationsrate anpassen.'
    },
    {
      id: 'base',
      name: 'Base Ingestion Collector',
      nameDe: 'Boden-Uplink Kollektor',
      coords: { x: 150, y: 280, r: 35 },
      status: 'ACTIVE',
      telemetry: 'EFF: 99.8% | VOLT: 450V',
      specs: [
        { label: 'Stromnetz', value: '3-Phasen Quantennetz' },
        { label: 'Kühlung', value: 'Flüssig-Stickstoff (77K)' },
        { label: 'Speicherkapazität', value: 'Zentralisierte DB' },
        { label: 'Filterung', value: 'Rauschunterdrücker (EMV)' }
      ],
      description: 'Die massive Bodenplattform leitet die gewonnene Arbitrage-Energie und neu gewonnene Werbeprojekte direkt an das Zentralsystem weiter, wo sie als anwendbare Upgrades freigegeben werden.'
    }
  ];

  const activeComp = components.find(c => c.id === selectedCompId) || components[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        id="uplink-modal"
        className="absolute inset-0 z-50 flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-slate-950/90 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} 
          animate={{ scale: 1, y: 0 }} 
          exit={{ scale: 0.95, y: 20 }}
          className={`w-full max-w-6xl h-[85vh] rounded-[36px] border flex flex-col overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.25)] ${isDark ? 'bg-slate-900 border-blue-500/30' : 'bg-slate-50 border-blue-200 text-slate-900'}`}
        >
          {/* Header Panel */}
          <div className={`p-6 sm:px-10 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white/60'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-500 text-white'}`}>
                <Cpu size={24} className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-2">
                  NEURONALER UPLINK-GENERATOR <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">Modell NU-01</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-[0.15em] mt-0.5">Spezifikation & Interaktive Funktions-Blaupause der Ingestions-Phasen</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              id="close-uplink"
              className={`p-2.5 rounded-full border transition-colors ${isDark ? 'hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-black'}`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Bar */}
          <div className={`px-8 py-3 border-b flex gap-4 text-xs font-black tracking-wider uppercase ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'}`}>
            <button 
              onClick={() => setActiveTab('blueprint')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === 'blueprint' ? 'text-blue-400 border-blue-500 bg-blue-500/5' : 'text-slate-400 hover:text-slate-200 border-transparent'}`}
            >
              <Layers size={14} /> 1. Interaktive Blaupause
            </button>
            <button 
              onClick={() => setActiveTab('process')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === 'process' ? 'text-blue-400 border-blue-500 bg-blue-500/5' : 'text-slate-400 hover:text-slate-200 border-transparent'}`}
            >
              <Compass size={14} /> 2. Ingestions-Prozess
            </button>
            <button 
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === 'telemetry' ? 'text-blue-400 border-blue-500 bg-blue-500/5' : 'text-slate-400 hover:text-slate-200 border-transparent'}`}
            >
              <Activity size={14} /> 3. Echtzeit-Telemetrie & Diagnose
            </button>
          </div>

          {/* Core Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Viewport Box (Left column, 60% on lg screen) */}
            <div className={`p-8 lg:w-[58%] border-r overflow-y-auto flex flex-col justify-between ${isDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200 bg-white'}`}>
              
              {activeTab === 'blueprint' && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-sm font-black uppercase text-blue-500 tracking-wider flex items-center gap-2"><Eye size={16}/> Interaktive Schnittansicht</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Klicke auf die markierten Bauteile in der Skizze, um detaillierte Konstruktions-Spezifikationen aufzurufen.</p>
                  </div>

                  {/* SVG Blueprint Draw */}
                  <div className="relative aspect-video flex items-center justify-center bg-slate-950 rounded-3xl p-6 border border-blue-900/10 overflow-hidden group shadow-inner">
                    {/* Retro Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-15" />
                    
                    {/* Isometric Vector Drawing */}
                    <svg viewBox="0 0 300 300" className="w-[85%] h-[85%] z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                      <defs>
                        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                        </linearGradient>
                        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
                          <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Laser Alignment Crosshair Lines */}
                      {activeComp && (
                        <g opacity="0.4">
                          <line x1="0" y1={activeComp.coords.y} x2="300" y2={activeComp.coords.y} stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="3 3"/>
                          <line x1={activeComp.coords.x} y1="0" x2={activeComp.coords.x} y2="300" stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="3 3"/>
                        </g>
                      )}

                      {/* 1. Base Terminal platform */}
                      <path 
                        d="M 60,260 L 240,260 L 210,290 L 90,290 Z" 
                        fill={selectedCompId === 'base' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(30, 41, 59, 0.6)'} 
                        stroke="#3b82f6" 
                        strokeWidth={selectedCompId === 'base' ? '2.5' : '1.5'} 
                        className="cursor-pointer transition-all duration-300 hover:fill-blue-500/20"
                        onClick={() => setSelectedCompId('base')}
                      />
                      <line x1="60" y1="260" x2="95" y2="215" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" opacity="0.3"/>
                      <line x1="240" y1="260" x2="205" y2="215" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" opacity="0.3"/>

                      {/* 2. Glass Capsule Cylinder */}
                      <rect 
                        x="100" y="70" width="100" height="150" rx="12" 
                        fill={selectedCompId === 'capsule' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)'} 
                        stroke="#00f0ff" 
                        strokeWidth={selectedCompId === 'capsule' ? '2.5' : '1.5'} 
                        strokeDasharray={selectedCompId === 'capsule' ? '0' : '4 2'}
                        className="cursor-pointer transition-all duration-300 hover:fill-cyan-500/10"
                        onClick={() => setSelectedCompId('capsule')}
                      />
                      {/* Glass glare effect lines */}
                      <line x1="120" y1="80" x2="120" y2="210" stroke="#ffffff" strokeWidth="0.7" opacity="0.2"/>
                      <line x1="128" y1="90" x2="128" y2="200" stroke="#ffffff" strokeWidth="0.4" opacity="0.1"/>

                      {/* 3. Damping Pillars (Pillars left & right inside bounds) */}
                      {/* Left Pillar */}
                      <g 
                        className="cursor-pointer" 
                        onClick={() => setSelectedCompId('pillars')}
                      >
                        <rect 
                          x="75" y="60" width="15" height="180" rx="3" 
                          fill={selectedCompId === 'pillars' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(15, 23, 42, 0.8)'} 
                          stroke="#3b82f6" 
                          strokeWidth={selectedCompId === 'pillars' ? '2.5' : '1.5'}
                        />
                        <line x1="75" y1="100" x2="90" y2="120" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                        <line x1="75" y1="140" x2="90" y2="160" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                        <line x1="75" y1="180" x2="90" y2="200" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                      </g>
                      
                      {/* Right Pillar */}
                      <g 
                        className="cursor-pointer" 
                        onClick={() => setSelectedCompId('pillars')}
                      >
                        <rect 
                          x="210" y="60" width="15" height="180" rx="3" 
                          fill={selectedCompId === 'pillars' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(15, 23, 42, 0.8)'} 
                          stroke="#3b82f6" 
                          strokeWidth={selectedCompId === 'pillars' ? '2.5' : '1.5'}
                        />
                        <line x1="225" y1="100" x2="210" y2="120" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                        <line x1="225" y1="140" x2="210" y2="160" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                        <line x1="225" y1="180" x2="210" y2="200" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                      </g>

                      {/* Top lid structure connecting the pillars */}
                      <rect x="70" y="50" width="160" height="15" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5"/>

                      {/* 4. Quantum glowing Core */}
                      <g 
                        className="cursor-pointer"
                        onClick={() => setSelectedCompId('core')}
                      >
                        <circle cx="150" cy="145" r="35" fill="url(#coreGlow)" opacity="0.75" />
                        
                        <circle 
                          cx="150" cy="145" r="16" 
                          fill={selectedCompId === 'core' ? '#22c55e' : '#10b981'} 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                          className="animate-pulse"
                        />
                        {/* Orbit path or ionization rays */}
                        <circle cx="150" cy="145" r="24" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3"/>
                        <circle cx="150" cy="145" r="30" fill="none" stroke="#22c55e" strokeWidth="0.5" opacity="0.5"/>
                      </g>

                      {/* 5. Holographic console screen display */}
                      <polygon 
                        points="110,230 190,230 180,250 120,250" 
                        fill={selectedCompId === 'terminal' ? 'rgba(0, 240, 255, 0.35)' : 'rgba(15, 23, 42, 0.9)'} 
                        stroke="#00f0ff" 
                        strokeWidth="1.5"
                        className="cursor-pointer transition-all hover:bg-cyan-500/10"
                        onClick={() => setSelectedCompId('terminal')}
                      />
                      <line x1="150" y1="210" x2="150" y2="230" stroke="#00f0ff" strokeWidth="1" opacity="0.6"/>

                      {/* Indicator text & nodes anchors inside blueprint */}
                      {components.map(comp => (
                        <g key={comp.id}>
                          <circle cx={comp.coords.x} cy={comp.coords.y} r="3.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1"/>
                          {selectedCompId === comp.id && (
                            <circle cx={comp.coords.x} cy={comp.coords.y} r="9" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" style={{ transformOrigin: `${comp.coords.x}px ${comp.coords.y}px` }}/>
                          )}
                        </g>
                      ))}
                    </svg>

                    {/* Anchor Legend Badge overlay inside drawing */}
                    <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[9px] font-mono flex flex-col gap-1 z-20">
                      <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"/> INTERAKTIVE AKTIV-ZELLEN</div>
                      <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> DÄMPFUNG MITTELS RAILS</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                    <span className="text-[10px] font-mono text-blue-400 font-extrabold flex items-center gap-1.5"><Info size={14}/> GEOMETRISCHER HINWEIS</span>
                    <span className="text-[10px] text-slate-400 font-bold max-w-[80%] text-right self-center">Die Eckpfeiler laufen sauber hinter den Gehegepfeilern und dem Gleisbecken, um visuelle Schnittstellenfehler zu eliminieren.</span>
                  </div>
                </div>
              )}

              {activeTab === 'process' && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="mb-6">
                    <h3 className="text-sm font-black uppercase text-blue-500 tracking-wider flex items-center gap-2"><Compass size={16}/> Gedanken-Ingestions-Pipeline</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Vierteiliger Workflow zur Re-Syntonisation roher Gedanken-Partikel in innovative Projekte.</p>
                  </div>

                  {/* Visual Process Flow Cards container */}
                  <div className="space-y-4 my-auto pr-2">
                    {[
                      {
                        num: '1', title: 'SPLITTER-COLLECTION', desc: 'Sammle leuchtende Ideenfraktionen (Arbeits-, Arbitrage- oder Creative-Splitter) direkt auf den Operationskarten der Zentrale.', icon: <Layers size={18} className="text-cyan-400" />
                      },
                      {
                        num: '2', title: 'KAPSEL-TRANSFER', desc: 'Trage den Splitter in den Erfassungsradius des Uplink-Generators und platziere ihn im Ultrahochvakuum der Glaskapsel.', icon: <Hourglass size={18} className="text-blue-400" />
                      },
                      {
                        num: '3', title: 'RE-SYNAPSEN-FOKUS', desc: 'Der Quantenkern aktiviert die Ionisation, um den Fragmentkörper zu de-integrieren und Muster-Abgleiche vorzunehmen.', icon: <Activity size={18} className="text-emerald-400" />
                      },
                      {
                        num: '4', title: 'PROJEKT-SYNTHESE', desc: 'Synthetisierte Arbitrage wird freigesetzt. Neue Firmenkampagnen und disruptive Softwareprojekte werden im System generiert!', icon: <Zap size={18} className="text-yellow-400" />
                      }
                    ].map((step, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border flex items-start gap-4 transition-all duration-300 ${isDark ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900' : 'bg-slate-100 border-slate-200'}`}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center border ${isDark ? 'bg-slate-950 border-blue-500/20 text-blue-400' : 'bg-white border-blue-300 text-blue-600'}`}>
                            {step.num}
                          </div>
                          {idx < 3 && <div className="w-[1.5px] h-8 bg-dashed bg-gradient-to-b from-blue-500 to-transparent opacity-40"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {step.icon}
                            <span className="text-xs font-black tracking-widest text-slate-200 uppercase">{step.title}</span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/15 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-extrabold">UPLINK BINDUNG</span>
                    <span className="text-[10px] text-slate-400 font-medium">Bringe leuchtende Splitter zum Uplink-Mittelkern, um sofort die Projektentwicklung zu beschleunigen!</span>
                  </div>
                </div>
              )}

              {activeTab === 'telemetry' && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-sm font-black uppercase text-blue-500 tracking-wider flex items-center gap-2"><Activity size={16}/> Physikalische Kern-Spezifikationen & Diagnose</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Echtzeit-Überwachung des Quantengitters und Ausführung tiefer Sicherheitsprüfungen.</p>
                  </div>

                  {/* Diagnostics Console and Logs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 my-4">
                    {/* Console controller */}
                    <div className={`p-6 rounded-3xl border flex flex-col justify-between ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono tracking-wider font-extrabold text-blue-400 uppercase">1. DIAGNOSTIK-OPERATIONEN</span>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                          Sollte die Ingestionsrate fluktuieren oder Anzeigefehler im holografischen Sender auftreten, führen Sie einen vollständigen thermischen Ausgleich durch.
                        </p>
                      </div>

                      <div className="space-y-3 mt-6">
                        <button 
                          onClick={runDiagnostic}
                          disabled={isDiagnosticRunning}
                          className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${isDiagnosticRunning ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-blue-600 border-blue-500 hover:bg-blue-500 text-white shadow-lg active:scale-95'}`}
                        >
                          <RefreshCw size={14} className={isDiagnosticRunning ? 'animate-spin' : ''} />
                          {isDiagnosticRunning ? `Diagnose läuft... (${diagnosticProgress}%)` : 'Systemdiagnose starten'}
                        </button>
                      </div>
                    </div>

                    {/* Operational Terminal Log Output */}
                    <div className="bg-black text-emerald-400 font-mono text-[10px] p-5 rounded-3xl border border-slate-800 flex flex-col h-[230px] justify-between">
                      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-semibold">
                        <p className="text-slate-500 mb-1 border-b border-slate-800 pb-1 flex justify-between"><span>NU-UPLINK TERMINAL V4.2</span> <span>ONLINE</span></p>
                        {diagnosticLogs.map((log, idx) => (
                          <div key={idx} className="leading-relaxed">{log}</div>
                        ))}
                        {diagnosticLogs.length === 0 && (
                          <p className="text-slate-600 italic">Terminalsatz bereit. Klicken Sie auf Diagnose starten.</p>
                        )}
                      </div>
                      
                      {isDiagnosticRunning && (
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3 text-emerald-300">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${diagnosticProgress}%` }} className="h-full bg-emerald-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">RESONANZ</span>
                      <span className="block text-sm font-black text-blue-400 font-mono mt-1">{resonance} THz</span>
                    </div>
                    <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">DAMPFMORTIALSTECK</span>
                      <span className="block text-sm font-black text-rose-400 font-mono mt-1">{coreTemp} K</span>
                    </div>
                    <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black">ZYLINDERDRUCK</span>
                      <span className="block text-sm font-black text-emerald-400 font-mono mt-1">{vacuumPress} x10⁻⁹</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar Details Panel (Right column, 42% on lg screen) */}
            <div className={`p-8 lg:w-[42%] flex flex-col justify-between overflow-y-auto ${isDark ? 'bg-slate-905 bg-slate-900/40 text-white' : 'bg-slate-100/60Text text-slate-900'}`}>
              <div>
                {/* Section Header */}
                <span className="text-[10px] font-mono text-blue-500 tracking-[0.25em] font-extrabold uppercase">SYSTEMKOMPONENTE SPEZIFIKATION</span>
                
                {/* Active Comp Header */}
                <div className="flex items-center gap-3 mt-3 mb-6">
                  <div className="px-2.5 py-1 text-[10px] font-mono bg-blue-500 text-white rounded-md font-extrabold tracking-wider uppercase">SUB-MODUL</div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{activeComp.nameDe}</h2>
                </div>

                {/* Subsystem status badge */}
                <div className="flex gap-2 items-center mb-6">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black ${activeComp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : (activeComp.status === 'CALIBRATING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20')}`}>
                    STATUS: {activeComp.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">{activeComp.telemetry}</span>
                </div>

                {/* Main description paragraph */}
                <div className={`p-5 rounded-2xl border text-xs leading-relaxed font-medium mb-6 ${isDark ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                  {activeComp.description}
                </div>

                {/* Technical data table */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider font-extrabold block">BETRIEBS-SRA PROTOKOLLE</span>
                  {activeComp.specs.map((spec, idx) => (
                    <div key={idx} className={`flex justify-between items-center py-2.5 px-3 rounded-xl border text-xs font-mono font-bold ${isDark ? 'bg-slate-950/20 border-slate-800 text-slate-300' : 'bg-white border-slate-100 text-slate-800'}`}>
                      <span className="text-slate-500 text-[11px] font-bold">{spec.label}</span>
                      <span className="text-blue-400 font-extrabold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingestion capacity state widget */}
              <div className={`p-6 rounded-3xl border mt-8 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono text-slate-500 tracking-widest font-black uppercase">RESONANZ-AUSLASTUNG</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-extrabold">OPERATIONAL (100%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-850 bg-slate-800 overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-emerald-400 w-[78%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                </div>
                <div className="flex justify-between items-center mt-3 text-[9px] font-mono text-slate-500 font-bold">
                  <span>0.00 THz</span>
                  <span>950.00 THz NOMINAL</span>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
