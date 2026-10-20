import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Float, 
  Text, 
  MeshDistortMaterial, 
  ContactShadows,
  Html,
  PresentationControls
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Info, CornerRightUp } from 'lucide-react';
import { LootCore } from '../types';

interface BueroSzeneProps {
  officerId: string;
  officerName: string;
  officerRole: string;
  roomTitle: string;
  isDayMode: boolean;
  onToggleDayMode: () => void;
  onExit: () => void;
  hologramLoot: LootCore | null;
}

// --- 3D Components ---

function PodcastTable() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Table Top (Glass) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.6, 0]} receiveShadow>
        <circleGeometry args={[2, 32]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.4} 
          roughness={0.1} 
          metalness={0.2} 
          transmission={0.9} 
          thickness={0.5} 
          color="#ffffff"
        />
      </mesh>
      {/* Table Legs */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 2) * 1.5,
          0.3,
          Math.sin(i * Math.PI / 2) * 1.5
        ]}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function StudioAvatar({ color }: { color: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.5 + Math.sin(state.clock.getElapsedTime() * 1.2) * 0.05;
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[2.5, -0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Simple Abstract Avatar Body */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 4, 16]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
}

function HologramIdea({ loot }: { loot: LootCore | null }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = 0.2 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  if (!loot) return null;

  return (
    <group ref={meshRef} position={[0, 0.2, 0]}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh castShadow>
          <torusGeometry args={[0.4, 0.1, 16, 64]} />
          <meshStandardMaterial 
            color={loot.color} 
            emissive={loot.color} 
            emissiveIntensity={2} 
            transparent 
            opacity={0.8}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial 
            color={loot.color} 
            emissive={loot.color} 
            emissiveIntensity={5} 
          />
        </mesh>
      </Float>
      <Html position={[0, 0.8, 0]} center>
        <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-[10px] font-black text-white whitespace-nowrap uppercase tracking-widest flex flex-col items-center">
          <span className="text-blue-400 mb-1">{loot.title}</span>
          <div className="flex gap-1 items-center">
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${loot.strength * 100}%` }} />
            </div>
            <span className="opacity-50">STRENGTH</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

function StudioLights({ isDay }: { isDay: boolean }) {
  return (
    <>
      <ambientLight intensity={isDay ? 1.5 : 0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isDay ? 2 : 0.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight 
        position={[-5, 5, -5]} 
        intensity={isDay ? 1 : 2} 
        color={isDay ? "#fff" : "#3b82f6"} 
      />
      {/* Ceiling lights */}
      {[-2, 0, 2].map(x => (
        <mesh key={x} position={[x, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      ))}
    </>
  );
}

function RoomWalls({ isDay }: { isDay: boolean }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color={isDay ? "#f1f5f9" : "#020617"} 
          roughness={0.8}
        />
      </mesh>
      {/* Back Wall */}
      <mesh position={[0, 14.5, -15]}>
        <planeGeometry args={[100, 30]} />
        <meshStandardMaterial 
          color={isDay ? "#e2e8f0" : "#1e293b"} 
        />
      </mesh>
      {/* Interior Grid Pattern on Floor */}
      <gridHelper args={[100, 100, isDay ? "#cbd5e1" : "#1e293b", isDay ? "#f1f5f9" : "#0f172a"]} position={[0, -0.49, 0]} />
    </group>
  );
}

// --- Main Scene Component ---

export default function BueroSzene({ 
  officerId, 
  officerName, 
  officerRole, 
  roomTitle,
  isDayMode, 
  onToggleDayMode, 
  onExit,
  hologramLoot
}: BueroSzeneProps) {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'l') onToggleDayMode();
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleDayMode, onExit]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black select-none font-sans">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 3, 8]} fov={50} />
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={5} 
          maxDistance={15} 
        />
        
        <StudioLights isDay={isDayMode} />
        <Environment preset={isDayMode ? "city" : "night"} />
        
        <PodcastTable />
        <StudioAvatar color={officerId === 'ops' ? '#3b82f6' : officerId === 'strat' ? '#a855f7' : officerId === 'intel' ? '#06b6d4' : '#eab308'} />
        <HologramIdea loot={hologramLoot} />
        
        <RoomWalls isDay={isDayMode} />
        
        <ContactShadows 
          position={[0, -0.49, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2} 
          far={4.5} 
        />
      </Canvas>

      {/* 2D UI Overlay */}
      <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <motion.div 
            initial={{ x: -40, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="p-8 rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 pointer-events-auto"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/20">
                <CornerRightUp size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{roomTitle}</h1>
                <div className="flex gap-2 items-center text-[10px] font-black text-slate-500 tracking-widest mt-1">
                   <span className="text-blue-500">SECURE CHANNEL</span>
                   <span>·</span>
                   <span>ENCRYPTION: 2048-BIT</span>
                </div>
              </div>
            </div>
            
            <div className={`p-6 rounded-3xl border transition-colors ${isDayMode ? 'bg-white/5 border-white/10' : 'bg-slate-900/40 border-white/5'}`}>
               <h2 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{officerName}</h2>
               <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">{officerRole}</p>
               <div className="h-px bg-white/10 mb-4" />
               <p className="text-sm italic text-slate-400 max-w-[240px]">
                 "Willkommen im Hub. Das System ist bereit für deine Analysen."
               </p>
            </div>
          </motion.div>

          <div className="flex flex-col gap-4 items-end pointer-events-auto">
            <button 
              onClick={onExit}
              className="p-5 rounded-2xl bg-red-500 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-white/20"
            >
               <X size={32} strokeWidth={3} />
               <span className="hidden">EXIT [ESC]</span>
            </button>
            <button 
              onClick={onToggleDayMode}
              className={`p-5 rounded-2xl shadow-2xl transition-all border border-white/10 flex items-center justify-center hover:scale-105 active:scale-95 ${isDayMode ? 'bg-slate-900 text-yellow-400' : 'bg-white text-slate-900'}`}
            >
               {isDayMode ? <Moon size={32} /> : <Sun size={32} />}
            </button>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mt-2">Steuerung: Maus + WASD</div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
               {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
               ))}
            </div>
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">VayWorld Intersystem // Virtual Office</div>
          </div>

          <div className="p-8 rounded-[40px] bg-black/40 backdrop-blur-xl border border-white/10 pointer-events-auto flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktion Erforderlich</span>
              <span className="text-sm font-black text-white tracking-widest uppercase">Ideen-Synchronisation...</span>
            </div>
            <div className="p-4 bg-green-500 text-black rounded-2xl animate-pulse">
               <Info size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
