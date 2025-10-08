import zod from "zod";

const schema = zod.union([
  zod.object({
    type: zod.literal("paid-lesson"),
    tutorId: zod.coerce.number().int().positive(),
    slotId: zod.coerce.number().int().positive(),
    start: zod.string().datetime(),
    duration: zod.coerce.number().int().positive(),
  }),
  zod.object({
    type: zod.literal("paid-plan"),
    planId: zod.coerce.number().int().positive(),
    period: zod.union([
      zod.literal("month"),
      zod.literal("quarter"),
      zod.literal("year"),
    ]),
  }),
]);

type CheckoutPageUrlQuery = Zod.infer<typeof schema>;

export function parseCheckoutPageUrlQuery(
  params: URLSearchParams
): CheckoutPageUrlQuery | null {
  const object: object = Object.fromEntries(params.entries() as string[][]);
  const query = schema.safeParse(object);
  if (!query.success) return null;
  return query.data;
}
