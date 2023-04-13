const { Product } = require('../models');

/**
 * Get user by name
 * @param {string} name
 * @returns {Promise<User>}
 */
const searchByName = async (name) => {
  const allProducts = await Product.find();
  const products = allProducts.filter((product) => {
    if (!product.name.includes(name)) return;
    return product;
  });
  return products;
};

module.exports = {
  searchByName,
};
