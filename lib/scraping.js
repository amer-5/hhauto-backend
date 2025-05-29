import express from "express";
import scrapeProducts from "./scraper2.js";
import { connectDB } from "./db.js";
import { createProducts, clearDB } from "../controller/product.controller.js";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

connectDB();

const url = "https://olx.ba/shops/HHAUTO/aktivni";

console.log("Server running...");

const scrapeAndSave = async () => {
  console.log("Starting daily scraping at midnight...");

  try {
    const products = await scrapeProducts(url);
    if (products < 1) {
      console.error("No Products found.");
      return;
    }

    await clearDB();
    await createProducts({ body: products });

    console.log("Daily scraping completed successfully");
  } catch (error) {
    console.error("Scraping error:", error.message);
  }
};

scrapeAndSave();

cron.schedule("0 */6 * * *", scrapeAndSave)

