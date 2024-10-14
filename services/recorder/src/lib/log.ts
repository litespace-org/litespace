import "colors";

type Loggable = { toString(): string };

function json<T extends Loggable>(value: T) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function logger(...prefixs: string[]) {
  const prefix = prefixs
    .filter((prefix) => prefix)
    .map((prefix) => `[${prefix}]`)
    .join(" ");

  const message = <T extends Loggable>(value: T[]) =>
    `${prefix} ${value.map(json).join(" ")}`;

  return {
    log: <T extends Loggable>(...value: T[]) => {
      console.log(message(value).bold);
    },
    error: <T extends Loggable>(...value: T[]) => {
      console.log(message(value).red.bold);
    },
    info: <T extends Loggable>(...value: T[]) => {
      console.log(message(value).gray.bold);
    },
    warning: <T extends Loggable>(...value: T[]) => {
      console.log(message(value).yellow.bold);
    },
    success: <T extends Loggable>(...value: T[]) => {
      console.log(message(value).green.bold);
    },
  };
}
