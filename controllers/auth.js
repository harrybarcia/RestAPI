const User= require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                const error = new Error('E-Mail exists already, please pick a different one.');
                error.statusCode = 422;
                throw error;
            }
            return bcrypt.hash(password, 12);
        })
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: 'User created!', userId: result._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}