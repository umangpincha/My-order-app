"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { productCategories } from "@/data/products";
import { OrderItem, FavouriteOrder } from "@/types/order";
import { generatePDF } from "@/utils/pdfGenerator";
import { generateExcel } from "@/utils/excelGenerator";

interface OrderFormProps {
  onLogout: () => void;
}

export default function OrderForm({ onLogout }: OrderFormProps) {
  const [customerName, setCustomerName] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("orderbook_cust_name") || "" : ""));
  const [address, setAddress] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("orderbook_cust_address") || "" : ""));
  const [phone, setPhone] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("orderbook_cust_phone") || "" : ""));
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [rates, setRates] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem("orderbook_rates");
    return saved ? JSON.parse(saved) : {};
  });
  const [favourites, setFavourites] = useState<FavouriteOrder[]>([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [favName, setFavName] = useState("");
  const [showSaveFav, setShowSaveFav] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const savedFavs = localStorage.getItem("orderbook_favourites");
    if (savedFavs) setFavourites(JSON.parse(savedFavs));
  }, []);

  // Save data whenever it changes
  useEffect(() => { localStorage.setItem("orderbook_cust_name", customerName); }, [customerName]);
  useEffect(() => { localStorage.setItem("orderbook_cust_address", address); }, [address]);
  useEffect(() => { localStorage.setItem("orderbook_cust_phone", phone); }, [phone]);
  useEffect(() => { localStorage.setItem("orderbook_rates", JSON.stringify(rates)); }, [rates]);

  const sortedCategories = useMemo(() => {
    return productCategories.map((cat) => ({
      ...cat,
      products: [...cat.products].sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return 0;
      }),
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, value: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (value <= 0) delete next[productId];
      else next[productId] = value;
      return next;
    });
  }, []);

  const updateRate = useCallback((productId: string, value: number) => {
    setRates((prev) => {
      const next = { ...prev };
      if (value <= 0) delete next[productId];
      else next[productId] = value;
      return next;
    });
  }, []);

  const orderItems: OrderItem[] = useMemo(() => {
    const items: OrderItem[] = [];
    sortedCategories.forEach((cat) => {
      cat.products.forEach((p) => {
        const qty = quantities[p.id] || 0;
        if (qty > 0) {
          items.push({
            productId: p.id,
            productName: p.name,
            category: p.category,
            quantity: qty,
            rate: rates[p.id] || 0,
            unit: p.unit,
          });
        }
      });
    });
    return items;
  }, [quantities, rates, sortedCategories]);

  const totalQuantity = useMemo(() => orderItems.reduce((s, i) => s + i.quantity, 0), [orderItems]);
  const totalItems = useMemo(() => orderItems.length, [orderItems]);
  const totalValue = useMemo(() => orderItems.reduce((s, i) => s + i.quantity * i.rate, 0), [orderItems]);

  const saveFavourite = () => {
    if (!favName.trim()) return;
    const fav: FavouriteOrder = { id: Date.now().toString(), name: favName.trim(), items: orderItems };
    const updated = [...favourites, fav];
    setFavourites(updated);
    localStorage.setItem("orderbook_favourites", JSON.stringify(updated));
    setFavName("");
    setShowSaveFav(false);
  };

  const loadFavourite = (fav: FavouriteOrder) => {
    const newQty: Record<string, number> = {};
    const newRates: Record<string, number> = {};
    fav.items.forEach((item) => {
      newQty[item.productId] = item.quantity;
      if (item.rate > 0) newRates[item.productId] = item.rate;
    });
    setQuantities(newQty);
    setRates(newRates);
    setShowFavourites(false);
  };

  const deleteFavourite = (id: string) => {
    const updated = favourites.filter((f) => f.id !== id);
    setFavourites(updated);
    localStorage.setItem("orderbook_favourites", JSON.stringify(updated));
  };

  const clearForm = () => {
    setQuantities({});
  };

  const handleExportPDF = async () => {
    if (orderItems.length === 0) { alert("Please add items first!"); return; }
    generatePDF({ id: Date.now().toString(), customerName, address, phone, date: new Date(orderDate).toLocaleDateString("en-IN"), items: orderItems, notes, totalItems, totalQuantity, totalValue });
  };

  const handleShareWhatsApp = async () => {
    if (orderItems.length === 0) { alert("Please add items first!"); return; }
    let msg = `📋 *ORDER DETAILS*\n━━━━━━━━━━━━━━━━━━\n`;
    if (customerName) msg += `👤 *Customer:* ${customerName}\n`;
    if (address) msg += `📍 *Address:* ${address}\n`;
    if (phone) msg += `📞 *Phone:* ${phone}\n`;
    msg += `📅 *Date:* ${new Date(orderDate).toLocaleDateString("en-IN")}\n━━━━━━━━━━━━━━━━━━\n\n`;
    const grouped: Record<string, OrderItem[]> = {};
    orderItems.forEach((item) => { if (!grouped[item.category]) grouped[item.category] = []; grouped[item.category].push(item); });
    Object.entries(grouped).forEach(([cat, items]) => {
      msg += `*${cat}*\n`;
      items.forEach((item) => { msg += `  • ${item.productName}: ${item.quantity} ${item.unit}\n`; });
      msg += `\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━━\n*📦 Total Items: ${totalItems}*\n*📊 Total Qty: ${totalQuantity}*\n`;
    if (notes) msg += `\n📝 *Note:* ${notes}\n`;
    msg += `\n✨ *Created by Umang Softwares Pvt Ltd*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleExportExcel = () => {
    if (orderItems.length === 0) { alert("Please add items first!"); return; }
    generateExcel({ id: Date.now().toString(), customerName, address, phone, date: new Date(orderDate).toLocaleDateString("en-IN"), items: orderItems, notes, totalItems, totalQuantity, totalValue });
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return sortedCategories;
    const q = searchQuery.toLowerCase();
    return sortedCategories
      .map((cat) => ({ ...cat, products: cat.products.filter((p) => p.name.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) }))
      .filter((cat) => cat.products.length > 0);
  }, [searchQuery, sortedCategories]);

  return (
    <div className="min-h-screen pb-28" style={{ cursor: "none" }}>

      {/* ── HEADER ── */}
      <motion.header
        className="sticky top-0 z-50 glass-header"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          {/* Left — Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm float-anim"
              whileHover={{ rotate: 15, scale: 1.1 }}
            >
              👑
            </motion.div>
            <div>
              <h1 className="font-display text-2xl text-white leading-none tracking-tight">ORDER BOOK</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-white/25 text-[9px] font-mono-custom uppercase tracking-widest">Date:</span>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="bg-transparent border-none text-[11px] text-white font-bold focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Right — Stats + Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-right">
              <div>
                <div className="text-white font-bold text-base leading-none">{totalItems}</div>
                <div className="text-white/25 text-[8px] font-mono-custom uppercase tracking-widest">Items</div>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <motion.div
                  className="text-white font-bold text-base leading-none"
                  key={totalQuantity}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {totalQuantity}
                </motion.div>
                <div className="text-white/25 text-[8px] font-mono-custom uppercase tracking-widest">Qty</div>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <motion.div
                  className="text-white font-bold text-base leading-none"
                  key={totalValue}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  ₹{totalValue > 0 ? totalValue.toLocaleString("en-IN") : "—"}
                </motion.div>
                <div className="text-white/25 text-[8px] font-mono-custom uppercase tracking-widest">Value</div>
              </div>
            </div>
            <motion.button
              onClick={onLogout}
              className="text-[9px] font-mono-custom tracking-[0.3em] uppercase text-white/30 hover:text-white border border-white/10 hover:border-white/40 px-3 py-1.5 transition-all duration-300"
              whileTap={{ scale: 0.95 }}
            >
              EXIT
            </motion.button>
          </div>
        </div>

        {/* Mobile stats bar */}
        <div className="sm:hidden flex border-t border-white/5">
          {[
            { label: "ITEMS", value: totalItems },
            { label: "QTY", value: totalQuantity },
            { label: "VALUE", value: totalValue > 0 ? `₹${totalValue.toLocaleString("en-IN")}` : "—" },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center py-2 border-r border-white/5 last:border-r-0">
              <div className="text-white font-bold text-sm">{s.value}</div>
              <div className="text-white/25 text-[8px] font-mono-custom tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* ── SEARCH ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative"
        >
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 text-xs font-mono-custom">⌕</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-3 input-line text-base text-white placeholder-white/30 font-bold"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-xs font-mono-custom"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── CUSTOMER DETAILS ── */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-white/60" />
            <h2 className="text-xs font-display text-white uppercase tracking-widest">Customer Details</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2">
              <label className="text-[8px] font-mono-custom text-white/25 uppercase tracking-widest block mb-1.5">Name</label>
              <input
                type="text" placeholder="Customer name" value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full input-line text-base text-white placeholder-white/20 py-2.5 font-bold"
              />
            </div>
            <div>
              <label className="text-[8px] font-mono-custom text-white/25 uppercase tracking-widest block mb-1.5">Address</label>
              <input
                type="text" placeholder="Address" value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full input-line text-sm text-white placeholder-white/15 py-1.5"
              />
            </div>
            <div>
              <label className="text-[8px] font-mono-custom text-white/25 uppercase tracking-widest block mb-1.5">Phone</label>
              <input
                type="tel" placeholder="Phone" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full input-line text-sm text-white placeholder-white/15 py-1.5"
              />
            </div>
          </div>
        </motion.section>

        {/* ── QUICK ACTIONS ── */}
        <motion.div
          className="flex gap-2 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <button
            onClick={() => setShowFavourites(!showFavourites)}
            className="flex-1 min-w-[100px] py-2.5 px-3 text-[9px] font-mono-custom tracking-[0.3em] uppercase border border-white/10 text-white/50 hover:border-white/40 hover:text-white transition-all duration-300"
          >
            ⭐ Favourites
          </button>
          <AnimatePresence>
            {orderItems.length > 0 && (
              <motion.button
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                onClick={() => setShowSaveFav(true)}
                className="flex-1 min-w-[100px] py-2.5 px-3 text-[9px] font-mono-custom tracking-[0.3em] uppercase border border-white/10 text-white/50 hover:border-white/40 hover:text-white transition-all duration-300"
              >
                💾 Save Fav
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={clearForm}
            className="py-2.5 px-4 text-[9px] font-mono-custom tracking-[0.3em] uppercase border border-white/10 text-white/30 hover:border-red-500/40 hover:text-red-400 transition-all duration-300"
          >
            🗑️
          </button>
        </motion.div>

        {/* ── SAVE FAVOURITE ── */}
        <AnimatePresence>
          {showSaveFav && (
            <motion.div
              className="border border-white/8 p-4 flex gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                type="text" placeholder="Favourite name..."
                value={favName} onChange={(e) => setFavName(e.target.value)}
                className="flex-1 input-line text-sm text-white placeholder-white/20 py-1"
              />
              <button onClick={saveFavourite} className="text-[9px] font-mono-custom tracking-widest uppercase px-4 bg-white text-black hover:bg-white/90 transition-colors">SAVE</button>
              <button onClick={() => setShowSaveFav(false)} className="text-[9px] font-mono-custom text-white/30 hover:text-white px-3 border border-white/10">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FAVOURITES LIST ── */}
        <AnimatePresence>
          {showFavourites && (
            <motion.div
              className="border border-white/8 p-4 space-y-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="text-[9px] font-mono-custom text-white/30 uppercase tracking-[0.4em] mb-3">⭐ Saved Favourites</div>
              {favourites.length === 0 ? (
                <p className="text-white/20 text-xs font-mono-custom text-center py-4">No favourites yet</p>
              ) : (
                favourites.map((fav) => (
                  <div key={fav.id} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <button onClick={() => loadFavourite(fav)} className="flex-1 text-left text-sm text-white/70 hover:text-white transition-colors font-mono-custom">
                      {fav.name}
                      <span className="text-white/20 text-[10px] ml-2">({fav.items.length} items)</span>
                    </button>
                    <button onClick={() => deleteFavourite(fav.id)} className="text-white/20 hover:text-red-400 transition-colors text-xs px-2">✕</button>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PRODUCT CATEGORIES ── */}
        <div className="space-y-1">
          {filteredCategories.map((cat, catIdx) => {
            const selectedCount = cat.products.filter((p) => quantities[p.id]).length;
            const isOpen = activeCategory === cat.name;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * catIdx, duration: 0.5 }}
                className="glass-card rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/5"
              >
                {/* Category Header */}
                <button
                  onClick={() => setActiveCategory(isOpen ? null : cat.name)}
                  className="w-full px-5 py-4 flex items-center justify-between category-btn group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${selectedCount > 0 ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-white/20"}`} />
                    <span className="font-display text-sm text-white transition-colors tracking-wide uppercase">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AnimatePresence>
                      {selectedCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="text-[9px] font-mono-custom font-bold bg-emerald-400 text-black px-2 py-0.5 rounded-full badge-pop"
                        >
                          {selectedCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.span
                      className="text-white text-lg font-black"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      ▼
                    </motion.span>
                  </div>
                </button>

                {/* Products */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/5 px-5 py-3">
                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_64px_64px] gap-2 pb-2 border-b border-white/5 mb-2">
                          {["ITEM", "QTY", "RATE"].map((h) => (
                            <span key={h} className="text-[10px] font-display text-white/50 uppercase tracking-widest">{h}</span>
                          ))}
                        </div>
                        <div className="space-y-0.5">
                          {cat.products.map((product) => (
                            <div
                              key={product.id}
                              className={`grid grid-cols-[1fr_64px_64px] gap-2 items-center py-1.5 px-2 rounded transition-all duration-200 ${quantities[product.id] ? "product-row-active" : ""}`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                {product.popular && <span className="text-[9px]">🔥</span>}
                                <span className={`text-sm truncate font-bold ${quantities[product.id] ? "text-white" : "text-white/80"}`}>
                                  {product.name}
                                </span>
                              </div>
                              <input
                                type="number" min="0" step="0.5"
                                value={quantities[product.id] || ""}
                                onChange={(e) => updateQuantity(product.id, parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-2 py-2 bg-[#2a2a2a] border border-white/20 text-white text-center text-sm font-bold focus:outline-none focus:border-white transition-all rounded"
                              />
                              <input
                                type="number" min="0"
                                value={rates[product.id] || ""}
                                onChange={(e) => updateRate(product.id, parseFloat(e.target.value) || 0)}
                                placeholder="₹"
                                className="w-full px-2 py-2 bg-[#2a2a2a] border border-white/20 text-white text-center text-sm font-bold focus:outline-none focus:border-white transition-all rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ── NOTES ── */}
        <motion.section
          className="glass-card p-5 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-white/60" />
            <h2 className="text-xs font-display text-white uppercase tracking-widest">Notes</h2>
          </div>
          <textarea
            placeholder="Special instructions..."
            value={notes} onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-[#2a2a2a] border border-white/20 p-3 rounded-lg text-base text-white placeholder-white/30 focus:outline-none focus:border-white transition-all resize-none font-bold py-2 leading-relaxed"
          />
        </motion.section>

        {/* ── BRANDING ── */}
        <div className="text-center py-4">
          <p className="text-[8px] font-mono-custom text-white/10 tracking-[0.4em] uppercase">
            Designed with ❤️ by Umang Softwares Pvt Ltd
          </p>
        </div>
      </div>

      {/* ── FIXED BOTTOM ACTIONS ── */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t-2 border-white/10 px-4 py-4 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-2">
          {[
            { label: "PDF", emoji: "📄", onClick: handleExportPDF },
            { label: "WHATSAPP", emoji: "💬", onClick: handleShareWhatsApp },
            { label: "EXCEL", emoji: "📊", onClick: handleExportExcel },
          ].map((btn) => (
            <motion.button
              key={btn.label}
              onClick={btn.onClick}
              className="relative overflow-hidden group py-4 bg-white text-black text-[11px] font-display tracking-widest uppercase border-none rounded-xl font-black"
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10">{btn.emoji} {btn.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
