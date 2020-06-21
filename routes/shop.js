const express   = require('express')

const path      = require('path')

const router    = express.Router()

const shopController = require('../controllers/shop')

const isAuth  = require('../middleware/is-auth')

router.get('/', shopController.getIndex)

router.get('/products', shopController.getProducts)
//
router.get('/cart', isAuth, shopController.getCart)
//
router.post('/cart', isAuth, shopController.postCart)
//
// router.get('/checkout', shopController.getCheckout)

//post order
router.post('/create-orders', isAuth, shopController.postOrders)
//
router.get('/getorders', shopController.getOrders)
//
router.get('/products/:productId', shopController.getProducts)

router.get('/orders/:orderId', isAuth, shopController.getInvoice)

router.get('/checkout', isAuth, shopController.getCheckOut)

router.get('/checkout/success', isAuth, shopController.getCheckoutSuccess)

// router.get('/checkout/cancel', isAuth, shopController.getCheckoutCancel)

module.exports = router
