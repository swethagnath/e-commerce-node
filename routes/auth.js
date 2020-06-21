const express = require('express')

const User = require('../models/User')

const { check, body } = require('express-validator')

const router  = express.Router()

const authController = require('../controllers/authController')

router.get('/login', authController.login)

router.post('/login', authController.postLogin)

router.post('/logout', authController.postLogout)

router.get('/signUp', authController.getSignUp)

router.post(
  '/signUp',
  [check('email')
  .isEmail()
  .normalizeEmail()
  // .withMessage('please enter a valid email')
  .custom((value, { req }) => {

    return User.findOne({ email: value })

      .then(user => {

          if(user) {
            return Promise.reject(
              'email already exist please pick a different one'
            )
          }

      })

    // if(value === 'test@gmail.com'){
    //   // if (!setting) throw new Error("this email address is forbidden'");
    //   throw new Error('this email address is forbidden')
    // }
    // return true // means it is succeded and to follow thw authController.postSignUp
  }),

  body('password', 'Please enter a password with minimum atleat 5 character')
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim(),

  body('confirmPassword', 'password doesnot match')
    .custom((value, {req}) => {
      if(req.body.password !== value) {
          throw new Error('password have to match')
      }
      return true
    })
    .trim()
  ],
  authController.postSignUp
)

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset-password/:token', authController.getNewPassword)

router.post('/updatePassword', authController.postNewPassword)

module.exports = router
