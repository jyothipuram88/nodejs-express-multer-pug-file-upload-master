'use strict';

let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let multer = require('multer');
let fs = require('fs-extra');
let prettysize = require('prettysize');

let upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      let uploadLocation = path.join(__dirname, 'uploads');
      fs.mkdirsSync(uploadLocation);
      callback(null, uploadLocation);
    },
    filename: (req, file, callback) => {
      //originalname is the uploaded file's name with extn
      console.log(file.originalname);
      callback(null, file.originalname);
    }
  })
});

app.get('/', function (req, res, next) {
  res.render('index', {
    title: 'File upload using Express'
  });
});

app.post('/result', upload.single('file'), (req, res) => {
  console.log('req.file', req.file);
  res.render('result', {
    result: {
      file_name: req.file.originalname,
      size: prettysize(req.file.size),
      mimetype: req.file.mimetype
    }
  });
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
