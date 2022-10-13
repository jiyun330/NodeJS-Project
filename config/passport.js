var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var {User} = require('../models/User');

// serialize & deserialize User
passport.serializeUser(function(user, done) {
    done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findOne({_id:id}, function(err, user) {
    done(err, user);
  });
});

// local strategy
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'id',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, id, password, done) {
      User.findOne({id:id})
        .select({password:1})
        .exec(function(err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)){
            return done(null, user);
          }
          else {
            req.flash('id', id);
            req.flash('errors', {login:'아이디 및 비밀번호가 일치하지 않습니다'});
            return done(null, false);
          }
        });
    }
  )
);

module.exports = passport;