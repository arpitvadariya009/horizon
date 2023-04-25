const mongoose = require('mongoose');

const postschema = mongoose.Schema({
   
    post_title : {
        type : String,
        required : true
    },
    post_details : {
        type : String,
        required : true
    },
    post_image : {
        type : String,
        required : true
    }
});
const post = mongoose.model('post',postschema);
module.exports = post;