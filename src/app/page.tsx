"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginPage from "@/components/LoginPage";
import OrderForm from "@/components/OrderForm";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const logged = localStorage.getItem("orderbook_logged_in");
    if (logged === "true") setIsLoggedIn(true);
    setLoading(false);
    const timer = setTimeout(() => setSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (userId: string, password: string) => {
    if (userId.toUpperCase() === "RAJA" && password === "54321") {
      localStorage.setItem("orderbook_logged_in", "true");
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem("orderbook_logged_in");
    setIsLoggedIn(false);
  };

  return (
    <AnimatePresence mode="wait">
      {(loading || splash) ? (
        /* ── SPLASH SCREEN ── */
        <motion.div
          key="splash"
          className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* Big BG text */}
          <div
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
            style={{ fontFamily: "'Bebas Neue', 'Arial Black', sans-serif" }}
          >
            <motion.div
              className="text-[40vw] font-black leading-none text-white"
              style={{ opacity: 0.02 }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: [0.76, 0, 0.24, 1] }}
            >
              O
            </motion.div>
          </div>

          {/* Center content */}
          <div className="relative z-10 text-center">
            {/* Title */}
            <motion.div
              className="overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.h1
                className="text-[14vw] sm:text-[10vw] font-black text-white leading-none tracking-tighter"
                style={{ fontFamily: "'Bebas Neue', 'Arial Black', sans-serif" }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
              >
                ORDER
              </motion.h1>
            </motion.div>
            <div className="overflow-hidden">
              <motion.h1
                className="text-[14vw] sm:text-[10vw] font-black text-transparent leading-none tracking-tighter"
                style={{
                  fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                  WebkitTextStroke: "2px rgba(255,255,255,0.2)"
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.76, 0, 0.24, 1] }}
              >
                BOOK
              </motion.h1>
            </div>

            {/* Tagline */}
            <motion.p
              className="text-white/20 text-[10px] font-mono tracking-[0.5em] uppercase mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              by Umang Softwares
            </motion.p>

            {/* Progress bar */}
            <motion.div
              className="mt-10 w-32 h-px bg-white/10 mx-auto relative overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.9, duration: 1.2, ease: "linear" }}
              />
            </motion.div>
          </div>
        </motion.div>
      ) : !isLoggedIn ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LoginPage onLogin={handleLogin} />
        </motion.div>
      ) : (
        <motion.div
          key="order"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <OrderForm onLogout={handleLogout} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
