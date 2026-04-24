export interface OrderItem {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  rate: number;
  unit: string;
}

export interface Order {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  date: string;
  items: OrderItem[];
  notes: string;
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
}

export interface FavouriteOrder {
  id: string;
  name: string;
  items: OrderItem[];
}
