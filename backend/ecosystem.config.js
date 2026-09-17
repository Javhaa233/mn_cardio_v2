/**
 * PM2 process definition for the MnCardio API.
 *
 * The backend had no process manager configuration at all before this; only the
 * frontend carried one. Production was started by hand.
 *
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save && pm2 startup     # survive a reboot
 *
 * fork mode with instances: 1, deliberately and non-negotiably.
 * WebSockets/ChatSocket.js:29-33 documents that Socket.IO rooms are per-process:
 * under cluster mode with more than one worker, a chat message fans out only to
 * the members who happen to share a worker with the sender, and the rest of the
 * room silently never receives it. Raising `instances` requires adding
 * @socket.io/redis-adapter first. Nothing warns you if you get this wrong.
 *
 * node_args mirrors `npm start` — the large header allowance is deliberate
 * (CLAUDE.md §2: auth headers on this system are big). Do not drop it.
 *
 * The app reads config/Config.env itself (server.js:6), so almost nothing is set
 * here. NODE_ENV is the exception: it decides whether JWT signatures are
 * verified, whether passwords are checked, and whether the server binds to
 * 127.0.0.1 for nginx or to 0.0.0.0. It must be `production` on a real server.
 */
module.exports = {
  apps: [
    {
      /*
       * PRODUCTION ALREADY RUNS A PM2 APP UNDER A DIFFERENT NAME.
       *
       * smr.telemedicine.mn was started by hand, before this file existed, as
       * `mn-cardio-backend` (PRODUCTION-CHECKLIST.md). PM2 keys apps by name, so
       * `pm2 start ecosystem.config.js` there does NOT adopt that process - it
       * starts a SECOND one, and the two fight over port 5001.
       *
       * The name is left as `mncardio-api` because that is what the customer's
       * own handover document uses throughout (docs/handover/admin-guide.md, 11
       * places). Reconciling them is a deployment decision, not a code change:
       * either `pm2 delete mn-cardio-backend` before the first start from this
       * file, or rename here and in the admin guide together.
       */
      name: 'mncardio-api',
      script: 'server.js',
      cwd: __dirname,
      node_args: '--max-http-header-size=524288',

      /*
       * Absolute path, not whatever `node` happens to be on PATH.
       *
       * package.json requires Node >=24, but npm only warns about `engines` at
       * install time — nothing stops PM2 launching this under an older runtime,
       * and it would appear to work until something needed a v24 feature.
       *
       * On the test host the system Node is v22 and two other live applications
       * depend on it, so v24 is installed alongside at /opt/node-24 rather than
       * replacing it. Set PM2_INTERPRETER if that path differs.
       */
      interpreter: process.env.PM2_INTERPRETER || '/opt/node-24/bin/node',

      exec_mode: 'fork',
      instances: 1,

      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Puppeteer's Chrome and the report generators are slow to start under
      // load; give the process room before PM2 decides a restart loop is stuck.
      min_uptime: '20s',
      max_restarts: 10,
      restart_delay: 2000,
      kill_timeout: 10000,

      merge_logs: true,
      time: true,
      error_file: 'logs/api-error.log',
      out_file: 'logs/api-out.log',

      // `env` is the default. env_production is declared as well so that an
      // explicit `--env production` resolves instead of warning "Environment
      // [production] is not defined in process file" and silently falling back.
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
};
