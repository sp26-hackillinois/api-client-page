export function usePayment(): {
  isLoading: boolean;
  error: string | null;
  signature: string | null;
  executePayment: (amountUsd?: number, serviceId?: string) => Promise<string | undefined>;
};
