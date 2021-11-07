const {handleClientError, handleServerError} = require('../utils');
const {datastore, URLS} = require('../datastore');

const express = require('express');
const router = express.Router();

const NOT_FOUND = "The requested resource could not be found.";

/* Redirect Short URL. */
router.get('/:key', async (req, res, next) => {
  const key = req.params.key;
  
  // Parse key as base36.
  const id = parseInt(key, 36);

  const URLKey = datastore.key([URLS, id]);
  let longURL;
  try {
    [longURL] = await datastore.get(URLKey)
  } catch (err) {
    if (err.code === 3) {
      // Key was not parsable.
      handleClientError(res, 404, NOT_FOUND, next);
    } else {
      handleServerError(res, next, err);
    }
    return;
  }

  // Resource was not found.
  if (!longURL) {
    handleClientError(res, 404, NOT_FOUND, next);
    return;
  }
  
  // Redirect to stored URL.
  res.redirect(longURL.url);
});

module.exports = router;
