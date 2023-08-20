const httpStatus = require('http-status');
const MiniSearch = require('minisearch');
const catchAsync = require('../utils/catchAsync');
const { Product, Company } = require('../models');
const pick = require('../utils/pick');

const { createCSVFile } = require('../services');
const paginate = require('./plugins/paginate.plugin');

const getAllData = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const allProducts = await Product.paginate(filter, options);
  res.status(httpStatus.CREATED).json(allProducts);
});

const searchData = catchAsync(async (req, res) => {
  const allProduct = await Product.find();
  const miniSearch = new MiniSearch({
    fields: ['name'], // fields to index for full-text search
    storeFields: ['name'], // fields to return with search results
  });

  // Index all documents
  miniSearch.addAll(allProduct);

  const results = miniSearch.search(req.body.value);

  const searchResult = await Promise.all(
    results.map(async (item) => {
      const product = await Product.findOne({ name: item.name }).populate('company');
      return product;
    })
  );
  // product.company
  const { page, limit } = req.query;

  const paginateData = paginate(searchResult);
  const paginatedResult = paginateData(page, limit);
  res.json(paginatedResult);
});

const createCsv = catchAsync(async (req, res) => {
  await createCSVFile(req.body.companyName); // get the filename of the created CSV file
  const CSVfileLink = `https://${req.get('host')}/products.csv`; // create the download link
  const XLSXfileName = `https://${req.get('host')}/products.xlsx`; // create the download link
  res.json({
    status: 'file is created',
    csvDownloadLink: CSVfileLink,
    XLSXDownloadLink: XLSXfileName,
  });
});
const getCompanies = catchAsync(async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
});

module.exports = {
  getAllData,
  searchData,
  createCsv,
  getCompanies,
};
