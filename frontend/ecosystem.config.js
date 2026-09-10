module.exports = {
  apps: [
    {
      name: "mn-cardio-frontend",
      script: "npm",
      args: ["run", "preview", "--", "--host"],
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
        script: "npm",
        args: ["run", "dev", "--", "--host"],
      },
    },
  ],
};
