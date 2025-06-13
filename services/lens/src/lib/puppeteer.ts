import { Page } from "puppeteer";

export function withRequestInterceptor(page: Page) {
  page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (type === "stylesheet" || type == "font" || type == "image")
      return req.abort();
    return req.continue();
  });
}

export async function withExtraPageHeaders(page: Page) {
  await page.setExtraHTTPHeaders({
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    Referer: "https://www.google.com/",
  });
}
