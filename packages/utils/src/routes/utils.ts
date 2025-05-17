export function asRegex(path: string) {
  let processed = path;

  processed = processed.replace(/:[^/]+/g, "([^/]+)");

  if (processed.endsWith("/")) processed += "?$";
  else processed += "/?$";

  if (processed.startsWith("/")) processed = "^/?" + processed.slice(1);
  else processed = "^/?" + processed;

  return new RegExp(processed);
}
