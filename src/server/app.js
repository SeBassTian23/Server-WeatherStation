var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var favicon = require('serve-favicon');
var logger = require('morgan');
var helmet = require('helmet');

require('dotenv').config();

// Start the App
var app = express();

// Establish Routes
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var dataRouter = require('./routes/data');
var downloadRouter = require('./routes/download');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, '..', '..', 'public')));
app.use(express.static(path.join(__dirname, '..', '..', 'public')));
app.use(favicon(path.join(__dirname, '..', '..', 'public', 'favicon.ico')));

if (process.env.NODE_ENV === "production"){
  app.use(helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "'unsafe-inline'"],
    },
  }));
}

if (process.env.NODE_ENV !== "production"){
  const webpack = require('webpack');
  const config = require(path.join(__dirname,  '..', '..',  'webpack.dev.js'));
  const compiler = webpack(config);

  const webpackDevMiddleware = require('webpack-dev-middleware');

  app.use(webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
    })
  )
}

app.use('/', indexRouter);
app.use('/data', dataRouter);
app.use('/api', apiRouter);
app.use('/download', downloadRouter);

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
