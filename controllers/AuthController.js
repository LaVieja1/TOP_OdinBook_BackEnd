const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.sign_up = [
    body('username')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Usuario requerido')
        .custom(async (value) => {
            const username = await User.find({ username: value });
            username ? false : true;
        })
        .escape(),
    body('password')
        .trim()
        .custom((value) => {
            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (passwordRegex.test(value)) {
                return true;
            }
            return false;
        })
        .withMessage(
            'La contraseña debe tener 8 caractéres minimo, una miníscula, una mayúscula y un numero'
        )
        .escape(),
    body('confirm_password')
        .trim()
        .custom((value, { req }) => {
            return req.body.password === value;
        })
        .withMessage('Las contraseñas no coinciden')
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req).errors;

        const user = new User({
            username: req.body.username,
            password: req.body.password,
        });

        if (errors.length) {
            res.status(401).json({ errors });
            return;
        } else {
            bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
                user.password = hashedPassword;
                await user.save();
            });
            const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, {
                expiresIn: '2hr'
            });
            res.status(200).json({
                msg: 'Login exitoso',
                token,
                userId: user._id
            });
        }
    })
];

exports.log_in = asyncHandler(async (req, res, next) => {
    const data = await User.find({ username: req.body.username });
    const user = data[0];

    if (!user) {
        return res.status(401).json({ msg: 'Usuario no encontrado' });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
        return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    const username = user.username;
    const token = jwt.sign({ username }, process.env.SECRET_KEY, {
        expiresIn: '2hr'
    });
    return res.status(200).json({
        msg: 'Login exitoso',
        token,
        userId: user._id,
    });
});

exports.guest_log_in = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ username: 'Guest User' });
    if (!user) {
        return res.status(500).json({ msg: 'Guest login fallido' });
    }
    const username = user.username;
    const token = jwt.sign({ username }, process.env.SECRET_KEY, {
        expiresIn: '2hr'
    });
    return res.status(200).json({
        msg: 'Login exitoso',
        token,
        userId: user._id,
    });
})