import '@testing-library/jest-dom';

// Polyfill / Mock para localStorage en caso de Node 22/26 con flags experimentales
if (typeof window !== 'undefined') {
  let store: Record<string, string> = {};

  const localStorageMock: Storage = {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = String(value);
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
    get length(): number {
      return Object.keys(store).length;
    }
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
}
