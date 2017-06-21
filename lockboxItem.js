// @ts-check

// faked
function decryptItem(encryptedItem) {
  return kinto.collection(DB.perItemKeys.name).list({
    filters: { [DB.perItemKeys.C.itemId]: encryptedItem.id }
  }).then(results => {
    if (results.data.length !== 1) {
      return Promise.reject(new Error(`decryptItem: Result count incorrect: ${results.data.length}`));
    }
    const secret = results.data[0][DB.perItemKeys.C.key];
    let str = atob(encryptedItem[DB.items.C.encryptedData]);
    return JSON.parse(str.replace(secret, ''));
  });
}

function addItem(itemData) {
  function createPerItemKey(itemUuid, encryptionKey) {
    // deriveKey(itemUuid, encryptionKey).then(...)
    const key = encryptionKey + itemUuid;
    return kinto.collection(DB.perItemKeys.name).create({
      [DB.perItemKeys.C.itemId]: itemUuid,
      [DB.perItemKeys.C.key]: key
    })
      .then(added => {
        return added.data;
      });
  }

  function createEmptyItem() {
    return kinto.collection(DB.items.name).create({})
      .then(result => result.data.id)
  }

  // faked
  function encryptItem(itemData, perItemKey) {
    const str = JSON.stringify(itemData);
    const b64 = btoa(str + perItemKey[DB.perItemKeys.C.key]);
    return Promise.resolve({
      id: perItemKey[DB.perItemKeys.C.itemId],
      [DB.items.C.encryptedData]: b64
    });
  }

  function updateItemEncryptedData(encryptedItem) {
    return kinto.collection(DB.items.name).update(encryptedItem);
  }

  createEmptyItem()
    .then(resultId => createPerItemKey(resultId, masterEncryptionKey))
    .then(perItemKey => encryptItem(itemData, perItemKey))
    .then(encryptedItem => updateItemEncryptedData(encryptedItem))
    .then(updatedItem => createOriginHash(updatedItem.data.id, itemData.site))
    .catch(ex => {
      console.error(ex);
      console.trace();
    });
}