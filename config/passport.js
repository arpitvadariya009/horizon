const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const register_model = require('../models/register_model');

passport.use(new passportLocal({
    usernameField : "email"
},async(email, password, done)=>{
    let user = await register_model.findOne({email : email});
    if(!user){
        return done(null, false, {type:'danger_msg', message:'email not registered yet !!!'});
    }
    if(user.password != password){
        return done(null, false, {type:'danger_msg', message:'incorrect password !!!'});
    }
    return done(null, user);
}))

passport.serializeUser((user,done)=>{
    return done(null,user.id)
});

passport.deserializeUser((id,done)=>{ 
        register_model.findById(id).then((user)=>{
            return done(null,user)
        }).catch((err)=>{
            return done(null,false);
        })
});

passport.checkAuthentication = async (req, res, next) => {
    try {
      if (req.isAuthenticated()) {
        next();
      } else {
        throw new Error("User is not authenticated");
      }
    } catch (error) {
      return res.redirect('/admin/login');
    }
  }
  
passport.setAuthentication = async (req, res, next) =>{
    try{
        if(req.isAuthenticated()){
            res.locals.user = req.user;
        }
        next();
        
    }catch(err){
        if(err){
            console.log(err);
        }
    }
}

module.exports = passport;