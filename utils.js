function setErrorState(res, statusCode, message) {
  res.status(statusCode).locals.errorMsg = message;
}

exports.handleClientError = function(res, statusCode, message, next) {
  setErrorState(res, statusCode, message);
  next();
}

exports.handleServerError = function(res, next, error) {
  setErrorState(res, 500, 'Something went wrong. We will fix it shortly.')
  next(error);
}
