const express         = require('express')
const app             = express()
const mongoose        = require('mongoose')
const session         = require('express-session')
const multer          = require('multer')
const MongoDbStore    = require('connect-mongodb-session')(session)

const csrf            = require('csurf')
const flash           = require('connect-flash')

const fileStorage     = multer.diskStorage({


  destination: (req, file, cb) => {
    cb(null, 'newImages/')
  },
  filename: (req, file, cb) => {
    console.log(file.originalname)
    cb(null,  Date.now() + '-' + file.originalname)
  }

})

const fileFilter = (req, file, cb) => {
  console.log(file)
  if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg'){
    cb(null, true)
  }else{
    console.log('entered here')
    return cb(new Error('Only image files are allowed!'), false)
  }

}

const adminRoutes     = require('./routes/admin')
const shopRoutes      = require('./routes/shop')
const authRoutes      = require('./routes/auth')

const errorController = require('./controllers/404')

const User = require('./models/User')

const rootDir = require('./util/path')

const bodyParser = require('body-parser')

const path = require('path')

const MONGODB_URI = 'mongodb+srv://123swetha:123swetha@cluster0-itmo2.mongodb.net/shop'

const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

// const mongoConnecont = require('./util/database').mongoConnect

app.set('view engine', 'ejs')

app.set('views', 'views')

app.use(bodyParser.urlencoded({extended: false}))

app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'))

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
)

const csrfProtection  = csrf()

app.use(csrfProtection)

app.use((req, res, next) => {

  if(!req.session.user){
    return next()
  }

  User.findById(req.session.user._id)
    .then(user => {
      req.user = user
      next()
    })
    .catch(err => {
      next(new Error(err))
    })

})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken       = req.csrfToken()
  next()
})

app.use(flash())

app.use('/admin', adminRoutes)

app.use(shopRoutes)

app.use(authRoutes)

app.use(express.static(path.join(__dirname, 'public')))

app.use('/newImages', express.static(path.join(__dirname, 'newImages')))

app.get('/500', errorController.error500)

app.use('/', errorController.error)

// app.use((error, req, res, next) => {
//
//   res.status(500).render('product/500', {
//
//     title: 'page not found',
//     path: '/'
//
//   })
//
// })

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen('3000')
  })

  .catch(err => console.log(err))
