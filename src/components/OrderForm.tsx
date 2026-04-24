"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { productCategories } from "@/data/products";
import { OrderItem, FavouriteOrder } from "@/types/order";
import { generatePDF } from "@/utils/pdfGenerator";
import { generateExcel } from "@/utils/excelGenerator";

interface OrderFormProps {
  onLogout: () => void;
}

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

  useEffect(() => {
    const saved = localStorage.getItem("orderbook_favourites");
    if (saved) setFavourites(JSON.parse(saved));
  }, []);

  // Sort categories: popular items first within each category
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
    if (orderItems.length === 0) {
      alert("Please add items to the order first!");
      return;
    }
    generatePDF({
      id: Date.now().toString(),
      customerName,
      address,
      phone,
      date: new Date().toLocaleDateString("en-IN"),
      items: orderItems,
      notes,
      totalItems,
      totalQuantity,
      totalValue,
    });
  };

  const handleShareWhatsApp = async () => {
    if (orderItems.length === 0) {
      alert("Please add items to the order first!");
      return;
    }

    let msg = `📋 *ORDER DETAILS*\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    if (customerName) msg += `👤 *Customer:* ${customerName}\n`;
    if (address) msg += `📍 *Address:* ${address}\n`;
    if (phone) msg += `📞 *Phone:* ${phone}\n`;
    msg += `📅 *Date:* ${new Date().toLocaleDateString("en-IN")}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n\n`;

    // Group by category
    const grouped: Record<string, OrderItem[]> = {};
    orderItems.forEach((item) => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    Object.entries(grouped).forEach(([cat, items]) => {
      msg += `*${cat}*\n`;
      items.forEach((item) => {
        msg += `  • ${item.productName}: ${item.quantity} ${item.unit}`;
        if (item.rate > 0) msg += ` @ ₹${item.rate} = ₹${item.quantity * item.rate}`;
        msg += `\n`;
      });
      msg += `\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `*📦 Total Items: ${totalItems}*\n`;
    msg += `*📊 Total Qty: ${totalQuantity}*\n`;
    if (totalValue > 0) msg += `*💰 Total Value: ₹${totalValue.toLocaleString("en-IN")}*\n`;
    
    if (notes) {
      msg += `\n📝 *Note:* ${notes}\n`;
    }

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const handleExportExcel = () => {
    if (orderItems.length === 0) {
      alert("Please add items to the order first!");
      return;
    }
    generateExcel({
      id: Date.now().toString(),
      customerName,
      address,
      phone,
      date: new Date().toLocaleDateString("en-IN"),
      items: orderItems,
      notes,
      totalItems,
      totalQuantity,
      totalValue,
    });
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 shadow-xl">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Raja Order Book</h1>
                <p className="text-blue-200 text-xs">Professional Order Management</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition"
            >
              Logout
            </button>
          </div>

          {/* Summary Bar */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <div className="text-white/60 text-[10px] uppercase tracking-wider">Items</div>
              <div className="text-white font-bold text-lg">{totalItems}</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <div className="text-white/60 text-[10px] uppercase tracking-wider">Gross Qty</div>
              <div className="text-white font-bold text-lg">{totalQuantity}</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
              <div className="text-white/60 text-[10px] uppercase tracking-wider">Value</div>
              <div className="text-white font-bold text-lg">₹{totalValue.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Customer Info */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
            <span>👤</span> Customer Details
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-2 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowFavourites(!showFavourites)}
            className="flex-1 min-w-[120px] py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-sm font-medium hover:bg-yellow-500/30 transition flex items-center justify-center gap-1"
          >
            ⭐ Favourites
          </button>
          {orderItems.length > 0 && (
            <button
              onClick={() => setShowSaveFav(true)}
              className="flex-1 min-w-[120px] py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-medium hover:bg-green-500/30 transition flex items-center justify-center gap-1"
            >
              💾 Save as Favourite
            </button>
          )}
          <button
            onClick={clearForm}
            className="py-2 px-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium hover:bg-red-500/30 transition"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Save Favourite Modal */}
        {showSaveFav && (
          <div className="glass rounded-2xl p-4 space-y-3">
            <h3 className="text-white font-semibold text-sm">Save as Favourite Order</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Favourite order name..."
                value={favName}
                onChange={(e) => setFavName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button onClick={saveFavourite} className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium">Save</button>
              <button onClick={() => setShowSaveFav(false)} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* Favourites List */}
        {showFavourites && (
          <div className="glass rounded-2xl p-4 space-y-2">
            <h3 className="text-white font-semibold text-sm mb-2">⭐ Saved Favourites</h3>
            {favourites.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-4">No favourites saved yet</p>
            ) : (
              favourites.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                  <button onClick={() => loadFavourite(fav)} className="flex-1 text-left text-white text-sm">
                    {fav.name}
                    <span className="text-white/40 text-xs ml-2">({fav.items.length} items)</span>
                  </button>
                  <button onClick={() => deleteFavourite(fav.id)} className="text-red-400 text-sm px-2">✕</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Product Categories */}
        {sortedCategories.map((cat) => (
          <div key={cat.name} className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-600/30 to-purple-600/30"
            >
              <span className="text-white font-bold text-sm">{cat.name}</span>
              <div className="flex items-center gap-2">
                {cat.products.some((p) => quantities[p.id]) && (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {cat.products.filter((p) => quantities[p.id]).length} selected
                  </span>
                )}
                <span className="text-white/60 text-lg">{activeCategory === cat.name ? "−" : "+"}</span>
              </div>
            </button>

            {activeCategory === cat.name && (
              <div className="p-3 space-y-2">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_60px_60px] gap-2 px-2 pb-1 border-b border-white/10">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider">Item</span>
                  <span className="text-white/50 text-[10px] uppercase tracking-wider text-center">Qty</span>
                  <span className="text-white/50 text-[10px] uppercase tracking-wider text-center">Rate ₹</span>
                </div>
                {cat.products.map((product) => (
                  <div
                    key={product.id}
                    className={`grid grid-cols-[1fr_60px_60px] gap-2 items-center px-2 py-1.5 rounded-lg transition ${
                      quantities[product.id] ? "bg-green-500/10 border border-green-500/20" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {product.popular && <span className="text-[10px]">🔥</span>}
                      <span className="text-white text-sm truncate">{product.name}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={quantities[product.id] || ""}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      min="0"
                      value={rates[product.id] || ""}
                      onChange={(e) => updateRate(product.id, parseFloat(e.target.value) || 0)}
                      placeholder="₹"
                      className="w-full px-2 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Notes Section */}
        <div className="glass rounded-2xl p-4 space-y-2">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
            <span>📝</span> Additional Notes / Message
          </h2>
          <textarea
            placeholder="Type any message or special instructions here... (will appear in PDF & WhatsApp order)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-dark px-4 py-3 safe-area-bottom">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-2">
          <button
            onClick={handleExportPDF}
            className="py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-1"
          >
            📄 PDF
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-1"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={handleExportExcel}
            className="py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm shadow-lg active:scale-95 transition flex items-center justify-center gap-1"
          >
            📊 Excel
          </button>
        </div>
      </div>
    </div>
  );
}
