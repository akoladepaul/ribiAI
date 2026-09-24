// Promise-based confirmation dialog, parallel to toast.js's pub/sub design.
// Usage: if (!(await confirmAction('Delete this address?'))) return;
let listener = null;

export const subscribeConfirm = (fn) => {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
};

export const confirmAction = (message) => {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(window.confirm(message));
      return;
    }
    listener({ message, resolve });
  });
};
