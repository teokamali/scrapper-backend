const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('../config/logger');
const { Product } = require('../models');

let page = 380;

const url = 'https://abzarmarket.com/products';

const fetchAbzarMarketProducts = async () => {
  let productData = [];
  logger.info(`fetching abzarMarket website page: ${page}`);

  try {
    const result = await axios.get(`${url}/page/${page}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/12.0',
        'Accept-Language': 'en-US',
        'Accept-Encoding': 'gzip, deflate',
        Accept: 'text/html',
        Referer: 'http://www.google.com/',
      },
    });
    const $ = cheerio.load(result.data);
    const products = $('div.row.mx--2 > div');

    products.map(async (i, product) => {
      const name = $(product).find('a > div.product-box-text > h3').text();
      if (!name.toString().length) return null;
      const image = $(product).find('a > picture > img').attr('data-src');
      const price = $(product)
        .find('a > div.product-box-price-row.justify-content-end > div > div > div.product-box-price-new')
        .text();
      const newProduct = new Product({
        company: 'ابزار مارکت',
        image,
        name,
        price: price.length ? price : 'ناموجود',
      });
      await newProduct.save();
      return productData.push(newProduct);
    });
    const nextButton = $('li.page-item:nth-child(11)');

    if (nextButton.find('a').attr('href')) {
      page += 1;
      return new Promise((resolve) => {
        setTimeout(() => {
          // recursively fetch next page
          resolve(fetchAbzarMarketProducts());
        }, 1000);
      });
    }

    logger.info('Done fetching abzarMarket!');

    productData = [];
    return;
  } catch (error) {
    logger.error(error);
  }
};

module.exports = fetchAbzarMarketProducts;
