/**
 * The generic REST layer: /api/base/:target and /api/report/*.
 *
 * Both mounts answered with NO AUTHENTICATION AT ALL until 2026-09-14. That was
 * a recorded security finding (CLAUDE.md §10, mobile/READINESS.md §2.7) and the
 * 2026-09-10 acceptance sweep confirmed it by getting 200s without a token.
 *
 * The gate is applied HERE, on the two sub-routers, rather than by wrapping
 * `app.use('/api', ...)` in server.js. Wrapping the mount would also intercept
 * every path under /api that these routers do not serve, turning what is now a
 * 404 into a 401 and running a full user fetch on each one - including for the
 * legacy prefixes that fall through to this mount unmatched. Two lines here
 * have a blast radius of exactly two prefixes.
 *
 * VerifyTokenJson rather than Auth.verifyToken because this layer speaks the
 * lowercase { success, message, data } envelope with real status codes; its
 * consumers read `responseData.success`, and frontend/src/config/Server.js
 * already has a 401 interceptor that redirects to the right login screen.
 *
 * DenyPatient because PATIENT_ALLOWED_PREFIXES does not reach this mount - see
 * helper/DenyPatient.js.
 *
 * Known consumers, all of which already send a bearer token through the
 * Server.js request interceptor: roughly thirty Redux reducers under
 * frontend/src/store/reducers (Icd, Pm, Organization, DoctorsProfile,
 * TurulhiinGajig, HavhlagaEmgeg, News, Options) plus
 * frontend/src/utils/rest/dataSource.js. For a logged-in user nothing changes;
 * an expired session now redirects instead of silently rendering empty lists.
 */
const Router = require('express').Router();

const gate = [require('../helper/VerifyTokenJson'), require('../helper/DenyPatient')];

Router.use('/report', gate, require('./report'));
Router.use('/base', gate, require('./base'));

module.exports = Router;
