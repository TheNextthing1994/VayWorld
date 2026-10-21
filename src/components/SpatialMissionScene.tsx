import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Html, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { DepartmentId } from '../services/councilService';

type Props = {
  selected: DepartmentId;
  council: boolean;
  onChoose: (id: DepartmentId) => void;
  onCouncil: () => void;
};

const LOCATIONS: Record<DepartmentId, [number, number, number]> = {
  strat: [-3.50, 0, -2.45],
  intel: [3.50, 0, -2.45],
  core: [-3.50, 0, 2.45],
  ops: [3.50, 0, 2.45],
};

const DEPTS: { id: DepartmentId; name: string; accent: string; icon: string }[] = [
  { id: 'strat', name: 'Strategie', accent: '#4bd5a9', icon: '◇' },
  { id: 'intel', name: 'Aufklärung', accent: '#56bfff', icon: '⌕' },
  { id: 'core', name: 'Kreation', accent: '#ef82d1', icon: '✦' },
  { id: 'ops', name: 'Zentrale', accent: '#ffb15b', icon: '▦' },
];

const THREE_POINTS = Array.from({ length: 19 }, (_, i) => {
  const a = i * 2.39996;
  const radius = .55 * Math.sqrt((i + .5) / 19);
  return [Math.cos(a) * radius, .3 + .65 * ((i % 4) / 4), Math.sin(a) * radius] as [number, number, number];
});

