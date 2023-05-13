const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { abzarReza, abzarMarket } = require('./services');
const { Product } = require('./models');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(async () => {
  logger.info('Connected to MongoDB');
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
  await abzarReza();
  await abzarMarket();

  server = app.listen(config.port, () => {
    logger.info(`Listening to port https://localhost:${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
