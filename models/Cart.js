// const path = require('path')
// const fs = require('fs')
// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'cart.json'
// )
//
// const getCartProduct = (cb) => {
//   fs.readFile(p, (err, fileContent)  => {
//     if(!err) {
//       cartProducts = JSON.parse(fileContent)
//       cb(cartProducts)
//     }
//     return []
//   })
// }
//
// module.exports = class Cart {
//
//
//   static findById(id, quatity = 1) {
//
//     fs.readFile(p, (err, fileContent)  => {
//
//
//
//       if(!err) {
//
//           let cartProducts = {products: [], totalPrice: 0}
//           let existingProduct
//           if(cartProducts.length > 0){
//             cartProducts = JSON.parse(fileContent)
//             existingProduct = cartProducts.products.find(prod => prod.id == id)
//           }
//
//           if(existingProduct) {
//
//             existingProduct.quatity += quatity
//
//           }else{
//
//             cartProducts.products.push({id, quatity})
//
//           }
//           fs.writeFile(p, JSON.stringify(cartProducts), (err) => {
//             console.log(err)
//           })
//       }
//
//
//
//     })
//
//   }
//
//   static fetchAll(cb) {
//     getCartProduct(products => cb(products))
//   }
//
//
//   static deleteCart(id) {
//
//     getCartProduct( cartProducts  =>  {
//
//       if(cartProducts.products){
//         const prods = cartProducts.products.filter(product => product.id != id)
//         cartProducts.products =  prods
//         fs.writeFile(p, JSON.stringify(cartProducts), (err) => {
//           console.log(err)
//         })
//       }
//
//     })
//
//   }
//
// }