function createScreenTexture(accent: string, variation = 0): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;
  const bg = ctx.createLinearGradient(0, 0, 256, 160);
  bg.addColorStop(0, '#0b223e');
  bg.addColorStop(1, '#06101e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 160);
  ctx.fillStyle = accent;
  ctx.globalAlpha = .85;
  ctx.fillRect(18, 16, 78, 5);
  ctx.globalAlpha = .35;
  ctx.fillRect(18, 29, 142, 2);
  ctx.globalAlpha = .92;
  if (variation % 2 === 0) {
    for (let i = 0; i < 9; i++) ctx.fillRect(22 + i * 23, 123 - ((i * 31 + variation * 17) % 71), 12, 18 + ((i * 31 + variation * 17) % 71));
  } else {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const x = 22 + i * 22;
      const y = 105 - Math.sin(i * .95 + variation) * 34 - i * 3;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = accent;
    ctx.stroke();
    ctx.strokeStyle = '#8fd9ff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(174, 27, 62, 53);
  }
  ctx.globalAlpha = .2;
  for (let y = 0; y < 160; y += 10) {
    ctx.fillStyle = '#b9e4ff';
    ctx.fillRect(0, y, 256, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function Monitor({ accent, variation = 0, width = .48 }: { accent: string; variation?: number; width?: number }) {
  const map = useMemo(() => createScreenTexture(accent, variation), [accent, variation]);
  return (
    <group>
      <RoundedBox args={[width + .06, .34, .035]} radius={.025} smoothness={4} position={[0, .23, 0]} castShadow>
        <meshStandardMaterial color="#111e2b" metalness={.7} roughness={.27}/>
      </RoundedBox>
      <mesh position={[0, .23, .023]}>
        <planeGeometry args={[width, .29]}/>
        <meshBasicMaterial map={map} toneMapped={false}/>
      </mesh>
      <mesh position={[0, .025, -.02]}>
        <cylinderGeometry args={[.012, .014, .2, 8]}/>
        <meshStandardMaterial color="#748b95" metalness={.75} roughness={.22}/>
      </mesh>
      <mesh position={[0, -.08, 0]}>
        <boxGeometry args={[.16, .012, .12]}/>
        <meshStandardMaterial color="#637782" metalness={.65}/>
      </mesh>
    </group>
  );
}

function Desk({ x, z, accent, turn = 0, index = 0 }: { x: number; z: number; accent: string; turn?: number; index?: number }) {
  return (
    <group position={[x, .3, z]} rotation={[0, turn, 0]}>
      <RoundedBox args={[.86, .055, .45]} radius={.025} smoothness={3} position={[0, .35, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#eff2e9" roughness={.6}/>
      </RoundedBox>
      {[-.37,.37].map((s) => (
        <mesh key={s} castShadow position={[s, .16, 0]}>
          <boxGeometry args={[.027,.35,.37]}/>
          <meshStandardMaterial color="#a8b5b8" metalness={.7} roughness={.25}/>
        </mesh>
      ))}
      <group position={[.06, .43, -.12]} rotation={[0, 0, 0]}>
        <Monitor accent={accent} variation={index}/>
      </group>
      <mesh castShadow position={[-.27,.39,.04]}>
        <boxGeometry args={[.22,.018,.075]}/>
        <meshStandardMaterial color="#253d50"/>
      </mesh>
      <group position={[.07, .18, .47]}>
        <RoundedBox args={[.33,.42,.32]} radius={.07} smoothness={3} position={[0, .03, 0]} castShadow>
          <meshStandardMaterial color="#31465e" roughness={.7}/>
        </RoundedBox>
        <mesh position={[0,-.24,-.05]}>
          <cylinderGeometry args={[.018,.018,.22,8]}/>
          <meshStandardMaterial color="#6e838c" metalness={.5}/>
        </mesh>
        <mesh position={[0,-.35,-.05]} rotation={[-Math.PI/2,0,0]}>
          <cylinderGeometry args={[.2,.2,.018,8]}/>
          <meshStandardMaterial color="#334757"/>
        </mesh>
      </group>
    </group>
  );
}

function LittlePerson({ x, z, color = '#39546a', turn = 0 }: { x: number; z: number; color?: string; turn?: number }) {
  return (
    <group position={[x,.51,z]} rotation={[0,turn,0]}>
      <mesh castShadow position={[0,.46,0]}>
        <sphereGeometry args={[.105,14,10]}/>
        <meshStandardMaterial color="#cda88d" roughness={.85}/>
      </mesh>
      <RoundedBox args={[.2,.31,.145]} radius={.05} position={[0,.16,0]} castShadow>
        <meshStandardMaterial color={color} roughness={.77}/>
      </RoundedBox>
      {[-.12,.12].map((dx) => (
        <mesh key={dx} castShadow position={[dx,.14,-.01]} rotation={[0,0,dx < 0 ? -.24 : .24]}>
          <capsuleGeometry args={[.035,.15,3,8]}/>
          <meshStandardMaterial color={color}/>
        </mesh>
      ))}
    </group>
  );
}

function Plant({ x, z, size = 1 }: { x: number; z: number; size?: number }) {
  return (
    <group position={[x,.18,z]} scale={size}>
      <mesh position={[0,.14,0]} castShadow>
        <cylinderGeometry args={[.145,.12,.29,12]}/>
        <meshStandardMaterial color="#d9ccbb" roughness={.86}/>
      </mesh>
      <mesh position={[0,.41,0]} castShadow>
        <cylinderGeometry args={[.021,.035,.48,8]}/>
        <meshStandardMaterial color="#775a42" roughness={1}/>
      </mesh>
      {THREE_POINTS.slice(0,12).map((p,i)=>(
        <mesh key={i} position={[p[0]*.65,.17 + p[1]*.63,p[2]*.65]} castShadow>
          <icosahedronGeometry args={[.12 + (i%3)*.017,1]}/>
          <meshStandardMaterial color={i%3===0 ? '#517a44' : i%3===1 ? '#44795d':'#317363'} roughness={.96}/>
        </mesh>
      ))}
    </group>
  );
}

function GlassScreen({ accent, index, x, z, turn = 0 }: { accent: string; index: number; x: number; z: number; turn?: number }) {
  const map = useMemo(() => createScreenTexture(accent, index), [accent, index]);
  return (
    <group position={[x,1.22,z]} rotation={[0,turn,0]}>
      <RoundedBox args={[.85,.62,.045]} radius={.04} smoothness={4} castShadow>
        <meshStandardMaterial color="#12243a" metalness={.72} roughness={.2}/>
      </RoundedBox>
      <mesh position={[0,0,.028]}>
        <planeGeometry args={[.76,.53]}/>
        <meshBasicMaterial map={map} toneMapped={false}/>
      </mesh>
      <mesh position={[0,-.4,0]}>
        <boxGeometry args={[.034,.18,.035]}/>
        <meshStandardMaterial color="#7d9bad" metalness={.7}/>
      </mesh>
    </group>
  );
}

function Island({ id, accent, name, selected, council, onChoose }:{
  id: DepartmentId; accent: string; name:string; selected:boolean; council:boolean; onChoose:()=>void;
}) {
  const group = useRef<THREE.Group>(null);
  const base = LOCATIONS[id];
  const light = useMemo(() => new THREE.Color(accent), [accent]);
  useFrame(({ clock },dt) => {
    if (!group.current) return;
    const tx = base[0] * (council ? .77 : 1);
    const tz = base[2] * (council ? .77 : 1);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, tx, 3.4, dt);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, tz, 3.4, dt);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y,
      Math.sin(clock.elapsedTime*.65 + base[0])*.055 + (selected ? .13: 0), 4, dt);
  });
  return (
    <group ref={group} position={base}>
      <group onClick={(event)=>{event.stopPropagation();onChoose();}}>
        <RoundedBox args={[3.65,.34,2.62]} radius={.16} smoothness={6} position={[0,-.22,0]} castShadow receiveShadow>
          <meshStandardMaterial color="#1d3145" metalness={.78} roughness={.29}/>
        </RoundedBox>
        <RoundedBox args={[3.74,.085,2.72]} radius={.10} smoothness={4} position={[0,-.058,0]}>
          <meshStandardMaterial color={light} emissive={light} emissiveIntensity={selected ? 2.4 : 1.35} metalness={.65} roughness={.18}/>
        </RoundedBox>
        <RoundedBox args={[3.61,.12,2.59]} radius={.085} smoothness={4} position={[0,.047,0]} receiveShadow>
          <meshStandardMaterial color="#d7dcda" roughness={.52} metalness={.15}/>
        </RoundedBox>
        <RoundedBox args={[3.45,.018,2.42]} radius={.065} position={[0,.121,0]}>
          <meshStandardMaterial color={id==='core'?'#eee1df':id==='ops'?'#f0e4d0':'#e6edf0'} roughness={.88}/>
        </RoundedBox>
        {[-1.6,1.6].map(x=>(
          <mesh key={x} position={[x,.35,-1.12]}>
            <boxGeometry args={[.035,.41,.035]}/>
            <meshStandardMaterial color="#b0bec4" metalness={.7}/>
          </mesh>
        ))}
        <mesh position={[0,.55,-1.13]}>
          <boxGeometry args={[3.22,.028,.035]}/>
          <meshStandardMaterial color="#bfd0d6" metalness={.5}/>
        </mesh>
        {[-1.1,1.1].map((z,i)=>(
          <Plant key={i} x={i===0?-1.48:1.48} z={z} size={.78}/>
        ))}
        <Desk x={-1.0} z={-.37} accent={accent} index={id==='ops'?2:0}/>
        <Desk x={.38} z={-.33} accent={accent} index={id==='core'?1:3} turn={-.12}/>
        {id==='strat' && (
          <>
            <Desk x={-.3} z={.65} accent={accent} index={1} turn={Math.PI}/>
            <LittlePerson x={-.9} z={.30} color="#273b52"/>
            <LittlePerson x={.47} z={.26} color="#3c5c62"/>
            <GlassScreen accent={accent} index={1} x={.9} z={-.98}/>
          </>
        )}
        {id==='intel' && (
          <>
            <GlassScreen accent={accent} index={5} x={-.22} z={-1}/>
            <GlassScreen accent={accent} index={2} x={.84} z={-1}/>
            <LittlePerson x={-.95} z={.26} color="#2e567e"/>
            <LittlePerson x={.42} z={.30} color="#284964"/>
            <mesh position={[1.4,.8,-.85]}>
              <icosahedronGeometry args={[.23,2]}/>
              <meshStandardMaterial color="#70b5ff" wireframe emissive="#377ed5" emissiveIntensity={1}/>
            </mesh>
          </>
        )}
        {id==='core' && (
          <>
            <GlassScreen accent={accent} index={7} x={.96} z={-.99}/>
            <Desk x={-.25} z={.66} accent={accent} index={6} turn={Math.PI}/>
            <LittlePerson x={-.92} z={.28} color="#855074"/>
            <LittlePerson x={.42} z={.26} color="#53627d"/>
          </>
        )}
        {id==='ops' && (
          <>
            <GlassScreen accent={accent} index={8} x={.84} z={-.99}/>
            <Desk x={-.22} z={.60} accent={accent} index={3} turn={Math.PI}/>
            <LittlePerson x={-.9} z={.26} color="#3b5269"/>
            <LittlePerson x={.47} z={.26} color="#63635d"/>
          </>
        )}
        <mesh visible={false} position={[0,.5,0]}>
          <boxGeometry args={[3.7,1.5,2.68]}/>
          <meshBasicMaterial/>
        </mesh>
      </group>
      <Html position={[0,1.92,0]} center distanceFactor={12.3} zIndexRange={[15,8]}>
        <button onClick={onChoose}
          style={{borderColor:selected?accent:'rgba(170,211,239,.30)'}}
          className="flex items-center gap-2 whitespace-nowrap rounded-xl border bg-[#071423]/90 px-3 py-2 text-xs text-slate-100 shadow-[0_10px_26px_rgba(0,0,0,.5)] backdrop-blur-xl transition-transform hover:scale-105">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{background:accent,boxShadow:'0 0 13px '+accent}}/>
          <span className="font-semibold">{name}</span>
          <span className="text-[10px] text-slate-400">Öffnen ›</span>
        </button>
      </Html>
    </group>
  );
}

function EnergyOrb({ council, onCouncil }:{council:boolean;onCouncil:()=>void}) {
  const group=useRef<THREE.Group>(null);
  const particleLocations=useMemo(()=>{
    const data=new Float32Array(165*3);
    for(let i=0;i<165;i++){
      const phi=Math.acos(1-2*(i+.5)/165);
      const theta=Math.PI*(1+Math.sqrt(5))*i;
      const r=.62+Math.sin(i*4.73)*.13;
      data[i*3]=r*Math.sin(phi)*Math.cos(theta);
      data[i*3+1]=r*Math.cos(phi);
      data[i*3+2]=r*Math.sin(phi)*Math.sin(theta);
    }
    return data;
  },[]);
  useFrame(({clock},delta)=>{
    if (!group.current) return;
    group.current.rotation.y+=delta*(council?1.8:.25);
    group.current.position.y=1.10+Math.sin(clock.elapsedTime*1.5)*.08;
  });
  return (
    <group>
      <group ref={group} position={[0,1.1,0]} onClick={e=>{e.stopPropagation();onCouncil();}}>
        <mesh>
          <sphereGeometry args={[.40,40,32]}/>
          <meshPhysicalMaterial color="#ff9b52" emissive="#ff5d1c" emissiveIntensity={council?3.4:2.4} transmission={.28} thickness={1.1} clearcoat={1} roughness={.12}/>
        </mesh>
        <mesh>
          <icosahedronGeometry args={[.55,2]}/>
          <meshBasicMaterial color="#ffb56b" wireframe transparent opacity={.65} depthWrite={false}/>
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particleLocations,3]}/>
          </bufferGeometry>
          <pointsMaterial color="#ffcd83" size={.065} sizeAttenuation transparent opacity={.95} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false}/>
        </points>
        <mesh>
          <sphereGeometry args={[.96,24,16]}/>
          <meshBasicMaterial color="#ff9d3d" transparent opacity={.06} depthWrite={false} side={THREE.BackSide} blending={THREE.AdditiveBlending}/>
        </mesh>
      </group>
      <Html center position={[0,-.36,0]} distanceFactor={14} zIndexRange={[15,8]}>
        <button className="whitespace-nowrap rounded-full border border-orange-300/45 bg-[#111b2c]/85 px-4 py-2 text-[11px] font-bold tracking-wider text-amber-100 shadow-[0_0_18px_rgba(255,146,69,.25)] backdrop-blur-md hover:bg-orange-700/35"
          onClick={onCouncil}>✧ Rat einberufen</button>
      </Html>
    </group>
  );
}

