import '@testing-library/jest-dom/vitest';

// Constants que Vite injecta al build.
Object.assign(globalThis, { __APP_VERSION__: 'test', __BUILD_DATE__: '2026-01-01T00:00:00.000Z' });
