require('dotenv').config()

const HTTP_PORT = 80;
const MONGO_URI = 'mongodb://luchwme:g6PKZjeLFi14wGAh@cluster0.vjnmw.mongodb.net/test?authSource=admin';
const PUBLIC_DOMAIN = process.env.PUBLIC_DOMAIN || ''; // 
const REDIS_URI = process.env.REDIS_URI || 'redis://:BFw5QeA2lezA9AEeB6f03tsYtVKujzop@redis-14804.c294.ap-northeast-1-2.ec2.cloud.redislabs.com:14804';

module.exports = {
    port: {
        http: HTTP_PORT,
        parse: 443
    },
    credentials: {
        key: `ssl/privkey.pem`,
        cert: `ssl/cert.pem`,
        ca: `ssl/chain.pem`,
        passphrase: null
    },
    parseServer: { // create unique index db.LivestreamActivity.createIndex({ "outid": 1 }, { unique: true })
        databaseURI: MONGO_URI,
        cloud: __dirname + '/parseServer/cloud/main.js',
        appId: 'GoStudio',
        masterKey: 'at`A9L[c^#RXd35!nQ3cAsX&MJk?-g', //Add your master key here. Keep it secret!
        serverURL: `http://localhost:${HTTP_PORT}/parse`, // Don't forget to change to https if needed
        liveQuery: {
            classNames: ['Livestream', 'LivestreamDest', 'LivestreamActivity', 'Project'], // List of classes to support for query subscriptions
        },
        enableAnonymousUsers: false,
        allowClientClassCreation: false,
        publicServerURL: `https://${PUBLIC_DOMAIN}/parse`,
        appName: 'GoStudio',
        redis: REDIS_URI
    }
}