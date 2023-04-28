const mongoose = require('mongoose');

const courseschema = mongoose.Schema({
   
    title : {
        type : String,
        required : true
    },
    founder : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    details : {
        type : String,
        required : true
    },
    course_image : {
        type : String,
        required : true
    }
});
const course = mongoose.model('course',courseschema);
module.exports = course;