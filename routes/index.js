const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

//composition to catch errors:
const { catchErrors } =require('../handlers/errorHandlers');
// obj destructuring allows us to import an entire object. imports one method we need

// Do work here
router.get('/', storeController.homePage);
//myMiddleware calls next(); so it passes to the next fcn
router.get('/add', storeController.addStore);
//for when we post a form we need to post from add
router.post('/add', catchErrors(storeController.createStore));

module.exports = router;
