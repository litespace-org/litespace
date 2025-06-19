import { Knex } from "knex";
import { knex } from "@/query";
import { pick } from "lodash";

export class Base<
  Row extends object,
  Self extends object,
  FieldToColumnMap extends Record<keyof Self, keyof Row>,
> {
  protected columns: Record<keyof Row, string>;
  protected fieldColumnMap: FieldToColumnMap;
  protected columnFieldMap: Record<keyof Row, keyof Self>;
  public table: string;
  protected transform:
    | { [K in keyof Self]?: (value?: Row[FieldToColumnMap[K]]) => Self[K] }
    | undefined;

  constructor({
    columns,
    fieldColumnMap,
    table,
    transform,
  }: {
    columns: Record<keyof Row, string>;
    fieldColumnMap: FieldToColumnMap;
    table: string;
    transform?: {
      [K in keyof Self]?: (value?: Row[FieldToColumnMap[K]]) => Self[K];
    };
  }) {
    this.columns = columns;
    this.fieldColumnMap = fieldColumnMap;
    this.table = table;
    this.transform = transform;
    this.columnFieldMap = Object.fromEntries(
      Object.entries(fieldColumnMap).map(([field, column]) => [column, field])
    );
  }

  select<T extends keyof Self>(
    fields?: T[]
  ): Pick<Record<keyof Row, string>, FieldToColumnMap[T]> {
    if (!fields) return this.columns;

    const columnKeys = fields.map((field) => this.fieldColumnMap[field]);
    return pick(this.columns, columnKeys);
  }

  column(property: keyof Row): string {
    return `${this.table}.${this.columns[property]}`;
  }

  builder(tx?: Knex.Transaction): Knex.QueryBuilder<Row, Row[]> {
    return tx ? tx(this.table) : knex(this.table);
  }

  from(row: Row): Self {
    const self: Partial<Self> = {};

    for (const columnKey in row) {
      const field = this.columnFieldMap[columnKey];
      if (!field) continue;

      const rowValue = row[columnKey];
      const transformer = this.transform?.[field];
      const value = transformer
        ? transformer(
            rowValue as unknown as Row[FieldToColumnMap[typeof field]]
          )
        : rowValue;

      self[field] = value as Self[typeof field];
    }

    return self as Self;
  }
}
