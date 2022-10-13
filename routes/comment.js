var express  = require('express');
var router = express.Router();
var Comment = require('../models/Comment');
var { Board } = require('../models/Board');
var util = require('../util');

// create
router.post('/', util.isLoggedin, checkPostId, function(req, res){
  var post = res.locals.post; 

  req.body.author = req.user._id; 
  req.body.post = post._id;

  Comment.create(req.body, function(err, comment){
    if(err){
      req.flash('commentForm', { _id: null, form:req.body }); 
      req.flash('commentError', { _id: null, errors:util.parseError(err) }); 
    }
    return res.redirect('/board/'+post._id+res.locals.getPostQueryString());
  });
});

// update // 2
router.put('/:id', util.isLoggedin, checkPermission, checkPostId, function(req, res){
  var post = res.locals.post;

  req.body.updatedAt = Date.now();
  Comment.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, comment){
    if(err){
      req.flash('commentForm', { _id: req.params.id, form:req.body });
      req.flash('commentError', { _id: req.params.id, errors:util.parseError(err) });
    }
    return res.redirect('/board/'+post._id+res.locals.getPostQueryString());
  });
});

// destroy // 3
router.delete('/:id', util.isLoggedin, checkPermission, checkPostId, function(req, res){
  var post = res.locals.post;

  Comment.findOne({_id:req.params.id}, function(err, comment){
    if(err) return res.json(err);

    // save updated comment
    comment.isDeleted = true;
    comment.save(function(err, comment){
      if(err) return res.json(err);

      return res.redirect('/board/'+post._id+res.locals.getPostQueryString());
    });
  });
});

module.exports = router;

// private functions
function checkPostId(req, res, next){ 
  Board.findOne({_id:req.query.postId},function(err, post){
    if(err) return res.json(err);

    res.locals.post = post;
    next();
  });
}

// private functions
function checkPermission(req, res, next){
  Comment.findOne({_id:req.params.id}, function(err, comment){
    if(err) return res.json(err);
    console.log(comment)
    if( comment.author.equals(req.user._id) ) return next();
    else return util.noPermission(req, res);
  });
}

