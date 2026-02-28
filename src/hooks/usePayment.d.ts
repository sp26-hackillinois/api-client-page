export interface PaymentResult {
  signature: string;
  amount_usd?: number;
  amount_sol_charged?: number;
  exchange_rate_sol?: number;
  [key: string]: unknown;
}

export function usePayment(): {
  isLoading: boolean;
  error: string | null;
  signature: string | null;
  executePayment: (amountUsd?: number, sourceWallet?: string) => Promise<PaymentResult | undefined>;
};
