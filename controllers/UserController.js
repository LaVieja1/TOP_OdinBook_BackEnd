const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const uploadImage = require('../services/uploadImage');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
        folder: 'odinBook'
    });
    return res;
}

exports.get_user = asyncHandler(async (req, res, next) => {
    const data = await User.findOne({ _id: req.params.id })
        .populate('friendRequests')
        .populate('friends')
        .exec();
    res.status(200).json(data);
});

exports.get_friends = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;
    try {
        const friends = await User.find({ friends: { $in: [userId] } })
            .sort('username')
            .exec();
        res.status(200).json(friends);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

exports.get_suggested_friends = asyncHandler(async (req, res, next) => {
    const userId = req.params.id;
    try {
        const data = await User.findById(userId).exec();
        let exclude = data.friendRequests;
        exclude.push(data._id);

        const users = await User.find({
            $and: [
                { friends: { $nin: [userId] } }, //Excludes users when userId is in their friends
                { _id: { $nin: exclude } }, //Excludes users where id matches already requested
                { friendRequests: { $nin: [userId] } }, //Excludes users where userId is already in friendRequests
            ]
        })
            .sort('username')
            .exec();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

exports.create_friend_request = asyncHandler(async (req, res, next) => {
    const from = req.params.id;
    const to = req.body.to;
    await User.findByIdAndUpdate(to, { $addToSet: { friendRequests: from } });
    res.status(200).json({ to: to, from: from });
});

exports.accept_friend_request = asyncHandler(async (req, res, next) => {
    const requestId = req.params.requestId;
    const userId = req.params.id;
    try {
        await Promise.all([
            user.findOneAndUpdate(
                { _id: userId },
                { $push: { friends: requestId }, $pull: { friendRequests: requestId } }
            ).exec(),
            User.findOneAndUpdate({ _id: requestId }, { $push: { friends: userId } })
        ]);
    } catch (err) {
        console.error(err);
        res.status(500).send();
        return;
    }
    res.status(200).send();
});

exports.decline_friend_request = asyncHandler(async (req, res, next) => {
    const requestId = req.params.requestid;
    const userId = req.params.id;
    try {
        await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { friendRequests: requestId } }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
    res.status(200).send();
});