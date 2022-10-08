const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/test')

module.exports = mongoose.model('Stu', {
    username: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
})