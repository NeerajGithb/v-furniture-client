import { jsPDF } from "jspdf";

export function generateInvoicePDF(order: any): Uint8Array {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN = 15;

  let y = MARGIN;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  /* ================= HEADER ================= */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("V FURNITURE", MARGIN, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Furniture Store", MARGIN, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("INVOICE", PAGE_WIDTH - MARGIN, y, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${order.orderNumber}`, PAGE_WIDTH - MARGIN, y + 6, {
    align: "right",
  });
  doc.text(`Date: ${formatDate(order.createdAt)}`, PAGE_WIDTH - MARGIN, y + 12, {
    align: "right",
  });

  y += 20;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  /* ================= BILL TO ================= */

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", MARGIN, y);

  doc.setFont("helvetica", "normal");
  y += 6;
  doc.text(order.shippingAddress?.fullName || "Customer", MARGIN, y);
  y += 5;
  doc.text(order.shippingAddress?.addressLine1 || "", MARGIN, y);
  y += 5;
  if (order.shippingAddress?.addressLine2) {
    doc.text(order.shippingAddress.addressLine2, MARGIN, y);
    y += 5;
  }
  doc.text(
    `${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.postalCode}`,
    MARGIN,
    y
  );
  y += 5;
  doc.text(`Phone: ${order.shippingAddress?.phone}`, MARGIN, y);

  /* ================= ORDER DETAILS ================= */

  const rightX = PAGE_WIDTH - MARGIN - 60;
  let detailsY = y - 20;

  doc.setFont("helvetica", "bold");
  doc.text("ORDER DETAILS", rightX, detailsY);

  doc.setFont("helvetica", "normal");
  detailsY += 6;
  doc.text(`Payment Method: ${order.paymentMethod}`, rightX, detailsY);
  detailsY += 5;
  doc.text(`Payment Status: ${order.paymentStatus}`, rightX, detailsY);
  detailsY += 5;
  doc.text(`Order Status: ${order.orderStatus}`, rightX, detailsY);

  /* ================= ITEMS TABLE ================= */

  y += 15;

  const col = {
    item: MARGIN,
    price: 120,
    qty: 150,
    total: 180,
  };

  doc.setFont("helvetica", "bold");
  doc.text("Item", col.item, y);
  doc.text("Price", col.price, y, { align: "right" });
  doc.text("Qty", col.qty, y, { align: "right" });
  doc.text("Total", col.total, y, { align: "right" });

  y += 3;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  doc.setFont("helvetica", "normal");

  for (const item of order.items) {
    y += 7;

    if (y > PAGE_HEIGHT - 60) {
      doc.addPage();
      y = MARGIN;
    }

    doc.text(item.name.substring(0, 45), col.item, y);
    doc.text(formatCurrency(item.price), col.price, y, { align: "right" });
    doc.text(String(item.quantity), col.qty, y, { align: "right" });
    doc.text(
      formatCurrency(item.price * item.quantity),
      col.total,
      y,
      { align: "right" }
    );

    if (item.sku) {
      y += 4;
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`SKU: ${item.sku}`, col.item, y);
      doc.setFontSize(9);
      doc.setTextColor(0);
    }
  }

  y += 5;
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  /* ================= TOTALS ================= */

  y += 10;

  const totalsX = col.qty;

  const addTotalRow = (label: string, value: number) => {
    doc.text(label, totalsX, y);
    doc.text(formatCurrency(value), col.total, y, { align: "right" });
    y += 6;
  };

  addTotalRow("Subtotal", order.priceBreakdown?.subtotal || 0);

  if (order.priceBreakdown?.totalDiscount > 0) {
    addTotalRow("Discount", -order.priceBreakdown.totalDiscount);
  }

  if (order.priceBreakdown?.shippingCost > 0) {
    addTotalRow("Shipping", order.priceBreakdown.shippingCost);
  }

  doc.line(totalsX, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL", totalsX, y);
  doc.text(formatCurrency(order.totalAmount), col.total, y, {
    align: "right",
  });

  /* ================= FOOTER ================= */

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);

  doc.text(
    "This is a computer-generated invoice. No signature required.",
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 20,
    { align: "center" }
  );

  doc.text(
    "Support: support@vfurniture.com",
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 14,
    { align: "center" }
  );

  return new Uint8Array(doc.output("arraybuffer"));
}
