import { PlaywrightCrawler } from "crawlee";

const crawler = new PlaywrightCrawler({
  requestHandler: async ({ page, request, enqueueLinks }) => {
    console.log(`Processing url: ${request.url}`);

    if (request.label === "DETAIL") {
    } else if (request.label === "CATEGORY") {
      await page.waitForSelector(".product-item");

      await enqueueLinks({
        selector: ".product-item",
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
