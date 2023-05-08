const express = require('express');
const router = express.Router();
const app = express();
//app.use('/admin',require('../admin/admin_routes'))
//models requires
const slider_model = require('../../models/sliders_model');
const post_model = require('../../models/post_model');
const quotes_model = require('../../models/quotes_model');
const course_model = require('../../models/course_model');



router.get('/', async(req, res)=>{
    let slider_data = await slider_model.find({}).sort({_id : -1})
    let post_data = await post_model.find({});
    let quotes_data = await quotes_model.find({});
    let course_data = await course_model.find({});


    return res.render('users/home',{
        alldata : slider_data,
        postdata : post_data,
        quotesdata : quotes_data,
        coursedata : course_data
    });
});

router.get('/course_details/:id', async (req, res) => {
    const courseId = req.params.id;
    const course = await course_model.findById(courseId);
  
    if (!course) {
      return res.status(404).send('Course not found');
    }
  
    return res.render('users/course_details', {
      course : course
    });
  });

  

module.exports = router;