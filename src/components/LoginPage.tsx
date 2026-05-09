"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

interface LoginPageProps {
  onLogin: (userId: string, password: string) => boolean;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*#@!%";

function ScrambleText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [display, setDisplay] = useState(() => text.split("").map(() => CHARS[Math.floor(Math.random() * CHARS.length)]).join(""));
  const done = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let iteration = 0;
      const original = text;
      const interval = setInterval(() => {
        setDisplay(
          original.split("").map((letter, idx) => {
            if (idx < iteration) return original[idx];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join("")
        );
        if (iteration >= original.length) {
          clearInterval(interval);
          setDisplay(original);
          done.current = true;
        }
        iteration += 0.4;
      }, 35);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span className={className}>{display}</span>;
}


export default function LoginPage({ onLogin }: LoginPageProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [3, -3]);
  const rotateY = useTransform(mouseX, [-300, 300], [-3, 3]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsEntering(true);
    setTimeout(() => {
      if (!onLogin(userId, password)) {
        setError("ACCESS DENIED — INVALID CREDENTIALS");
        setIsShaking(true);
        setIsEntering(false);
        setTimeout(() => setIsShaking(false), 600);
      }
    }, 600);
  };


  return (
    <div className="min-h-screen flex overflow-hidden relative" style={{ cursor: "none" }}>

      {/* ── NOISE TEXTURE LAYER ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: "128px" }}
      />

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden border-r border-white/[0.08]">

        {/* Giant BG letter */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <motion.div
            className="font-black text-white leading-none"
            style={{ fontSize: "38vw", opacity: 0.05, fontFamily: "'Arial Black', sans-serif", y: useTransform(mouseY, [-300, 300], [-20, 20]) }}
          >
            R
          </motion.div>
        </div>

        {/* Top nav */}
        <div className="relative z-10 flex items-center justify-between p-8">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-white/25 text-[9px] font-mono tracking-[0.4em] uppercase">System Active</span>
          </div>
          <span className="text-white/15 text-[9px] font-mono tracking-widest">v2.0.1</span>
        </div>

        {/* Hero title */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-12">
          <motion.p
            className="text-white/20 text-[9px] font-mono tracking-[0.5em] uppercase mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Professional Order Management
          </motion.p>

          <div className="overflow-hidden mb-2">
            <motion.h1
              className="font-black text-white leading-none"
              style={{ fontSize: "clamp(4rem, 8vw, 7rem)", fontFamily: "'Arial Black', sans-serif", lineHeight: 0.9 }}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
            >
              <ScrambleText text="ORDER" delay={300} className="shimmer-text" />
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1
              className="font-black text-transparent leading-none"
              style={{
                fontSize: "clamp(5rem, 9vw, 8rem)",
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                WebkitTextStroke: "1.5px rgba(255,255,255,0.18)",
                lineHeight: 0.9
              }}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.76, 0, 0.24, 1] }}
            >
              <ScrambleText text="BOOK" delay={500} className="text-white opacity-50" />
            </motion.h1>
          </div>

          {/* Year + divider */}
          <motion.div
            className="flex items-center gap-4 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-white/20 text-[9px] font-mono tracking-widest">2025</span>
          </motion.div>
        </div>

        <div className="flex-1" />
      </div>

      {/* ── RIGHT PANEL — FORM ── */}
      <div className="flex-1 flex flex-col relative bg-black/20 backdrop-blur-sm">

        {/* Corner label */}
        <motion.div
          className="absolute top-8 right-8 text-white/15 text-[9px] font-mono tracking-[0.4em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Secure Login
        </motion.div>

        {/* Mobile title */}
        <div className="lg:hidden px-8 pt-16 pb-0">
          <div className="overflow-hidden">
            <motion.h1
              className="font-black text-white text-7xl leading-none"
              style={{ fontFamily: "'Bebas Neue', 'Arial Black', sans-serif" }}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
            >
              ORDER<br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.2)" }}>BOOK</span>
            </motion.h1>
          </div>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-14">
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
            className="w-full max-w-sm"
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
          >

            <motion.p
              className="text-white text-sm font-display tracking-[0.2em] uppercase mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Enter your credentials
            </motion.p>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Login ID Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, ease: [0.76, 0, 0.24, 1] }}
              >
                <label className="block text-[10px] font-mono tracking-[0.3em] uppercase mb-3"
                  style={{ color: focused === "id" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>
                  Login ID
                </label>
                <div className="relative">
                  <input
                    type="text" value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    onFocus={() => setFocused("id")}
                    onBlur={() => setFocused(null)}
                    placeholder="—"
                    required
                    className="w-full bg-transparent pb-3 text-white text-sm font-mono tracking-[0.2em] placeholder-white/10 focus:outline-none border-none"
                    style={{ cursor: "none" }}
                  />
                  {/* Animated underline */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
                  <motion.div
                    className="absolute bottom-0 left-0 h-px bg-white"
                    animate={{ width: focused === "id" || userId ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, ease: [0.76, 0, 0.24, 1] }}
              >
                <label className="block text-[10px] font-mono tracking-[0.3em] uppercase mb-3"
                  style={{ color: focused === "pw" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("pw")}
                    onBlur={() => setFocused(null)}
                    placeholder="—"
                    required
                    className="w-full bg-transparent pb-3 text-white text-sm font-mono tracking-[0.2em] placeholder-white/10 focus:outline-none border-none pr-16"
                    style={{ cursor: "none" }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
                  <motion.div
                    className="absolute bottom-0 left-0 h-px bg-white"
                    animate={{ width: focused === "pw" || password ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-2 text-[8px] font-mono tracking-[0.3em] uppercase text-white/20 hover:text-white/60 transition-colors"
                    style={{ cursor: "none" }}>
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      className="w-1 h-1 rounded-full bg-red-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                    />
                    <span className="text-red-400/80 text-[9px] font-mono tracking-[0.3em] uppercase">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
              >
                <motion.button
                  type="submit"
                  className="w-full relative overflow-hidden group bg-white text-black py-4 rounded-xl font-display text-sm tracking-widest uppercase border-none"
                  animate={{ x: isShaking ? [-6, 6, -6, 6, 0] : 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ cursor: "none" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative z-10 flex items-center justify-between px-8">
                    <span className="font-black">
                      {isEntering ? "Authenticating" : "Enter System"}
                    </span>
                    <span className="font-black">→</span>
                  </div>
                </motion.button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              className="mt-16 pt-6 border-t border-white/[0.05] flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <span className="text-white/30 text-[10px] font-mono tracking-[0.2em] uppercase">Umang Softwares Pvt Ltd</span>
              <div className="flex items-center gap-1.5">
                <motion.div className="w-1 h-1 rounded-full bg-emerald-400" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-white/30 text-[10px] font-mono tracking-widest">© 2025</span>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
