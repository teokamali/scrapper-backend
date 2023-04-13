const express = require('express');
const mainRoute = require('./main.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/',
    route: mainRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
