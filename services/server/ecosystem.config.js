module.exports = {
  apps: [
    {
      script: "pnpm start",
      name: "api",
    },
    {
      script: "pnpm peer",
      name: "peer",
    },
  ],
};
