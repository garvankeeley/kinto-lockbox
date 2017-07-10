# Testing Kinto.js and Lockbox DB spec In-Browser

## Purpose:

Implement Lockbox DB Spec using [Kinto.js](https://kintojs.readthedocs.io/en/latest/)
and verify behaviour in WKWebView iOS and Android WebView.
I confirmed it runs fine in all modern web view implementations –don't expect it to run on UIWebView for instance.

## Building:

No steps required, just open the index.html in a browser.

## Run it:

http://htmlpreview.github.io/?https://github.com/garvankeeley/kinto-lockbox/blob/master/index.html

Testing is not automated, there are a few buttons to add items, remove items, dump the indexedDB table to a text area,
and to sync with the Kinto remote storage.

## Details:

Lockbox item storage uses a key specific to each 'lockbox item', so accessing item information requires looking up key information
in a table of 'perItemKeys'. The code implements this, and in particular it is useful to view the live indexedDB store to
both confirm the data is stored as expected, and to get a hands-on understanding of how indexedDB is used by Kinto.js.

Crypto (i.e. key generation, encryption/decryption) is largely faked, or is placeholder code (there is a rudimentary PBKDF2 util used for key generation).
