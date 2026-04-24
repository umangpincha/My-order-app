"use client";

import { useState, useEffect } from "react";
import LoginPage from "@/components/LoginPage";
import OrderForm from "@/components/OrderForm";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logged = localStorage.getItem("orderbook_logged_in");
    if (logged === "true") setIsLoggedIn(true);
    setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <OrderForm onLogout={handleLogout} />;
}
