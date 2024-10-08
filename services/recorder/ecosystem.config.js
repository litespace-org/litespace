module.exports = {
  apps: [
    {
      script: "pnpm start",
      name: "recorder",
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
