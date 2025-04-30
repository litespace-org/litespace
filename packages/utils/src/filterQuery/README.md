# Filter Query Specifications

- [Filter Query Specifications](#filter-query-specifications)
- [Comparable fields](#comparable-fields)
  - [Numeric](#numeric)
  - [Date](#date)
  - [Nullable string fileds](#nullable-string-fileds)
  - [Nullable numeric fields](#nullable-numeric-fields)
  - [Union-base fileds](#union-base-fileds)
  - [Boolean fileds](#boolean-fileds)
  - [Regular numeric fileds](#regular-numeric-fileds)
  - [Enum-based fileds](#enum-based-fileds)

# Comparable fields

### Numeric

```ts
{
    [key: string]?: number | {
        gt?: number,
        gte?: number,
        lt?: number,
        lte?: number,
        noeq?: number
    }
}
```

Example

```ts
const query = zod.object({
  weeklyMinutes: zod.union([
    zod.number().min(0).optional(),
    zod.object({
      gte: zod.number().optional(),
      lte: zod.number().optional(),
      gt: zod.number().optional(),
      lt: zod.number().optional(),
      noeq: zod.number().optional(),
    }),
  ]),
});
```

### Date

```ts
{
    [key: string]?: string | {
        gt?: string,
        gte?: string,
        lt?: string,
        lte?: string,
        noeq?: string
    }
}
```

Example

```ts
const query = zod.object({
  start: zod.union([
    zod.streing().optional(),
    zod.object({
      gte: zod.string().optional(),
      lte: zod.string().optional(),
      gt: zod.string().optional(),
      lt: zod.string().optional(),
      noeq: zod.string().optional(),
    }),
  ]),
});
```

### Nullable string fileds

Nullable string query should be defined like this

> You cann default value as well using `.default()`

```ts
bio: zod.union([zod.string(), zod.null()]).describe("search by tutor bio");
```

### Nullable numeric fields

Nullable number query should be defined like this:

> You cann default value as well using `.default()`

```ts
notice: zod
  .union([zod.number(), zod.null()])
  .describe("search by tutor notice"),
```

### Union-base fileds

Union-based fileds should be defined similar to the example below.

```ts
env: zod
  .union([
    zod.literal("local"),
    zod.literal("staging"),
    zod.literal("production"),
  ])
  .describe("target environment"),
```

### Boolean fileds

Boolean fileds should be defined similar to the example below:

```ts
active: zod.boolean().optional().default(false),
```

### Regular numeric fileds

Regular numeric fileds should be defined similar to the example below:

> `.int`, `.positive` , `negative`, `.max`, `.min`, `.default` are optional.

```ts
page: zod.number().int().positive().min(0).max(100).optional().default(1),
size: zod.number().int().negative().min(0).max(200).optional().default(10),
```

### Enum-based fileds

Enum based fileds should be defined similar to the example below:

```ts
periods: zod
  .nativeEnum(IPlan.Period)
  .array()
  .optional()
  .describe("list of plan periods"),
```
