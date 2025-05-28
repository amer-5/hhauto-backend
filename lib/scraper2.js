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
      { timeout: 5000 }
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
      await productPage
        .waitForSelector(
          ".price-heading.vat, .price-heading.vat.discount, .price-heading.vat.discounted-price",
          { timeout: 5000 }
        )
        .catch(() => {});

      const product = await productPage.evaluate(() => {
        const cleanText = (str) =>
          str ? str.trim().replace(/\s+/g, " ") : null;

        const getOsobineValue = (labels) => {
          if (typeof labels === "string") labels = [labels];

          // Prvo pokušajte pronaći u "required-attributes" sekciji
          const requiredWraps = Array.from(
            document.querySelectorAll(".required-wrap")
          );
          for (const wrap of requiredWraps) {
            const labelElement = wrap.querySelector("td:first-child");
            if (labelElement) {
              const labelText = cleanText(labelElement.innerText);
              for (const label of labels) {
                if (labelText.includes(label)) {
                  const valueElement = wrap.querySelector("td:last-child");
                  if (valueElement) {
                    const link = valueElement.querySelector("a");
                    return cleanText(
                      link ? link.innerText : valueElement.innerText
                    );
                  }
                }
              }
            }
          }

          // Pokušajte u tabelama
          const tables = Array.from(document.querySelectorAll("table"));
          for (const table of tables) {
            const rows = Array.from(table.querySelectorAll("tr"));
            for (const row of rows) {
              const tds = row.querySelectorAll("td");
              if (tds.length >= 2) {
                const labelText = cleanText(tds[0].innerText);
                for (const label of labels) {
                  if (labelText.includes(label)) {
                    const value = tds[1];
                    const link = value.querySelector("a");
                    return cleanText(link ? link.innerText : value.innerText);
                  }
                }
              }
            }
          }
          return null;
        };

        // Naziv proizvoda
        const name =
          document.querySelector(".main-title-listing")?.innerText.trim() ||
          null;

        // Cijene
        let oldPrice = null;
        let newPrice = null;
        const discountedPrice = document.querySelector(
          ".price-heading.vat.discounted-price"
        );
        const originalPrice = document.querySelector(
          ".price-heading.vat.discount"
        );
        const singlePrice = document.querySelector(
          ".price-heading.vat:not(.discount):not(.discounted-price)"
        );

        if (discountedPrice && originalPrice) {
          oldPrice = cleanText(originalPrice.innerText);
          newPrice = cleanText(discountedPrice.innerText);
        } else if (singlePrice) {
          newPrice = cleanText(singlePrice.innerText);
        }

        // Slike
        const images = Array.from(
          document.querySelectorAll(".swiper-lazy.swiper-lazy-loaded")
        )
          .map((img) => img.src)
          .filter((src) => src && src.startsWith("http"));

        // Osobine
        const brand = getOsobineValue(["Proizvođač", "Brend", "Marka"]);
        const godiste = getOsobineValue([
          "Godište",
          "Godina prve registracije",
        ]);
        const kilometraza = getOsobineValue(["Kilometraža"]);
        const transmisija = getOsobineValue(["Transmisija"]);
        const brojVrata = getOsobineValue(["Broj vrata"]);
        const konjskeSnage = getOsobineValue([
          "Konjskih snaga",
          "Snaga motora (KW)",
        ]);
        const pogon = getOsobineValue(["Vrsta pogona", "Pogon"]);

        return {
          name,
          brand,
          oldPrice,
          newPrice,
          images,
          godiste,
          kilometraza,
          transmisija,
          brojVrata,
          konjskeSnage,
          pogon,
        };
      });

      if (product.newPrice) {
        products.push(product);
      }

      await productPage.close();
    }

    await browser.close();
    return products;
  } catch (error) {
    console.error("Error scraping products:", error.message);
    return [];
  }
};

export default scrapeProducts;
