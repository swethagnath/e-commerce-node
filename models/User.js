// const  getDb = require('../util/database').getdb
// const mongodb = require('mongodb')
// const ObjectId = mongodb.ObjectId

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({

  username: {
    type: String
  },

  email: {
    type: String
  },

  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity:  {
          type: Number
        }
      }
    ]
  },

  password: {
    type: String
  },

  confirmPassword: {
    type: String
  },
  // userId: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User'
  // },

  resetToken: {
    type: String
  },

  resetTokenExpiration: {
    type: Date
  }

})

userSchema.methods.addToCart = function(prod) {

  let newProduct = [...this.cart.items]

  const ifProductExistIndex = newProduct.findIndex(product => {
    return product._id == prod._id
  }) //9

  if(ifProductExistIndex >= 0){
    newProduct[ifProductExistIndex].quantity  += 1
  }else{
    newProduct.push({productId: prod._id, quantity: 1})
  }

  const updateCart = {
    items: newProduct
  }

  this.cart = updateCart
  // console.log(this)
  return this.save()

}

userSchema.methods.deleteCartItem = function(productId) {

  const newUpdated = this.cart.items.filter(product => {
    return product.productId != productId
  })

  this.cart.items = newUpdated
  return this.save()

}


userSchema.methods.clearCart = function() {

  this.cart.items = []
  return this.save()
}

module.exports = mongoose.model('User', userSchema)

// class User {
//
//   constructor(username, email, _id, cart) {
//     this.username = username;
//     this.email    = email;
//     this._id      = _id;
//     this.cart     = cart;
//   }
//
//   save() {
//     const db = getDb()
//     return db.collection('User').insertOne(this)
//   }
//
//   static findById(id) {
//     const db = getDb()
//     return db.collection('User').findOne({_id: new ObjectId(id)})
//     .then(user => {
//       return user
//     })
//   }
//
//   addToCart(productId) {
//     const db = getDb()
//
//     let newProduct = [...this.cart.items]
//
//     const ifProductExistIndex = newProduct.findIndex(product => {
//
//       return product.productId == productId
//     }) //9
//
//     if(ifProductExistIndex >= 0){
//       newProduct[ifProductExistIndex].quantity  += 1
//     }else{
//       newProduct.push({productId: new ObjectId(productId), quantity: 1})
//     }
//
//     const updateCart = {
//       items: newProduct
//     }
//
//     return db.collection('User').updateOne({_id: new ObjectId(this._id)}, {$set: { cart: updateCart }})
//       .then(updatedProduct => (updatedProduct))
//
//   }
//
//   getCart() {
//
//     const db = getDb()
//     const productIds = this.cart.items.map(product => (product.productId))
//
//     return db.collection('Products')
//       .find({_id: {$in: productIds}})
//       .toArray()
//       .then(Products => {
//         return Products.map(mainProduct => {
//           return {...mainProduct, quantity: this.cart.items.find(product => (mainProduct.productId == product._id)).quantity}
//         })
//       })
//   }
//
//   deleteCart(id) {
//
//     const db = getDb()
//     const newUpdated = this.cart.items.filter(product => {
//         console.log(product.productId, id)
//         return product.productId != id
//     })
//
//     return db.collection('User').updateOne({_id: new ObjectId(this._id)}, {$set: { cart: {items: newUpdated} } })
//
//   }
//

//
//   getOrder() {
//
//     const db = getDb()
//     return db.collection('orders').find({'user.id': new ObjectId(this._id)})
//       .toArray()
//       .then(result => {return result})
//
//   }
//
// }
