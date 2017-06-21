const LL = console.log;

let kinto = {};

let hashSalt = 'abcd';
let masterEncryptionSalt = 'e85c53e7f119d41fd7895cdc9d7bb9dd';
let masterPassword = 'supersecret';
let masterEncryptionKey = 'pbkdf(salt and password)';

let sampleLoginsData = [{ site: 'google.ca', username: 'foofoo', password: 'pw1' },
{ site: 'mozilla.ca', username: 'doodoo', password: 'pw2' }];

const DB = {
  items: { name: 'items', C: { encryptedData: 'encryptedData' } },
  perItemKeys: { name: 'perItemKeys', C: { itemId: 'itemId', key: 'key' } },
  originHashes: { name: 'originHashes', C: { origin: 'origin', itemIds: 'itemIds' } },
  //tagHashes: { name: 'tagHashes', C: {} }
};
