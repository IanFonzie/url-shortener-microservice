const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const URLRouter = require('./routes/urls');
const indexRouter = require('./routes/index');

const app = express();
app.set('trust proxy', true);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add server name to request.
app.use((req, res, next) => {
  req.serverName = () => `${req.protocol}://${req.get('host')}`;
  next();
});

app.use('/urls', URLRouter);
app.use('/', indexRouter);

// Handle 4xx errors.
app.use((req, res, next) => {
  res.set('Content-Type', 'application/json').send({Error: res.locals.errorMsg});
});
  
// Handle 5xx errors.
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.set('Content-Type', 'application/json').send({Error: res.locals.errorMsg});
});

module.exports = app;
