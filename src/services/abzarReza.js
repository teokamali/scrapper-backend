const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('../config/logger');
const { Product } = require('../models');

let page = 1;

const url = 'https://abzarreza.com/shop';

const fetchAbzarRezaProducts = async () => {
  let productData = [];
  logger.info(`fetching abzarreza website page: ${page}`);

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
    const products = $('#us_grid_18 > div.w-grid-list > article.product');

    products.map(async (i, product) => {
      const name = $(product).find('h2 > a').text();
      if (!name.toString().length) return null;

      const image = $(product).find('div.w-post-elm.post_image.usg_post_image_2.has_width > a > img').attr('data-lazy-src');
      const price = $(product).find('bdi').text();
      const newProduct = new Product({
        company: 'ابزار رضا',
        image,
        name,
        price: price.length ? price : 'ناموجود',
      });
      await newProduct.save();
      return productData.push(newProduct);
    });

    const nextButton = $('#us_grid_18 > nav > div > a.next');
    if (nextButton.length) {
      page += 1;
      return new Promise((resolve) => {
        setTimeout(() => {
          // recursively fetch next page
          resolve(fetchAbzarRezaProducts());
        }, 1000);
      });
    }

    logger.info('Done fetching abzarreza!');

    productData = [];
    return;
  } catch (error) {
    logger.error(error);
  }
};

module.exports = fetchAbzarRezaProducts;
