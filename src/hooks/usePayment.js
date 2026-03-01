import { useState } from 'react';
import { Transaction, Connection } from '@solana/web3.js';
import { Buffer } from 'buffer';

const BACKEND_URL   = 'https://micropay.up.railway.app';
const API_KEY       = 'mp_live_demo_key';
const SERVICE_ID    = 'finance_stocks';
const SOURCE_WALLET = 'AuofYo21iiX8NQtgWBXLRFMiWfv83z2CbnhPNen6WNt5';

// Direct devnet connection — same as backend test_full_flow.js
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export const usePayment = () => {
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState(null);
  const [signature,  setSignature]  = useState(null);

  const executePayment = async (amountUsd = 0.01) => {
    setIsLoading(true);
    setError(null);
    setSignature(null);

    try {
      // Step 1: Get unsigned tx from backend
      const res = await fetch(`${BACKEND_URL}/api/v1/charges`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          service_id:    SERVICE_ID,
          source_wallet: SOURCE_WALLET,
          amount_usd:    amountUsd,
        }),
      });

      const charge = await res.json();
      if (!res.ok) throw new Error(charge?.error?.message || `Backend error: ${res.status}`);
      if (!charge.transaction_payload) throw new Error('No transaction_payload in response.');

      // Step 2: Decode Base64 → Transaction
      const tx = Transaction.from(Buffer.from(charge.transaction_payload, 'base64'));

      // Step 3: Refresh blockhash so it doesn't expire before broadcast
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;

      // Step 4: Phantom SIGNS only (does not broadcast)
      const provider = window.phantom?.solana || window.solana;
      if (!provider?.isPhantom) throw new Error('Phantom not found.');
      if (!provider.isConnected) await provider.connect();

      const connectedKey = provider.publicKey?.toString();
      if (connectedKey !== SOURCE_WALLET) {
        throw new Error(`Wrong wallet. Phantom has ${connectedKey?.slice(0,8)}... but needs AuofYo21...`);
      }

      // signTransaction shows popup but does NOT broadcast — we control the send
      const signedTx = await provider.signTransaction(tx);

      // Step 5: We broadcast to devnet ourselves — same as backend test sendRawTransaction
      const sig = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      // Step 6: Wait for confirmation
      await connection.confirmTransaction({
        signature: sig,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      console.log(`✅ Confirmed: https://explorer.solana.com/tx/${sig}?cluster=devnet`);

      setSignature(sig);
      return {
        signature:          sig,
        amount_usd:         charge.amount_usd,
        amount_sol_charged: charge.amount_sol,
        exchange_rate_sol:  charge.exchange_rate_sol_usd,
        ...charge,
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, signature, executePayment };
};