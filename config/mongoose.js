const mongoose = require('mongoose');

const db = mongoose.connect('mongodb://127.0.0.1/final_project',{

}).then(()=>{
    console.log("connected");
}).catch((err)=>{
    console.log(err);
});
module.exports = mongoose;