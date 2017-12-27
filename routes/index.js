const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');

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
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

//user controller
router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);

// 1. validate the registration data
// 2. register the user
// 3. log them in
router.post('/register', userController.validateRegister);

module.exports = router;
