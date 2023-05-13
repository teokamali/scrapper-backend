const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('../config/logger');
const Product = require('../models/product.model');
const { Company } = require('../models');
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
    const company = await Company.findOne({ name: 'Abzar Reza' });
    const result = await axios.get(`${link}`, { headers });
    const $ = cheerio.load(result.data);
    const productName = $('#page_title').text();
    const productImage = $('#product_base_data .product_gallery.us_custom_2d9ebfef > div > figure > div > a').attr('href');
    await SaveImage(productImage, productName);

    const productDescription = $('#content-description > div > div > p').text();
    const productPrice = $('.product_field.price.us_custom_327d9f11 > span > bdi').text();

    const product = new Product({
      name: productName,
      image: `${process.env.Domain}/images/${productName}.jpeg`,
      price: productPrice || 'ناموجود',
      description: productDescription || 'محتوا پیدا نشد',
      company: company._id,
    });

    await product.save();
    logger.info(`Product ${productName} saved successfully.`);
  } catch (error) {
    logger.info(`Error while fetching data for product with link ${link}: ${error.message}`);
  }
};

const fetchAbzarRezaSingleProductData = async (productLinks) => {
  const promises = productLinks.map(async (link, index) => {
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

const fetchAbzarRezaProductsLinks = async () => {
  const url = 'https://abzarreza.com/shop';
  logger.info(`fetching abzarreza website page: ${page}`);
  try {
    const result = await axios.get(`${url}/page/${page}`, { headers });
    const $ = cheerio.load(result.data);
    const products = $('#us_grid_18 > div.w-grid-list > article.product');
    const productLinks = products
      .map((i, product) => {
        const link = $(product).find('div > a').attr('href');
        return { url: link };
      })
      .get();
    logger.info('Done fetching AbzarReza product links!');

    await fetchAbzarRezaSingleProductData(productLinks);

    const nextButton = $('#us_grid_18 > nav > div > a.next');
    if (nextButton.length) {
      page += 1;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fetchAbzarRezaProductsLinks());
        }, 1000);
      });
    }
  } catch (error) {
    logger.error(error);
  }
};

const abzarReza = async () => {
  // Delete the Abzar Reza company document
  await Company.findOneAndDelete({ name: 'Abzar Reza' });
  logger.info('Abzar Reza company document deleted from the database.');
  const company = new Company({
    name: 'Abzar Reza',
    url: 'https://abzarreza.com',
  });
  await company.save();
  // Fetch new product links and product data for Abzar Reza
  await fetchAbzarRezaProductsLinks();

  return logger.info('New Abzar Reza data saved to the database.');
};

module.exports = abzarReza;
