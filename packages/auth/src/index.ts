// packages/auth/src/index.ts
export { createBrowserClient } from './client.js';
export { updateSession } from './middleware.js';
export { createServerClient, getSession, getUser, requireAuth } from './server.js';
