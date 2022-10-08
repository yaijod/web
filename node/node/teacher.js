const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/test') //和test数据库创建连接

module.exports = mongoose.model('Teacher', { //数据库的规则
    jobnumber: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    entrydate: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
})