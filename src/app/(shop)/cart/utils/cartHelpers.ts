export const calculateInsuranceCost = (itemTotal: number): number => {
  return Math.round(itemTotal * 0.02);
};

export const getItemTotalWithInsurance = (
  itemTotal: number,
  hasInsurance: boolean,
): number => {
  return itemTotal + (hasInsurance ? calculateInsuranceCost(itemTotal) : 0);
};