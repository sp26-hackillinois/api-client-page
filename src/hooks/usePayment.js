import { useState } from 'react';
import axios from 'axios';
import { Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { getPhantomProvider } from '../utils/phantom';

export const usePayment = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [signature, setSignature] = useState(null);

    const executePayment = async () => {
        setIsLoading(true);
        setError(null);
        setSignature(null);

        try {
            const provider = getPhantomProvider();
            if (!provider) {
                throw new Error('Phantom wallet not found or extension not installed.');
            }

            const { publicKey } = await provider.connect();

            const response = await axios.post(
                'http://localhost:3000/api/v1/charges',
                {
                    amount_usd: 0.05,
                    source_wallet: publicKey.toString(),
                    destination_wallet: 'HRX8iSq6U5J2z3s698t6g3T8d9q1PqAQRr6b9sZ6mR' // Replace with your hardcoded dev pubkey
                },
                {
                    headers: {
                        Authorization: 'Bearer test_api_key_123',
                    },
                }
            );

            const payload = response.data.transaction_payload;
            if (!payload) {
                throw new Error('Invalid response from payment server.');
            }

            const tx = Transaction.from(Buffer.from(payload, 'base64'));
            const { signature: computedSignature } = await provider.signAndSendTransaction(tx);

            setSignature(computedSignature);
            return computedSignature;
        } catch (err) {
            const errMsg = err.response?.data?.error || err.message || 'Payment execution failed';
            setError(errMsg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, error, signature, executePayment };
};
