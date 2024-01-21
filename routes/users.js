const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const JWT = require('../services/verifyJWT');
router.use(JWT.verify);

router.get('/:id/suggested_friends', UserController.get_suggested_friends);

router.get('/:id', UserController.get_user);

router.get('/:id/friends', UserController.get_friends);

router.get('/:id/friendrequests', UserController.create_friend_request);

router.post('/:id/profilepic', UserController.update_pic);

router.post('/:id/friendrequests/:requestid/accept', UserController.accept_friend_request);

router.post('/:id/friendrequests/:requestid/decline', UserController.decline_friend_request);

router.post('/:id/bio', UserController.update_bio);

module.exports = router;
