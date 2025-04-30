# Filter Query Specifications

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

#### Example 

```ts
const query = zod.object({
  weeklyMinutes: zod.number()
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
})
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

#### Example

```ts
const query = zod.object({
  start: zod.string()
    .min(0)
    .optional()
    .or(
      zod
        .object({
          gte: zod.string().optional(),
          lte: zod.string().optional(),
          gt: zod.string().optional(),
          lt: zod.string().optional(),
        })
        .optional()
    ),
})
```

# Incomparable fields

```ts
{
    [key: string]?: string | enum | number | union | Array<string | enum | number | union >
}
```

#### Example

```ts
const query = zod.object({
  plans: zod.number().array().optional(),
  periods: zod.nativeEnum(IPlan.Period).array().optional(),
  page: zod.number().optional().default(1),
  size: zod.number().optional().default(10),
  name: zod.string().optional(),
})
```