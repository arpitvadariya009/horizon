const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const app = express();
const cookie = require('cookie-parser');
//node mailer
const nodemailer = require('nodemailer');

//models
const slider_model = require('../../models/sliders_model');
const post_model = require('../../models/post_model');
const quotes_model = require('../../models/quotes_model')
const register_model  = require('../../models/register_model');
const course_model  = require('../../models/course_model');


//passport require
const passport = require('passport');
const passportLocal = require('../../config/passport');

//image path

const imagePath = path.join("uploads");
app.use("../../uploads",express.static(path.join(__dirname,"uploads")));

//multer for slider
const multer  = require('multer');

const mystorage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null,imagePath);  
    },
    filename : (req,file,cb) => {
        cb(null,file.fieldname+"-"+Date.now()); 
    }
})

const slider_upload = multer({ storage : mystorage}).single('slider_image');
const post_upload = multer({ storage : mystorage}).single('post_image');
const course_upload = multer({ storage : mystorage}).single('course_image');



router.get ('/',passport.setAuthentication, (req, res)=>{
    if(!res.locals.user){
        req.flash('danger_msg', 'please first log in');
        return res.redirect('admin/login');
    }
    return res.render('admin/index');
});

router.get ('/add_sliders', (req, res)=>{
    res.render('admin/add_sliders');
});

//*************************** register & login start **********************************

router.get('/register', passport.setAuthentication, (req, res)=>{
    if(res.locals.user){
        req.flash('danger_msg', 'please first logout');
        return res.redirect('/admin');
    }
    return res.render('admin/register');
});

router.post('/registerdata',passport.setAuthentication,async (req, res)=>{
    const {name,email,password,password2} = await req.body;
    let errors = [];

    //validation of data
    if(!name || !email || !password || !password2){
        errors.push({msg : 'please fill all details'});
    }
    if(password!=password2){
        errors.push({msg: 'password do not match'});
    }
    if(password.length<6){
        errors.push({msg: 'password should be atleast six character'});
    }
    if(errors.length > 0){
        res.render('admin/register',{
            errors,
            name,
            email,
            password,
            password2
        })
    }else{ 
        //validation passed
        register_model.findOne({email : email})
        .then(async(user)=>{
            try{
                if(user){
                    errors.push({msg : 'email already exist'});
                    res.render('admin/register',{
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }
                else{
                    const user = await register_model.create({
                        name,
                        email,
                        password
                    });
                    req.flash('success_msg','you are registered now you can log in');
                    res.redirect('/admin/login');
                }
            }catch(err){
                if(err){
                    console.log(err);
                    return false;
                }
            }             
        })
    }
});

router.get('/login', passport.setAuthentication, async (req, res)=>{
    
    if(res.locals.user){
        req.flash('danger_msg', 'please first logout');
        return res.redirect('/admin');
    }
    return res.render('admin/login');

});

router.post('/logindata',passport.setAuthentication, (req, res, next) =>{
    passport.authenticate('local',{
        failureRedirect: '/admin/login',
        failureFlash: true
        
    })(req, res, next);
}, async (req, res)=>{
    await res.render('admin/index');
});

router.get('/logout',passport.setAuthentication, async (req, res)=>{
    try{
        await req.logout((err) => {
            if (err) {
              return next(err)
            }
            req.flash('success_msg', 'You have successfully logged out')
            res.redirect('/admin/login')
          })
        
    }catch(err){
        if(err){
            console.log(err);
        }
    }
})

//*************************** register & login end ********************************** 


//*************************** forgot password start **********************************

router.get('/forgot', async (req, res)=>{
    res.render('admin/forgot');
});

router.post('/forgot', async (req, res)=>{
    try{
        let email = req.body.email;
        let user = await register_model.findOne({email : email});
        if(user){
            
            let otp = Math.floor(Math.random() * 1000000);

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                  user: 'arpitvadariya003@gmail.com',
                  pass: 'ioufebxriwioarjc'
                }
              });

              let mailOptions = {
                from: 'arpitvadariya003@gmail.com',
                to: email,
                subject: 'horrizon education ',
                text: 'Otp :- '+otp
              };

              transporter.sendMail(mailOptions, function(error, info){
                if(error) {
                  console.log(error);
                } else {
                    let otpobj = {
                        email : email,
                        otp : otp
                    }
                    res.cookie('data',otpobj);
                  console.log('Email sent: ' + info.response);
                  return res.redirect('/admin/otp');
                }
              });
        }else{
            console.log(" not found");
            return res.redirect('back');
        }
   }catch(err){
        console.log(err);
        return res.redirect('back');
   }
});

