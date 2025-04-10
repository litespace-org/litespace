module.exports = {
  apps: [
    {
      script: "pnpm start:telegram",
      name: "telegram",
    },
    {
      script: "pnpm start:whatsapp",
      name: "whatsapp",
    },
  ],
};
