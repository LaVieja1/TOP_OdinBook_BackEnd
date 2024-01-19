const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    time: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', CommentSchema);