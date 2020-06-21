const mongodb     = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db

const mongoConnect = callback => {

  MongoClient.connect('mongodb+srv://123swetha:123swetha@cluster0-itmo2.mongodb.net/test?retryWrites=true&w=majority')
    .then(client => {
      callback(client)
      _db = client.db('shop')
    })
    .catch(err => {
      console.log(err)
      throw err
    })

}

const getdb = () => {

  if(_db) {
    return _db
  }
  throw 'data base not found'

}

exports.mongoConnect = mongoConnect;
exports.getdb        = getdb;
