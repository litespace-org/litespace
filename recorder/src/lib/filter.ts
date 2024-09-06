import { entries } from "lodash";

type FilterName = string;
type Arguments = Record<string, string>;
type Dim = { w: number; h: number };

const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;

export class FilterChain {
  private chain: Record<FilterName, { args: Arguments; expr: string }> = {};
  public inputs: Array<string> = [];
  public outputs: Array<string> = [];

  withName(name: string): FilterChain {
    this.chain[name] = this.chain[name] || {
      args: {},
      expr: "",
    };
    return this;
  }

  withArg(name: string, key: string, value: string | number): FilterChain {
    this.withName(name);
    this.chain[name].args[key] = value.toString();
    return this;
  }

  withExpr(name: string, expr: string): FilterChain {
    this.withName(name).chain[name].expr = expr;
    return this;
  }

  withDims(name: string, key: string, { w, h }: Dim): FilterChain {
    this.withName(name);
    this.chain[name].args[key] = `${w}x${h}`;
    return this;
  }

  /**
   * @param dim video dimensions
   * @param duration video duration in milliseconds
   * @example "color=color=black:size=1280x720:duration=120"
   */
  black(dim: Dim, duration: number): FilterChain {
    const name = "color";
    return this.withName(name)
      .withArg(name, "color", "black")
      .withDims(name, "size", dim)
      .withArg(name, "duration", duration / MILLISECONDS_IN_SECOND);
  }

  scale({ w, h }: Dim): FilterChain {
    const name = "scale";
    return this.withName(name).withExpr(name, `${w}x${h}`);
  }

  /**
   * Apply video delay filter
   *
   * @param duration in miliseconds
   */
  vdelay(duration: number): FilterChain {
    const name = "setpts";
    const seconds = duration / MILLISECONDS_IN_SECOND;
    return this.withExpr(name, `PTS+${seconds}/TB`);
  }

  /**
   * Apply audio delay on all audio channels.
   * @param duration delay duration in milliseconds
   */
  adelay(duration: number): FilterChain {
    const name = "adelay";
    return this.withName(name)
      .withArg(name, "delays", duration)
      .withArg(name, "all", 1); // apply the delay on all audio channels.
  }

  /**
   * Apply audio mix filter for a given number of inputs.
   * @param inputs number of audio inputs streams
   */
  amix(inputs: number): FilterChain {
    const name = "amix";
    return this.withName(name).withArg(name, "inputs", inputs);
  }

  withInput(input: string | string[]): FilterChain {
    const values = Array.isArray(input) ? input : [input];
    this.inputs.push(...values);
    return this;
  }

  withOutput(output: string | string[]): FilterChain {
    const values = Array.isArray(output) ? output : [output];
    this.outputs.push(...values);
    return this;
  }

  toString(): string {
    const content = entries(this.chain)
      .map(([name, value]) => this.asFilterString(name, value))
      .join(", ");

    const inputs = this.inputs.map((input) => `[${input}]`).join("");
    const outputs = this.outputs.map((output) => `[${output}]`).join("");

    return [inputs, content, outputs].join(" ").trim();
  }

  private asFilterString(
    name: FilterName,
    { expr, args }: { expr: string; args: Arguments }
  ) {
    const value = entries(args)
      .map(([key, value]) => `${key}=${value}`)
      .join(":")
      .trim();

    if (expr && !value) return `${name}=${expr}`; // only expr
    if (expr && value) return `${name}=${expr}:${value}`; // expr and value
    return `${name}=${value}`; // only value
  }

  static init(): FilterChain {
    return new FilterChain();
  }
}

export class ComplexFilterBuilder {}

/**
 * @param duration duration experssion
 * @returns duration in milliseconds
 */
export function duration(duration: string) {
  const regex = /(\d+.?\d*)\s?(ms|sec|min|hour|h|m|s)/;
  const match = duration.match(regex);
  if (!match) throw new Error("Invalid duration");
  const value = Number(match[1].trim());
  const unit = match[2].trim();
  if (["min", "m"].includes(unit))
    return value * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;

  if (["hour", "h"].includes(unit))
    return value * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;

  if (["s", "sec"].includes(unit)) return value * MILLISECONDS_IN_SECOND;

  return value;
}
