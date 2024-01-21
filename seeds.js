const { faker } = require('@faker-js/faker');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const dotenv = require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
main().catch((err) => console.log(err));
async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error(error);
    }
}

let users = [];
let posts = [];

function getRandomElementFromArray(arr) {
    if (arr.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

async function createRandomUser() {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_=+[\]{}|;:'",.<>?/]).{8,}$/;
    let friend = getRandomElementFromArray(users);
    friend === null ? (friend = []) : friend;

    const user = new User({
        _id: faker.database.mongodbObjectId(),
        username: faker.person.fullName(),
        password: faker.internet.password({ regex: passwordRegex }),
        friends: friend,
        profilePhoto: faker.image.avatar(),
        bio: faker.word.words({ count: { min: 3, max: 50 } }),
    });

    bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
        user.password = hashedPassword;
        await user.save();
    });

    if (friend !== null) {
        await User.findOneAndUpdate(
            { _id: friend._id },
            { $push: { friends: user } }
        ).exec();
    }

    return user;
}

async function createGuestUser() {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_=+[\]{}|;:'",.<>?/]).{8,}$/;
    const user = new User({
        _id: faker.database.mongodbObjectId(),
        username: 'Guest User',
        password: faker.internet.password({ regex: passwordRegex }),
        friends: [users[0], users[1]],
        friendRequests: [
            users[2],
            users[3],
            users[4],
            users[5],
            users[6],
            users[7],
        ],
        profilePhoto:
            'https://res.cloudinary.com/djvf2vnbp/image/upload/v1705540508/gzwfyiin2urns1uyzzxt.png',
        bio: faker.word.words({ count: { min: 3, max: 50 } })
    });

    bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
        user.password = hashedPassword;
        await user.save();
    });

    await Promise.all([
        User.findOneAndUpdate({ _id: users[0]._id }, { $push: { friends: user } }),
        User.findOneAndUpdate({ _id: users[0]._id }, { $push: { friends: user } }),
    ]);

    return user;
}

async function createPost(author) {
    let likes = [];

    for (let i = 0; i < 3; i++) {
        let user = getRandomElementFromArray(users);
        likes.push(user);
    }

    const post = new Post({
        author: author._id,
        text: faker.word.words({ count: { min: 3, max: 50 } }),
        comments: [],
        likes: likes,
    });

    posts.push(post);
    await post.save();
    await User.findOneAndUpdate({ _id: author._id }, { $push: { posts: post } });
}

async function createComment() {
    let post = getRandomElementFromArray(posts);
    const comment = new Comment({
        author: getRandomElementFromArray(users),
        text: faker.word.words({ count: { min: 3, max: 30 } }),
        post: post,
    });

    post.comments.push(comment);
    await comment.save();
    await post.save();
}

async function seed() {
    const userCount = 30;

    for (let i = 0; i < userCount; i++) {
        const user = await createRandomUser();
        users.push(user);
    }

    const guestUser = await createGuestUser();
    users.push(guestUser);

    for (let i = 0; i < users.length - 1; i++) {
        await createPost(getRandomElementFromArray(users));
    }

    for (let i = 0; i < userCount * 3; i++) {
        await createComment();
    }

    console.log('Listo');
    return;
}

seed();

return;