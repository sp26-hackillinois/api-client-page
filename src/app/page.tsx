'use client';

import { useState, useRef, useEffect } from 'react';
import { usePayment, type PaymentResult } from '../hooks/usePayment';

declare global {
  interface Window {
    phantom?: { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }>; signAndSendTransaction: (tx: unknown) => Promise<{ signature: string }> } };
    solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }>; signAndSendTransaction: (tx: unknown) => Promise<{ signature: string }> };
  }
}

type View = 'landing' | 'console';
type PaymentStatus = 'pending' | 'confirmed' | 'failed';
type MessageRole = 'user' | 'assistant' | 'tool_call' | 'payment' | 'confirmed';
type Message = {
  role: MessageRole;
  content: string;
  toolName?: string;
  amountUsd?: number;
  paymentStatus?: PaymentStatus;
  paymentSignature?: string;
  isTyping?: boolean;
};

const TICKERS = [
  { sym: 'AAPL', val: '$189.42', chg: '+1.2%', up: true },
  { sym: 'TSLA', val: '$241.18', chg: '-0.8%', up: false },
  { sym: 'BTC',  val: '$67,420', chg: '+2.4%', up: true },
  { sym: 'SOL',  val: '$142.30', chg: '+3.1%', up: true },
];

const ENDPOINTS = [
  { name: 'GET /quote', price: '$0.05', desc: 'Real-time stock quote' },
  { name: 'GET /ohlcv', price: '$0.05', desc: 'OHLCV candlestick data' },
  { name: 'GET /news',  price: '$0.05', desc: 'Market news feed' },
  { name: 'GET /macro', price: '$0.05', desc: 'Macro economic indicators' },
];

const SUGGESTED_PROMPTS = [
  'Get AAPL real-time quote',
  'TSLA OHLCV last 7 days',
  'Latest Fed rate decision news',
  'US GDP & inflation data',
];

function detectTool(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('quote') || t.includes('aapl') || t.includes('tsla') || t.includes('price')) return 'GET /quote — Real-time Quote';
  if (t.includes('ohlcv') || t.includes('candle')) return 'GET /ohlcv — Candlestick Data';
  if (t.includes('news') || t.includes('fed') || t.includes('rate')) return 'GET /news — Market News';
  if (t.includes('gdp') || t.includes('inflation') || t.includes('macro')) return 'GET /macro — Macro Indicators';
  return 'GET /quote — Market Data';
}

function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0; setDisplayed(''); setDone(false);
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { clearInterval(iv); setDone(true); onDone?.(); }
    }, 18);
    return () => clearInterval(iv);
  }, [text]);
  return <span>{displayed}{!done && <span className="cur">▊</span>}</span>;
}

function PaymentModal({ onMicropay, onClose }: { onMicropay: () => void; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Access API Console</div>
          <div className="modal-sub">Choose how you want to pay for API calls</div>
        </div>
        <div className="modal-option modal-option-old">
          <div className="modal-option-badge modal-badge-old">Traditional</div>
          <div className="modal-option-title">Add $10.00 Credit</div>
          <div className="modal-option-desc">Pre-load a balance before making any API calls. Unused credits don&apos;t roll over. Minimum top-up required.</div>
          <ul className="modal-pain-list">
            <li>⚠ Pay upfront before using anything</li>
            <li>⚠ Lose unused balance at month end</li>
            <li>⚠ Requires credit card on file</li>
            <li>⚠ Subscriptions lock you in</li>
          </ul>
          <button className="modal-btn-old" disabled>Add $10 Credit</button>
        </div>
        <div className="modal-divider">
          <div className="modal-divider-line" />
          <span className="modal-divider-text">or</span>
          <div className="modal-divider-line" />
        </div>
        <div className="modal-option modal-option-new">
          <div className="modal-option-badge modal-badge-new">✦ Powered by Solana</div>
          <div className="modal-option-title modal-title-new">Pay Per Call · Micropay</div>
          <div className="modal-option-desc">No upfront cost. Each API call costs exactly $0.05, settled instantly on Solana. No subscriptions, no minimums, no waste.</div>
          <ul className="modal-green-list">
            <li>✓ Pay only for what you use</li>
            <li>✓ Instant Solana settlement</li>
            <li>✓ No credit card required</li>
            <li>✓ $0.05 per call, that&apos;s it</li>
          </ul>
          <button className="modal-btn-new" onClick={onMicropay}>
            Connect Wallet &amp; Start →
          </button>
        </div>
      </div>
    </div>
  );
}

