const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Product } = require('../models');
const pick = require('../utils/pick');

const getAllData = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const allProducts = await Product.paginate(filter, options);
  res.status(httpStatus.CREATED).json(allProducts);
});

const searchData = catchAsync(async (req, res) => {
  const filter = { name: { $regex: req.body.value, $options: 'i' } };
  const options = { sortBy: 'createdAt:desc', limit: 10, page: 1 };
  const { results, totalPages, totalResults } = await Product.paginate(filter, options);

  res.json({ results, totalPages, totalResults });
});

module.exports = {
  getAllData,
  searchData,
};
