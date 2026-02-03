export const calculateItemInsuranceCost = (
  itemTotal: number,
  hasProtection: boolean,
): number => {
  return hasProtection ? Math.round(itemTotal * 0.02) : 0;
};

export const getInsuranceRate = () => 0.02; // 2% of item value
