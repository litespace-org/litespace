import { ApiContext } from "@/types/api";
import safeRequest from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import zod from "zod";
import { freepik } from "@/providers";
import { withExtraPageHeaders, withRequestInterceptor } from "@/lib/puppeteer";

const findQuery = zod.object({
  query: zod.string(),
});

function find({ cluster }: ApiContext) {
  return safeRequest(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { query } = findQuery.parse(req.query);

      const urls = await cluster.execute({ query }, async ({ page }) => {
        withRequestInterceptor(page);
        await withExtraPageHeaders(page);
        return await freepik.search(page, query);
      });

      res.status(200).json(urls);
    }
  );
}

export default {
  find,
};
