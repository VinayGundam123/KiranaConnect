const express = require('express');
const router = express.Router();

const cartController= require('../controllers/cart');

router
    .post('/',cartController.sendPrompt)

exports.router=router;