const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const app = express();

//models
const slider_model = require('../../models/sliders_model');
const post_model = require('../../models/post_model');
const quotes_model = require('../../models/quotes_model')
const register_model  = require('../../models/register_model');

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





//*************************** forgot password end ********************************** 





//*************************** slider crud operation start ********************************** 
router.post ('/add_data', slider_upload, async (req, res)=>{
    
    try{
       await slider_model.create({
        title1 : req.body.title1,
        title2 : req.body.title2,
        slider_image : imagePath+"/"+req.file.filename
       })
       
       res.redirect('back');
    }catch(err){
        if(err){
            console.log(err);
            return false;
        }
    }
})

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



module.exports = router;