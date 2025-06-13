import { Provider } from "@/providers/base";
import { Page } from "puppeteer";
import { parse } from "node-html-parser";

class Freepik implements Provider {
  name = "freepik";

  async search(page: Page, query: string): Promise<string[]> {
    await page.setExtraHTTPHeaders({
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      Referer: "https://www.google.com/",
    });
    const url = `https://www.freepik.com/search?format=search&last_filter=query&last_value=${query}&query=${query}&type=vector`;
    await page.goto(url, {
      waitUntil: "load",
    });
    const content = await page.content();
    const html = parse(content);
    const imgs = html.querySelectorAll("figure img");
    const urls: string[] = [];

    for (const img of imgs) {
      const src = img.getAttribute("src");
      if (!src) continue;
      urls.push(src);
    }

    return urls;
  }
}

export const freepik = new Freepik();
