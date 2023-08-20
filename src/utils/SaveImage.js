const sharp = require('sharp');
const axios = require('axios');
const logger = require('../config/logger');

async function SaveImage(url, name) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data);
  sharp(buffer)
    .resize(1000, 1000)
    .toFile(`public/images/${name}.jpeg`, (err) => {
      if (err) {
        return logger.error(err);
      }
    });
}
module.exports = SaveImage;
