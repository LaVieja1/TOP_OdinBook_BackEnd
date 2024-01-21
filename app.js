const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const User = require('./models/User');
const cors = require('cors');
const compression = require('compression');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());

// mongoDB
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

// ROUTE IMPORT
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');

// SESSION
app.use(
  session({
    secret: process.env.SECRET_KEY,
    saveUninitialized: true,
    resave: true,
    cookie: {
      secure: true,
      sameSite: 'none'
    }
  })
);

app.set('trust proxy', 1);

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ROUTE MIDDLEWARE
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
