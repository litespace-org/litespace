export function asFullUrl(base: string, pathname: string): string {
  return new URL(pathname, base).href;
}
