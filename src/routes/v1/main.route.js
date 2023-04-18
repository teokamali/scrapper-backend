const express = require('express');
const controller = require('../../controllers/controller');

const router = express.Router();

router.route('/').get(controller.getAllData);
router.route('/search').post(controller.searchData);
router.route('/get-companies').get(controller.getCompanies);
router.route('/create-csv').post(controller.createCsv);

module.exports = router;
