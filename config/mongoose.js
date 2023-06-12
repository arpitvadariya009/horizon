const mongoose = require('mongoose');

const db = mongoose.connect('mongodb+srv://arpitvadariya009:A.kkiller47%40@oreohospital.fjhcf3c.mongodb.net/horizone',{

}).then(()=>{
    console.log("connected");
}).catch((err)=>{
    console.log(err);
});
module.exports = mongoose;