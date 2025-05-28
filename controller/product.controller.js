import Product from "../models/product.model.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({
      success: true,
      data: products,
    });
  } catch (err) {
    console.error("Error getting products:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const createProducts = async (data, isDirectCall = false) => {
  try {
    const products = isDirectCall ? data.body : data.body;

    if (!Array.isArray(products)) {
      const error = "Request body must be an array of products";
      if (!isDirectCall) {
        return data.status(400).json({
          success: false,
          message: error,
        });
      }
      throw new Error(error);
    }

    for (const product of products) {
      if (!product.name || !product.newPrice || !product.images) {
        const error = "Each product must have name, newPrice and images";
        if (!isDirectCall) {
          return data.status(400).json({
            success: false,
            message: error,
          });
        }
        throw new Error(error);
      }
    }

    const savedProducts = await Product.insertMany(products);

    if (!isDirectCall) {
      return data.status(201).json({
        success: true,
        data: savedProducts,
        message: "Products created successfully",
      });
    }
    return savedProducts;
  } catch (error) {
    console.error("Error creating products:", error.message);
    if (!isDirectCall) {
      return data.status(500).json({
        success: false,
        message: "Failed to create products",
      });
    }
    throw error;
  }
};

export const clearDB = async (isDirectCall = false) => {
  try {
    await Product.deleteMany({});

    if (!isDirectCall) {
      return {
        success: true,
        message: "Database cleared successfully",
      };
    }
    return { success: true };
  } catch (error) {
    console.error("Error clearing database:", error.message);
    if (!isDirectCall) {
      throw new Error("Failed to clear database: " + error.message);
    }
    throw error;
  }
};
