const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  id: {
    type: String,
    required:[true,'아이디를 입력해주세요'],
    match:[/^.{4,12}$/,'4자 이상의 아이디를 입력해주세요'],
    trim:true,
    unique:true,
    maxLength: 50,
  },
  password: {
    type: String,
    required:[true,'비밀번호를 입력해주세요'], 
    select:false, // DB에서 해당 모델을 읽어 올때 해당 항목값을 읽어오지 않음
    maxLength: 50,
  },
  name: { 
    type: String,
    maxLength: 50,
    match:[/^.{2,12}$/,'2자 이상의 이름을 입력해주세요'],
    trim:true
  },
  email: {
    type: String,
    maxLength: 50,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'이메일을 입력해주세요'],
    trim:true,
    unique: 1,
  },
  regdate:{
    type : Date,
    default: Date.now
  },
  role: { // 일반 회원, 관리자
    type: Number,
    default: 0,
  }
},{
  toObject:{virtuals:true}
});

// virtuals
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = '알파벳과 숫자를 이용하여 최소 8자 이상의 비밀번호를 입력해주세요!';

userSchema.path('password').validate(function(v) {
  var user = this; 

  // create user 
  if(user.isNew){ 
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', '비밀번호를 입력해주세요.');
    }

    if(!passwordRegex.test(user.password)){
      user.invalidate('password', passwordRegexErrorMessage);
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '비밀번호가 동일하지 않습니다.');
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', '현재 비밀번호를 입력해주세요');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate('currentPassword', '현재 비밀번호를 틀렸습니다.');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMessage);
    }
    else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '비밀번호가 동일하지 않습니다.!');
    }
  }
});

// hash password
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};


const User = mongoose.model('User', userSchema)

module.exports = { User }