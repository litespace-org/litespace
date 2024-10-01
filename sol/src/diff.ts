import { differenceWith, toPairs, isEqual, fromPairs } from "lodash";

/**
 *
 * @param first the updated object
 * @param second the old object
 * @returns the updated fields located in `first` but not in `second`
 */
export function diff<T extends object>(first: T, second: T): T {
  const changes = differenceWith(toPairs(first), toPairs(second), isEqual);
  const filtered = changes.filter(([_, value]) => value !== undefined);
  return fromPairs(filtered) as T;
}
