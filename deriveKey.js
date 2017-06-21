// copied from MDN
function deriveKeyPBKDF(passphrase, salt) {
  // salt should be Uint8Array or ArrayBuffer
  const saltBuffer = Unibabel.hexToBuffer(salt);
  const passphraseKey = Unibabel.utf8ToBuffer(passphrase);

  // You should firstly import your passphrase Uint8array into a CryptoKey
  return window.crypto.subtle.importKey(
    'raw',
    passphraseKey,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  ).then(function (key) {
    return window.crypto.subtle.deriveKey(
      {
        "name": 'PBKDF2',
        "salt": saltBuffer,
        "iterations": 100,
        "hash": 'SHA-256'
      },
      key,
      { "name": 'AES-CBC', "length": 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }).then(function (webKey) {
    return crypto.subtle.exportKey("raw", webKey);
  }).then(function (buffer) {
    return Unibabel.bufferToHex(new Uint8Array(buffer));
  });
}
