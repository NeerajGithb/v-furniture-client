import { useEffect } from "react";

export const useCartInit = (
  userId: string | undefined,
  initializeCart: () => Promise<void>,
) => {
  useEffect(() => {
    if (userId) {
      initializeCart();
    }
  }, [userId, initializeCart]);
};