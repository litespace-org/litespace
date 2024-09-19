import "colors";

type Loggable = string | number | object;

function json<T>(value: Loggable) {
  if (typeof value === "string" || typeof value === "number") return value;
  return JSON.stringify(value, null, 2);
}

export function logger(...prefixs: string[]) {
  const prefix = prefixs
    .filter((prefix) => prefix)
    .map((prefix) => `[${prefix}]`)
    .join(" ");

  const message = (value: Loggable[]) =>
    `${prefix} ${value.map(json).join(" ")}`;

  return {
    log: (...value: Loggable[]) => {
      console.log(message(value).bold);
    },
    error: (...value: Loggable[]) => {
      console.log(message(value).red.bold);
    },
    info: (...value: Loggable[]) => {
      console.log(message(value).gray.bold);
    },
    warning: (...value: Loggable[]) => {
      console.log(message(value).yellow.bold);
    },
    success: (...value: Loggable[]) => {
      console.log(message(value).green.bold);
    },
  };
}
