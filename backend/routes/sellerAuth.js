const express=require('express');
const router=express.Router();

const sellerAuthController=require('../controllers/sellerAuth');

router
    .post('/signUp', sellerAuthController.signUp)
    .post('/login', sellerAuthController.login)

exports.router = router;
