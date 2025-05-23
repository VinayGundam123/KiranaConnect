const express=require('express');
const router=express.Router();

const buyerAuthController=require('../controllers/buyerAuth');

router
    .post('/signUp', buyerAuthController.signUp)
    .post('/login', buyerAuthController.login)

exports.router = router;