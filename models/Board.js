const mongoose = require('mongoose')
var Counter = require('./Counter');

// schema
const boardSchema = mongoose.Schema({
  writer: {
    type : mongoose.Schema.Types.ObjectId, 
    ref:'User', 
    required:true
  },
  title: { 
    type: String,
    maxLength: 50,
    required:[true,'제목을 입력해주세요']
  },
  views:{type:Number, default:0}, // 1
  numId:{type:Number},
  content: {
    type: String,
    maxLength: 1000,
    required:[true,'내용을 입력해주세요']
  },
  regdate: { // 날짜
    type: Date,
    default: Date.now
  }
})

boardSchema.pre('save', async function (next){ // 3
  var post = this;
  if(post.isNew){
    counter = await Counter.findOne({name:'posts'}).exec();
    if(!counter) counter = await Counter.create({name:'posts'});
    counter.count++;
    counter.save();
    post.numId = counter.count;
  }
  return next();
});

// model & export
const Board = mongoose.model('Board', boardSchema)

module.exports = { Board }
