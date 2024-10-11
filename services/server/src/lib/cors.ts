export function isAllowedOrigin(
  origin: string | undefined,
  callback: (error: Error | null, origin?: boolean | string) => void
) {
  // allow all origins for now
  callback(null, true);
}
