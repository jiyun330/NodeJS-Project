const mongoose = require('mongoose')

// schema
const noticeSchema = mongoose.Schema({
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

// model & export
const Notice = mongoose.model('Notice', noticeSchema)

module.exports = { Notice }
