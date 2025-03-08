import express from "express";
import mongoose from "mongoose";
import { getProducts } from "../controller/product.controller.js";

const router = express.Router();

router.get("/", getProducts);

export default router;
