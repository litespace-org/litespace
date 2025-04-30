import { AutoComplete, filterQuery } from "@/filterQuery";
import { nameof } from "@/utils";
import { IPlan } from "@litespace/types";
import { expect } from "chai";
import zod from "zod";

describe(nameof(filterQuery.parse), () => {
  it("should parse simple key value", () => {
    expect(filterQuery.parse("key=value")).to.be.deep.eq({
      key: "value",
    });
  });

  it("should parse simple string values wrapped in single quotes", () => {
    expect(filterQuery.parse("key='some value'")).to.be.deep.eq({
      key: "some value",
    });
  });

  it("should parse simple string values wrapped in douple quotes", () => {
    expect(filterQuery.parse(`key="some value"`)).to.be.deep.eq({
      key: "some value",
    });
  });

  it("should parse simple numeric integer values", () => {
    expect(filterQuery.parse(`key=1`)).to.be.deep.eq({
      key: 1,
    });
  });

  it("should parse simple numeric float values", () => {
    expect(
      filterQuery.parse(`key-1=1.5 key-2=.5 key-3=-1.3333 key-4=-1 key-5=-.1`)
    ).to.be.deep.eq({
      "key-1": 1.5,
      "key-2": 0.5,
      "key-3": -1.3333,
      "key-4": -1,
      "key-5": -0.1,
    });
  });

  it("should parse simple null values", () => {
    expect(filterQuery.parse(`key=null`)).to.be.deep.eq({
      key: null,
    });
  });

  it("should parse true boolean expression", () => {
    expect(filterQuery.parse(`is:open`)).to.be.deep.eq({
      open: true,
    });
  });

  it("should parse false boolean expression", () => {
    expect(filterQuery.parse(`is:!open`)).to.be.deep.eq({
      open: false,
    });
  });

  it("should parse list of values wrapped in []", () => {
    expect(filterQuery.parse(`key=[value, "value-2", 1, null]`)).to.be.deep.eq({
      key: ["value", "value-2", 1, null],
    });
  });

  it("should parse list of values wrapped in ()", () => {
    expect(filterQuery.parse(`key=(value, "value-2", 1, null)`)).to.be.deep.eq({
      key: ["value", "value-2", 1, null],
    });
  });

  it("should parse list of values wrapped in {}", () => {
    expect(filterQuery.parse(`key={value, "value-2", 1, null}`)).to.be.deep.eq({
      key: ["value", "value-2", 1, null],
    });
  });

  it("should parse parse comparison operators", () => {
    expect(
      filterQuery.parse(`key-1:>1 key-1:<3 key-2:>=1 key-3:<2 key-4:<=2 `)
    ).to.be.deep.eq({
      "key-1": { gt: 1, lt: 3 },
      "key-2": { gte: 1 },
      "key-3": { lt: 2 },
      "key-4": { lte: 2 },
    });
  });

  it("should be fault tolerant", () => {
    expect(filterQuery.program("key").value).to.be.deep.eq([
      { key: "key", operator: undefined, value: undefined },
    ]);

    expect(filterQuery.program("key=").value).to.be.deep.eq([
      { key: "key", operator: "eq", value: undefined },
    ]);

    expect(filterQuery.program("key:>").value).to.be.deep.eq([
      { key: "key", operator: "gt", value: undefined },
    ]);

    expect(filterQuery.program("is").value).to.be.deep.eq([
      { key: "is", operator: undefined, value: undefined },
    ]);

    expect(filterQuery.program("is:").value).to.be.deep.eq([
      { key: "", operator: "eq", value: true },
    ]);

    expect(filterQuery.program("key=[val").value).to.be.deep.eq([
      { key: "key", operator: "eq", value: ["val"] },
    ]);
  });
});

