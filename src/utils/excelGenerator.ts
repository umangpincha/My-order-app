import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Order } from "@/types/order";

export function generateExcel(order: Order) {
  const wb = XLSX.utils.book_new();

  // Header rows
  const data: (string | number)[][] = [
    ["RAJA ORDER BOOK"],
    [],
    ["Customer:", order.customerName, "", "Date:", order.date],
    ["Address:", order.address, "", "Phone:", order.phone],
    [],
    ["Total Items:", order.totalItems, "Gross Qty:", order.totalQuantity, "Total Value:", order.totalValue > 0 ? `₹${order.totalValue}` : "N/A"],
    [],
  ];

  // Group by category
  const grouped: Record<string, typeof order.items> = {};
  order.items.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  Object.entries(grouped).forEach(([category, items]) => {
    data.push([category]);
    const hasRates = items.some((i) => i.rate > 0);
    if (hasRates) {
      data.push(["#", "Item", "Qty", "Unit", "Rate (₹)", "Amount (₹)"]);
    } else {
      data.push(["#", "Item", "Qty", "Unit"]);
    }
    items.forEach((item, idx) => {
      const row: (string | number)[] = [idx + 1, item.productName, item.quantity, item.unit];
      if (hasRates) {
        row.push(item.rate > 0 ? item.rate : "-" as unknown as number);
        row.push(item.rate > 0 ? item.quantity * item.rate : "-" as unknown as number);
      }
      data.push(row);
    });
    data.push([]);
  });

  if (order.notes) {
    data.push(["Notes:", order.notes]);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 8 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws, "Order");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/octet-stream" });
  saveAs(blob, `Order_${order.customerName || "Unknown"}_${order.date.replace(/\//g, "-")}.xlsx`);
}
