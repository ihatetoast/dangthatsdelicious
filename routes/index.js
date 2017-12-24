const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Do work here
router.get('/', storeController.homePage);
//myMiddleware calls next(); so it passes to the next fcn
router.get('/add', storeController.addStore);
//for when we post a form we need to post from add
router.post('/add', storeController.createStore);

module.exports = router;
