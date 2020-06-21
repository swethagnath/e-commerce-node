const bcrypt = require('bcryptjs')

const { validationResult } = require('express-validator')

const User       = require('../models/User')

const crypto     = require('crypto')
const nodemailer = require('nodemailer')

let testAccount = nodemailer.createTestAccount();

let transporter = nodemailer.createTransport({
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    service: 'gmail',
    auth: {
      user: "swethagnthn@gmail.com", // generated ethereal user
      pass: ".....", // generated ethereal password
    }
});

exports.login = (req, res) => {

  let message = req.flash('error')

  if(message.length > 0) {
    message = message[0]
  }else{
    message = null
  }

  res.render('auth/login', {
    path: '/auth',
    pageTitle: 'Your authrization',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    errorValidation: []
  })

}

exports.postLogin = (req, res) => {


    const email = req.body.email
    const password = req.body.password

    User.findOne({ email: email })

      .then(user => {

        if(user) {

          bcrypt
            .compare(password, user.password)
            .then(doMatch => {

              if(doMatch) {

                req.session.isLoggedIn = true
                req.session.user       = user

                return req.session.save(err => {
                    return res.redirect('/')
                })

              }else{
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'invalid email or password',
                    oldInput: {
                      email,
                      password
                    },
                    errorValidation: [{param: 'password'}]
                })
              }

            })
        }else{

          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'invalid email or password',
            oldInput: {
              email,
              password
            },
            errorValidation: [{param: 'email'}]
          })

        }

      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })

}

exports.postLogout = (req, res) => {

    return req.session.destroy(() => {
      return res.redirect('/')
    })

}

exports.getSignUp = (req, res) => {

    let message = req.flash('error')

    if(message.length > 0) {
      message = message[0]
    }else{
      message = null
    }


    res.render('auth/signUp', {
      path: '/signUp',
      pageTitle: 'SignUp',
      isAuthenticated: false,
      errorMessage: message,
      oldInput: {
        email: "",
        password: "",
        confirmPassword: ""
      },
      errorValidation: []
    })

}
exports.postSignUp = (req, res) => {

  const email    = req.body.email
  const password = req.body.password
  const errors   = validationResult(req)
  const confirmPassword = req.body.confirmPassword

  if(!errors.isEmpty()){

    return res.status(422).render('auth/signup', {

      path: '/signup',
      pageTitle: 'SignUp',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword
      },

      errorValidation: errors.array()

    })

  }

  bcrypt.hash(password, 12)

    .then(hashedPassword => {

      const user = new User({
        email,
        password: hashedPassword,
        cart: {
          items: []
        }
      })

      return user.save()

    })

    .then(() => {

      res.redirect('/login')

      return transporter.sendMail({
        from: "swethagnthn@gmail.com",
        to: 'swethagnthn@gmail.com',
        subject: "hello",
        html: '<p>Your html here</p>'

      })

    })

    // .then(result => console.log(result))
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })

}

exports.getReset = (req, res) => {

  let message = req.flash('error')

  if(message.length > 0) {
    message = message[0]
  }else{
    message = null
  }

  res.render('auth/reset', {
    path: '/reset',
    errorMessage: message
  })

}

exports.postReset = (req, res) => {

  crypto.randomBytes(32, (err, buffer) => {

    if(err) {
      return res.redirect('/reset')
    }

    const token = buffer.toString('hex')

    User.findOne({email: req.body.email})

      .then((user) =>{

        if(!user) {
          return res.redirect('/reset')
        }

        user.resetToken = token

        user.resetTokenExpiration = Date.now() + 3600000

        return user.save()

      })

      .then(() => {
        res.redirect('/')
        return transporter.sendMail({
          from: "swethagnthn@gmail.com",
          to: 'swethagnthn@gmail.com',
          subject: "hello",
          html: `<p><a href="http://localhost:3000/reset-password/${token}">click here</a></p>`
        })

      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
  })

}

exports.getNewPassword = (req, res) => {

  const token  = req.params.token
  console.log('token', token)

  // resetTokenExpiration: { $gt: Date.now()  + 4600000}
  User.findOne({ resetToken: token })

    .then(user => {

      let message  = req.flash('error')

      if(message.length > 0) {
        message = message[0]
      }else{
        message = null
      }

      res.render('auth/new-password', {

        path: '/new-password',
        pageTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token

      })

    })

}

exports.postNewPassword = (req, res) => {

  const newPassword   = req.body.password
  const userId        = req.body.userId
  const passwordToken = req.body.passwordToken

  let resetUser

  User.findOne({

    resetToken: passwordToken,
    _id: userId
    // resetTokenExpiration: { $gt: Date.now() }

  })

  .then(user => {

     resetUser = user
     return bcrypt.hash(newPassword, 12)

  })

  .then(hashedPassword => {

    resetUser.password             = hashedPassword
    resetUser.resetToken           = undefined
    resetUser.resetTokenExpiration = undefined

    return resetUser.save()

  })

  .then(user => {
    res.redirect('/login')
  })

  .catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })

}
