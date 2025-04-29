import { searchSchema } from "@/searchSchema";
import { nameof } from "@/utils";
import { expect } from "chai";

describe(nameof(searchSchema.parse), () => {
  it("should parse simple key value", () => {
    expect(searchSchema.parse("key=value").value).to.be.deep.eq([
      {
        key: "key",
        operator: "eq",
        value: "value",
      },
    ]);
  });

  it("should parse simple string values wrapped in single quotes", () => {
    expect(searchSchema.parse("key='some value'").value).to.be.deep.eq([
      { key: "key", operator: "eq", value: "some value" },
    ]);
  });

  it("should parse simple string values wrapped in douple quotes", () => {
    expect(searchSchema.parse(`key="some value"`).value).to.be.deep.eq([
      { key: "key", operator: "eq", value: "some value" },
    ]);
  });

  it("should parse simple numeric integer values", () => {
    expect(searchSchema.parse(`key=1`).value).to.be.deep.eq([
      { key: "key", operator: "eq", value: 1 },
    ]);
  });

  it("should parse simple numeric float values", () => {
    expect(
      searchSchema.parse(`key-1=1.5 key-2=.5 key-3=-1.3333 key-4=-1 key-5=-.1`)
        .value
    ).to.be.deep.eq([
      { key: "key-1", operator: "eq", value: 1.5 },
      { key: "key-2", operator: "eq", value: 0.5 },
      { key: "key-3", operator: "eq", value: -1.3333 },
      { key: "key-4", operator: "eq", value: -1 },
      { key: "key-5", operator: "eq", value: -0.1 },
    ]);
  });

  it("should parse simple null values", () => {
    expect(searchSchema.parse(`key=null`).value).to.be.deep.eq([
      { key: "key", operator: "eq", value: null },
    ]);
  });

  it("should parse true boolean expression", () => {
    expect(searchSchema.parse(`is:open`).value).to.be.deep.eq([
      { key: "open", operator: "eq", value: true },
    ]);
  });

  it("should parse false boolean expression", () => {
    expect(searchSchema.parse(`is:!open`).value).to.be.deep.eq([
      { key: "open", operator: "eq", value: false },
    ]);
  });

  it("should parse list of values wrapped in []", () => {
    expect(
      searchSchema.parse(`key=[value, "value-2", 1, null]`).value
    ).to.be.deep.eq([
      { key: "key", operator: "eq", value: ["value", "value-2", 1, null] },
    ]);
  });

  it("should parse list of values wrapped in ()", () => {
    expect(
      searchSchema.parse(`key=(value, "value-2", 1, null)`).value
    ).to.be.deep.eq([
      { key: "key", operator: "eq", value: ["value", "value-2", 1, null] },
    ]);
  });

  it("should parse list of values wrapped in {}", () => {
    expect(
      searchSchema.parse(`key={value, "value-2", 1, null}`).value
    ).to.be.deep.eq([
      { key: "key", operator: "eq", value: ["value", "value-2", 1, null] },
    ]);
  });

  it("should parse parse comparison operators", () => {
    expect(
      searchSchema.parse(`key-1:>1 key-2:>=1 key-3:<2 key-4:<=2 `).value
    ).to.be.deep.eq([
      { key: "key-1", operator: "gt", value: 1 },
      { key: "key-2", operator: "gte", value: 1 },
      { key: "key-3", operator: "lt", value: 2 },
      { key: "key-4", operator: "lte", value: 2 },
    ]);
  });
});
