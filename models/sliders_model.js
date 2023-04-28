const mongoose = require('mongoose');

const sliderschema = mongoose.Schema({
   
    title1 : {
        type : String,
        required : true
    },
    title2 : {
        type : String,
        required : true
    },
    slider_image : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true
    }
});
const slider = mongoose.model('slider',sliderschema);
module.exports = slider;