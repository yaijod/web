const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/test')

module.exports = mongoose.model('Student', {
    stunum: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    admissiondate: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    teacher: {
        type: String,
        required: true
    },
    class: {
        type: String,
            required: true
    },
    job: {
        type: String,
    },
    money: {
        type: String,
    }
})