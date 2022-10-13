var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util'); 

var app = express();

// DB setting
mongoose.connect('mongodb+srv://j1yun:pass1234@cp2law.bcroagb.mongodb.net/law_db');
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongoDB");
});

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash()); 
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));

// Passport
app.use(passport.initialize());
app.use(passport.session());


// Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
})

// Routes
app.use('/', require('./routes/home'));
app.use('/board', util.getPostQueryString, require('./routes/board'));
app.use('/user', require('./routes/user'));
app.use('/comment', util.getPostQueryString, require('./routes/comment'));
app.use('/notice', require('./routes/notice'));
//app.use('/service', require('./routes/service'));

// Port setting
var port = 5000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});