const express = require('express');
const server=express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');

const cartRouter = require('./routes/buyerCart');
const buyerAuthRouter=require('./routes/buyerAuth');
const sellerAuthRouter=require('./routes/sellerAuth');
const sellerInventoryRouter = require('./routes/sellerInventory');

//MONOGO DB CONNECTION
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
}

// Authorization
const auth=(req,res,next)=>{
    try{
        const token=req.get('Authorization').split(' ')[1];
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(decoded.email){
            console.log(decoded)
            next();
        }else{
            res.status(401).json({message:'Unauthorized'});
        }
    }
    catch(err){
        res.status(401).json({message:'Unauthorized'});
        console.log(err)
    }
}

server.use(cors());
server.use(express.json());
server.get('/',(req,res)=>{
    res.send('Hello World');
});

server.use('/buyer/cart',cartRouter.router);
server.use('/buyer',buyerAuthRouter.router);
server.use('/seller/inventory', sellerInventoryRouter);
server.use('/seller',sellerAuthRouter.router);

server.listen(process.env.PORT,()=>{
    console.log(`port ${process.env.PORT} is activated`);
})