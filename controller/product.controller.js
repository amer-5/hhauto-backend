import Product from "../models/product.model.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.json(products).status(200);
  } catch (err) {
    console.error("Error getting products: ", err.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ _id: id });

    if (!product) return res.json({ message: "No product found" }).status(404);

    return res.json(product).status(200);
  } catch (err) {
    console.error("Error getting product: ", err.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const createProducts = async (req) => {
  const products = req.body;
  for (const product of products) {
    if (!product.name || !product.newPrice || !product.images)
      return console.log({
        success: false,
        message: "Please provide all details",
      });
  }

  try {
    const savedProducts = await Product.insertMany(products);
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
