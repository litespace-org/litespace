import {
  JsonArray,
  JsonBoolean,
  JsonComparable,
  JsonComparisonOperators,
  JsonInteger,
  JsonNullableNumber,
  JsonNullableString,
  JsonNumber,
  JsonObject,
  JsonString,
} from "@/filterQuery/types";
import { FilterQueryParser } from "@/filterQuery/filterQuery";
import zodToJsonSchema from "zod-to-json-schema";
import { entries, keys, last } from "lodash";

export class AutoComplete {
  public readonly jsonSchema: JsonObject;
  constructor(public readonly zodSchema: Zod.ZodSchema) {
    this.jsonSchema = zodToJsonSchema(zodSchema) as JsonObject;
  }

  predict(src: string) {
    try {
      const { properties } = this.jsonSchema;
      const parser = new FilterQueryParser();
      const program = parser.parse(src);
      const statement = last(program.value);
      if (!statement)
        return {
          type: "keys",
          values: keys(properties),
        };

      const { key, operator, value } = statement;
      const keySchema = properties[key];

      if (
        key &&
        !operator &&
        keySchema &&
        "type" in keySchema &&
        keySchema.type === "number"
      )
        return {
          type: "operators",
          values: [":", ":>", ":>=", ":<", ":<="],
        };

      if (
        key &&
        !operator &&
        keySchema &&
        "type" in keySchema &&
        keySchema.type === "string" &&
        !!keySchema.enum
      )
        return {
          type: "enum",
          values: keySchema.enum,
        };

      if (
        key &&
        !operator &&
        "type" in keySchema &&
        keySchema.type === "array" &&
        keySchema.items.type === "string" &&
        keySchema.items.enum
      )
        return {
          type: "enum",
          values: keySchema.items.enum,
        };

      if (key && operator && value && src.endsWith(" "))
        return {
          type: "new-expression",
          values: keys(properties),
        };

      return {
        type: "fallback",
        values: [],
      };
    } catch (_) {
      return {
        type: "error",
        values: [],
      };
    }
  }

  help() {
    const { properties } = this.jsonSchema;
    const help: string[] = [];

    for (const [key, value] of entries(properties)) {
      if ("type" in value && value.type === "string")
        help.push(this.string(value, key));

      if ("type" in value && value.type === "boolean")
        help.push(this.boolean(value, key));

      if ("type" in value && value.type === "number")
        help.push(this.number(value, key));

      if ("type" in value && value.type === "integer")
        help.push(this.integer(value, key));

      if ("type" in value && value.type === "array")
        help.push(this.array(value, key));

      if (
        "type" in value &&
        typeof value.type === "object" &&
        value.type[0] === "string" &&
        value.type[1] === "null"
      )
        help.push(this.nullableString(value as JsonNullableString, key));

      if (
        "type" in value &&
        typeof value.type === "object" &&
        value.type[0] === "number" &&
        value.type[1] === "null"
      )
        help.push(this.nullableNumber(value as JsonNullableNumber, key));

      if ("anyOf" in value) help.push(this.comperable(value, key));
    }

    return help;
  }

  private string(value: JsonString, key?: string): string {
    let help = key ? `${key} (string) —` : "";

    if (value.description) help += ` ${value.description}`;

    if (value.enum) help += ` (${value.enum.join(", ")})`;

    return help.trim();
  }

  private nullableString(value: JsonNullableString, key?: string): string {
    let help = key ? `${key} (string or null) —` : "";

    if (value.description) help += ` ${value.description}`;

    return help.trim();
  }

  private nullableNumber(value: JsonNullableNumber, key?: string): string {
    let help = key ? `${key} (number or null) —` : "";

    if (value.description) help += ` ${value.description}`;

    return help.trim();
  }

  private boolean(value: JsonBoolean, key?: string): string {
    let help = key ? `${key} (boolean) —` : "";

    if (value.description) help += ` ${value.description}`;

    if (typeof value.default !== "undefined")
      help += ` (default=${value.default})`;

    return help.trim();
  }

  private number(value: JsonNumber, key?: string): string {
    let help = key ? `${key} (number) —` : "";

    if (value.description) help += ` ${value.description}`;

    if (typeof value.default !== "undefined")
      help += ` (default=${value.default})`;

    if (value.enum) help += ` (${value.enum.join(", ")})`;

    return help.trim();
  }

  private integer(value: JsonInteger, key?: string): string {
    let help = key ? `${key} (integer) —` : "";

    if (value.description) help += ` ${value.description}`;

    if (typeof value.default !== "undefined")
      help += ` (default=${value.default})`;

    if (typeof value.exclusiveMinimum !== "undefined")
      help += ` (min=${value.exclusiveMinimum})`;

    if (typeof value.exclusiveMaximum !== "undefined")
      help += ` (max=${value.exclusiveMaximum})`;

    if (value.enum) help += ` (${value.enum.join(", ")})`;

    return help.trim();
  }

  private array(value: JsonArray, key?: string): string {
    const type = value.items.type;
    let help = key ? `${key} (${type}[]) —` : "";
    if (value.description) help += ` ${value.description}`;

    if (type === "number") help += this.number(value.items);
    if (type === "integer") help += this.integer(value.items);
    if (type === "string") help += this.string(value.items);
    if (type === "boolean") help += this.boolean(value.items);

    return help.trim();
  }

  private comperable(value: JsonComparable, key?: string) {
    let help = key ? `${key} (comparable)` : "";

    for (const item of value.anyOf) {
      if (item.type === "number") help += ` — number: ${this.number(item)}`;
      if (item.type === "string") help += ` — string: ${this.string(item)}`;
      if (item.type === "object")
        help += ` — operators (${this.comparisonOperators(item)})`;
    }

    return help;
  }

  private comparisonOperators(value: JsonComparisonOperators) {
    const operators = [];

    const { gt, gte, lt, lte } = value.properties;

    if (gt) operators.push(">");
    if (gte) operators.push(">=");
    if (lt) operators.push("<");
    if (lte) operators.push("<=");

    return operators.join(", ");
  }
}
