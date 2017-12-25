const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

//composition to catch errors:
const { catchErrors } =require('../handlers/errorHandlers');
// obj destructuring allows us to import an entire object. imports one method we need

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore))

//myMiddleware calls next(); so it passes to the next fcn
router.get('/add', storeController.addStore);
//for when we post a form we need to post from add
router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post('/add/:id', 
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

module.exports = router;
