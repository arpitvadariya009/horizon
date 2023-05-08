const express = require('express');
const app = express();
const router = express.Router();
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
//my sql

const mysql = require('mysql');

const con = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "",
    database : "final_api"
});

// multer for slider
const imagePath = path.join("uploads");
app.use("../../uploads",express.static(path.join(__dirname,"uploads")));

//multer for slider
const multer  = require('multer');
const { log } = require('console');


const mystorage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null,imagePath);  
    },
    filename : (req,file,cb) => {
        cb(null,file.fieldname+"-"+Date.now()); 
    }
})

const api_slider = multer({ storage : mystorage}).single('apislider_image');
const api_userImage = multer({ storage : mystorage}).single('user_image');



// ********************************* register *******************************************
router.post('/api_register', (req, res)=>{
    const {name,email,password} = req.body;
    const image = '../../public/default.jpg';
    var sql = `INSERT INTO users(name,email,password,user_image) VALUES ('${name}','${email}','${password}','${image}')`

    con.query(sql,(err)=>{
        if(err){
        return res.json({"messege" : err, "status" : "0"});
    }
    return res.json({"messege" : " record succesfully", "status" :"1"});
})
});

// ********************************* login *******************************************

router.post('/api_login',  (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;

    const sql = `SELECT * FROM users WHERE email = '${email}'`;

    con.query(sql, (err, result) => {
      if (err) {
        return res.json({ "message": err, "status": "0" });
      }

      // check if email exists in database
      if (result.length === 0) {
        return res.json({ "message": result, "status": "0" });
      }

      const user = result[0];

      // verify password
      if (password !== user.password) {
        return res.json({ "message": "Incorrect password", "status": "0" });
      }

      // generate token
      const token = jwt.sign({ email: user.email }, 'amaterasu');

      return res.json({ "message": "login done", "status": "1", "token": token });
    });
  } catch (err) {
    return res.json({ "message": err, "status": "0" });
  }
});
// ********************************* forgot *******************************************

router.post('/api_forgot', (req, res) => {
  const { email } = req.body;
  const sql = `SELECT * FROM users WHERE email = '${email}'`;

  con.query(sql, (err, results) => {
    if (err) {
      return res.json({ message: err, status: '0' });
    }

    if (results.length === 0) {
      return res.json({ message: 'User not found', status: '0' });
    }
  
   
   let otp = Math.floor(Math.random()*100000);
   let email = results[0].email;
   res.cookie('email', email, { maxAge: 60000 });
   res.cookie('otp', otp, { maxAge: 60000 });
   
   return res.json({ message: 'otp generated successfully', status: '1' });
  });
});




// ********************************* reset password *******************************************
router.post('/api_reset', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let otp = req.body.otp;
  

    //store cookies data
    let emailFromCookie =  req.cookies.email;
    let otpFromCookie =  req.cookies.otp;
    
    // Verify email
    if (email !== emailFromCookie) {
      return res.json({ message: 'Invalid email', status: '0' });
    }
  
    // Verify otp
    if (otp !== otpFromCookie) {
      return res.json({ message: 'Invalid OTP', status: '0' });
    }
  
    // Update the password in the database
    const sql = `UPDATE users SET password = '${password}' WHERE email = '${email}'`;
  
    con.query(sql, (err, results) => {
      if (err) {
        return res.json({ message: err, status: '0' });
      }
  
      // Delete the OTP cookie after the password has been updated
      res.clearCookie('otp');
      res.clearCookie('email');
  
      return res.json({ message: 'Password updated successfully', status: '1' });
    });
  });
  
// ********************************* slider crud operation start ***********************************

router.post('/api_add_slider',api_slider, async (req, res)=>{

try{

  let title = req.body.title;
  let details = req.body.details;
  let image =  imagePath+"/"+req.file.filename;

  var sql = `INSERT INTO sliders(title,details,apislider_image) VALUES ('${title}','${details}','${image}')`

  con.query(sql,(err)=>{
      if(err){
      return res.json({"messege" : err, "status" : "0"});
  }
  return res.json({"messege" : " record succesfully added", "status" :"1"});
})

}catch(err){
  if(err){
    return res.json({"msg" : err, "status" : "0"});
  }
}
});

router.delete('/api_delete_slider/:id', async (req, res) => {
  const id = req.params.id;
  try {
   
    const sql = `DELETE FROM sliders WHERE id = '${id}'`;
    con.query(sql, (err, result) => {
      if (err) {
        return res.json({ "message": err, "status": "0" });
      }
      return res.json({ "message": "Slider successfully deleted", "status": "1" });
    });
  } catch (err) {
    return res.json({ "message": err, "status": "0" });
  }
});

router.put('/api_update_slider/:id', api_slider, async (req, res) => {
  const id = req.params.id;

  try {
   
      const title = req.body.title;
      const details = req.body.details;
      const image = imagePath + "/" + req.file.filename;
      const sql = `UPDATE sliders SET title = '${title}', details = '${details}', apislider_image = '${image}' WHERE id = '${id}'`;
    
      con.query(sql, (err, result) => {
      if (err) {
        return res.json({ "message": err, "status": "0" });
      }
      return res.json({ "message": "Slider successfully updated", "status": "1" });
    });
 

  } catch (err) {
    return res.json({ "message": err, "status": "0" });
  }
});

router.get('/api_view_slider', (req, res)=>{
  let sql = `SELECT * FROM sliders`;

  con.query(sql, (err, result)=>{
    if(err){
      return res.json({"msg" : err , "status" : "0"});
    }
    return res.json({"msg" : result , "status" : "1"});
  })

})

// ********************************* slider crud operation end *******************************************





// ********************************* update profile using token *******************************************

router.post('/api_update_profile', authenticateToken,api_userImage, (req, res) => {

    let name = req.body.name;
    let email = req.body.email;
    let image =  imagePath + "/" + req.file.filename;

    const useremail = req.user.email;
    const sql = `UPDATE users SET name = '${name}', email = '${email}', user_image = '${image}' WHERE email = '${useremail}'`;

    con.query(sql,(err)=>{
      if(err){
        return res.json({"msg": err , "status" : "0"});
      }
      return res.json({"msg" : "updated", "status" : "1"});
    })
});
//************************************ token authentication function *********************
function authenticateToken(req, res, next) {
  console.log(req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token:', token);

  if (token == null) {
      return res.json({"msg" : "token not found"});
  }

  jwt.verify(token, 'amaterasu', (err, user) => {
      if (err) {
          console.log('Token error:', err); // Add this line
          return res.sendStatus(403);
      }

      req.user = user;
      next();
  });
}




module.exports = router;