const cheerio = require('cheerio');
const axios = require('axios');
const logger = require('../config/logger');
const Product = require('../models/product.model');
const { Company } = require('../models');

const headers = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/12.0',
  'Accept-Language': 'en-US',
  'Accept-Encoding': 'gzip, deflate',
  Accept: 'text/html',
  Referer: 'http://www.google.com/',
};
let page = 1;

const createAbzarRezaCompany = (productLinks) => {
  const company = new Company({
    name: 'Abzar Reza',
    url: 'https://abzarreza.com',
    productLinks: productLinks.map((link) => ({ url: link })),
  });

  return company;
};

const saveCompany = async (company) => {
  try {
    await company.save();
    logger.info(`Saved Abzar Reza company with ${company.productLinks.length} product links.`);
  } catch (error) {
    logger.error(error);
  }
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
        return $(product).find('div > a').attr('href');
      })
      .get();
    logger.info('Done fetching AbzarReza product links!');

    const company = createAbzarRezaCompany(productLinks);
    await saveCompany(company);

    const nextButton = $('#us_grid_18 > nav > div > a.next');
    if (nextButton.length) {
      page += 1;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fetchAbzarRezaProductsLinks());
        }, 1000);
      });
    }

    return;
  } catch (error) {
    logger.error(error);
  }
};

const fetchAndSaveProduct = async (link) => {
  try {
    const company = await Company.findOne({ name: 'Abzar Reza' });

    const result = await axios.get(`${link}`, { headers });
    const $ = cheerio.load(result.data);
    const productName = $('#page_title').text();
    const productImage = $('#product_base_data .product_gallery.us_custom_2d9ebfef > div > figure > div > a').attr('href');

    const productDescription = $('#content-description > div > div > p').text();
    const productPrice = $('.product_field.price.us_custom_327d9f11 > span > bdi').text();
    const attributes = $('.product_field.attributes > div');

    const productAttributes = attributes
      .map((i, attr) => {
        const attrTitle = $(attr).children('.w-post-elm-before').text();
        const attrValue = $(attr).find('.woocommerce-product-attributes-item__value').text();
        return { title: attrTitle, value: attrValue };
      })
      .get();
    const product = new Product({
      name: productName,
      image: productImage,
      price: productPrice || 'ناموجود',
      description: productDescription || '',
      attributes: productAttributes,
      companyId: company._id,
    });

    await product.save();
    logger.info(`Product ${productName} saved successfully.`);
  } catch (error) {
    logger.info(`Error while fetching data for product with link ${link}: ${error.message}`);
  }
};

const fetchAbzarRezaSingleProductData = async () => {
  const company = await Company.findOne({ name: 'Abzar Reza' });
  const linkList = company.productLinks;
  logger.info(linkList);

  linkList.map(async (link) => {
    const { url } = link;
    await fetchAndSaveProduct(url);
  });
};

const abzarReza = async () => {
  // Delete all products related to Abzar Reza
  await Product.deleteMany({ company: { name: 'Abzar Reza' } });
  logger.info('All Abzar Reza products deleted from the database.');

  // Delete the Abzar Reza company document
  await Company.findOneAndDelete({ name: 'Abzar Reza' });
  logger.info('Abzar Reza company document deleted from the database.');

  // Fetch new product links and product data for Abzar Reza
  await fetchAbzarRezaProductsLinks();
  await fetchAbzarRezaSingleProductData();
  logger.info('New Abzar Reza data saved to the database.');
};

module.exports = abzarReza;
