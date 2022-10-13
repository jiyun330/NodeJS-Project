var express = require('express');
var router = express.Router();
var { User } = require('../models/User');
var util = require('../util');

// Index
router.get('/', function(req, res){
  User.find({})
    .sort({id:1})   // 오름차순(asc)으로 정렬
    .exec(function(err, user){
      if(err) return res.json(err);
      res.render('user/index', {user:user});
    });
});

// New
router.get('/new', function(req, res){
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('user/new', { user:user, errors:errors });
});

// 유저 생성
router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/user/new');
    }
    res.redirect('/login');
  });
});

// 유저 조회
router.get('/:id', util.isLoggedin, checkPermission, function(req, res){
  User.findOne({id:req.params.id}, function(err, user){
    if(err) return res.json(err);
    res.render('user/show', {user:user});
  });
});

// 유저 편집
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if(!user){
    User.findOne({id:req.params.id}, function(err, user){
      if(err) return res.json(err);
      res.render('user/edit', {id:req.params.id, user:user, errors:errors});
    });
  }
  else {
    res.render('user/edit', { id:req.params.id, user:user, errors:errors });
  }

});

// 수정
router.put('/:id', util.isLoggedin, checkPermission, function(req, res, next){
  User.findOne({id:req.params.id})
    .select('password')
    .exec(function(err, user){
      if(err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password;
      for(var p in req.body){
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function(err, user){
        if(err){
          req.flash('user', req.body);
          req.flash('errors', parseError(err));
          return res.redirect('/user/'+req.params.id+'/edit');
        }
        res.redirect('/user/'+user.id);
      });
  });
});

// destroy
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res){
  User.deleteOne({id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/user');
  });
});

module.exports = router;

// functions
function parseError(errors){
  var parsed = {};
  if(errors.name == 'ValidationError'){
    for(var name in errors.errors){
      var validationError = errors.errors[name];
      parsed[name] = { message:validationError.message };
    }
  }
  else if(errors.code == '11000' && errors.errmsg.indexOf('id') > 0) {
    parsed.id = { message:'This id already exists!' };
  }
  else {
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
}

function checkPermission(req, res, next){
  User.findOne({id:req.params.id}, function(err, user){
    if(err) return res.json(err);
    if(user.id != req.user.id) return util.noPermission(req, res);
 
    next();
  });
 }