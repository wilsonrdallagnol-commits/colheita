// packages/auth/src/index.ts
export { createBrowserClient } from './client.js';
export { updateSession } from './middleware.js';
export {
  createAdminClient,
  createServerClient,
  getSession,
  getUser,
  requireAuth,
} from './server.js';
