import zod from "zod";

export const serverConfig = {
  origin: ["http://localhost:5173"],
  assets: "assets/",
  port: zod.coerce.number().parse(process.env.PORT),
};
