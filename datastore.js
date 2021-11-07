const { Datastore } = require('@google-cloud/datastore');

exports.Datastore = Datastore;
exports.datastore = new Datastore();

/* Kinds */
exports.URLS = 'URLs';

/* Helpers */
exports.findEntity = async function findEntity(kind, id) {
  // Finds an entity and returns it to the caller.
  const key = exports.datastore.key([kind, id]);
  let [entity] = await exports.datastore.get(key);

  return entity;
}
