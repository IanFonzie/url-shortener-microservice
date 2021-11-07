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

/* Create Short URL. */
router.post('/', async (req, res, next) => {
  // Assert client accepts 'application/json'.
  if (isNotAcceptable(req, 'application/json')) {
    const errorMsg = `Unsupported 'Accept' header: '${req.get('Accept')}'. Must accept 'application/json'.`;
    handleClientError(res, 406, errorMsg, next);
    return;
  }

  // Assert client sent JSON.
  if (isUnsupportedMediaType(req, 'application/json')) {
    const errorMsg = `Unsupported media type: '${req.get('Content-Type')}'. Payload must be 'application/json'.`;
    handleClientError(res, 415, errorMsg, next);
    return;
  }

  // Get expected properties.
  const longURL = getURLProps(req);

  // Check if URL is missing.
  if (longURL.URL === undefined) {
    handleClientError(res, 400, URL_REQUIRED, next);
    return;
  }

  const problems = invalidProps(longURL);
  if (problems) {
    // Problem with a supplied value.
    handleClientError(res, 400, invalidPropsMsg(problems), next);
    return;
  }

  // Insert the URL.
  const key = datastore.key(URLS);
  try {
    await datastore.insert({key, data: {url: longURL.URL}});
  } catch (err) {
    handleServerError(res, next, err);
    return;
  }

  // Construct short URL.
  const shortURL = `${req.serverName()}/${parseInt(key.id, 10).toString(36)}`;
  res.send(201, {short_url: shortURL});
});

module.exports = router;
