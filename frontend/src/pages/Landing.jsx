import React, { Suspense, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, Environment } from '@react-three/drei';
import { Server, Zap, Map, Cpu, ShieldCheck, Activity, ChevronRight, Compass, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Landing.css';

/* ── Animation Variants ─────────────────────────────────────────── */
const fadeUp = {
 hidden: { opacity: 0, y: 30 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

/* ── 3D Interactive Model ────────────────────────────────────────── */
function InteractiveModel() {
 const { scene } = useGLTF('/clock_model.glb');
 const [hovered, setHover] = useState(false);
 const modelRef = useRef();

 useFrame(() => {
  // Relying on OrbitControls autoRotate for constant speed
 });

 return (
  <Float floatIntensity={1} rotationIntensity={1} speed={2}>
   <primitive
    ref={modelRef}
    object={scene}
    scale={hovered ? 4.5 : 4}
    onPointerOver={() => setHover(true)}
    onPointerOut={() => setHover(false)}
   />
  </Float>
 );
}

useGLTF.preload('/clock_model.glb');

/* ── Landing Page ────────────────────────────────────────────────── */
export default function Landing() {
 const navigate = useNavigate();
 const { theme, toggleTheme } = useTheme();
 const handleScroll = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
 };

 return (
  <div className="w-full min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-['Work_Sans'] overflow-x-hidden selection:bg-[var(--accent-primary)] selection:text-[var(--bg-primary)]">

   {/* ═══════════════════════════════════════════════════════════
     1. FIXED GLASSMORPHISM NAVBAR
     ═══════════════════════════════════════════════════════════ */}
   <nav className="fixed top-0 left-0 w-full z-50 bg-[var(--bg-primary)]/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
    {/* Logo */}
    <div className="font-black text-xl tracking-widest text-[var(--text-primary)] font-['Bebas_Neue'] flex items-center gap-2">
     <ShieldCheck size={22} className="text-[var(--accent-primary)]" />
     ICE-NET
    </div>

    {/* Center Links */}
    <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-[var(--text-secondary)]">
     <motion.a href="#features" onClick={handleScroll('features')} whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="hover:text-[var(--accent-primary)] duration-0 cursor-pointer">FEATURES</motion.a>
     <motion.a href="#workflow" onClick={handleScroll('workflow')} whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="hover:text-[var(--accent-primary)] duration-0 cursor-pointer">WORKFLOW</motion.a>
     <motion.a href="#hardware" onClick={handleScroll('hardware')} whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="hover:text-[var(--accent-primary)] duration-0 cursor-pointer">HARDWARE</motion.a>
    </div>

    {/* Right Actions */}
    <div className="flex items-center gap-4">
     <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-[var(--bg-panel-raised)] border border-[var(--border)] text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors flex items-center justify-center shadow-[var(--shadow-glass)]"
     >
      <AnimatePresence mode="wait">
       <motion.div
        key={theme}
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: 90 }}
        transition={{ duration: 0.2 }}
       >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
       </motion.div>
      </AnimatePresence>
     </motion.button>

     <button
      onClick={() => navigate('/login')}
      className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors tracking-wide"
     >
      LOG IN
     </button>
     <button
      onClick={() => navigate('/login')}
      className="bg-gradient-to-b from-blue-500 to-blue-600 text-white font-semibold rounded-lg px-6 py-2 shadow-[0_0_20px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] hover:from-blue-400 hover:to-blue-500 transition-all duration-300 border border-blue-400/30 text-sm tracking-wider"
     >
      SIGN UP
     </button>
    </div>
   </nav>

   {/* ═══════════════════════════════════════════════════════════
     2. CINEMATIC HERO SECTION (Contained Video)
     ═══════════════════════════════════════════════════════════ */}
   <section className="relative w-full h-screen flex flex-col justify-center overflow-hidden">
    {/* Video Background */}
    <video
     autoPlay loop muted playsInline
     className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 pointer-events-none"
     src="/antarctica.mp4"
    />

    {/* Premium Blue Tint Overlay */}
    <div className="absolute inset-0 bg-blue-600/10 mix-blend-color z-10 pointer-events-none"></div>

    {/* Gradient Overlay */}
    <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg-primary) 0%, transparent 100%)', opacity: 0.85 }}></div>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-primary)] z-10 pointer-events-none"></div>

    {/* Hero Content — Left Aligned */}
    <motion.div
     initial="hidden"
     animate="visible"
     variants={fadeUp}
     className="relative z-20 flex flex-col items-start text-left px-8 md:px-16 max-w-3xl w-full pt-20"
    >
     <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] leading-[1.05] tracking-tight mb-5 font-['Bebas_Neue'] uppercase">
      The ice doesn't wait.<br />
      Neither should your logistics.
     </h1>

     <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-lg leading-relaxed mb-8">
      An offline-first, high-resilience command deck built for extreme environments where connectivity is a luxury, not a guarantee.
     </p>

     <div className="flex flex-row items-center gap-4">
      <motion.button
       onClick={() => navigate('/login')}
       whileHover={{ scale: 1.04 }}
       whileTap={{ scale: 0.97 }}
       transition={{ duration: 0.3, ease: 'easeOut' }}
       className="bg-gradient-to-b from-blue-500 to-blue-600 px-7 py-3 font-bold text-base rounded-lg tracking-wider text-white shadow-[0_0_30px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] hover:from-blue-400 hover:to-blue-500 transition-all duration-300 border border-blue-400/30"
      >
       ENTER THE PLATFORM
      </motion.button>
      <motion.a
       href="#workflow"
       onClick={handleScroll('workflow')}
       whileHover={{ scale: 1.04 }}
       whileTap={{ scale: 0.97 }}
       transition={{ duration: 0.3, ease: 'easeOut' }}
       className="backdrop-blur-xl bg-[var(--bg-panel-raised)] border border-[var(--border)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] shadow-[var(--shadow-glass)] px-7 py-3 font-bold text-base rounded-sm tracking-wider text-center transition-colors text-[var(--text-primary)]"
      >
       SEE THE MISSION
      </motion.a>
     </div>
    </motion.div>
   </section>

   {/* ═══════════════════════════════════════════════════════════
     3. BENTO BOX: THREE TIERS
     ═══════════════════════════════════════════════════════════ */}
   <section id="features" className="relative z-20 w-full max-w-6xl mx-auto px-6 py-20">
    <motion.div
     initial="hidden"
     whileInView="visible"
     variants={fadeUp}
     viewport={{ once: true }}
     className="flex items-center justify-center gap-3 mb-12"
    >
     <span className="text-[var(--accent-primary)] text-sm">◆</span>
     <ShieldCheck size={24} className="text-[var(--accent-primary)]" />
     <h2 className="text-2xl md:text-3xl font-['Bebas_Neue'] tracking-widest text-[var(--text-primary)]">
      THREE TIERS. ONE COMMAND DECK.
     </h2>
     <span className="text-[var(--accent-primary)] text-sm">◆</span>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
     {/* Card 1 — Cloud Command */}
     <motion.div
      whileInView="visible"
      initial="hidden"
      variants={fadeUp}
      viewport={{ once: true }}
      className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-lg p-6 flex flex-col hover:border-[var(--accent-primary)] hover:-translate-y-2 hover:shadow-[0_12px_40px_-12px_rgba(59,130,246,0.15)] transition-all duration-500 ease-out group cursor-pointer"
     >
      <div className="flex items-center gap-1 mb-4">
       <div className="w-[3px] h-5 bg-[var(--accent-primary)] rounded-sm"></div>
       <span className="text-xs font-mono text-[var(--accent-primary)] font-bold tracking-widest px-1">01</span>
       <div className="w-[3px] h-5 bg-[var(--border)] rounded-sm"></div>
      </div>
      <Server size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors mb-5" />
      <h3 className="text-lg font-['Bebas_Neue'] text-[var(--text-primary)] tracking-wider mb-3 uppercase">Cloud Command</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
       Centralized mission planning, fleet tracking, and deep historical analytics.
       Synchronizes instantly when connectivity returns, resolving conflicts autonomously.
      </p>
     </motion.div>

     {/* Card 2 — Edge Station */}
     <motion.div
      whileInView="visible"
      initial="hidden"
      variants={fadeUp}
      viewport={{ once: true }}
      className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-lg p-6 flex flex-col hover:border-[var(--accent-primary)] hover:-translate-y-2 hover:shadow-[0_12px_40px_-12px_rgba(59,130,246,0.25)] transition-all duration-500 ease-out group cursor-pointer"
     >
      <div className="flex items-center gap-1 mb-4">
       <div className="w-[3px] h-5 bg-[var(--accent-primary)] rounded-sm"></div>
       <span className="text-xs font-mono text-[var(--accent-primary)] font-bold tracking-widest px-1">02</span>
       <div className="w-[3px] h-5 bg-[var(--border)] rounded-sm"></div>
      </div>
      <Zap size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors mb-5" />
      <h3 className="text-lg font-['Bebas_Neue'] text-[var(--text-primary)] tracking-wider mb-3 uppercase">Edge Station</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
       Full offline capability. Your base camp server continues tracking inventory,
       personnel, and emergency status even when the satellite link drops out for days.
      </p>
     </motion.div>

     {/* Card 3 — Physical Layer */}
     <motion.div
      whileInView="visible"
      initial="hidden"
      variants={fadeUp}
      viewport={{ once: true }}
      className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-lg p-6 flex flex-col hover:border-[var(--accent-primary)] hover:-translate-y-2 hover:shadow-[0_12px_40px_-12px_rgba(59,130,246,0.15)] transition-all duration-500 ease-out group cursor-pointer"
     >
      <div className="flex items-center gap-1 mb-4">
       <div className="w-[3px] h-5 bg-[var(--accent-primary)] rounded-sm"></div>
       <span className="text-xs font-mono text-[var(--accent-primary)] font-bold tracking-widest px-1">03</span>
       <div className="w-[3px] h-5 bg-[var(--border)] rounded-sm"></div>
      </div>
      <Map size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors mb-5" />
      <h3 className="text-lg font-['Bebas_Neue'] text-[var(--text-primary)] tracking-wider mb-3 uppercase">Physical Layer</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
       Ruggedized ESP32 hardware, LoRaWAN mesh networking, and GNSS modules ensuring every
       asset is monitored down to the last centimeter and degree.
      </p>
     </motion.div>
    </div>
   </section>



   {/* ═══════════════════════════════════════════════════════════
     4. 3D HARDWARE SHOWCASE
     ═══════════════════════════════════════════════════════════ */}
   <section id="hardware" className="w-full bg-[var(--bg-primary)] relative py-16">
    {/* Top gradient divider */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent"></div>
    {/* Bottom gradient divider */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent"></div>
    {/* Title Overlay */}
    <div className="absolute top-8 left-0 w-full text-center z-20 pointer-events-none">
     <h2 className="text-2xl font-bold tracking-widest text-[var(--text-primary)] font-['Bebas_Neue']">HARDWARE SPECIFICATIONS</h2>
    </div>

    {/* 3D Canvas */}
    <div className="w-full max-w-5xl mx-auto h-[30vh] min-h-[260px] relative z-10 cursor-grab active:cursor-grabbing">
     <Canvas camera={{ position: [0, 1.5, 4.5], fov: 45 }}>
      <ambientLight intensity={1.5} />
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={3} />
      <directionalLight position={[-5, 5, 5]} intensity={2} />
      <Environment preset="city" />
      <Suspense fallback={null}>
       <InteractiveModel />
      </Suspense>
      <OrbitControls autoRotate autoRotateSpeed={1} enablePan={false} enableZoom={false} />
     </Canvas>
    </div>

    {/* Specs Strip */}
    <motion.div
     initial="hidden"
     whileInView="visible"
     variants={fadeUp}
     viewport={{ once: true }}
     className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 px-6 mt-8 relative z-20"
    >
     <motion.div className="bg-[var(--bg-primary)] border border-white/10 rounded-lg p-4 cursor-pointer hover:border-[rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_-8px_rgba(59,130,246,0.1)] transition-all duration-500 ease-out">
      <span className="text-[var(--accent-primary)] font-mono text-[10px] tracking-widest block mb-2">HW-ID: ESP-32S3</span>
      <h4 className="font-['Bebas_Neue'] text-lg text-[var(--text-primary)] tracking-wide mb-2">Core Processing</h4>
      <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono border-t border-white/5 pt-2 mt-2">
       <span>Freq</span><span className="text-[var(--text-primary)]">240MHz</span>
      </div>
      <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono border-t border-white/5 pt-2 mt-2">
       <span>SRAM</span><span className="text-[var(--text-primary)]">512KB</span>
      </div>
     </motion.div>

     <motion.div className="bg-[var(--bg-primary)] border border-white/10 rounded-lg p-4 cursor-pointer hover:border-[rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_-8px_rgba(59,130,246,0.15)] transition-all duration-500 ease-out">
      <span className="text-[var(--accent-primary)] font-mono text-[10px] tracking-widest block mb-2">HW-ID: SX1262</span>
      <h4 className="font-['Bebas_Neue'] text-lg text-[var(--text-primary)] tracking-wide mb-2">LoRa Radio</h4>
      <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono border-t border-white/5 pt-2 mt-2">
       <span>Band</span><span className="text-[var(--text-primary)]">868/915MHz</span>
      </div>
      <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono border-t border-white/5 pt-2 mt-2">
       <span>Range</span><span className="text-[var(--text-primary)]">15km+ LOS</span>
      </div>
     </motion.div>

     <motion.div className="bg-[var(--bg-primary)] border border-white/10 rounded-lg p-4 cursor-pointer hover:border-[rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_-8px_rgba(59,130,246,0.1)] transition-all duration-500 ease-out">
      <span className="text-[var(--accent-primary)] font-mono text-[10px] tracking-widest block mb-2">HW-ID: NEO-M9N</span>
      <h4 className="font-['Bebas_Neue'] text-lg text-[var(--text-primary)] tracking-wide mb-2">GNSS Module</h4>
      <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono border-t border-white/5 pt-2 mt-2">
       <span>Constel</span><span className="text-[var(--text-primary)]">4 Concurrent</span>
      </div>
      <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono border-t border-white/5 pt-2 mt-2">
       <span>Accuracy</span><span className="text-[var(--text-primary)]">1.5m CEP</span>
      </div>
     </motion.div>

     <motion.div className="bg-[var(--bg-primary)] border border-white/10 rounded-lg p-4 cursor-pointer hover:border-[rgba(59,130,246,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_25px_-8px_rgba(59,130,246,0.1)] transition-all duration-500 ease-out">
      <span className="text-[var(--accent-primary)] font-mono text-[10px] tracking-widest block mb-2">HW-ID: BME280</span>
      <h4 className="font-['Bebas_Neue'] text-lg text-[var(--text-primary)] tracking-wide mb-2">Env Sensor</h4>
      <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono border-t border-white/5 pt-2 mt-2">
       <span>Temp</span><span className="text-[var(--text-primary)]">-40°C to +85°C</span>
      </div>
      <div className="flex justify-between text-xs text-[var(--text-secondary)] font-mono border-t border-white/5 pt-2 mt-2">
       <span>Humid</span><span className="text-[var(--text-primary)]">0% to 100%</span>
      </div>
     </motion.div>
    </motion.div>
   </section>

   {/* ═══════════════════════════════════════════════════════════
     5. EXPEDITION WORKFLOW (Contained Flex Nodes)
     ═══════════════════════════════════════════════════════════ */}
   <section id="workflow" className="w-full max-w-6xl mx-auto px-6 py-20">
    <motion.h2
     initial="hidden"
     whileInView="visible"
     variants={fadeUp}
     viewport={{ once: true }}
     className="text-3xl md:text-4xl font-['Bebas_Neue'] text-center text-[var(--text-primary)] tracking-widest mb-4"
    >
     EXPEDITION WORKFLOW
    </motion.h2>
    <motion.p
     initial="hidden"
     whileInView="visible"
     variants={fadeUp}
     viewport={{ once: true }}
     className="text-center text-[var(--text-secondary)] text-sm max-w-lg mx-auto mb-12"
    >
     Four phases from manifest to merge. Each step is designed to function independently even without connectivity.
    </motion.p>

    <div className="flex flex-col md:flex-row justify-between items-start gap-10 relative mt-10">
     {/* Animated connecting line (desktop) */}
     <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 z-0 overflow-hidden">
      <div
       className="w-full h-full"
       style={{
        backgroundImage: 'linear-gradient(to right, var(--accent-primary) 50%, transparent 50%)',
        backgroundSize: '16px 2px',
        backgroundRepeat: 'repeat-x',
        opacity: 0.4,
        animation: 'move-line 1s linear infinite'
       }}
      ></div>
     </div>

     {/* Step 1 */}
     <motion.div
      initial="hidden"
      whileInView="visible"
      variants={fadeUp}
      viewport={{ once: true }}
      className="flex flex-col items-start md:items-center text-left md:text-center w-full md:w-64 gap-4 z-10"
     >
      <motion.div
       whileHover={{ scale: 1.2, backgroundColor: 'var(--accent-primary)', color: '#fff' }}
       transition={{ duration: 0.35, ease: 'easeOut' }}
       className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-xl font-['Bebas_Neue'] cursor-pointer"
      >
       1
      </motion.div>
      <h4 className="text-lg font-bold text-[var(--text-primary)] font-['Bebas_Neue'] tracking-wide">Seal Manifest</h4>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
       HQ finalizes the cargo packing list before departure. Every item is tagged, weighed, and digitally sealed.
      </p>
     </motion.div>

     {/* Step 2 */}
     <motion.div
      initial="hidden"
      whileInView="visible"
      variants={fadeUp}
      viewport={{ once: true }}
      className="flex flex-col items-start md:items-center text-left md:text-center w-full md:w-64 gap-4 z-10"
     >
      <motion.div
       whileHover={{ scale: 1.2, backgroundColor: 'var(--accent-primary)', color: '#fff' }}
       transition={{ duration: 0.35, ease: 'easeOut' }}
       className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-xl font-['Bebas_Neue'] cursor-pointer"
      >
       2
      </motion.div>
      <h4 className="text-lg font-bold text-[var(--text-primary)] font-['Bebas_Neue'] tracking-wide">Scan on Arrival</h4>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
       Edge nodes verify incoming hardware against the manifest. Discrepancies are flagged instantly.
      </p>
     </motion.div>

     {/* Step 3 */}
     <motion.div
      initial="hidden"
      whileInView="visible"
      variants={fadeUp}
      viewport={{ once: true }}
      className="flex flex-col items-start md:items-center text-left md:text-center w-full md:w-64 gap-4 z-10"
     >
      <motion.div
       whileHover={{ scale: 1.2, backgroundColor: 'var(--accent-primary)', color: '#fff' }}
       transition={{ duration: 0.35, ease: 'easeOut' }}
       className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-xl font-['Bebas_Neue'] cursor-pointer"
      >
       3
      </motion.div>
      <h4 className="text-lg font-bold text-[var(--text-primary)] font-['Bebas_Neue'] tracking-wide">Work Offline</h4>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
       The mission proceeds with localized data and mesh tracking. No uplink required.
      </p>
     </motion.div>

     {/* Step 4 */}
     <motion.div
      initial="hidden"
      whileInView="visible"
      variants={fadeUp}
      viewport={{ once: true }}
      className="flex flex-col items-start md:items-center text-left md:text-center w-full md:w-64 gap-4 z-10"
     >
      <motion.div
       whileHover={{ scale: 1.2, backgroundColor: 'var(--accent-primary)', color: '#fff', borderColor: 'var(--accent-primary)' }}
       transition={{ duration: 0.35, ease: 'easeOut' }}
       className="w-12 h-12 rounded-full border-2 border-[var(--accent-primary)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-xl font-['Bebas_Neue'] cursor-pointer"
      >
       4
      </motion.div>
      <h4 className="text-lg font-bold text-[var(--text-primary)] font-['Bebas_Neue'] tracking-wide">Merge & Alert</h4>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
       Data syncs to cloud on uplink; automated SOS logic runs 24/7. Conflicts resolved via CRDTs.
      </p>
     </motion.div>
    </div>
   </section>

   {/* ═══════════════════════════════════════════════════════════
     6. FOOTER
     ═══════════════════════════════════════════════════════════ */}
   <footer className="w-full bg-transparent pt-0 pb-8 px-6 relative z-20">
    {/* Gradient divider line */}
    <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent mb-16"></div>
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
     {/* Brand Col */}
     <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 font-['Bebas_Neue'] text-2xl text-[var(--text-primary)] tracking-widest">
       <Compass size={24} className="text-[var(--accent-primary)]" />
       HEEM_SANCHAR
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
       Advanced logistics and asset tracking system engineered for extreme polar environments.
       Ensuring 100% mission integrity when connectivity is a luxury.
      </p>
     </div>

     {/* Platform Links */}
     <div className="flex flex-col gap-4">
      <h4 className="font-['Bebas_Neue'] text-lg text-[var(--text-primary)] tracking-widest mb-2">PLATFORM</h4>
      <a href="#features" onClick={handleScroll('features')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer w-fit">Features & Tiers</a>
      <a href="#workflow" onClick={handleScroll('workflow')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer w-fit">Mission Workflow</a>
      <a href="#hardware" onClick={handleScroll('hardware')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer w-fit">Hardware Specs</a>
      <span onClick={() => navigate('/login')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors cursor-pointer w-fit">Commander Login</span>
     </div>

     {/* Legal & Info */}
     <div className="flex flex-col gap-4">
      <h4 className="font-['Bebas_Neue'] text-lg text-[var(--text-primary)] tracking-widest mb-2">LEGAL & INFO</h4>
      <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit">About Project</a>
      <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit">Disclaimer</a>
      <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit">Privacy Policy</a>
      <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-fit">Terms of Service</a>
     </div>

     {/* Contact */}
     <div className="flex flex-col gap-4">
      <h4 className="font-['Bebas_Neue'] text-lg text-[var(--text-primary)] tracking-widest mb-2">COMMAND HQ</h4>
      <div className="text-sm text-[var(--text-secondary)] flex flex-col gap-1">
       <span className="text-[var(--text-primary)]">NCPOR Base</span>
       <span>Headland Sada, Vasco da Gama</span>
       <span>Goa 403804, India</span>
      </div>
      <a href="mailto:comms@heem-sanchar.gov.in" className="text-sm text-[var(--accent-primary)] hover:text-[var(--text-primary)] transition-colors w-fit mt-2">
       comms@heem-sanchar.gov.in
      </a>
     </div>
    </div>

    {/* Bottom Bar */}
    <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-[var(--text-secondary)] relative">
     {/* Bottom gradient divider */}
     <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/40 to-transparent"></div>
     <div>
      &copy; {new Date().getFullYear()} HEEM_SANCHAR / SIH 2026. All rights reserved.
     </div>
     <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse shadow-[0_0_8px_var(--ok)]"></div>
      <span className="text-[var(--ok)] font-bold tracking-wider">ALL SYSTEMS NOMINAL</span>
     </div>
    </div>
   </footer>
  </div>
 );
}
