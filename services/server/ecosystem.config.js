module.exports = {
  apps: [
    {
      script: "pnpm start",
      name: "main-server",
    },
    {
      script: "pnpm peer",
      name: "peer",
    },
  ],
  deploy: {
    production: {
      user: "SSH_USERNAME",
      host: "SSH_HOSTMACHINE",
      ref: "origin/master",
      repo: "GIT_REPOSITORY",
      path: "DESTINATION_PATH",
    },
  },
};
