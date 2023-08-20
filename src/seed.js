/* eslint-disable security/detect-non-literal-fs-filename */
const path = require('path');
const fs = require('fs');
const { abzarMarket, abzarReza } = require('./services');
const { Product } = require('./models');
const logger = require('./config/logger');

const seed = async () => {
  await Product.deleteMany();
  const imageFolder = path.join(`${__dirname}`, '../public/images');
  logger.info(imageFolder);
  // Delete the folder if it exists
  if (fs.existsSync(imageFolder)) {
    fs.rmdirSync(imageFolder, { recursive: true });
    logger.info(`Deleted folder: ${imageFolder}`);
  }
  // Recreate the folder
  fs.mkdirSync(imageFolder);
  logger.info(`Created folder: ${imageFolder}`);

  logger.info('All products deleted from the database.');
  await abzarMarket();
  await abzarReza();
};
module.exports = seed;
