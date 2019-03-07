const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dbConfig = require('./config/database.config.js');

const { uri, options } = dbConfig;

mongoose.Promise = global.Promise;
mongoose
  .connect(
    uri,
    options,
  )
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((err) => {
    console.log("Couldn't connect to the database...", err);
    process.exit();
  });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }

  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to prostuti-api, yayy!' });
});

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
  next(error);
});

module.exports = app;
