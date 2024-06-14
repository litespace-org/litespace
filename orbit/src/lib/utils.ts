export function selectUpdatedOrNone<P, U>(
  prev?: P,
  updated?: U
): U | undefined {
  return updated !== prev ? updated : undefined;
}
