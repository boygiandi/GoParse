# GoParse

To test request, use this curl command

Public API
`curl -X POST  -H "X-Parse-Application-Id: <appid>"  -H "X-Parse-REST-API-Key: <key>"  -H "Content-Type: application/json"  -d "{}"  https://parseapi.back4app.com/functions/test:global`

Protected API
`curl -X POST  -H "X-Parse-Application-Id: <appid>"  -H "X-Parse-REST-API-Key: <key>"  -H "Content-Type: application/json"  -d "{}"  https://parseapi.back4app.com/functions/test:needlogin`
