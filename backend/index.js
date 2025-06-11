const express = require('express');
const server=express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');

const cartRouter = require('./routes/buyerCart');
const BuyerAuthRouter=require('./routes/buyerAuth');

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
        // console.log(err)
    }
}


server.use(cors());
server.use(express.json());
server.get('/',(req,res)=>{
    res.send('Hello World');
});

server.use('/buyer/cart',cartRouter.router);
server.use('/buyer',BuyerAuthRouter.router);

// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: {
//         user: 'brad.goyette@ethereal.email',
//         pass: 'RTBkRzYHskSPfb3gPA'
//     }
// });


// server.post('/send-email', async (req, res) => {
//     try {
//     const { to, subject, message } = req.body;
    
//     const mailOptions = {
//       from: '21je0373@iitism.ac.in',
//       to: to,
//       subject: subject,
//       text: message,
//       html: `<p>${message}</p>` // optional HTML version
//     };

//     const result = await transporter.sendMail(mailOptions);
    
//     res.status(200).json({
//       success: true,
//       message: 'Email sent successfully',
//       messageId: result.messageId
//     });
    
//   } catch (error) {
//     console.error('Email error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to send email',
//       error: error.message
//     });
//   }
// });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
server.post('/send-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    await sgMail.send({
      to: to,
      from: 'vinaygundam123@gmail.com',
      subject: subject,
      text: message,
      html: `<p>${message}</p>`
    });
    
    res.json({ success: true, message: 'Email sent!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

server.listen(5000,()=>{
    console.log(`port ${5000} is activated`);
})