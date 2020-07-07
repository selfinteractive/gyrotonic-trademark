# gyrotonic-trademark
A JS tool for automatically styling any occurrences of GYROTONIC &amp; GYROKINESIS trademarks on a webpage.

More info: https://www.gyrotonic.com/terms-of-use/trademark-formatting-code/

# Running
`npm start` will launch dev mode and open an autorefreshing test page on which the script is run.

# Deploying
`git push` to Github, where jsDelivr CDN serves from.

# Purging jsDelivr after deploy
```
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