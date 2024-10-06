import { knex } from "@/query";
import { merge, omit } from "lodash";
import { RecordAttributes } from "@litespace/types";

/**
 * Most internal tables have `created_at`, `created_by`, `updated_at`, `updated_by`
 * columns. This function populates the `created_by` and `updated_by` fields with
 * the information of its associated user.
 */
export function asAttributesQuery<
  Row extends object,
  Result extends RecordAttributes[],
>(table: string, columns: Record<string, string>) {
  const prefixed = (column: string) => [table, column].join(".");
  return knex<Row>(table)
    .select<Result>(
      merge(columns, {
        createdAt: prefixed("created_at"),
        createdById: prefixed("created_by"),
        createdByEmail: "creator.email",
        createdByName: "creator.name",
        updatedAt: prefixed("updated_at"),
        updatedById: prefixed("updated_by"),
        updatedByEmail: "updator.email",
        updatedByName: "updator.name",
      })
    )
    .innerJoin("users AS creator", "creator.id", prefixed("created_by"))
    .innerJoin("users AS updator", "updator.id", prefixed("updated_by"))
    .clone();
}

export function mapAttributesQuery<
  T extends RecordAttributes,
  M extends object,
>(list: T[], mapper: (item: T) => M) {
  return list.map((item) =>
    omit(
      merge(
        item,
        {
          createdBy: {
            id: item.createdById,
            email: item.createdByEmail,
            name: item.createdByName,
          },
          updatedBy: {
            id: item.updatedById,
            email: item.updatedByEmail,
            name: item.updatedByName,
          },
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        },
        mapper(item)
      ),
      "createdById",
      "createdByEmail",
      "createdByName",
      "updatedById",
      "udpatedByEmail",
      "updatedByName"
    )
  );
}
