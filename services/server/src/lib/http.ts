export function asBase64(app: {
  clientId: string;
  clientSecret: string;
}): string {
  return Buffer.from([app.clientId, app.clientSecret].join(":")).toString(
    "base64"
  );
}
