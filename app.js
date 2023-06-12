
const express = require('express');
const { url } = require('inspector');
const app = express();
const port = 9000;
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const cookie = require('cookie-parser');
const session = require('express-session');
mongoose.set('strictQuery', true);
const hostname = '0.0.0.0';

//passport require
const passport = require('passport');
const passportLocal = require('./config/passport');

//sql
const sql = require('mysql');

//public static
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

//view set
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//express session
app.use(session({
    secret: 'boom',
    resave: true,
    saveUninitialized: true,
    cookie : {
        maxAge : 1000*60*60
    }
  }));


  // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.setAuthentication);
    app.use(cookie());


  // connect flash
    app.use(flash());

//global variables
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash('success_msg');
        res.locals.danger_msg = req.flash('danger_msg');
        next();
    })


//database 
const db = require('./config/mongoose');



//routes set
app.use('/',require('./routes/users/users_routes'));
app.use('/admin',require('./routes/admin/admin_routes'));
app.use('/api',require('./routes/users/user_api'));


//server start
app.listen(port,(err)=>{
    if(err){
        console.log(err);
        return false;
    }
    console.log("server start on port ="+port);
});