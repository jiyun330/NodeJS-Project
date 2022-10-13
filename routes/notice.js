var express  = require('express');
var router = express.Router();
var { Notice } = require('../models/Notice');
var util = require('../util');

// 리스트 
router.get('/', async function(req, res){
  var page = Math.max(1, parseInt(req.query.page));
  var limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page)?page:1;
  limit = !isNaN(limit)?limit:10;

  var skip = (page-1)*limit;
  var count = await Notice.countDocuments({});
  var maxPage = Math.ceil(count/limit);
  var notice = await Notice.find({})
    .populate('writer')
    .sort({regdate:-1})
    .skip(skip)
    .limit(limit)
    .exec();

  res.render('notice/index', {
    notice:notice,
    currentPage:page,
    maxPage:maxPage,
    limit:limit
  });
});

// New
router.get('/new', util.isLoggedin, function(req, res){
  var board = req.flash('board')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('notice/new', { notice:notice, errors:errors });
});

// 게시글 생성
router.post('/', util.isLoggedin, function(req, res){
  req.body.writer = req.user._id;
  Notice.create(req.body, function(err, notice){
    if(err){
      req.flash('notice', req.body);
      req.flash('errors', util.parseError(err));
      console.log(err)
      return res.redirect('/notice/new');
    }
    res.redirect('/notice');
  });
});

// 게시글 조회
router.get('/:id', function(req, res){
    Notice.findOne({_id:req.params.id}, function(err, post){
        if(err) return res.json(err);
        res.render('notice/show', {notice:notice});
      });
});

// 게시글 편집
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
  var notice = req.flash('notice')[0];
  var errors = req.flash('errors')[0] || {};
  if(!notice){
    Notice.findOne({_id:req.params.id}, function(err, board){
        if(err) return res.json(err);
        res.render('board/edit', { notice:notice, errors:errors });
      });
  }
  else {
    notice._id = req.params.id;
    res.render('notice/edit', { notice:notice, errors:errors });
  }
});

// 게시글 수정
router.put('/:id', util.isLoggedin, checkPermission, function(req, res){
  Notice.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, board){
    if(err){
      req.flash('notice', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/notice/');
    }
    res.redirect('/notice/');
  });
});

// 게시글 삭제
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res){
  Notice.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/notice');
  });
});

module.exports = router;

// private functions
function checkPermission(req, res, next){
  Notice.findOne({_id:req.params.id}, function(err, board){
    if(err) return res.json(err);
    if( notice.writer.equals(req.user._id) ) return next();
    else return util.noPermission(req, res);

  });
}