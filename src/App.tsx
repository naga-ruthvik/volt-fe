/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Zap, 
  Link as LinkIcon, 
  Share2, 
  Download, 
  Copy, 
  User, 
  Terminal, 
  Activity,
  Github,
  Monitor,
  Network,
  Code
} from "lucide-react";
import { useState, useEffect, type FC, useRef } from "react";
import { motion, useInView } from "motion/react";
import Noise from './Noise';

const PLATFORMS = [
  "GITHUB", "LEETCODE", "CODECHEF", "GEEKSFORGEEKS", "CODEFORCES", "INTERVIEWBIT"
];

const TESTIMONIALS = [
  {
    name: "ALEX_R",
    platform: "GITHUB",
    text: "Volt completely changed how I track my growth. All platforms in one view is visually satisfying.",
    avatar: "https://picsum.photos/seed/alex/100/100"
  },
  {
    name: "SARAH.JS",
    platform: "LEETCODE",
    text: "The SVG export feature is incredible. My GitHub profile now looks 10x more professional.",
    avatar: "https://picsum.photos/seed/sarah/100/100"
  },
  {
    name: "M_CHEN",
    platform: "CODEFORCES",
    text: "Clean, brutalist, and efficient. I don't need fluffy UI, I need data. Volt delivers exactly that.",
    avatar: "https://picsum.photos/seed/chen/100/100"
  }
];

const HeatmapCell: FC<{ intensity: number }> = ({ intensity }) => {
  const colors = [
    "bg-[#1a1a1a]", // 0 - Inactive
    "bg-[#333333]", // 1 - Low
    "bg-[#660033]", // 2 - Medium
    "bg-[#ff0066]", // 3 - High
    "bg-[#ff3385]"  // 4 - Peak
  ];
  
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      className={`heatmap-cell ${colors[intensity] || colors[0]} ${intensity === 4 ? 'shadow-[0_0_8px_#ff0066]' : ''}`}
    />
  );
};

