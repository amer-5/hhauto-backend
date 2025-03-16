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
  const products = [];
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await autoScroll(page);

    await page.waitForSelector(
      ".rounded-5.wrap.relative.w-full.flex.rounded-sm",
      {
        timeout: 5000,
      }
    );

    const urls = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          ".rounded-5.wrap.relative.w-full.flex.rounded-sm"
        )
      )
        .map((link) => link.href)
        .filter((href) => href.startsWith("https"));
    });

    for (const url of urls) {
      const productPage = await browser.newPage();
      await productPage.goto(url, { waitUntil: "domcontentloaded" });

      await productPage
        .waitForSelector(".main-title-listing", { timeout: 5000 })
        .catch(() => {});

      const product = await productPage.evaluate(() => {
        const name =
          document.querySelector(".main-title-listing")?.innerText.trim() ||
          "N/A";
        const price =
          document.querySelector(".price-heading")?.innerText.trim() || "N/A";

        const images = Array.from(
          document.querySelectorAll(".swiper-lazy.swiper-lazy-loaded")
        )
          .slice(0, 5)
          .map((image) => image.src);

        return { name, price, images };
      });

      products.push(product);
      await productPage.close();
    }

    await browser.close();
    console.log(products);
    return products;
  } catch (error) {
    console.error("Error scraping products:", error.message);
    return [];
  }
};

export default scrapeProducts;
