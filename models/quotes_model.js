const mongoose = require('mongoose');

const quoteschema = mongoose.Schema({
   
    quotes : {
        type : String,
        required : true
    },
    writer : {
        type : String,
        required : true
    }
});
const quotes = mongoose.model('quotes',quoteschema);
module.exports = quotes;