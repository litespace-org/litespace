import { Knex } from "knex";
import { Select, fromRow, knex, column } from "@/query";
import { pick } from "lodash";
import { ObjectKey } from "@litespace/types";
import { invert, keys } from "@litespace/utils/utils";

type BaseSelf = Record<string, unknown>;
type BaseRow = Record<string, unknown>;

type TransformRowMap<
  Self extends BaseSelf,
  Row extends BaseRow,
  FieldToColumnMap extends Record<keyof Self, keyof Row>,
> = {
  [K in keyof Self]?: (value: Row[FieldToColumnMap[K]]) => Self[K];
};

function asColumnMap<T extends ObjectKey>(
  columns: T[],
  table: string
): Record<T, string> {
  const map: Partial<Record<T, string>> = {};
  for (const col of columns) {
    if (typeof col != "string") throw new Error("invalid column name");
    map[col] = `${table}.${col}`;
  }
  return map as Record<T, string>;
}

export abstract class Model<
  Row extends BaseRow,
  Self extends BaseSelf,
  FieldColumnMap extends Record<keyof Self, keyof Row>,
> {
  protected transform: TransformRowMap<Self, Row, FieldColumnMap> | undefined;
  protected columnsMap: Record<keyof Row, string>;
  protected fieldColumnMap: FieldColumnMap;
  public table: string;

  constructor({
    fieldColumnMap,
    table,
    transform,
  }: {
    transform?: TransformRowMap<Self, Row, FieldColumnMap>;
    fieldColumnMap: FieldColumnMap;
    table: string;
  }) {
    this.fieldColumnMap = fieldColumnMap;
    this.table = table;
    this.transform = transform;
    this.columnsMap = asColumnMap(keys(invert(fieldColumnMap)), table);
  }

  select<T extends keyof Self>(
    fields?: T[]
  ): Pick<Record<keyof Row, string>, FieldColumnMap[T]> {
    if (!fields) return this.columnsMap;
    const columnKeys = fields.map((field) => this.fieldColumnMap[field]);
    return pick(this.columnsMap, columnKeys);
  }

  column(value: keyof Row): string {
    return column(value, this.table);
  }

  builder(tx?: Knex.Transaction): Knex.QueryBuilder<Row, Row[]> {
    const builder = tx || knex;
    return builder(this.table);
  }

  from<T extends keyof Self>(
    row: Select<Row, T, FieldColumnMap>
  ): Pick<Self, T> {
    return fromRow(row, this.fieldColumnMap, this.transform);
  }
}
