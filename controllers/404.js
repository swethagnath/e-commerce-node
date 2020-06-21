exports.error = (req, res, next) => {

  res.status(404).render('product/404', {

    title: 'page not found',
    path: '/',
    isAuthenticated: req.session.isLoggedIn

  })

}

exports.error500  = (req, res, next) => {

  res.status(500).render('product/500', {

    title: 'page not found',
    path: '/',
    isAuthenticated: req.session.isLoggedIn

  })

}
