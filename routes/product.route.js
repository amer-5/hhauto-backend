import express from "express";
import mongoose from "mongoose";
import { getProducts, getProduct } from "../controller/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

export default router;
