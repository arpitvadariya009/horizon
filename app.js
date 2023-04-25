
const express = require('express');
const { url } = require('inspector');
const app = express();
const port = 9000;
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

//public static
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

//view set
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//database 
const db = require('./config/mongoose');



//routes set
app.use('/',require('./routes/users/users_routes'));
app.use('/admin',require('./routes/admin/admin_routes'));



//server start
app.listen(port,(err)=>{
    if(err){
        console.log(err);
        return false;
    }
    console.log("server start on port ="+port);
});