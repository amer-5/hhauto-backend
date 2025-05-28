import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
    },
    oldPrice: {
      type: String,
    },
    newPrice: {
      type: String,
      required: true,
      default: "0",
    },
    images: {
      type: [String],
      required: true,
    },
    godiste: {
      type: String,
    },
    kilometraza: {
      type: String,
    },
    transmisija: {
      type: String,
    },
    brojVrata: {
      type: String,
    },
    konjskeSnage: {
      type: String,
    },
    pogon: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
