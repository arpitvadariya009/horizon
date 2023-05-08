const mongoose = require('mongoose');

const registerschema = mongoose.Schema({
   
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required  : true
    },
    user_image : {
        type : String
    }
});
const register = mongoose.model('register',registerschema);
module.exports = register;