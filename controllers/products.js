const Product = require('../models/Product')
const Cart    = require('../models/Cart')
const mongodb = require('mongodb')
const { validationResult } = require('express-validator')
const fileHelper  = require('../util/file')

exports.getProducts = (req, res, next) => {

  // Product.find({userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId', 'name')
    Product.find()
   .then(products => {
     res.status('404').render('product/products', {
       pageTitle: 'Admin Title',
       prods: products,
       path: '/admin/products'
     })
  })

}

exports.getAddProduct = (req, res, next) => {

  res.status('404').render('product/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      hasError: false,
      validationError : [],
      product: {
        title: '',
        price: '',
        description: '',
        image: ''
      }
  })

}

exports.postAddProducts = (req, res, next) => {

  const errors      =  validationResult(req)
  const title       =  req.body.title
  const price       =  req.body.price
  const description =  req.body.description
  const image       =  req.file
  const userId      =  req.user

  const imageUrl    =  image.path

  if(!image) {
    return res.status('422').render('product/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        isAuthenticated: req.session.isLoggedIn,
        validationError : [],
        hasError: true,
        product: {
          title,
          price,
          description
        },
        errorMessage: 'attached file is not an image'
    })
  }

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId
  })

  if(!errors.isEmpty()) {

    return res.status('422').render('product/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: true,
        isAuthenticated: req.session.isLoggedIn,
        validationError : errors.array(),
        hasError: true,
        product: {
          title,
          price,
          description,
          imageUrl
        },
        errorMessage: errors.array()[0].msg
    })
  }



  product.save() //promise

    .then(result => {
        req.flash('added product')
        res.redirect('/admin/add-product')
    })

    .catch(err =>
      {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })

}

exports.editProducts = (req, res, next) => {

  const editMode  = req.query.edit

   if(!editMode) {

    return res.redirect('/')

   }

   const id = req.params.productId

   Product.findById(id)

     .then(product => {

         // if(!product) {
         //   return res.redirect('/')
         // }

       res.status('404').render('product/edit', {

           pageTitle: 'Edit Page',
           path: '/admin/edit',
           editing: true,
           isAuthenticated: req.session.isLoggedIn,
           hasError: false,
           product: {
             title: product.title,
             price: product.price,
             description: product.description,
             imageUrl: product.imageUrl,
             _id: product._id
           },
           errorMessage: null,
           validationError: []

       })

     })

}


exports.postEditProducts = (req, res, next) => {

  const errors = validationResult(req)
  const title  = req.body.title
  const price  = 9
  const desciption = req.body.description
  const productId  = req.body.productId


  if(!errors.isEmpty()) {

    return res.status('422').render('product/edit', {

      pageTitle: 'Edit Page',
      path: '/admin/edit',
      editMode: true,
      editing: true,
      isAuthenticated: req.session.isLoggedIn,
      hasError: true,
      product: {
        title,
        price,
        desciption,
        image: '',
        _id: productId
      },
      errorMessage: errors.array()[0].msg,
      validationError : errors.array()
    })

  }

  Product.findById(req.body.productId)

    .then(product => {

      if(product.userId.toString() != req.user._id.toString()){
        return res.redirect('/')
      }

      product.title       = req.body.title
      product.price       = req.body.price
      product.description = req.body.description
      if(req.file) {
        // fileHelper.deleteFile(product.imageUrl)
        product.imageUrl    = req.file.path
      }

      product
        .save()
        .then(product => res.redirect('/'))
    })

}


// exports.deleteProduct = (req, res, next) => {
//
//   const id = req.params.id
//
//
//   Product.findById(id)
//     .then(product => {
//       if(!product) {
//         return next(new Error('Product not found  '))
//       }
//       // console.log(product.imageUrl)
//       // fileHelper.deleteFile(product.imageUrl)
//       return Product.deleteOne({_id: id, userId: req.user._id})
//     })
//
//     .then(product => {
//       res.redirect('/')
//     })
//
// }

exports.deleteProduct = (req, res, next) => {

  const id = req.params.id

  Product.findById(id)
    .then(product => {
      if(!product) {
        return next(new Error('Product not found  '))
      }
      // console.log(product.imageUrl)
      // fileHelper.deleteFile(product.imageUrl)
      return Product.deleteOne({_id: id, userId: req.user._id})
    })

    .then(product => {
      res.status('200').json({message: 'success'})
    })
    .catch(err => {
      res.status('500').json({message: 'deleting  product failed'})
    })

}


exports.deleteCartItem = (req, res, next) => {

  const id = req.params.productId

  req.user
    .deleteCartItem(id)
    .then(result => {
      User.findByIdAndUpdate({_id:this._id}, {"cart.items": newUpdated })
        .then((user) => {
        })
      res.redirect('/cart')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })

}
