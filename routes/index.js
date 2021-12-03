const {handleClientError, handleServerError} = require('../utils');
const {datastore, URLS, findEntity} = require('../datastore');

const express = require('express');
const router = express.Router();

const NOT_FOUND = "The requested resource could not be found.";

async function findURL(req) {
  // Parse key as base 36
  const id = parseInt(req.params.key, 36)

  try {
    return await findEntity(URLS, id);
  } catch (err) {
    if (err.code === 3) {
      // Key was not parsable.
      throw {status: 404, message: NOT_FOUND};
    } else {
      throw {};
    }
  }
}

/* Redirect Short URL. */
router.get('/:key', async (req, res, next) => {
  let longURL;
  try {
    longURL = await findURL(req);
  } catch (err) {
    if (err.status) {
      handleClientError(res, err.status, err.message);
    } else {
      handleServerError(res, next, err);
    }
    return;
  }

  // Resource was not found.
  if (!longURL) {
    return handleClientError(res, 404, NOT_FOUND);
  }
  
  // Redirect to stored URL.
  res.redirect(longURL.url);
});

module.exports = router;
