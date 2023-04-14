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
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const searchResult = await Product.paginate(filter, options);

  res.json(searchResult);
});

module.exports = {
  getAllData,
  searchData,
};
