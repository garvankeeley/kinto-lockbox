// @ts-check

function createOriginHash(itemUuid, origin) {
  let hashedOrigin = '';

  generateHash(origin, hashSalt)
    .then(hashed => {
      hashedOrigin = hashed;
      return kinto.collection(DB.originHashes.name).list({ filters: { [DB.originHashes.C.origin]: hashedOrigin } });
    })
    .then(foundRecords => {
      if (foundRecords.data.length > 1) {
        throw new Error(`generateHash wrong record count: ${foundRecords.data.length}`);
      }
      if (foundRecords.data.length < 1) {
        return {
          id: generateUUID(),
          [DB.originHashes.C.origin]: hashedOrigin,
          [DB.originHashes.C.itemIds]: [itemUuid]
        };
      }
      const record = foundRecords.data[0];
      record[DB.originHashes.C.itemIds].push(itemUuid);
      return record;
    })
    .then(record => kinto.collection(DB.originHashes.name).upsert(record));
}

function listAll() {
  kinto.collection(DB.items.name).list().then(result => {
    let promises = result.data.map(row => {
      return decryptItem(row).then(item => {
        return `id: "${row.id}", data: ${item.site} ${item.username} ${item.password}`;
      });
    })
    Promise.all(promises).then(results => {
      document.getElementById('items-table').innerHTML = results.join('\n');
    });
  })

  kinto.collection(DB.perItemKeys.name).list().then(result => {
    let rows = result.data.map(row => {
      return `itemId: "${row.itemId}", key: ${row.key}`;
    })
    document.getElementById('keys-table').innerHTML = rows.join('\n');
  })

  kinto.collection(DB.originHashes.name).list().then(results => {
    results.data.forEach(r => console.log(r));
  })
}

function main() {
  const username = 'foo';
  const password = 'doo';
  const options = {
    remote: 'https://kinto.dev.mozaws.net/v1/',
    //requestMode: 'no-cors',
    headers: {
      Authorization: "Basic " + btoa(`${username}:${password}`)
    }
  };

  // @ts-ignore
  kinto = new Kinto(options);

  document.getElementById('button-delete-all').onclick = () => {
    const promises = [];
    for (const table in DB) {
      const collection = kinto.collection(table);
      promises.push(collection.clear());
      promises.push(collection.api.bucket(collection.bucket).deleteCollection(collection.name));
    }
    Promise.all(promises)
      .then(res => listAll())
      .catch(err => LL(err));
  }

  document.getElementById('button-clear-local-data').onclick = () => {
    const promises = [];
    for (const table in DB) {
      const collection = kinto.collection(table);
      promises.push(collection.clear());
    }
    Promise.all(promises)
      .then(res => listAll());
  }

  document.getElementById('button-list-all').onclick = () => {
    listAll();
  }

  document.getElementById('button-sync').onclick = () => {
    const promises = [];
    for (const table in DB) {
      promises.push(kinto.collection(table).sync());
    }
    Promise.all(promises)
      .then(res => listAll())
      .catch(err => LL(err));
  }

  const form = document.getElementById('form-add');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const data = event.target['title'].value;
    if (!data) {
      addItem(sampleLoginsData[0]);
      return;
    }
    const parts = data.split(':')
    addItem({ site: parts[0], username: parts[1], password: parts[2] });
  });

  addItem(sampleLoginsData[0]);

  deriveKeyPBKDF(masterPassword, masterEncryptionSalt).then(key => {
    masterEncryptionKey = key;
    LL(key);
  });
}

window.addEventListener('DOMContentLoaded', main);
