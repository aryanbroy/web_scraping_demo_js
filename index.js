import { PlaywrightCrawler, Dataset } from "crawlee";

const crawler = new PlaywrightCrawler({
  requestHandler: async ({ page, request, enqueueLinks }) => {
    console.log(`Processing url: ${request.url}`);

    if (request.label === "DETAIL") {
      const urlPart = request.url.split("/").slice(-1);
      const manufacturer = urlPart[0].split("-")[0];

      const title = await page.locator(".product-meta h1").textContent();
      const sku = await page.locator("span.product-meta__sku").textContent();

      const priceElement = page
        .locator("span.price")
        .filter({ hasText: "$" })
        .first();
      const currentPriceString = await priceElement.textContent();
      const rawPrice = currentPriceString.split("$")[1];
      const price = Number(rawPrice.replace(",", ""));

      const inStockElement = page
        .locator("span.product-form__inventory")
        .filter({ hasText: "In stock" })
        .first();
      const inStock = (await inStockElement.count()) > 0;

      const results = {
        url: request.url,
        manufacturer,
        title,
        sku,
        currentPrice: price,
        available: inStock,
      };
      await Dataset.pushData(results);
    } else if (request.label === "CATEGORY") {
      await page.waitForSelector(".product-item > a");

      await enqueueLinks({
        selector: ".product-item > a",
        label: "DETAIL",
      });

      const nextButton = page.$("a.pagination__next link");
      if (nextButton) {
        await enqueueLinks({
          selector: "a.pagination__next link",
          label: "CATEGORY",
        });
      }
    } else {
      await page.waitForSelector(".collection-block-item");

      await enqueueLinks({
        selector: ".collection-block-item",
        label: "CATEGORY",
      });
    }
  },
});

await crawler.run(["https://warehouse-theme-metal.myshopify.com/collections"]);