const Heatmap = () => {
  // Generate random data for 52 weeks x 7 days
  const [data, setData] = useState<number[][]>([]);

  useEffect(() => {
    const newData = Array.from({ length: 52 }, () => 
      Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
    );
    setData(newData);
  }, []);

  return (
    <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-4 custom-scrollbar">
      {data.map((week: number[], i: number) => (
        <div key={i} className="flex flex-col gap-1 sm:gap-1.5 flex-shrink-0">
          {week.map((intensity: number, j: number) => (
            <HeatmapCell key={`${i}-${j}`} intensity={intensity} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [activeFilter, setActiveFilter] = useState("ALL");

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 py-2 bg-brand-accent-gray/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-6 h-6 bg-brand-pink flex items-center justify-center group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(255,0,102,0.3)]">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tighter uppercase text-white group-hover:text-brand-pink transition-colors">Volt</span>
          </div>
          
          <div className="hidden md:flex space-x-10 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">
            {["Features", "Preview", "Stories", "Handshake"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-brand-pink transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-pink group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <button className="px-6 py-2 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 hover:border-brand-pink hover:text-brand-pink transition-all glass-card">
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-4 overflow-hidden min-h-[65vh] flex flex-col justify-center z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-medium tracking-tighter mb-4 leading-[0.9] uppercase text-white">
              Your Coding <br /> Journey, <br />
              <span className="relative inline-block">
                <span className="text-gradient-pink tracking-[0.05em]">UNIFIED</span>
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 1.5, ease: [0.77, 0, 0.175, 1] }}
                  className="absolute -bottom-2 left-0 h-2 bg-brand-pink"
                />
              </span>
            </h1>
            <p className="max-w-xl text-lg md:text-xl text-brand-muted mb-6 leading-relaxed font-medium">
              Aggregating GitHub, LeetCode, and Codeforces into a monochromatic high-fidelity activity map. Brutal efficiency for the modern developer.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-5 bg-brand-pink text-white text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,102,0.4)] hover:shadow-[0_0_40px_rgba(255,0,102,0.7)] relative overflow-hidden group transition-all duration-300"
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span>Generate Map</span>
                  <Zap className="w-4 h-4 fill-current group-hover:scale-125 transition-transform duration-300" />
                </div>
                <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-5 border-2 border-brand-pink text-brand-pink text-sm font-bold uppercase tracking-widest hover:bg-brand-pink hover:text-white hover:shadow-[0_0_30px_rgba(255,0,102,0.5)] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <span>Live Demo</span>
                  <Monitor className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Platform Scroller */}
          <div className="mb-6 border-y border-white/5 py-8 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-brand-bg to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-brand-bg to-transparent z-10" />
            <div className="flex whitespace-nowrap animate-scroll">
              {[...PLATFORMS, ...PLATFORMS].map((platform, i) => (
                <span key={i} className="text-2xl md:text-4xl font-bold text-white/10 px-12 hover:text-brand-pink transition-colors cursor-default">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Heatmap Preview Section */}
      <section id="preview" className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 md:p-16 glass-card relative group"
          >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border border-brand-border flex items-center justify-center bg-brand-accent-gray/50 shadow-[0_0_15px_rgba(255,0,102,0.3)]">
                    <Activity className="w-6 h-6 text-brand-pink" />
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest text-white">SYNCHRONIZED_PROTOCOL_04</div>
                    <div className="text-[10px] text-brand-muted font-mono">STATUS: STABLE // ENCRYPTED</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {["ALL", "GITHUB", "LEETCODE", "CODEFORCES"].map((filter) => (
                    <button 
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-1.5 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeFilter === filter 
                          ? "border-brand-pink text-white bg-brand-pink" 
                          : "border-brand-border text-brand-muted hover:border-white hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3 border border-brand-border text-[10px] font-bold uppercase tracking-widest hover:border-brand-pink hover:text-brand-pink transition-all glass-card">
                  <Download className="w-4 h-4" />
                  Download SVG
                </button>
                <button className="flex items-center gap-2 px-6 py-3 border border-brand-border text-[10px] font-bold uppercase tracking-widest hover:border-brand-pink hover:text-brand-pink transition-all glass-card">
                  <Copy className="w-4 h-4" />
                  Embed Link
                </button>
              </div>
            </div>

            <Heatmap />

            <div className="mt-8 flex justify-end items-center gap-4 text-[10px] text-brand-muted font-bold uppercase tracking-widest">
              <span>Low</span>
              <div className="flex gap-1.5">
                <div className="w-4 h-4 bg-[#1a1a1a] border border-white/5" />
                <div className="w-4 h-4 bg-[#333333]" />
                <div className="w-4 h-4 bg-[#660033]" />
                <div className="w-4 h-4 bg-[#ff0066]" />
                <div className="w-4 h-4 bg-[#ff3385] shadow-[0_0_8px_#ff0066]" />
              </div>
              <span>Extreme</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-brand-bg relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter text-white">Features</h2>
            <p className="text-brand-muted font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Core data aggregation protocols.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: LinkIcon, title: "Multi-Platform Sync", desc: "Real-time telemetry from all major coding nodes." },
              { icon: Share2, title: "Export & Share", desc: "High-fidelity SVG rendering optimized for profile integration." },
              { icon: Zap, title: "Instant Generation", desc: "Full profile synthesis in under 30ms." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 feature-card group"
              >
                <div className="w-12 h-12 border border-brand-border flex items-center justify-center mb-8 group-hover:border-brand-pink group-hover:shadow-pink-glow transition-all">
                  <feature.icon className="w-6 h-6 text-brand-muted group-hover:text-brand-pink transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-tight text-white">{feature.title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="stories" className="py-16 bg-brand-bg border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter text-white">Volt Stories</h2>
            <p className="text-brand-muted font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Verified developer feedback.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 glass-card group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 border border-brand-pink/30 grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white">{t.name}</div>
                    <div className="flex items-center gap-1 mt-1 opacity-60">
                      <Terminal className="w-3 h-3 text-brand-pink" />
                      <span className="text-[8px] font-mono uppercase tracking-widest text-brand-muted">{t.platform}</span>
                    </div>
                  </div>
                </div>
                <p className="text-brand-muted text-xs italic leading-relaxed">"{t.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="handshake" className="py-16 border-t border-white/5 bg-brand-bg relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-12 uppercase tracking-tighter text-white">Get Started in 3 Steps</h2>
          
          <div className="grid md:grid-cols-3 border border-white/5">
            {[
              { step: "01", icon: Network, title: "Connect", desc: "Link your platforms via handled authentication nodes." },
              { step: "02", icon: Monitor, title: "Generate", desc: "Create your map with synthesized temporal signatures." },
              { step: "03", icon: Share2, title: "Share", desc: "Embed or download your monochromatic high-fidelity map." }
            ].map((item, i) => (
              <div key={i} className={`step-card group ${i < 2 ? 'md:border-r border-b md:border-b-0' : ''}`}>
                <div className="flex justify-between items-start mb-10">
                  <span className="text-7xl font-bold text-white/15 group-hover:text-brand-pink/30 transition-all duration-700 tabular-nums leading-none">{item.step}</span>
                  <item.icon className="w-6 h-6 text-brand-muted group-hover:text-brand-pink transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-6 uppercase text-white group-hover:text-brand-pink transition-colors">{item.title}</h3>
                <p className="text-brand-muted text-base font-medium">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[1px] bg-gradient-to-r from-brand-pink to-transparent opacity-20 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-brand-bg relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-6 group cursor-pointer">
                <div className="w-10 h-10 bg-white flex items-center justify-center group-hover:bg-brand-pink transition-colors">
                  <Zap className="w-6 h-6 text-black fill-current" />
                </div>
                <span className="text-2xl font-bold uppercase tracking-tighter text-white">Volt</span>
              </div>
              <p className="text-brand-muted text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">High-performance developer profiles.</p>
            </div>

            <div className="flex items-center gap-12 text-[10px] font-bold uppercase tracking-widest text-brand-muted">
              <a href="#" className="hover:text-brand-pink transition-colors">Privacy</a>
              <a href="#" className="hover:text-brand-pink transition-colors">Terms</a>
              <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-[9px] text-brand-muted uppercase tracking-[0.5em] font-bold">
            © 2026 VOLT-CORE v10.0. Monochromatic Brutal Protocol.
          </div>
        </div>
      </footer>
    </div>
  );
}

