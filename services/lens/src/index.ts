import { Cluster } from "puppeteer-cluster";
import express, { json } from "express";
import { authMiddleware } from "@litespace/auth";
import { config } from "@/lib/config";
import { ApiContext } from "@/types/api";
import routes from "@/routes";
import { PORT } from "@/lib/constants";
import { LaunchOptions } from "puppeteer";

async function main() {
  const options: LaunchOptions = {
    headless: true,
  };

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 3,
    puppeteerOptions: options,
  });

  const context: ApiContext = { cluster };

  // await cluster.execute("https://www.litespace.org");
  const app = express();
  app.use(json());
  app.use(authMiddleware({ jwtSecret: config.jwtSecret }));
  app.use("/api/v1/img/", routes.image(context));
  app.listen(PORT, () => console.log(`server running on port ${PORT}`));

  process.on("SIGIN", async () => {
    await cluster.close();
  });
}

main();
