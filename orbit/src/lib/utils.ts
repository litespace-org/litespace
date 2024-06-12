export function selectUpdatedOrNone<T>(prev?: T, updated?: T): T | undefined {
  return updated !== prev ? updated : undefined;
}
