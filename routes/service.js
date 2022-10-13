/*var express = require('express');
var passport = require('../config/passport')
var router = express.Router();

// Home
router.get('/', function(req, res){
    var errors = req.flash('errors')[0] || {};
    res.render('service/law_chat', { errors:errors });
});

// api
router.post('/', function(req, res){
    User.create(req.body, function(err, user){
      if(err){
        req.flash('user', req.body);
        req.flash('errors', util.parseError(err));
        return res.redirect('/user/new');
      }
      res.redirect('/');
    });
  });

var openApiURL = 'http://aiopen.etri.re.kr:8000/LegalQA';
var access_key = '21e6972f-f9bc-43b4-a4cc-97a11c0d8971';
var question = '대한민국 헌법';

var requestJson = {
    'access_key': access_key,
    'argument': {
    	'question': question,
    }
};

var request = require('request');
var options = {
    url: openApiURL,
    body: JSON.stringify(requestJson),
    headers: {'Content-Type':'application/json; charset=UTF-8'}
};

request.post(options, function (error, response, body) {
    console.log('responseCode = ' + response.statusCode);
    console.log('responseBody = ' + body);
});

module.exports = router;*/