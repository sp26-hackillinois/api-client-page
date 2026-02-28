export function getPhantomProvider() {
  if (typeof window !== 'undefined' && window.phantom?.solana?.isPhantom) {
    return window.phantom.solana;
  }
  if (typeof window !== 'undefined') {
    window.open('https://phantom.app/', '_blank');
  }
  return null;
}

export async function connectWallet() {
  return '2Hn6ESeMRqfVDTptanXgK6vDEpgJGnp4rG6Ls3dzszv8'; // paste your public key here
}