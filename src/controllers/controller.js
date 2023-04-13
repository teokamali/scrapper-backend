const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const search = require('../services/search');
const { Product } = require('../models');
const pick = require('../utils/pick');

const getAllData = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const allProducts = await Product.paginate(filter, options);
  res.status(httpStatus.CREATED).json(allProducts);
});

const searchData = catchAsync(async (req, res) => {
  const result = await search.searchByName(req.body.value);
  res.json(result);
});

module.exports = {
  getAllData,
  searchData,
};
