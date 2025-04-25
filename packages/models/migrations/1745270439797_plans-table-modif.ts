import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.dropColumns("plans", [
    "alias",
    "full_month_price",
    "full_quarter_price",
    "half_year_price",
    "full_year_price",
    "full_month_discount",
    "full_quarter_discount",
    "half_year_discount",
    "full_year_discount",
    "created_by",
    "updated_by",
  ]);

  pgm.addColumns("plans", {
    base_monthly_price: { type: "INT", notNull: true, default: 0 },
    month_discount: { type: "INT", notNull: true, default: 0 },
    quarter_discount: { type: "INT", notNull: true, default: 0 },
    year_discount: { type: "INT", notNull: true, default: 0 },
  });
}

export async function down(_: MigrationBuilder): Promise<void> {}
