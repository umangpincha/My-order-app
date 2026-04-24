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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function OrderForm({ onLogout }: OrderFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [rates, setRates] = useState<Record<string, number>>({});
  const [favourites, setFavourites] = useState<FavouriteOrder[]>([]);
  const [showFavourites, setShowFavourites] = useState(false);
  const [favName, setFavName] = useState("");
  const [showSaveFav, setShowSaveFav] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("orderbook_favourites");
    if (saved) setFavourites(JSON.parse(saved));
  }, []);

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
    const fav: FavouriteOrder = {
      id: Date.now().toString(),
      name: favName.trim(),
      items: orderItems,
    };
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
    setRates({});
    setCustomerName("");
    setAddress("");
    setPhone("");
    setNotes("");
  };

  const handleExportPDF = async () => {
    if (orderItems.length === 0) { alert("Please add items to the order first!"); return; }
    generatePDF({ id: Date.now().toString(), customerName, address, phone, date: new Date().toLocaleDateString("en-IN"), items: orderItems, notes, totalItems, totalQuantity, totalValue });
  };

  const handleShareWhatsApp = async () => {
    if (orderItems.length === 0) { alert("Please add items to the order first!"); return; }
    let msg = `📋 *ORDER DETAILS*\n━━━━━━━━━━━━━━━━━━\n`;
    if (customerName) msg += `👤 *Customer:* ${customerName}\n`;
    if (address) msg += `📍 *Address:* ${address}\n`;
    if (phone) msg += `📞 *Phone:* ${phone}\n`;
    msg += `📅 *Date:* ${new Date().toLocaleDateString("en-IN")}\n━━━━━━━━━━━━━━━━━━\n\n`;
    const grouped: Record<string, OrderItem[]> = {};
    orderItems.forEach((item) => { if (!grouped[item.category]) grouped[item.category] = []; grouped[item.category].push(item); });
    Object.entries(grouped).forEach(([cat, items]) => {
      msg += `*${cat}*\n`;
      items.forEach((item) => { msg += `  • ${item.productName}: ${item.quantity} ${item.unit}`; if (item.rate > 0) msg += ` @ ₹${item.rate} = ₹${item.quantity * item.rate}`; msg += `\n`; });
      msg += `\n`;
    });
    msg += `━━━━━━━━━━━━━━━━━━\n*📦 Total Items: ${totalItems}*\n*📊 Total Qty: ${totalQuantity}*\n`;
    if (totalValue > 0) msg += `*💰 Total Value: ₹${totalValue.toLocaleString("en-IN")}*\n`;
    if (notes) msg += `\n📝 *Note:* ${notes}\n`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleExportExcel = () => {
    if (orderItems.length === 0) { alert("Please add items to the order first!"); return; }
    generateExcel({ id: Date.now().toString(), customerName, address, phone, date: new Date().toLocaleDateString("en-IN"), items: orderItems, notes, totalItems, totalQuantity, totalValue });
  };

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return sortedCategories;
    const q = searchQuery.toLowerCase();
    return sortedCategories
      .map((cat) => ({
        ...cat,
        products: cat.products.filter(
          (p) => p.name.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.products.length > 0);
  }, [searchQuery, sortedCategories]);

  const stats = [
    { label: "Items", value: totalItems, icon: "📦", color: "from-indigo-500 to-blue-500" },
    { label: "Gross Qty", value: totalQuantity, icon: "📊", color: "from-purple-500 to-pink-500" },
    { label: "Value", value: `₹${totalValue.toLocaleString("en-IN")}`, icon: "💰", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <motion.div
        className="relative overflow-hidden"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
        
        <div className="relative max-w-lg mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
                whileHover={{ rotate: 10, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-xl">👑</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Order Book</h1>
                <p className="text-white/50 text-[11px] font-medium">Professional Order Management</p>
              </div>
            </div>
            <motion.button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-white/10 text-white/80 text-sm font-medium backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>

          {/* Animated Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-card bg-white/10 rounded-2xl px-3 py-3 text-center backdrop-blur-sm border border-white/5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="text-lg mb-0.5">{stat.icon}</div>
                <motion.div
                  className="text-white font-bold text-lg"
                  key={String(stat.value)}
                  initial={{ scale: 1.3, color: "#a78bfa" }}
                  animate={{ scale: 1, color: "#ffffff" }}
                  transition={{ duration: 0.3 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-indigo-400/40 input-glow transition-all"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs"
              >
                ✕
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Customer Details */}
        <motion.div
          className="glass rounded-2xl p-4 space-y-3 neon-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-white/80 font-semibold text-xs uppercase tracking-widest flex items-center gap-2">
            <span>👤</span> Customer Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-2 px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-white/20 text-sm focus:outline-none focus:border-indigo-400/40 input-glow transition-all"
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-white/20 text-sm focus:outline-none focus:border-indigo-400/40 input-glow transition-all"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-white/20 text-sm focus:outline-none focus:border-indigo-400/40 input-glow transition-all"
            />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="flex gap-2 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={() => setShowFavourites(!showFavourites)}
            className="flex-1 min-w-[110px] py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium flex items-center justify-center gap-1.5"
            whileHover={{ scale: 1.03, backgroundColor: "rgba(245,158,11,0.2)" }}
            whileTap={{ scale: 0.97 }}
          >
            ⭐ Favourites
          </motion.button>
          <AnimatePresence>
            {orderItems.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setShowSaveFav(true)}
                className="flex-1 min-w-[110px] py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium flex items-center justify-center gap-1.5"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                💾 Save Fav
              </motion.button>
            )}
          </AnimatePresence>
          <motion.button
            onClick={clearForm}
            className="py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(239,68,68,0.2)" }}
            whileTap={{ scale: 0.95 }}
          >
            🗑️
          </motion.button>
        </motion.div>

        {/* Save Favourite Modal */}
        <AnimatePresence>
          {showSaveFav && (
            <motion.div
              className="glass rounded-2xl p-4 space-y-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="text-white font-semibold text-sm">Save as Favourite Order</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Favourite order name..."
                  value={favName}
                  onChange={(e) => setFavName(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-indigo-400/40 input-glow"
                />
                <motion.button onClick={saveFavourite} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium" whileTap={{ scale: 0.95 }}>Save</motion.button>
                <motion.button onClick={() => setShowSaveFav(false)} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm" whileTap={{ scale: 0.95 }}>✕</motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Favourites List */}
        <AnimatePresence>
          {showFavourites && (
            <motion.div
              className="glass rounded-2xl p-4 space-y-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-white font-semibold text-sm mb-2">⭐ Saved Favourites</h3>
              {favourites.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-4">No favourites saved yet</p>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-2">
                  {favourites.map((fav) => (
                    <motion.div
                      key={fav.id}
                      variants={itemVariants}
                      className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5 hover:bg-white/10 transition-colors"
                    >
                      <button onClick={() => loadFavourite(fav)} className="flex-1 text-left text-white text-sm">
                        {fav.name}
                        <span className="text-white/30 text-xs ml-2">({fav.items.length} items)</span>
                      </button>
                      <button onClick={() => deleteFavourite(fav.id)} className="text-red-400/60 hover:text-red-400 text-sm px-2 transition-colors">✕</button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Categories */}
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredCategories.map((cat) => {
            const selectedCount = cat.products.filter((p) => quantities[p.id]).length;
            return (
              <motion.div
                key={cat.name}
                variants={itemVariants}
                className="glass rounded-2xl overflow-hidden"
              >
                <motion.button
                  onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                  className="w-full px-4 py-3.5 flex items-center justify-between relative overflow-hidden"
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20" />
                  <span className="relative text-white font-bold text-sm">{cat.name}</span>
                  <div className="relative flex items-center gap-2">
                    <AnimatePresence>
                      {selectedCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="bg-gradient-to-r from-emerald-400 to-green-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-lg shadow-green-500/20 badge-pop"
                        >
                          {selectedCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.span
                      className="text-white/50 text-lg"
                      animate={{ rotate: activeCategory === cat.name ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      ▾
                    </motion.span>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {activeCategory === cat.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-1">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_60px_60px] gap-2 px-2 pb-2 border-b border-white/5">
                          <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">Item</span>
                          <span className="text-white/30 text-[10px] uppercase tracking-widest text-center font-bold">Qty</span>
                          <span className="text-white/30 text-[10px] uppercase tracking-widest text-center font-bold">Rate</span>
                        </div>
                        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-1">
                          {cat.products.map((product) => (
                            <motion.div
                              key={product.id}
                              variants={itemVariants}
                              className={`grid grid-cols-[1fr_60px_60px] gap-2 items-center px-2 py-2 rounded-xl transition-all duration-200 ${
                                quantities[product.id] ? "product-row-active" : "hover:bg-white/3"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {product.popular && <span className="text-[10px]">🔥</span>}
                                <span className={`text-sm truncate ${quantities[product.id] ? "text-emerald-300 font-medium" : "text-white/80"}`}>
                                  {product.name}
                                </span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                value={quantities[product.id] || ""}
                                onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-white text-center text-sm focus:outline-none focus:border-indigo-400/40 input-glow transition-all"
                              />
                              <input
                                type="number"
                                min="0"
                                value={rates[product.id] || ""}
                                onChange={(e) => updateRate(product.id, parseFloat(e.target.value) || 0)}
                                placeholder="₹"
                                className="w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/8 text-white text-center text-sm focus:outline-none focus:border-indigo-400/40 input-glow transition-all"
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Notes */}
        <motion.div
          className="glass rounded-2xl p-4 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-white/80 font-semibold text-xs uppercase tracking-widest flex items-center gap-2">
            <span>📝</span> Notes / Message
          </h2>
          <textarea
            placeholder="Special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-white/20 text-sm focus:outline-none focus:border-indigo-400/40 input-glow transition-all resize-none"
          />
        </motion.div>
      </div>

      {/* Fixed Bottom Bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 glass-dark px-4 py-3 safe-area-bottom"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.6 }}
      >
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-2.5">
          {[
            { label: "📄 PDF", onClick: handleExportPDF, colors: "from-red-500 to-rose-600" },
            { label: "💬 WhatsApp", onClick: handleShareWhatsApp, colors: "from-emerald-500 to-green-600" },
            { label: "📊 Excel", onClick: handleExportExcel, colors: "from-blue-500 to-indigo-600" },
          ].map((btn) => (
            <motion.button
              key={btn.label}
              onClick={btn.onClick}
              className={`py-3 rounded-xl bg-gradient-to-r ${btn.colors} text-white font-semibold text-sm shadow-lg btn-magic`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {btn.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
