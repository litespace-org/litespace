module.exports = {
  apps: [
    {
      script: "pnpm start",
      name: "jobs",
      watch: ["dist"],
      watch_delay: 5 * 1000,
    },
  ],
};
