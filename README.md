# gyrotonic-trademark

A JS tool for automatically styling any occurrences of GYROTONIC &amp; GYROKINESIS trademarks on a webpage.

Also supports calling the code manually:

`window.gyrotonicTrademarks.apply('.optional-container-selector-prefix')`

More info at the [GYROTONIC Trademark Code Homepage](https://www.gyrotonic.com/terms-of-use/trademark-formatting-code/)

Add the class "gttm-ignore" to any container this script should ignore.

## Running

`npm start` will launch dev mode and open an autorefreshing test page on which the script is run.

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
