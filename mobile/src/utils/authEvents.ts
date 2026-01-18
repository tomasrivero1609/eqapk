type UnauthorizedListener = () => void;

const listeners: UnauthorizedListener[] = [];

export const emitUnauthorized = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeUnauthorized = (listener: UnauthorizedListener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  };
};
