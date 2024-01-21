const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { body, validationResult } = require('express-validator');

exports.create_post = [
    body('text')
        .trim()
        .isLength({ min: 1 })
        .withMessage('El post no puede estar vacio'),

    asyncHandler(async (req, res, next) => {
        try {
            const errors = validationResult(req).errors;

            if (errors.length) {
                console.error('err -->' + errors);
                return res.status(401).json(errors);
            }

            const author = req.body.author;
            const newPost = new Post({
                author: author,
                text: req.body.text,
                comments: [],
                likes: [],
            });

            await newPost.save();
            await User.updateOne(
                { _id: req.body.author },
                { $push: { posts: newPost } }
            );
            res.status(200).send();
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    })
];

exports.get_all_posts = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.params.userid;
        const user = await User.findById(userId);
        userAndFriends = [user._id, ...user.friends];

        const posts = await Post.find({ author: { $in: userAndFriends } })
            .populate({ path: 'comments', populate: { path: 'author' } })
            .populate({ path: 'likes' })
            .populate('author')
            .sort('-time')
            .exec();
        res.status(200).json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

exports.get_all_user_posts = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.params.userid;
        const posts = await Post.find({ author: userId })
            .populate({ path: 'comments', populate: { path: 'author' } })
            .populate({ path: 'likes' })
            .populate('author')
            .sort('-time')
            .exec();
        res.status(200).json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

exports.get_post = asyncHandler(async (req, res, next) => {
    try {
        const postId = req.params.postid;
        const post = await Post.findById(postId)
            .populate({ path: 'comments', populate: { path: 'author' } })
            .populate({ path: 'likes' })
            .populate('author')
            .exec();
        res.status(200).json({ post: post });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

exports.like_post = asyncHandler(async (req, res, next) => {
    try {
        const postId = req.params.postid;
        const userId = req.body.userid;

        await Post.updateOne(
            { _id: postId, likes: { $ne: userId } },
            { $push: { likes: userId, options: 2 } }
        );
        res.status(200).send();
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

exports.create_comment = [
    body('text')
        .trim()
        .isLength({ min: 1 })
        .withMessage('El comentario no puede estar vacío'),

    asyncHandler(async (req, res, next) => {
        try {
            const errors = validationResult(req).errors;

            if (errors.length) {
                console.error('err -->' + errors);
                return res.status(401).json(errors);
            }

            const userId = req.body.userid;
            const postId = req.params.postid;
            const comment = new Comment({
                author: userId,
                text: req.body.text,
                post: postId,
            });
            console.log(comment.author, userId, req.body.userid);

            await comment.save();
            await Post.updateOne({ _id: postId }, { $push: { comments: comment } });
            res.status(200).send();
        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    })
];