var express = require('express');
var passport = require('../config/passport')
var router = express.Router();

// Home
router.get('/', function(req, res){
  res.render('home/welcome');
});

router.get('/about', function(req, res){
  res.render('home/about');
});

// Login
router.get('/login', function (req,res) {
  var id = req.flash('id')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    id:id,
    errors:errors
  });
});

// Post Login
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.id){
      isValid = false;
      errors.id = '아이디를 입력해주세요!';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = '비밀번호를 입력해주세요!';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors', errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash: true
  }
));

// Logout
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;