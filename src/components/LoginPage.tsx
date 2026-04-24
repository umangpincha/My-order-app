"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginPageProps {
  onLogin: (userId: string, password: string) => boolean;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!onLogin(userId, password)) {
      setError("Invalid Login ID or Password");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="glass rounded-3xl p-8 w-full max-w-sm shadow-2xl neon-border"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: isShaking ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{
          duration: 0.5,
          x: { duration: 0.4 },
        }}
      >
        {/* Animated Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/25"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: ["0 10px 40px rgba(139,92,246,0.2)", "0 10px 40px rgba(139,92,246,0.5)", "0 10px 40px rgba(139,92,246,0.2)"] }}
            transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
          >
            <span className="text-4xl">👑</span>
          </motion.div>
          <motion.h1
            className="text-3xl font-bold shimmer-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Raja Order Book
          </motion.h1>
          <motion.p
            className="text-purple-300/60 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Professional Order Management
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-indigo-300/80 text-xs font-semibold mb-1.5 uppercase tracking-wider">Login ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-indigo-400/50 input-glow transition-all duration-300 text-sm"
              placeholder="Enter Login ID"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-indigo-300/80 text-xs font-semibold mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-indigo-400/50 input-glow transition-all duration-300 text-sm"
                placeholder="Enter Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-2.5 text-center"
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-base shadow-xl shadow-purple-500/20 btn-magic"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(139,92,246,0.3)" }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            🚀 Login
          </motion.button>
        </form>

        <motion.p
          className="text-center text-white/20 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Raja Foods © {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </div>
  );
}
