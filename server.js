import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import ProductRoutes from "./routes/product.route.js";
import "./lib/scraping.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
app.use(cors());

app.use(express.json());

app.use("/api/products", ProductRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Listening on http://localhost:${PORT}`);
});
