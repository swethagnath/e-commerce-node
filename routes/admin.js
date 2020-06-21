const express = require('express')

const { check, body } = require('express-validator')

const path    = require('path')

const router  = express.Router()

const rootDir = require('../util/path')

const productsController = require('../controllers/products')

const isAuth  = require('../middleware/is-auth')

// /admin/add-product => get
router.get('/add-product', isAuth, productsController.getAddProduct )

router.post('/products', [

  body('title', 'password mininmum length required')
    .isLength({ min: 3 })
    .trim(),
  //
  // body('image', 'should be url')
  //   .isUrl(),

  // body('price', 'price should be float')
  //   .isFloat(),

  body('description', 'minimum character should be 5 and max 500')
    .isLength({ min: 2, max: 500 })
    .trim()

], isAuth, productsController.postAddProducts)

// /admin/products  => post

router.get('/products', productsController.getProducts)

router.get('/edit-products/:productId', isAuth, productsController.editProducts)

router.post('/edit-products/:productId', [

  body('title', 'password mininmum length required')
    .isLength({ min: 3 })
    .trim(),

  body('description', 'minimum character should be 5 and max 500')
    .isLength({ min: 5, max: 500 })
    .trim()

], isAuth, productsController.postEditProducts)
//
router.get('/delete-cart/:productId', isAuth, productsController.deleteCartItem)
//
// router.get('/delete-products/:id', productsController.deleteProduct)

router.delete('/delete-products/:id', isAuth, productsController.deleteProduct)

module.exports = router
