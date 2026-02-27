export const getPhantomProvider = () => {
  if (typeof window !== 'undefined' && window.phantom?.solana?.isPhantom) {
    return window.phantom.solana;
  }
  if (typeof window !== 'undefined') {
    window.open('https://phantom.app/', '_blank');
  }
  return null;
};
