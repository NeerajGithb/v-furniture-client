/**
 * Generate a unique tracking number for orders
 * Format: TRK-YYYYMMDD-XXXXXX (random 6-digit number)
 */
export const generateTrackingNumber = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `TRK-${date}-${random}`;
};
