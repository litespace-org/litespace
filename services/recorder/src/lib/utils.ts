import zod, { ZodLiteral } from "zod";

export function unionOfLiterals<T extends string | number>(
  constants: readonly T[]
) {
  const literals = constants.map((x) => zod.literal(x)) as unknown as readonly [
    ZodLiteral<T>,
    ZodLiteral<T>,
    ...ZodLiteral<T>[],
  ];
  return zod.union(literals);
}
