import puppeteer from "puppeteer";

const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
};

const scrapeProducts = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await autoScroll(page);

    await page.waitForSelector(
      ".listing-image-main.loaded.h-full.object-cover.h-13",
      {
        timeout: 5000,
      }
    );

    const products = await page.evaluate(() => {
      const products = [];
      const names = document.querySelectorAll(".main-heading.normal-heading");
      const priceContainers = document.querySelectorAll(
        ".font-bold.sm\\:text-standard.xl\\:m-2.flex.flex-col"
      );
      const images = document.querySelectorAll(
        ".listing-image-main.loaded.h-full.object-cover.h-13"
      );
      console.log(names.length);
      for (let i = 0; i < names.length; i++) {
        const name = names[i]?.innerText.trim();
        const prices = priceContainers[i]?.querySelectorAll(".smaller") || [];

        let oldPrice = null;
        let newPrice = null;

        if (prices.length === 2) {
          oldPrice = prices[0]?.innerText.trim();
          newPrice = prices[1]?.innerText.trim();
        } else if (prices.length === 1) {
          newPrice = prices[0]?.innerText.trim();
        }

        const imageUrl = images[i]?.src || null;

        products.push({ name, oldPrice, newPrice, imageUrl });
      }
      return { products };
    });

    await browser.close();

    console.log(`Scraped.`);
    return products.products;
  } catch (error) {
    console.error("Scraping error:", error);
    return [];
  }
};

export default scrapeProducts;
