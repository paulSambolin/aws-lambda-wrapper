'use strict';

const AWS = require('aws-sdk');

class Lambda {
    constructor(config) {
        // const params = {
        //     region: config.region
        // };

        // if (config.profile) {
        //     params.credentials = new AWS.SharedIniFileCredentials({
        //         profile: config.profile
        //     });
        // }

        // this.accountId = config.accountId;
        // this.region = config.region;
        this.lambda = new AWS.Lambda(params);
    }

    invoke(name, qualifier, eventType, payload) {

        const fnArn = `arn:aws:lambda:${this.region}:${this.accountId}:function:${name}`;
        const deferred = Q.defer();
        const params = {
            FunctionName: fnArn,
            InvocationType: eventType,
            Payload: JSON.stringify(payload),
            Qualifier: qualifier
        };

        this.lambda.invoke(params, (err, data) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    }
}

module.exports = Lambda;