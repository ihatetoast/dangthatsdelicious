const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Do work here
router.get('/', storeController.homePage);
//myMiddleware calls next(); so it passes to the next fcn


module.exports = router;
