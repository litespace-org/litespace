module.exports = {
  apps: [
    {
      script: "pnpm start",
      name: "api",
      watch: ["dist"],
      watch_delay: 1000,
    },
    {
      script: "pnpm peer",
      name: "peer",
    },
  ],
};