function Stage(props:Props) {
  const ids=Object.values(LOCATIONS);
  return (
    <>
      <ambientLight intensity={.85}/>
      <hemisphereLight args={['#b7d7ec','#3b2931',1.2]}/>
      <directionalLight position={[-4,11,6]} intensity={2.9} color="#fff0dc" castShadow shadow-mapSize={[2048,2048]} shadow-bias={-.0002}/>
      <pointLight position={[0,4,0]} intensity={30} distance={8} decay={2} color="#ff8937"/>
      <pointLight position={[5,4,-4]} intensity={24} distance={10} decay={2} color="#3faeff"/>
      <pointLight position={[-6,4,2]} intensity={16} distance={10} decay={2} color="#ffc891"/>
      {DEPTS.map(d=><Island key={d.id} id={d.id} name={d.name} accent={d.accent}
        selected={props.selected===d.id} council={props.council} onChoose={()=>props.onChoose(d.id)}/>)}
      {ids.map(([x,,z],i)=>{
        const direction=new THREE.Vector3(x*.73,.0,z*.73);
        return (
          <group key={i}>
            <Line points={[[0,.10,0],[direction.x,.10,direction.z]]} color="#e79562" lineWidth={props.council?2.9:1.5} transparent opacity={props.council?.95:.30}/>
            <Line points={[[0,.10,0],[direction.x,.10,direction.z]]} color="#f7bb87" lineWidth={.55} transparent opacity={.75}/>
          </group>
        );
      })}
      <EnergyOrb council={props.council} onCouncil={props.onCouncil}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.6,0]} receiveShadow>
        <planeGeometry args={[200,200]}/>
        <meshStandardMaterial color="#0a1423" roughness={.4} metalness={.48}/>
      </mesh>
      <ContactShadows position={[0,-.75,0]} scale={24} blur={3.5} far={9} opacity={.28}/>
      <OrbitControls makeDefault enablePan={false} minDistance={11} maxDistance={19} minPolarAngle={.52} maxPolarAngle={1.35} minAzimuthAngle={-.33} maxAzimuthAngle={.33} target={[0,.25,0]}/>
    </>
  );
}

export default function SpatialMissionScene(props:Props) {
  return (
    <Canvas shadows dpr={[1,1.8]} camera={{ position:[0,10,13.8], fov:43 }} gl={{antialias:true,alpha:true, toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.17}}>
      <Stage {...props}/>
    </Canvas>
  );
}
