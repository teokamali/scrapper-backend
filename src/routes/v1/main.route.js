const express = require('express');
const controller = require('../../controllers/controller');

const router = express.Router();

router.route('/').get(controller.getAllData);
router.route('/search').post(controller.searchData);

module.exports = router;
