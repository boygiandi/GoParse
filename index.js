const http = require('http'); // /etc/letsencrypt/live/backend.gostudio.co/privkey.pem
const https = require('https');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const config = require('./config');
const parseServer = require('./parseServer');
const bodyParser = require('body-parser');

const app = express()

app.use(cors());
app.use(express.json());
// app.use(express.static(__dirname, { dotfiles: 'deny' }));
app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use(function(req, res, next) {
    req.headers['x-real-ip'] = req.ip.replace('::ffff:', '');
    next(); 
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var httpServer = http.createServer(app);
var parse = null;
if ( fs.existsSync(config.credentials.key) ) {
    var httpsServer = https.createServer({
        key: fs.readFileSync(config.credentials.key),
        cert: fs.readFileSync(config.credentials.cert),
        // ca: fs.readFileSync(config.credentials.ca),
        passphrase: null
    }, app);
    httpsServer.listen(config.port.parse);
    parse = new parseServer(httpsServer);
} else parse = new parseServer(httpServer);

parse.run(app);

httpServer.listen(config.port.http);

console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
console.log('*                                                                       *')
console.log('* [Warning] Run command "npm run init" to create/update your DB Schema  *')
console.log('*                                                                       *')
console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
