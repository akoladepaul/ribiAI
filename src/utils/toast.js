// Lightweight pub/sub toast bus so any module (components, services) can
// surface a non-blocking notification without threading a context through.
let listeners = [];
let nextId = 1;

export const subscribeToast = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

export const toast = (message, type = 'info') => {
  const entry = { id: nextId++, message, type };
  listeners.forEach((listener) => listener(entry));
};
