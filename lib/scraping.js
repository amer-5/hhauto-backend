import express from "express";
import scrapeProducts from "./scraper.js";
import { connectDB } from "./db.js";
import { createProducts, clearDB } from "../controller/product.controller.js";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

connectDB();

const url = "https://olx.ba/shops/HHAUTO/aktivni";

console.log("Server running...");

cron.schedule("0 */6 * * *", async () => {
  console.log("Scraping after 5 seconds...");

  try {
    const products = await scrapeProducts(url);
    if (products.length < 1) {
      console.error("No Products found.");
      return;
    }

    await clearDB();
    await createProducts({ body: products });

    console.log("Scraping - Done");
  } catch (error) {
    console.error(error);
  }
});
