let mongoose = require('mongoose')



let namelist = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,

    },
    resetid: {
        type: String,
        default: "not yet reset"
    }
})

var userdata = mongoose.model("vals", namelist)

module.exports = { userdata }