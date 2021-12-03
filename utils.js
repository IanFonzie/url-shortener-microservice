function setErrorState(res, statusCode, message) {
  res.status(statusCode).locals.errorMsg = message;
}

exports.handleClientError = function(res, statusCode, message) {
  setErrorState(res, statusCode, message);
  res.set('Content-Type', 'application/json').send({Error: res.locals.errorMsg});
}

exports.handleServerError = function(res, next, error) {
  setErrorState(res, 500, 'Something went wrong. We will fix it shortly.')
  next(error);
}
