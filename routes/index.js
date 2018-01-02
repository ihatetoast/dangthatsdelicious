const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
//composition to catch errors:
const { catchErrors } =require('../handlers/errorHandlers');
// obj destructuring allows us to import an entire object. imports one method we need

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:id/edit', catchErrors(storeController.editStore))

//myMiddleware calls next(); so it passes to the next fcn
router.get('/add', authController.isLoggedIn, storeController.addStore);
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
router.get('/register',  userController.registerForm);

// 1. validate the registration data
// 2. register the user
// 3. log them in
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login
)
//need post login for when a user logs in, we know what to do with it.

router.post('/login', authController.login)
router.get('/logout', authController.logout)

router.get('/account', authController.isLoggedIn, userController.account)
router.post('/account', catchErrors(userController.updateAccount))
router.post('/account/forgot', catchErrors(authController.forgot))

//when someone is directed to account reset and any token (:token)
router.get('/account/reset/:token', catchErrors(authController.reset))

router.post('/account/reset/:token',
 authController.confirmedPasswords,
 catchErrors(authController.update)
)

router.get('/map', storeController.mapPage)
/*
API
*/ 
router.get('/api/search', catchErrors(storeController.searchStores))
router.get('/api/stores/near',catchErrors(storeController.mapStores))

module.exports = router;
