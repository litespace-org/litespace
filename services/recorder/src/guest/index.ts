import playwrite from "playwright";

async function main() {
  const browser = await playwrite.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://amazon.com");
  await page.screenshot({ path: `image.png`, fullPage: true });
  await page.waitForTimeout(1000);

  await context.close();
  await browser.close();
}

main();