function LandingPage({ onEnterConsole }: { onEnterConsole: () => void }) {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="landing-logo">QuantFeed</span>
        <div className="landing-nav-links">
          <a href="#" className="landing-nav-link">Docs</a>
          <a href="#" className="landing-nav-link">Pricing</a>
          <a href="#" className="landing-nav-link">Endpoints</a>
          <button className="landing-nav-cta" onClick={onEnterConsole}>API Console →</button>
        </div>
      </nav>
      <div className="landing-hero">
        <div className="landing-hero-badge">Financial Market Data API</div>
        <h1 className="landing-h1">Real-time market data.<br />Pay per call.</h1>
        <p className="landing-p">
          QuantFeed delivers institutional-grade financial data — quotes, OHLCV, news, and macro indicators — with no subscriptions, no minimums. Each API call costs exactly $0.05, settled instantly on Solana via Micropay x402.
        </p>
        <div className="landing-hero-actions">
          <button className="landing-btn-primary" onClick={onEnterConsole}>Go to API Console →</button>
          <a href="#" className="landing-btn-secondary">View Docs</a>
        </div>
        <div className="landing-tickers">
          {TICKERS.map(t => (
            <div key={t.sym} className="landing-ticker">
              <span className="landing-ticker-sym">{t.sym}</span>
              <span className="landing-ticker-val">{t.val}</span>
              <span className={t.up ? 'landing-ticker-up' : 'landing-ticker-dn'}>{t.chg}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="landing-features">
        <div className="landing-feature">
          <div className="landing-feature-icon">◈</div>
          <div className="landing-feature-title">4 Endpoints</div>
          <div className="landing-feature-desc">Quotes, OHLCV, news, and macro data. REST API with JSON responses.</div>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">⬡</div>
          <div className="landing-feature-title">$0.05 Per Call</div>
          <div className="landing-feature-desc">No monthly fees. No minimums. Pay exactly for what you use.</div>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">↯</div>
          <div className="landing-feature-title">Solana Settlement</div>
          <div className="landing-feature-desc">Payments settle in &lt;1s on Solana Devnet via Micropay x402 protocol.</div>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">▶</div>
          <div className="landing-feature-title">Live Console</div>
          <div className="landing-feature-desc">Test every endpoint in the browser. See transactions settle in real-time.</div>
        </div>
      </div>
      <div className="landing-endpoints">
        <div className="landing-section-title">Endpoints</div>
        <div className="landing-ep-table">
          {ENDPOINTS.map(e => (
            <div key={e.name} className="landing-ep-row">
              <span className="landing-ep-name">{e.name}</span>
              <span className="landing-ep-desc">{e.desc}</span>
              <span className="landing-ep-price">{e.price} / call</span>
            </div>
          ))}
        </div>
      </div>
      <div className="landing-cta-bar">
        <div className="landing-cta-text">No credit card. No signup. Just connect your wallet.</div>
        <button className="landing-btn-primary" onClick={onEnterConsole}>Try the API Console →</button>
      </div>
      <div className="landing-footer">
        QuantFeed v2.1.0 · Payments by <span>Micropay x402</span> · Solana Devnet
      </div>
    </div>
  );
}

function Console({ walletAddress, onConnectWallet }: { walletAddress: string | null; onConnectWallet: () => Promise<string | null> }) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'QuantFeed API Console ready. Each query is billed per-call via Solana micropayments — no subscriptions, no minimums. What data do you need?',
  }]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading: isPaymentLoading, executePayment } = usePayment();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMessage = (msg: Message) => setMessages(prev => [...prev, msg]);

  const handleSend = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isThinking || isPaymentLoading) return;
    let wallet = walletAddress;
    if (!wallet) { wallet = await onConnectWallet(); if (!wallet) return; }

    addMessage({ role: 'user', content: trimmed });
    setInput('');
    setIsThinking(true);
    addMessage({ role: 'tool_call', content: '', toolName: detectTool(trimmed), amountUsd: 0.05 });
    addMessage({ role: 'payment', content: '', amountUsd: 0.05, paymentStatus: 'pending' });
    setIsThinking(false);

    try {
      const result: PaymentResult | undefined = await executePayment(0.05, wallet);
      if (!result) throw new Error('No result from payment gateway.');
      setMessages(prev => prev.map((m, i) => i === prev.length - 1
        ? { ...m, paymentStatus: 'confirmed' as PaymentStatus, paymentSignature: result.signature } : m));
      addMessage({ role: 'confirmed', content: 'Payment confirmed. Fetching market data...' });
      addMessage({
        role: 'assistant',
        content: `Query executed successfully.\n\nCharged: $${result.amount_usd} USD (${result.amount_sol_charged} SOL @ ${result.exchange_rate_sol} SOL/USD)\nTx: ${result.signature}\n\n— Powered by Micropay x402 Protocol`,
        isTyping: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed.';
      setMessages(prev => prev.map((m, i) => i === prev.length - 1
        ? { ...m, paymentStatus: 'failed' as PaymentStatus } : m));
      addMessage({ role: 'assistant', content: `Error: ${msg}` });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="console-root">
      <aside className="sidebar">
        <div className="sb-header">
          <span className="sb-logo">QuantFeed</span>
          <span className="sb-tag">Financial Market Data API</span>
        </div>
        <div className="sb-ticker-bar">
          {TICKERS.map(t => (
            <div key={t.sym} className="ticker-row">
              <span className="ticker-sym">{t.sym}</span>
              <span className="ticker-val">{t.val}</span>
              <span className={t.up ? 'ticker-up' : 'ticker-dn'}>{t.chg}</span>
            </div>
          ))}
        </div>
        <nav className="sb-nav">
          {[['▦','Overview'],['⬡','Endpoints'],['◈','Pricing'],['▶','API Console'],['≡','Docs']].map(([icon, label]) => (
            <a key={label} href="#" className={`nav-item ${label === 'API Console' ? 'nav-item-active' : ''}`}>
              <i className="nav-icon">{icon}</i>{label}
            </a>
          ))}
        </nav>
        <div className="sb-endpoints">
          <div className="ep-label">Endpoints · Pay-per-call</div>
          {ENDPOINTS.map(e => (
            <div key={e.name} className="ep-row">
              <span className="ep-name">{e.name}</span>
              <span className="ep-price">{e.price}</span>
            </div>
          ))}
        </div>
        <div className="sb-footer">
          <p>v2.1.0 · REST API · Solana Devnet</p>
          <p>Payments by <span>Micropay x402</span></p>
        </div>
      </aside>
      <div className="main">
        <header className="header">
          <div className="hdr-left">
            <div className="live-dot" />
            <div>
              <div className="hdr-title">API Console</div>
              <div className="hdr-sub">Real-time financial data · Pay-per-call via Solana</div>
            </div>
          </div>
          <div>
            {walletAddress ? (
              <div className="wallet-pill">
                <div className="live-dot" style={{ width: 5, height: 5 }} />
                {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
              </div>
            ) : (
              <button className="btn" onClick={onConnectWallet}>Connect Wallet</button>
            )}
          </div>
        </header>
        <div className="chat-area">
          {messages.map((msg, i) => {
            if (msg.role === 'user') return (
              <div key={i} className="msg-row msg-row-user">
                <div className="bubble-user">{msg.content}</div>
              </div>
            );
            if (msg.role === 'assistant') return (
              <div key={i} className="msg-row msg-row-agent">
                <div className="bubble-agent">
                  {msg.isTyping ? <TypewriterText text={msg.content} /> : msg.content}
                </div>
              </div>
            );
            if (msg.role === 'tool_call') return (
              <div key={i} className="msg-row msg-row-sys">
                <div className="tool-card">
                  <div className="tool-lbl">⬡ Endpoint Called</div>
                  <div className="tool-name">{msg.toolName}</div>
                  <div className="tool-sub">Resolving via Micropay Gateway → Solana payment required</div>
                </div>
              </div>
            );
            if (msg.role === 'payment') {
              const isConfirmed = msg.paymentStatus === 'confirmed';
              const isFailed = msg.paymentStatus === 'failed';
              const dotColor = isConfirmed ? 'var(--green)' : isFailed ? 'var(--red)' : 'var(--amber)';
              return (
                <div key={i} className="msg-row msg-row-sys">
                  <div className={`pay-card ${isConfirmed ? 'pay-card-confirmed' : isFailed ? 'pay-card-failed' : ''}`}>
                    <div className="pay-lbl">Micropay Charge</div>
                    <div className="pay-amount">${msg.amountUsd?.toFixed(2) ?? '0.05'}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>USD → SOL · live oracle peg</div>
                    <span className={`badge ${isConfirmed ? 'badge-confirmed' : isFailed ? 'badge-failed' : 'badge-pending'}`}>
                      <span className="badge-dot" style={{ background: dotColor, animation: msg.paymentStatus === 'pending' ? 'pulse 2s infinite' : 'none' }} />
                      {isConfirmed ? 'Settled on Solana' : isFailed ? 'Failed' : 'Awaiting Phantom approval...'}
                    </span>
                    {msg.paymentSignature && (
                      <a className="explorer" href={`https://explorer.solana.com/tx/${msg.paymentSignature}?cluster=devnet`} target="_blank" rel="noreferrer">
                        ↗ View on Solana Explorer
                      </a>
                    )}
                  </div>
                </div>
              );
            }
            if (msg.role === 'confirmed') return (
              <div key={i} className="conf-row">
                <span style={{ fontSize: '0.7rem' }}>✓</span>
                <span>{msg.content}</span>
              </div>
            );
            return null;
          })}
          {(isThinking || isPaymentLoading) && (
            <div className="msg-row msg-row-agent">
              <div className="thinking">
                <div className="dot" /><div className="dot" /><div className="dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {messages.length <= 1 && (
          <div className="prompts-bar">
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p} className="chip" onClick={() => handleSend(p)}>{p}</button>
            ))}
          </div>
        )}
        <div className="input-bar">
          <div className="input-wrap">
            <textarea
              ref={inputRef}
              className="chat-input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query market data — e.g. 'Get AAPL real-time quote'"
              disabled={isThinking || isPaymentLoading}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() || isThinking || isPaymentLoading}>
              Send ↵
            </button>
          </div>
          <p className="hint">QuantFeed API · Pay-per-call · Powered by Micropay x402 · Solana Devnet</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [showModal, setShowModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleConnectWallet = async (): Promise<string | null> => {
    const provider = window.phantom?.solana || window.solana;
    if (provider?.isPhantom) {
      try {
        const { publicKey } = await provider.connect();
        const addr = publicKey.toString();
        setWalletAddress(addr); return addr;
      } catch { /* rejected */ }
    }
    const key = prompt('Enter your Solana devnet public key:');
    if (key?.trim()) { setWalletAddress(key.trim()); return key.trim(); }
    return null;
  };

  const handleEnterConsole = () => setShowModal(true);

  const handleMicropay = async () => {
    setShowModal(false);
    const addr = await handleConnectWallet();
    if (addr) setView('console');
  };

  return (
    <>
      {view === 'landing' && <LandingPage onEnterConsole={handleEnterConsole} />}
      {view === 'console' && <Console walletAddress={walletAddress} onConnectWallet={handleConnectWallet} />}
      {showModal && <PaymentModal onMicropay={handleMicropay} onClose={() => setShowModal(false)} />}
    </>
  );
}
