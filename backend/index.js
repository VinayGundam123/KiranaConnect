const express = require('express');
const server=express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const cartRouter = require('./routes/cart');
const BuyerAuthRouter=require('./routes/buyerAuth');

//MONOGO DB CONNECTION
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
}

server.use(cors());
server.use(express.json());
server.get('/',(req,res)=>{
    res.send('Hello World');
});

server.use('/buyer',BuyerAuthRouter.router);
server.use('/cart',cartRouter.router);

server.listen(5000,()=>{
    console.log(`port ${5000} is activated`);
})