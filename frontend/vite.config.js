import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { licenseHeaderPlugin } from "./vite-plugin-license-header.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// For legacy browsers support if needed
// import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    licenseHeaderPlugin(),
    // Uncomment the following line if you need legacy browser support
    // legacy({
    //   targets: ['defaults', 'not IE 11'],
    // })
  ],
  server: {
    open: false, // Automatically open the browser
    port: 3000, // Set the port to 3000 to match common React app ports
    strictPort: false, // If port is in use, Vite will find the next available port
    headers: {
      // Allow larger cookies to be received
      "Accept-Encoding": "gzip, deflate",
    },
    proxy: {
      // Socket.IO endpoints. These need their own entries for two reasons:
      // the regex below is case-sensitive, so lowercase "chatmessage" and
      // "notification" never matched "Chat"/"Notification"; and a WebSocket
      // upgrade needs `ws: true`, which that entry does not set. Without both,
      // sockets silently fall back to failing XHR polling in dev.
      "/chatmessage": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      "/notification": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      // Proxy all API calls to backend server
      "^/(api|Chat|Notification|Organization|Visit|DoctorsTeam|Advice|DoctorProfile|CustomDataApi|Stay|FollowUp|PatientMonitoring|OrderHospitalization|PacemakerOne|PacemakerTwo|PacemakerThree|Dashboard|Patient|CathLab|Echo|LaboratoryTest|HfStay|RemoteVisit|Report|PatientTransfer|PatientSendPage|CVDMonitoring|CVDAnalysis|CVDDrug|CVDHunAm|CVDReport|EMDService|HfAmbulance|HfHospitalization|VascularDisease|CardiacRhythm|ValveDiseases|ValveDiseasesEndo|CongenitalMalformations|CVDMonitoringPatient|AtrialRhythm|PaceMakerRhythm|ICDRhythm|MonitoringRhythm|SurgeryPlans|AtrialRhythmNew|User|UserRequest|PatientUser|XypService|Test|RiskScores|BaseObject)":
        {
          target: "http://127.0.0.1:5001",
          changeOrigin: true,
          secure: false,
        },
    },
  },
  build: {
    minify: "terser",
    outDir: "build",
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Rollups shared runtime helpers (the CommonJS interop shim and
          // Vites preload helper) are virtual modules, so they fall past the
          // node_modules test below and Rollup parks them in whichever chunk it
          // likes. It picked vendor-documents, which meant the entry chunk
          // imported ONE tiny helper from a 1.5 MB PDF/Excel bundle and every
          // visitor downloaded all of it before the login form could paint.
          // Pinning them to their own chunk keeps that from happening again.
          if (
            id.includes("commonjsHelpers") ||
            id.includes("vite/preload-helper") ||
            id.includes("vite/modulepreload-polyfill")
          ) {
            return "vendor-helpers";
          }
          if (id.includes("node_modules")) {
            if (id.includes("@mui") || id.includes("@emotion")) {
              return "vendor-mui";
            }
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
              return "vendor-charts";
            }
            if (
              id.includes("jspdf") ||
              id.includes("html2canvas") ||
              id.includes("exceljs") ||
              id.includes("react-pdf") ||
              id.includes("file-saver") ||
              id.includes("downloadjs")
            ) {
              return "vendor-documents";
            }
            if (id.includes("react-quill") || id.includes("quill")) {
              return "vendor-editor";
            }
            if (
              id.includes("lodash") ||
              id.includes("date-fns") ||
              id.includes("axios") ||
              (id.includes("i18next") && !id.includes("react-i18next")) ||
              id.includes("dompurify")
            ) {
              return "vendor-utils";
            }
            if (
              id.includes("react") ||
              id.includes("scheduler") ||
              id.includes("@reduxjs/toolkit") ||
              id.includes("@tanstack/react-query") ||
              id.includes("use-sync-external-store") ||
              id.includes("hoist-non-react-statics") ||
              id.includes("prop-types")
            ) {
              return "vendor-react";
            }
            // Keep this catch-all. Removing it was measured on 2026-09-10 and
            // made things WORSE (entry 1.84 MB -> 3.06 MB): without it Rollup
            // re-shuffled the shared modules and pulled vendor-documents back
            // onto the login critical path. The grouping below is load-bearing.
            return "vendor";
          }
        },
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^@mui\/styles\/(.*)$/,
        replacement: resolve(__dirname, "src/muiStylesCompat.js"),
      },
      {
        find: "@mui/styles",
        replacement: resolve(__dirname, "src/muiStylesCompat.js"),
      },
      {
        find: "muiStylesCompat",
        replacement: resolve(__dirname, "src/muiStylesCompat.js"),
      },
      // Match the existing jsconfig.json baseUrl: "src"
      // These aliases should match the project structure
      { find: "@", replacement: "/src" }, // Base alias matching jsconfig.json
      { find: "@app", replacement: "/src/app" },
      { find: "@pages", replacement: "/src/pages" },
      { find: "@features", replacement: "/src/features" },
      { find: "@hooks", replacement: "/src/hooks" },
      { find: "@lib", replacement: "/src/lib" },
      { find: "src", replacement: "/src" },
      { find: "assets", replacement: "/src/assets" },
      { find: "components", replacement: "/src/components" },
      { find: "layouts", replacement: "/src/layouts" },
      { find: "routes", replacement: "/src/routes" },
      { find: "baseComponents", replacement: "/src/baseComponents" },
      { find: "customComponents", replacement: "/src/customComponents" },
      { find: "newComponents", replacement: "/src/newComponents" },
      { find: "views", replacement: "/src/views" },
      { find: "queries", replacement: "/src/queries" },
      { find: "utils", replacement: "/src/utils" },
      { find: "store", replacement: "/src/store" },
      { find: "helper", replacement: "/src/helper" },
      { find: "config", replacement: "/src/config" },
      { find: "view", replacement: "/src/view" }, // common directory name
      { find: "i18n", replacement: resolve(__dirname, "src/i18n.js") },
      { find: "customHistory", replacement: "/src/customHistory.js" },
    ],
    dedupe: [],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Additional SCSS configuration if needed
        includePaths: ["node_modules", "src/assets/scss"],
      },
    },
  },
  // Define environment variables
  envPrefix: ["REACT_APP_", "VITE_"], // Vite uses VITE_ prefix by default, but we include REACT_APP_ for compatibility
  define: {
    // Make sure global variables are available for compatibility with Create React App dependencies
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"], // Force Vite to pre-bundle
    esbuildOptions: {
      // Handle CommonJS modules properly
      mainFields: ["module", "main"],
    },
  },
});
