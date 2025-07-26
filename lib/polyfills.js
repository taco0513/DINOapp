// Server-side polyfills for browser globals
if (typeof self === 'undefined') {
  global.self = global;
}

if (typeof window === 'undefined') {
  global.window = global;
}

if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({}),
    createTextNode: () => ({}),
    querySelector: () => null,
    querySelectorAll: () => [],
  };
}