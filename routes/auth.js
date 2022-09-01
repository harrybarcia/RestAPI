const express = require('express');
const {body}=require('express-validator');
const router = express.Router();
const User = require('../models/user');
const authController = require('../controllers/auth');
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
router.put('/signup', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, {req})=>{
        return User.findOne({email:value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('E-Mail address already exists!');
            }
        });
    })
    .normalizeEmail(),
    body('password').trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
], (req, res, next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        console.log(req.body);
        const error=new Error('Validation failed');
        error.statusCode=422;
        throw error;
    }
    const email=req.body.email;
    const name=req.body.name;
    const password=req.body.password;
    bcrypt.hash(password, 12)
    .then(hashedPw=>{
        const user=new User({
            email:email,
            password:hashedPw,
            name:name
        });
        return user.save();
    })
    .then(result=>{
        res.status(201).json({message:'User created!', userId:result._id});
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500;
        }
        next(err);
    });
});

module.exports = router;
