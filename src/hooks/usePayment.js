import { useState } from 'react';
import { Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

const BACKEND_URL = 'https://micropay.up.railway.app';
const API_KEY = 'test_api_key_123';
const DESTINATION_WALLET = '2Hn6ESeMRqfVDTptanXgK6vDEpgJGnp4rG6Ls3dzszv8'; // ask Member 2 for this

export const usePayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signature, setSignature] = useState(null);

  const executePayment = async (amountUsd = 1.00, sourceWallet) => {
    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      // Step 1: Get unsigned transaction from backend
      const res = await fetch(`${BACKEND_URL}/api/v1/charges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          amount_usd: amountUsd,
          source_wallet: 'AuofYo21iiX8NQtgWBXLRFMiWfv83z2CbnhPNen6WNt5',
          destination_wallet: DESTINATION_WALLET,
        }),
      });

      const data = await res.json();
      if (!data.transaction_payload) throw new Error('No transaction payload returned.');

      // Step 2: Decode Base64 tx
      const tx = Transaction.from(Buffer.from(data.transaction_payload, 'base64'));

      // Step 3: Send to Phantom
      const provider = window.phantom?.solana || window.solana;
      if (!provider) throw new Error('Phantom not found.');
      const { signature: sig } = await provider.signAndSendTransaction(tx);

      setSignature(sig);
      return { signature: sig, ...data };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, signature, executePayment };
};