describe(nameof(AutoComplete), () => {
  it("should return all possible keys in case the input is empty", () => {
    const schema = zod.object({ age: zod.number(), name: zod.string() });
    const autoComplete = new AutoComplete(schema);
    expect(autoComplete.predict("").values).to.be.deep.eq(["age", "name"]);
  });

  it("should return all possible operators incase key is entered and the value is a number", () => {
    const schema = zod.object({ age: zod.number(), name: zod.string() });
    const autoComplete = new AutoComplete(schema);
    expect(autoComplete.predict("age").values).to.be.deep.eq([
      ":",
      ":>",
      ":>=",
      ":<",
      ":<=",
    ]);
  });

  it("should return empty values incase key is entered and the value is a pure string", () => {
    const schema = zod.object({ age: zod.number(), name: zod.string() });
    const autoComplete = new AutoComplete(schema);
    expect(autoComplete.predict("name").values).to.be.deep.eq([]);
  });

  it("should return all possible operators incase key is entered and the value is a union", () => {
    const schema = zod.object({
      period: zod.union([
        zod.literal("month"),
        zod.literal("quarter"),
        zod.literal("year"),
      ]),
    });

    const autoComplete = new AutoComplete(schema);

    expect(autoComplete.predict("period").values).to.be.deep.eq([
      "month",
      "quarter",
      "year",
    ]);
  });

  it("should return keys list in case value is entered", () => {
    const schema = zod.object({ age: zod.number(), name: zod.string() });
    const autoComplete = new AutoComplete(schema);
    expect(autoComplete.predict("name=age ").values).to.be.deep.eq([
      "age",
      "name",
    ]);
  });

  it("should auto complete from list of unions of literals", () => {
    const schema = zod.object({
      roles: zod.array(
        zod.union([zod.literal("student"), zod.literal("tutor")])
      ),
    });
    const autoComplete = new AutoComplete(schema);
    expect(autoComplete.predict("roles").values).to.be.deep.eq([
      "student",
      "tutor",
    ]);
  });

  it("should auto complete from list of enums", () => {
    const schema = zod.object({
      roles: zod.array(zod.enum(["tutor", "student"])),
    });
    const autoComplete = new AutoComplete(schema);
    expect(autoComplete.predict("roles").values).to.be.deep.eq([
      "tutor",
      "student",
    ]);
  });

  it("should auto complete for numeric filter", () => {
    const schema = zod.object({
      weeklyMinutes: zod
        .number()
        .min(0)
        .optional()
        .or(
          zod
            .object({
              gte: zod.number().optional(),
              lte: zod.number().optional(),
              gt: zod.number().optional(),
              lt: zod.number().optional(),
            })
            .optional()
        ),
    });
    const autoComplete = new AutoComplete(schema);
    expect(autoComplete.predict("weeklyMinutes").values).to.be.deep.eq([]);
  });

  it("should provide help from inspecting the schema", () => {
    const findQuery = zod.object({
      ids: zod.number().array().optional().describe("list of user plan ids"),
      periods: zod
        .nativeEnum(IPlan.Period)
        .array()
        .optional()
        .describe("list of plan periods"),
      weeklyMinutes: zod.union([
        zod.number().min(0).max(10).describe("filter by weekly minutes"),
        zod.object({
          gte: zod.number().optional(),
          lte: zod.number().optional(),
          gt: zod.number().optional(),
          lt: zod.number().optional(),
        }),
      ]),
      page: zod.number().int().positive().optional().default(1),
      size: zod.number().int().negative().optional().default(10),
      seed: zod.number().default(1).describe("random seed number"),
      name: zod.string().optional().describe("search by user name"),
      email: zod
        .string()
        .default("test@litespace.org")
        .describe("search by user email"),
      env: zod
        .union([
          zod.literal("local"),
          zod.literal("staging"),
          zod.literal("production"),
        ])
        .describe("target environment"),
      active: zod.boolean().optional().default(false),
    });

    const autoComplete = new AutoComplete(findQuery);
    expect(autoComplete.help()).to.be.deep.eq([
      "ids (number[]) — list of user plan ids",
      "periods (number[]) — list of plan periods(0, 1, 2)",
      "weeklyMinutes (comparable) — number: filter by weekly minutes — operators (>, >=, <, <=)",
      "page (integer) — (default=1) (min=0)",
      "size (integer) — (default=10) (max=0)",
      "seed (number) — random seed number (default=1)",
      "name (string) — search by user name",
      "email (string) — search by user email",
      "env (string) — target environment (local, staging, production)",
      "active (boolean) — (default=false)",
    ]);
  });
});
