const ParseServer = require('parse-server').ParseServer;
const RedisCacheAdapter = require('parse-server').RedisCacheAdapter;
const config = require('../config');
class parseServer {
    constructor(server) {
        let redisCache = new RedisCacheAdapter({ url: config.parseServer.redis });
        this.server = new ParseServer({
            logLevel: 'error',
            ...config.parseServer,
            cacheAdapter: redisCache,
            passwordPolicy: {
                // doNotAllowUsername: true, // optional setting to disallow username in passwords
                // maxPasswordAge: 90, // optional setting in days for password expiry. Login fails if user does not reset the password within this period after signup/last reset.
                // maxPasswordHistory: 2, // optional setting to prevent reuse of previous n passwords. Maximum value that can be specified is 20. Not specifying it or specifying 0 will not enforce history.
                resetTokenValidityDuration: 24 * 60 * 60, // expire after 24 hours
            },
            // email verify
            verifyUserEmails: false,
            // emailAdapter: {
            //     module: emailAdapter,
            //     options: {
            //         from: config.aws.email,
            //         accessKeyId: config.aws.accessKeyId,
            //         secretAccessKey: config.aws.secretAccessKey,
            //         region: config.aws.region,
            //         apiVersion: config.aws.apiVersion,
            //         verifyEmailTemplate: config.aws.verifyEmailTemplate,
            //         resetPasswordTemplate: config.aws.resetPasswordTemplate
            //     }
            // }
        });
        var parseLiveQueryServer = ParseServer.createLiveQueryServer(server);
    }

    run(app) {
        app.use('/parse', this.server);
        console.log(`Parse Server listening on port ${config.port.http}`)
    }
}

module.exports = parseServer;