export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  popular?: boolean;
}

export interface ProductCategory {
  name: string;
  products: Product[];
}

export const productCategories: ProductCategory[] = [
  {
    name: "MOST POPULAR",
    products: [
      { id: "mp-1", name: "₹5 KPB", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-2", name: "170G KPB", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-3", name: "₹10 KPB", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-4", name: "170G BB", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-5", name: "₹20 KPB", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-6", name: "170G SLX", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-7", name: "120G KPB", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-8", name: "300G BB", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-9", name: "120G M.BOO", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-10", name: "300G KPB", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-11", name: "120G P.BOO", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-12", name: "300G SLX", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-13", name: "120G SLX", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-14", name: "1KG BB", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-15", name: "120G BP", category: "MOST POPULAR", unit: "Pcs", popular: true },
      { id: "mp-16", name: "1KG SLX", category: "MOST POPULAR", unit: "Pcs", popular: true },
    ],
  },
  {
    name: "ITEM NAME ₹5/-",
    products: [
      { id: "r5-1", name: "KPB", category: "ITEM NAME ₹5/-", unit: "Pcs" },
      { id: "r5-2", name: "TASTY", category: "ITEM NAME ₹5/-", unit: "Pcs" },
      { id: "r5-3", name: "AB", category: "ITEM NAME ₹5/-", unit: "Pcs" },
      { id: "r5-4", name: "NAV", category: "ITEM NAME ₹5/-", unit: "Pcs" },
      { id: "r5-5", name: "DAL", category: "ITEM NAME ₹5/-", unit: "Pcs" },
      { id: "r5-6", name: "SP", category: "ITEM NAME ₹5/-", unit: "Pcs" },
      { id: "r5-7", name: "KP", category: "ITEM NAME ₹5/-", unit: "Pcs" },
      { id: "r5-8", name: "HJC", category: "ITEM NAME ₹5/-", unit: "Pcs" },
      { id: "r5-9", name: "BB", category: "ITEM NAME ₹5/-", unit: "Pcs" },
      { id: "r5-10", name: "PAL SEV", category: "ITEM NAME ₹5/-", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME ₹10/-",
    products: [
      { id: "r10-1", name: "KPB", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-2", name: "TASTY", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-3", name: "AB", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-4", name: "KP", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-5", name: "DAL", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-6", name: "NAV", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-7", name: "BB", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-8", name: "PT", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-9", name: "KM", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-10", name: "SP", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-11", name: "HJC", category: "ITEM NAME ₹10/-", unit: "Pcs" },
      { id: "r10-12", name: "LD", category: "ITEM NAME ₹10/-", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME ₹20/-",
    products: [
      { id: "r20-1", name: "KPB", category: "ITEM NAME ₹20/-", unit: "Pcs" },
      { id: "r20-2", name: "BB", category: "ITEM NAME ₹20/-", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME 120G",
    products: [
      { id: "g120-1", name: "KPB", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-2", name: "BP", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-3", name: "MBOO", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-4", name: "BB", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-5", name: "PLAIN BO", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-6", name: "DAL", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-7", name: "AB", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-8", name: "KRI", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-9", name: "KP", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-10", name: "SAHI COK", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-11", name: "TASTY", category: "ITEM NAME 120G", unit: "Pcs" },
      { id: "g120-12", name: "KM", category: "ITEM NAME 120G", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME 300G/400G",
    products: [
      { id: "g300-1", name: "KPB", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-2", name: "DAL", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-3", name: "PLAIN BO", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-4", name: "SCOKT", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-5", name: "SLX", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-6", name: "KP", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-7", name: "BB", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-8", name: "NAGORI", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-9", name: "AB", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-10", name: "NAV", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-11", name: "KRI", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-12", name: "DIET", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-13", name: "SE SADA", category: "ITEM NAME 300G/400G", unit: "Pcs" },
      { id: "g300-14", name: "KM", category: "ITEM NAME 300G/400G", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME / PARTY PACK",
    products: [
      { id: "pp-1", name: "SLX 1K", category: "ITEM NAME / PARTY PACK", unit: "Pcs" },
      { id: "pp-2", name: "BB 1K", category: "ITEM NAME / PARTY PACK", unit: "Pcs" },
      { id: "pp-3", name: "AB 1K", category: "ITEM NAME / PARTY PACK", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME / 170G/200G FULL",
    products: [
      { id: "g170-1", name: "BB", category: "ITEM NAME / 170G/200G FULL", unit: "Pcs" },
      { id: "g170-2", name: "KPB", category: "ITEM NAME / 170G/200G FULL", unit: "Pcs" },
      { id: "g170-3", name: "SLX", category: "ITEM NAME / 170G/200G FULL", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME / PAPAD",
    products: [
      { id: "pad-1", name: "200G", category: "ITEM NAME / PAPAD", unit: "Pcs" },
      { id: "pad-2", name: "400G", category: "ITEM NAME / PAPAD", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME / MISCELLANEOUS",
    products: [
      { id: "misc-1", name: "500 BB", category: "ITEM NAME / MISCELLANEOUS", unit: "Pcs" },
      { id: "misc-2", name: "KANHA 250", category: "ITEM NAME / MISCELLANEOUS", unit: "Pcs" },
      { id: "misc-3", name: "KANHA 400", category: "ITEM NAME / MISCELLANEOUS", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME / DRYFRUIT 200G",
    products: [
      { id: "df-1", name: "KKM", category: "ITEM NAME / DRYFRUIT 200G", unit: "Pcs" },
      { id: "df-2", name: "KKRI", category: "ITEM NAME / DRYFRUIT 200G", unit: "Pcs" },
    ],
  },
  {
    name: "ITEM NAME / GUJRATI",
    products: [
      { id: "guj-1", name: "LAHSUN", category: "ITEM NAME / GUJRATI", unit: "Pcs" },
      { id: "guj-2", name: "PAPADI", category: "ITEM NAME / GUJRATI", unit: "Pcs" },
      { id: "guj-3", name: "BHAV NGR", category: "ITEM NAME / GUJRATI", unit: "Pcs" },
      { id: "guj-4", name: "METHI GATH", category: "ITEM NAME / GUJRATI", unit: "Pcs" },
      { id: "guj-5", name: "GATHIYA", category: "ITEM NAME / GUJRATI", unit: "Pcs" },
      { id: "guj-6", name: "MALI SEV", category: "ITEM NAME / GUJRATI", unit: "Pcs" },
    ],
  },
];

// Flatten all products sorted: popular first
export function getAllProducts(): Product[] {
  const all: Product[] = [];
  productCategories.forEach((cat) => {
    cat.products.forEach((p) => all.push(p));
  });
  // Popular items come first
  return all.sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return 0;
  });
}
