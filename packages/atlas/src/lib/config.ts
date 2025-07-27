import zod from "zod";

const schema = zod.object({
  whatsAppAPI: zod.object({
    numberProfileId: zod.object({
      local: zod.coerce.number(),
      staging: zod.coerce.number(),
      production: zod.coerce.number(),
    }),
    graphVersion: zod.string().startsWith("v"),
  }),
});

type ConfigSchema = Zod.infer<typeof schema>;

/**
const configExample = `{
  "whatsAppAPI": { 
    "numberProfileId": {
      "local": 0,
      "staging": 0,
      "production": 0
    },
    "graphVersion": "v22.0"
  }
}`;

function parseConfig(): ConfigSchema {
  const config = path.join("atlas.config.json");

  const exists = fs.existsSync(config);
  if (!exists)
    fs.writeFileSync(config, configExample);

  const content = fs.readFileSync(config).toString("utf-8");
  return schema.parse(JSON.parse(content));
}

const configJson = parseConfig();
*/

// @moehab TODO: figure out a way to make it dynamic and works on both browsers and node processes.
export const config: ConfigSchema = schema.parse({
  whatsAppAPI: {
    numberProfileId: {
      local: 725711760624278,
      staging: 725711760624278,
      production: 725711760624278,
    },
    graphVersion: "v22.0",
  },
});
