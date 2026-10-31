import '@testing-library/jest-dom';

// Polyfill / Mock para localStorage en caso de Node 22/26 con flags experimentales
if (typeof window !== 'undefined') {
  let store: Record<string, string> = {};

  Storage.prototype.getItem = function (key: string): string | null {
    return store[key] ?? null;
  };
  Storage.prototype.setItem = function (key: string, value: string): void {
    store[key] = String(value);
  };
  Storage.prototype.removeItem = function (key: string): void {
    delete store[key];
  };
  Storage.prototype.clear = function (): void {
    store = {};
  };
  Storage.prototype.key = function (index: number): string | null {
    return Object.keys(store)[index] ?? null;
  };
  Object.defineProperty(Storage.prototype, 'length', {
    get: function () {
      return Object.keys(store).length;
    },
    configurable: true
  });

  const localStorageMock = Object.create(Storage.prototype);
  localStorageMock.getItem = (key: string) => Storage.prototype.getItem.call(localStorageMock, key);
  localStorageMock.setItem = (key: string, val: string) => Storage.prototype.setItem.call(localStorageMock, key, val);
  localStorageMock.removeItem = (key: string) => Storage.prototype.removeItem.call(localStorageMock, key);
  localStorageMock.clear = () => Storage.prototype.clear.call(localStorageMock);

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
  });
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
  });
}
