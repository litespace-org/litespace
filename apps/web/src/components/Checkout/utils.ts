import zod from "zod";
import { Tab, TxTypePayload } from "@/components/Checkout/types";
import { UrlQueryOf, Web } from "@litespace/utils/routes";
import { nstr } from "@litespace/utils";

const schema: Zod.Schema<TxTypePayload> = zod.union([
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

export function asTxTypePayload(params: URLSearchParams): TxTypePayload | null {
  const object: object = Object.fromEntries(params.entries());
  const query = schema.safeParse(object);
  if (!query.success) return null;
  return query.data;
}

export function asSearchUrlParams(
  txTypePayload: TxTypePayload
): UrlQueryOf<Web.Checkout> {
  if (txTypePayload.type === "paid-lesson")
    return {
      type: "paid-lesson",
      tutorId: nstr(txTypePayload.tutorId),
      slotId: nstr(txTypePayload.slotId),
      start: txTypePayload.start,
      duration: nstr(txTypePayload.duration),
    };

  return {
    type: "paid-plan",
    planId: nstr(txTypePayload.planId),
    period: txTypePayload.period,
  };
}

export function isValidTab(tab: string): tab is Tab {
  return tab === "card" || tab === "ewallet" || tab === "fawry";
}
