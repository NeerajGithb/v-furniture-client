import { useMemo, useCallback } from 'react';
import { CreditCard, Banknote } from 'lucide-react';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { PaymentMethodOption } from '../utils/paymentHelpers';
import { PaymentMethod } from '@/types/payment';

export const usePaymentMethods = () => {
  const { updateSelectedPaymentMethod } = useCheckoutStore();

  const paymentMethods: PaymentMethodOption[] = useMemo(
    () => [
      {
        id: PaymentMethod.RAZORPAY,
        name: 'Online Payment',
        icon: <CreditCard className="w-5 h-5" />,
        description: 'UPI, Cards, Net Banking & Wallets',
        popular: true,
        offers: ['Instant payment', 'Secure & encrypted'],
        available: true,
      },
      {
        id: PaymentMethod.COD,
        name: 'Cash on Delivery',
        icon: <Banknote className="w-5 h-5" />,
        description: 'Pay when your order is delivered',
        popular: true,
        offers: ['No advance payment', 'Pay after receiving product'],
        available: true,
      },
    ],
    [],
  );

  const handlePaymentMethodSelect = useCallback(
    (methodId: PaymentMethod, onErrorClear?: () => void) => {
      updateSelectedPaymentMethod(methodId);
      onErrorClear?.();
    },
    [updateSelectedPaymentMethod],
  );

  return {
    paymentMethods,
    handlePaymentMethodSelect,
  };
};