router.get('/otp', (req, res)=>{
    res.render('admin/otp');
});

router.post('/otp', async (req, res)=>{
    let otp = req.cookies.data.otp;
    if(otp == req.body.otp){
        return res.redirect('/admin/newpass');
    }
    else{
        req.flash('danger_msg', 'please cheack otp');
        return res.redirect('back');
    }
});

router.get('/newpass', (req, res)=>{
    res.render('admin/newpass');
});

router.post('/newpass', async (req, res)=>{
    try{

        if(req.body.password == req.body.cpassword){
            let email = req.cookies.data.email;
    
            let data = await register_model.findOneAndUpdate({email},
                {
                    password : req.body.password
                });
    
                if(data){
                    req.flash('success_msg', 'password successfully updated');
                    res.clearCookie('otp');
                    return res.redirect('/admin/login');
                }
                else{
                    console.log("password not match");
                }
        }
        else{
            req.flash('danger_msg', 'check password');
            return res.redirect('back');
        }
    
    }
    catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
})


//*************************** forgot password end ********************************** 





//*************************** slider crud operation start ********************************** 
router.post ('/add_data', slider_upload, async (req, res)=>{
    
    try{
       await slider_model.create({
        title1 : req.body.title1,
        title2 : req.body.title2,
        slider_image : imagePath+"/"+req.file.filename,
        status : 0
       })
       
       res.redirect('back');
    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
});  

router.get ('/view_sliders', async(req, res)=>{
    let data = await slider_model.find({});
    res.render('admin/view_sliders',{
        alldata : data
    })
});

router.get ('/deletedata/:id', async(req, res)=>{
    try{
        let id = req.params.id;
        let data = await slider_model.findById(id);

        fs.unlinkSync(data.slider_image);
        await slider_model.findByIdAndDelete(id);
        return res.redirect('back');
    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
})

router.get ('/editdata/:id', async(req, res)=>{
  try{
    let id = req.params.id;
    let data = await slider_model.findById(id);

    return res.render('admin/edit_sliders',{
        singledata : data
    })
  }catch(err){
    if(err){
        console.log(err);
        return false;
    }
  }
});

router.post('/updatedata', slider_upload, async (req, res)=>{
    try{
        let id = req.body.id;
        if(req.file){
            let data = await slider_model.findById(id);
            fs.unlinkSync(data.slider_image);

            await slider_model.findByIdAndUpdate(id,{
                title1 : req.body.title1,
                title2 : req.body.title2,
                slider_image : imagePath+"/"+req.file.filename
            })
            return res.redirect('/admin/view_sliders');
        }else{
            let data = await slider_model.findById(id);
            let oldimg = data.slider_image;
            
            await slider_model.findByIdAndUpdate(id,{
                title1 : req.body.title1,
                title2 : req.body.title2,
                slider_image : oldimg
            })
            res.redirect('/admin/view_sliders');
        }

    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
})


//*************************** slider crud operation end ********************************** 


//********************************* active and deactive for slider start **********************
router.get('/activate/:id', async (req, res)=>{
    let id = req.params.id;
    let data = await slider_model.findByIdAndUpdate(id, { status: "1" });
    res.redirect('back');
  });

  router.get('/deactivate/:id', async (req, res)=>{
    let id = req.params.id;
    let data = await slider_model.findByIdAndUpdate(id, { status: "0" });
    res.redirect('back');
  });
  
//********************************* active and deactive for slider end **********************


//*************************** post crud operation start ********************************** 

router.get('/add_post', (req, res)=>{
    res.render('admin/add_post');
});

router.post ('/add_post', post_upload, async (req, res)=>{
    
    try{
       await post_model.create({
        post_title : req.body.post_title,
        post_details : req.body.post_details,
        post_image : imagePath+"/"+req.file.filename
       })
       
       res.redirect('back');
    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
});

router.get ('/view_post', async(req, res)=>{
    let data = await post_model.find({});
    res.render('admin/view_post',{
        alldata : data
    })
});


router.get ('/delete_post/:id', async(req, res)=>{
    try{
        let id = req.params.id;
        let data = await post_model.findById(id);

        fs.unlinkSync(data.post_image);
        await post_model.findByIdAndDelete(id);
        return res.redirect('back');
    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
});

router.get ('/edit_post/:id', async(req, res)=>{
    try{
      let id = req.params.id;
      let data = await post_model.findById(id);
  
      return res.render('admin/edit_post',{
          singledata : data
      })
    }catch(err){
      if(err){
          console.log(err);
          return false;
      }
    }
  });
  
  router.post('/update_post', post_upload, async (req, res)=>{
    try{
        let id = req.body.id;
        if(req.file){
            let data = await post_model.findById(id);
            fs.unlinkSync(data.post_image);

            await post_model.findByIdAndUpdate(id,{
                post_title : req.body.post_title,
                post_details : req.body.post_details,
                post_image : imagePath+"/"+req.file.filename
            })
            return res.redirect('/admin/view_post');
        }else{
            let data = await post_model.findById(id);
            let oldimg = data.post_image;
            
            await post_model.findByIdAndUpdate(id,{
                post_title : req.body.post_title,
                post_details : req.body.post_details,
                post_image : oldimg
            })
            res.redirect('/admin/view_post');
        }

    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
})


//*************************** post crud operation end ********************************** 


//*************************** quotes crud operation start ********************************** 

router.get('/add_quotes', (req, res)=>{
    res.render('admin/add_quotes')
});

router.post ('/add_quotes', async (req, res)=>{
    
    try{
       await quotes_model.create({
        quotes : req.body.quotes,
        writer : req.body.writer,
       })
       
       res.redirect('back');
    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
});

router.get ('/view_quotes', async(req, res)=>{
    let data = await quotes_model.find({});
    res.render('admin/view_quotes',{
        alldata : data
    })
});


router.get ('/delete_quotes/:id', async(req, res)=>{
    try{
        let id = req.params.id;
        await quotes_model.findByIdAndDelete(id);
        return res.redirect('back');
    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
});

router.get ('/edit_quotes/:id', async(req, res)=>{
    try{
      let id = req.params.id;
      let data = await quotes_model.findById(id);
  
      return res.render('admin/edit_quotes',{
          singledata : data
      })
    }catch(err){
      if(err){
          console.log(err);
          return false;
      }
    }
  });

  router.post('/update_quotes', async (req, res)=>{
    try{
        let id = req.body.id;
        await quotes_model.findByIdAndUpdate(id,{
            quotes : req.body.quotes,
            writer : req.body.writer,
        });
        res.redirect('/admin/view_quotes');

    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
});
//*************************** quotes crud operation end **********************************


//*************************** course crud operation start **********************************

router.get('/add_course', (req, res)=>{
    res.render('admin/add_course');
});

router.post ('/add_course', course_upload, async (req, res)=>{
    
    try{
       await course_model.create({
        title : req.body.title,
        founder: req.body.founder,
        category: req.body.category,
        details: req.body.details,
        date: req.body.date,
        course_image : imagePath+"/"+req.file.filename
       })
       
       res.redirect('back');
    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
});

router.get ('/view_course', async(req, res)=>{
    let data = await course_model.find({});
    res.render('admin/view_course',{
        alldata : data
    })
});

router.get ('/delete_course/:id', async(req, res)=>{
    try{
        let id = req.params.id;
        let data = await course_model.findById(id);

        fs.unlinkSync(data.course_image);
        await course_model.findByIdAndDelete(id);
        return res.redirect('back');
    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
});


router.get ('/edit_course/:id', async(req, res)=>{
    try{
      let id = req.params.id;
      let data = await course_model.findById(id);
  
      return res.render('admin/edit_course',{
          singledata : data
      })
    }catch(err){
      if(err){
          console.log(err);
          return false;
      }
    }
  });


  router.post('/update_course', course_upload, async (req, res)=>{
    try{
        let id = req.body.id;
        if(req.file){
            let data = await course_model.findById(id);
            fs.unlinkSync(data.course_image);

            await course_model.findByIdAndUpdate(id,{
                title : req.body.title,
                founder: req.body.founder,
                category: req.body.category,
                details: req.body.details,
                date: req.body.date,
                course_image : imagePath+"/"+req.file.filename
            })
            return res.redirect('/admin/view_course');
        }else{
            let data = await course_model.findById(id);
            let oldimg = data.course_image;
            
            await course_model.findByIdAndUpdate(id,{
                title : req.body.title,
                founder: req.body.founder,
                category: req.body.category,
                details: req.body.details,
                date: req.body.date,
                course_image : oldimg
            })
            res.redirect('/admin/view_course');
        }

    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
})


//*************************** course crud operation end ********************************** 





module.exports = router;