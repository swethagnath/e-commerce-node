const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({

     products: [
      {
         product: {
           type: Object
         },
         quantity: {
           type: Number
         }
      }
     ],
     user: {
       userId: {
         type: Schema.Types.ObjectId,
         ref: 'User'
       },
       username: {
         type: String
       }
     }

})


module.exports = mongoose.model('Order',orderSchema)
