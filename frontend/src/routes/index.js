/**
 * Main routes aggregator
 * Combines all feature-based route modules
 */
import authRoutes from "./authRoutes";
import patientPortalRoutes from "./patientPortalRoutes";
import adminRoutes from "./adminRoutes";
import nationalRegistryRoutes from "./nationalRegistryRoutes";
import cardiovascularRoutes from "./cardiovascularRoutes";
import settingsRoutes from "./settingsRoutes";

const dashRoutes = [
  ...authRoutes,
  ...patientPortalRoutes,
  ...adminRoutes,
  ...nationalRegistryRoutes,
  ...cardiovascularRoutes,
  ...settingsRoutes,
];

export default dashRoutes;
