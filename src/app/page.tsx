'use client';

import { useState } from 'react';
import { usePayment } from '../hooks/usePayment';

export default function PromptPayAI() {
    const [prompt, setPrompt] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const { isLoading, error, signature, executePayment } = usePayment();

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        try {
            setResult('');
            await executePayment();
            setResult(`Artwork successfully generated for: "${prompt}"`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-8 transition-transform hover:scale-[1.01] duration-300">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                    PromptPay AI
                </h1>
                <p className="text-neutral-400 mb-8 text-sm">
                    Generate premium AI imagery instantly. Powered by frictionless Solana micropayments.
                </p>

                <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="prompt" className="block text-sm font-medium text-neutral-300">
                            Creative Prompt
                        </label>
                        <input
                            id="prompt"
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="A neon-lit cyberpunk market in the rain..."
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder:text-neutral-600"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <span>Generate (Costs $0.05)</span>
                        )}
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-4 bg-red-950/40 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                )}

                {signature && (
                    <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-4 bg-green-950/30 border border-green-500/20 rounded-xl flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <p className="text-green-400 text-sm font-bold">Payment Confirmed</p>
                            </div>
                            <a
                                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-green-300 hover:text-green-200 transition-colors truncate block"
                                title={signature}
                            >
                                Tx: {signature}
                            </a>
                        </div>

                        {result && (
                            <div className="p-5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl">
                                <p className="text-indigo-200 text-sm text-center font-medium">{result}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
