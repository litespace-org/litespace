module.exports = {
  apps: [
    {
      script: "pnpm start",
      name: "apollo",
      watch: ["dist"],
      watch_delay: 1000,
    },
  ],
};
