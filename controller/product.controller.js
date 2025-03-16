import Product from "../models/product.model.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error("Error getting products:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createProducts = async (req) => {
  const products = req.body;
  console.log(req.body);
  for (const product of products) {
    if (!product.name || !product.price || !product.images)
      return console.log({
        success: false,
        message: "Please provide all details",
      });
  }

  try {
    const savedProducts = await Product.insertMany(products);
    console.log("Products saved:", savedProducts);
  } catch (error) {
    console.error(error.message);
  }
};

export const clearDB = async () => {
  try {
    await Product.deleteMany({});
    console.log("DB cleared");
  } catch (error) {
    console.error(error.message);
  }
};
