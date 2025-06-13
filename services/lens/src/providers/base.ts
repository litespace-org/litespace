import { Page } from "puppeteer";

export interface Provider {
  name: string;
  search(page: Page, query: string): Promise<string[]>;
}
