var express  = require('express');
var router = express.Router();
var { Board } = require('../models/Board');
var Comment = require('../models/Comment');
var util = require('../util');

// 게시글 리스트 
router.get('/', async function(req, res){
  var page = Math.max(1, parseInt(req.query.page));
  var limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page)?page:1;
  limit = !isNaN(limit)?limit:10;

  var searchQuery = createSearchQuery(req.query);

  var skip = (page-1)*limit;
  var count = await Board.countDocuments(searchQuery);
  var maxPage = Math.ceil(count/limit);
  var boards = await Board.find(searchQuery)
    .populate('writer')
    .sort({regdate:-1})
    .skip(skip)
    .limit(limit)
    .exec();

  res.render('board/index', {
    boards:boards,
    currentPage:page,
    maxPage:maxPage,
    limit:limit,
    searchType:req.query.searchType,
    searchText:req.query.searchText
  });
});

// New
router.get('/new', util.isLoggedin, function(req, res){
  var board = req.flash('board')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('board/new', { board:board, errors:errors });
});

// 게시글 생성
router.post('/', util.isLoggedin, function(req, res){
  req.body.writer = req.user._id;
  Board.create(req.body, function(err, board){
    if(err){
      req.flash('board', req.body);
      req.flash('errors', util.parseError(err));
      console.log(err)
      return res.redirect('/board/new'+res.locals.getPostQueryString());
    }
    res.redirect('/board'+res.locals.getPostQueryString(false, { page:1, searchText:'' }));
  });
});

// 게시글 조회
router.get('/:id', function(req, res){
  var commentForm = req.flash('commentForm')[0] || {_id: null, form: {}};
  var commentError = req.flash('commentError')[0] || { _id:null, parentComment: null, errors:{}};

  Promise.all([
      Board.findOne({_id:req.params.id}).populate({ path: 'writer', select: 'name' }),
      Comment.find({post:req.params.id}).sort('createdAt').populate({ path: 'author', select: 'name' })
    ])
    .then(([board, comments]) => {
      res.render('board/show', { board:board, comments:comments, commentForm:commentForm, commentError:commentError});
    })
    .catch((err) => {
      console.log('err: ', err);
      return res.json(err);
    });
});

// 게시글 편집
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
  var board = req.flash('board')[0];
  var errors = req.flash('errors')[0] || {};
  if(!board){
    Board.findOne({_id:req.params.id}, function(err, board){
        if(err) return res.json(err);
        res.render('board/edit', { board:board, errors:errors });
      });
  }
  else {
    board._id = req.params.id;
    res.render('board/edit', { board:board, errors:errors });
  }
});

// 게시글 수정
router.put('/:id', util.isLoggedin, checkPermission, function(req, res){
  Board.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, board){
    if(err){
      req.flash('board', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/board/'+req.params.id+'/edit'+res.locals.getPostQueryString());
    }
    res.redirect('/board/'+req.params.id+res.locals.getPostQueryString());
  });
});

// 게시글 삭제
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res){
  Board.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/board'+res.locals.getPostQueryString());
  });
});

module.exports = router;

// private functions
function checkPermission(req, res, next){
  Board.findOne({_id:req.params.id}, function(err, board){
    if(err) return res.json(err);
    if( board.writer.equals(req.user._id) ) return next();
    else return util.noPermission(req, res);

  });
}

// createSearchQuery
function createSearchQuery(queries){
  var searchQuery = {};
  if(queries.searchType && queries.searchText && queries.searchText.length >= 3){ // 1
    var searchTypes = queries.searchType.toLowerCase().split(',');
    var postQueries = [];
    // title
    if(searchTypes.indexOf('title')>=0){
      postQueries.push({ title: { $regex: new RegExp(queries.searchText, 'i') } }); // 2
    }
    // content
    if(searchTypes.indexOf('content')>=0){
      postQueries.push({ content: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if(postQueries.length > 0) searchQuery = {$or:postQueries};
    else searchQuery = null; 
  }
  return searchQuery;

}