const express = require('express');
const router = express.Router();
const app = express();
//app.use('/admin',require('../admin/admin_routes'))
//models requires
const slider_model = require('../../models/sliders_model');
const post_model = require('../../models/post_model');
const quotes_model = require('../../models/quotes_model');



router.get('/', async(req, res)=>{
    let slider_data = await slider_model.find({});
    let post_data = await post_model.find({});
    let quotes_data = await quotes_model.find({});


    return res.render('users/home',{
        alldata : slider_data,
        postdata : post_data,
        quotesdata : quotes_data
    });
});


module.exports = router;