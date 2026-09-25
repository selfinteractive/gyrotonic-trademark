# gyrotonic-trademark

A JS tool for automatically styling any occurrences of GYROTONIC &amp; GYROKINESIS trademarks on a webpage.

Also supports calling the code manually:

`window.gyrotonicTrademarks.apply('.optional-container-selector-prefix')`

More info at the [GYROTONIC Trademark Code Homepage](https://www.gyrotonic.com/terms-of-use/trademark-formatting-code/)

Add the class "gttm-ignore" to any container this script should ignore.

## GYROTONIC® & Logo

"& Logo" directly after a GYROTONIC® mention (as in "GYROTONIC® & Logo, GYROTONIC® and
GYROKINESIS® are registered trademarks...") is formatted in Times New Roman bold, matching
the GYROTONIC® wording next to it. It is matched case-insensitively on "logo" and displayed
capitalized, so "& logo" as typed still renders as "& Logo". Only GYROTONIC triggers it -
GYROKINESIS, "GYROTONIC EXPANSION SYSTEM", and unrelated text like "Brand & Logo" are left
alone.

The JS version also formats a split form, where "&" and "Logo" sit in separate inline
elements (e.g. a trainer bolded only "Logo") - each piece gets wrapped in its own span. The
PHP version (used for the theme's emails, which never go through a rich-text editor) handles
only the unsplit form.

A typo like "& <logo" (a stray "<" where "Logo" should be) is content, not something this
script repairs - it is left as-is.

## Running

`npm start` will launch dev mode and open an autorefreshing test page on which the script is run.

## Testing

`npm install` once (no `node_modules` is committed), then:

- `npm test` runs both suites (JS, then PHP).
- `npm run test:js` runs the JS suite alone (`node:test` + jsdom, against `src/js/app.js`).
- `npm run test:php` runs the PHP suite alone (`test/php/GyrotonicTrademarkTest.php`).

## Deploying

1. `npm run build`
2. `git push` to Github, where jsDelivr CDN serves from.
3. Purge jsDelivr if urgent-ish bugfix

## Purging jsDelivr after deploy

```sh
curl -X POST \
  http://purge.jsdelivr.net/ \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
"path": [
"/gh/selfinteractive/gyrotonic-trademark@latest/dist/js/gyrotonic-trademark.js"
]
}'
```
