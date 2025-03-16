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
  console.log("Scraping after 6 hours...");

  try {
    const products = await scrapeProducts(url);
    if (products < 1) {
      console.error("No Products found.");
      return;
    }

    await clearDB();
    await createProducts({ body: products });

    console.log("Scraping - Done");
  } catch (error) {
    console.error(error);
  }
};

setTimeout(scrapeAndSave, 1000)