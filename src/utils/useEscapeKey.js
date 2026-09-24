import { useEffect } from 'react';

// Closes the calling modal on Escape — the one keyboard affordance every
// modal in the app was missing. Pass `active` so the listener only attaches
// while the modal is actually open.
export const useEscapeKey = (onClose, active = true) => {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, onClose]);
};
