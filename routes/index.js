const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

router.post('/login', authController.log_in);

router.post('/signup', authController.sign_up);

router.post('/login/guest', authController.guest_log_in);

module.exports = router;
