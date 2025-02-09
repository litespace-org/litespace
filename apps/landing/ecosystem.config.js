module.exports = {
  apps: [
    {
      script: "pnpm start --port 6060",
      name: "landing",
      watch: ["dist"],
      watch_delay: 1000,
    },
  ],
};
