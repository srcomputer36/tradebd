// Procloudify.com / cPanel (CloudLinux Passenger & LiteSpeed lsnode.js) Startup File
// In cPanel -> "Setup Node.js App", set Application Startup File to: app.cjs

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

import('./server.js').catch((err) => {
  console.error('Failed to start Tradebd production server (make sure you ran "npm run build" first):', err);
  process.exit(1);
});
