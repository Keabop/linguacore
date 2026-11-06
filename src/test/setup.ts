import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
// The app's translations (Spanish by default), so components render their real texts
import '../i18n/config';

// The tries of a step live in sessionStorage: each test starts from the first try
import { afterEach } from 'vitest';
afterEach(() => { if (typeof sessionStorage !== 'undefined') sessionStorage.clear(); });
