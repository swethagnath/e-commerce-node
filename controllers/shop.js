const Product      = require('../models/Product')
const Shop         = require('../models/Cart')
const Order        = require('../models/Order')
const fs           = require('fs')
const path         = require('path')
const pdfDocument  = require('pdfkit')
const itemsPerPage = 2
const stripe       = require('stripe')('sk_test_51GvnpmBn5YPjVkQUYAGMDaqiw34n6bFL6WQroFkPUVme01SReRju2ktLQmf9FtYF8GUH1ccGf5Jns2RdcqDgVlyy007haVyY8L')

exports.getProducts = (req, res, next) => {

    Product.fetchAll(products => {

      res.status('404').render('shop/shop-list', {
        pageTitle: 'Add Product',
        prods: products,
        path: '/products',
        hasProducts: products.length > 0,
        activeShop: true,
        productCss: true,
        isAuthenticated: req.session.isLoggedIn
      })

    })

}

exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1
    let totalItem

    Product.find()
      .countDocuments()
      .then(count => {
        totalItem = count
        return Product.find()
          .skip((page-1) * itemsPerPage)
          .limit(itemsPerPage)
      })
      .then(products => {
        res.status('404').render('shop/shop-list', {
          pageTitle: 'shop',
          hasProducts: products.length > 0,
          prods: products,
          path: '/',
          isAuthenticated: req.session.isLoggedIn,
          csrfToken: req.csrfToken(),
          totalProducts: totalItem,
          hasNextPage: itemsPerPage * page < totalItem,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page -1,
          lastPage: Math.ceil(totalItem/itemsPerPage),
          currentPage: page
        })
    })

}

exports.getCart= (req, res, next) => {

  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(products => {
        console.log(products)
        res.status('404').render('shop/cart', {
          pageTitle: 'Your Cart',
          path: '/cart',
          prods: products.cart.items,
          hasCartItems: (products ?  !products == [] : true),
          isAuthenticated: req.session.isLoggedIn
        })
    })

}

exports.postCart = (req, res, next) => {

  const productId = req.body.productId
  Product.findById(productId)

    .then(product => {
      return req.user.addToCart(product)
    })

    .then(cartProduct => {
        res.redirect('/cart')
      })

}



exports.getProducts = (req, res, next) => {
  const id  = req.params.productId

  Product.findById(id)
    .then(product => {
      res.status('404').render('shop/product-detail', {
          pageTitle: 'Product-Detail',
          path: '/products',
          product: product,
          hasProducts: product ?  true : false
      })
    })

}

exports.postOrders = (req, res, next) => {


  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {

      const product = user.cart.items.map(p => {
        return { product: {...p.productId._doc}, quantity: p.quantity}
      })

      const order = new Order({
        products: product,
        user: {
          email: req.user.email,
          userId: req.user,
          username: req.user.username
        }
      })

      order.save()
        .then(() => {
          return req.user.clearCart()
        })
        .then(() => {
          res.redirect('/orders')
        })

    })

}

exports.getOrders = (req, res, next) => {

  Order.find({'user.userId': req.user._id})
    .then(orders => {
      console.log(orders)
      res.render('shop/orders', {
        pageTitle: 'order',
        path: '/order',
        orders,
        hasProducts: true,
        isAuthenticated: req.session.isLoggedIn
      })
    })

}

exports.getInvoice = (req, res, next) => {
  const id          = req.params.orderId


  Order.findById(id)

    .then(order => {
      if(!order) {
        return next(new Error('No order found'))
      }

      if(order.user.userId != req.user.id){
        return next(new Error('Unauthorized'))
      }

        const invoiceName = 'test.pdf'
        const invoice     = path.join('data', 'invoices', invoiceName)

        const pdfDoc = new pdfDocument()
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline; filename="' + invoice + '"')

        pdfDoc.pipe(fs.createWriteStream(invoice))
        pdfDoc.pipe(res)

        pdfDoc.fontSize(26).text('Invoice', {
          underline: true
        })

        pdfDoc.text('----------------------------')

        let productPrice = 0

        order.products.forEach(prod => {
          productPrice +=  prod.quantity * prod.product.price
          pdfDoc.text(prod.product.title + '-' + prod.product.price + '-' + prod.quantity)
        })

        pdfDoc.text('Total Price' + productPrice)

        pdfDoc.end()

        fs.readFile(invoice, (err, data) => {

          if(err) {
            return next(err)
          }

          const file = fs.createReadStream(invoice)


          file.pipe(res)

        })

    })

    .catch(err => console.log(err))

}

exports.getCheckOut = (req, res, next) => {

  let products;
  let total = 0;

  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        console.log(user.cart.items)
        products = user.cart.items

        return stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: products.map(prod => {
            return {
              name: prod.productId.title,
              description: prod.productId.description,
              amount: 900,
              currency: 'inr',
              quantity: prod.quantity
            }
          }),
          success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
          cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
        })

        .then(session => {

          res.status('404').render('shop/checkout', {
            pageTitle: 'checkout',
            path: '/checkOut',
            prods: user.cart.items,
            totalSum: total,
            isAuthenticated: req.session.isLoggedIn,
            sessionId: session.id
          })

        })

    })

}


exports.getCheckoutSuccess = (req, res, next) => {

  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {

      const product = user.cart.items.map(p => {
        return { product: {...p.productId._doc}, quantity: p.quantity}
      })

      const order = new Order({
        products: product,
        user: {
          email: req.user.email,
          userId: req.user,
          username: req.user.username
        }
      })

      order.save()
        .then(() => {
          return req.user.clearCart()
        })
        .then(() => {
          res.redirect('/getorders')
        })

    })

}
