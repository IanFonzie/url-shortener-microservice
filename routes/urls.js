const {handleClientError, handleServerError} = require('../utils');
const {datastore, URLS} = require('../datastore');

const express = require('express');
const router = express.Router();

const URL_REQUIRED = 'URL is required.';

const validators = {
  URL: longURL => {
    let validURL;
    const issue = 'Invalid URL';

    try {
      validURL = new URL(longURL);
    } catch (err) {
      return issue;
    }

    return !(['http:', 'https:'].includes(validURL.protocol)) ? issue : null;
  }
};

function isNotAcceptable(req, expected) {
  // Assert client requests a supported MIME type.
  return !req.accepts(expected);
}

function isUnsupportedMediaType(req, expected) {
  // Assert client payload MIME type is supported.
  return req.get('Content-Type') !== expected;
}

function getURLProps(req) {
  const props = (({body: {url, custom_path, expire_at}}) => {
    return {
      URL: url, 
      customPath: custom_path, 
      expireAt: expire_at
    };
  })(req);

  // Filter out undefined values.
  Object.keys(props).forEach(prop => {
    if (props[prop] === undefined) {
      delete props[prop];
    }
  });

  return props;
}

function invalidProps(boat) {
  const invalidProps = [];

  for (let prop in boat) {
    let invalid = validators[prop](boat[prop]);
    if (invalid) {
      invalidProps.push([prop, invalid]);
    }
  }

  return invalidProps.length > 0 ? invalidProps : null;
}

function invalidPropsMsg(problems) {
  let errorMsg = '';

  for (let [prop, problem] of problems) {
    errorMsg += `Bad value for payload attribute: '${prop}'. Cause: '${problem}'. `
  }

  return errorMsg.trimRight();
}

function invalidAcceptMsg(req) {
  return `Unsupported 'Accept' header: '${req.get('Accept')}'. Must accept `
  + `'application/json'.`;
}

function invalidContentTypeMsg(req) {
  return `Unsupported media type: '${req.get('Content-Type')}'. Payload must be `
  + `'application/json'.`;
}

function buildShortURL(req, key) {
  return `${req.serverName()}/${parseInt(key.id, 10).toString(36)}`;
}

function validateRequest(req) {
  if (isNotAcceptable(req, 'application/json')) {
    // Assert client accepts 'application/json'.
    throw {status: 406, message: invalidAcceptMsg(req)};
  } else if (isUnsupportedMediaType(req, 'application/json')) {
    // Assert client sent JSON.
    throw {status: 415, message: invalidContentTypeMsg(req)};
  }

  // Assert expected properties exist.
  const inputURL = getURLProps(req);
  if (inputURL.URL === undefined) {
    throw {status: 400, message: URL_REQUIRED};
  }

  // Validate expected properties.
  const problems = invalidProps(inputURL);
  if (problems) {
    throw {status: 400, message: invalidPropsMsg(problems)};
  }

  return inputURL;
}

/* Create Short URL. */
router.post('/', async (req, res, next) => {
  // Get valid long URL or handle its errors.
  let longURL;
  try {
    longURL = validateRequest(req);
  } catch (err) {
    return handleClientError(res, err.status, err.message);
  }

  // Insert the URL.
  const key = datastore.key(URLS);
  try {
    await datastore.insert({key, data: {url: longURL.URL}});
  } catch (err) {
    return handleServerError(res, next, err);
  }

  // Construct short URL.
  res.send(201, {short_url: buildShortURL(req, key)});
});

module.exports = router;
