// CommonJS bootstrapper for cPanel "Setup Node.js App" (Phusion Passenger)
// Point cPanel "Application startup file" to: cpanel-app.cjs
process.env.NODE_ENV = 'production';

import('./dist/cpanel-server.mjs').catch((err) => {
  console.error('Failed to start Insight Marketing Kenya SSR server:', err);
  process.exit(1);
});
