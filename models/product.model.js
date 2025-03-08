import mongoose from "mongoose";
import { type } from "os";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: String,
    },
    newPrice: {
      type: String,
      required: true,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
