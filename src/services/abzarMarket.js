const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('../config/logger');
const { Product, Company } = require('../models');
const SaveImage = require('../utils/SaveImage');

const headers = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/12.0',
  'Accept-Language': 'en-US',
  'Accept-Encoding': 'gzip, deflate',
  Accept: 'text/html',
  Referer: 'http://www.google.com/',
};
let page = 1;

const fetchAndSaveProduct = async (link) => {
  try {
    const result = await axios.get(`${link}`, { headers });
    const $ = cheerio.load(result.data);
    const productName = $('div.product-title h1').text();
    const product = await Product.findOne({ name: productName });
    const productImage = $('div.gallery-main.position-relative > img').attr('ref');
    await SaveImage(productImage, productName);
    const productDescription = $('#tab-description > div.product-description:nth-child(1)').text();
    product.image = `${process.env.Domain}/images/${productName}.jpeg`;
    product.description = productDescription;
    await product.save();
    logger.info(`product ${productName} updated`);
  } catch (error) {
    logger.info(`Error while fetching data for product with link ${link}: ${error.message}`);
  }
};

const fetchAbzarMarketSingleProductData = async (linkList) => {
  const promises = linkList.map(async (link, index) => {
    const { url } = link;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000 + index)); // wait for 1 second + index
      return fetchAndSaveProduct(url);
    } catch (error) {
      logger.error(error);
    }
  });

  await Promise.all(promises); // wait for all promises to resolve

  // function will only return after all promises have resolved
};

const fetchAbzarMarketProductsLinks = async () => {
  const url = 'https://abzarmarket.com/products';
  const company = await Company.findOne({ name: 'Abzar Market' });
  logger.info(`fetching abzar market website page: ${page}`);
  try {
    const result = await axios.get(`${url}/page/${page}`, { headers });
    const $ = cheerio.load(result.data);
    const products = $('div.row.mx--2 > div');
    const productLinks = products
      .map((i, product) => {
        const link = $(product).find('.block-product > div > a').attr('href');
        const productName = $(product).find('.block-product a  div.product-box-text > h3').text();
        const productPrice = $(product).find('.product-box-price-item .product-box-price-new').text();
        if (!link) return null;
        try {
          const newProduct = new Product({
            name: productName,
            price: productPrice || 'ناموجود',
            company: company._id,
          });
          newProduct.save();
        } catch (error) {
          logger.error(error);
        }
        logger.info(`Product ${productName} saved successfully.`);
        return { url: link };
      })
      .get();
    await fetchAbzarMarketSingleProductData(productLinks);

    const nextButton = $('li.page-item:nth-child(11)');

    if (nextButton.find('a').attr('href')) {
      page += 1;
      return new Promise((resolve) => {
        setTimeout(() => {
          // recursively fetch next page
          resolve(fetchAbzarMarketProductsLinks());
        }, 1000);
      });
    }
    logger.info('Done fetching AbzarMarket product links!');
  } catch (error) {
    logger.error(error);
  }
};

const abzarMarket = async () => {
  // Delete the Abzar Market company document
  await Company.findOneAndDelete({ name: 'Abzar Market' });
  logger.info('Abzar Market company document deleted from the database.');
  const company = new Company({
    name: 'Abzar Market',
    url: 'https://abzarmarket.com',
  });
  await company.save();
  // Fetch new product links and product data for Abzar Market
  await fetchAbzarMarketProductsLinks();

  return logger.info('New Abzar Market data saved to the database.');
};
module.exports = abzarMarket;
