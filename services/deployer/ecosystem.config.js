module.exports = {
  apps: [
    {
      script: "pnpm start",
      name: "deployer",
      watch: ["dist"],
      watch_delay: 5 * 1000, // 5 seconds
    },
  ],
};
