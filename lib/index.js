'use strict';

const AWS = require('aws-sdk');
const config = require('config');
const Q = require('q');

class Lambda {
    constructor(arn, qualifer) {

        const params = {
            region: config.get('aws.region')
        };

        if (config.has('aws.profile')) {
            params.credentials = new AWS.SharedIniFileCredentials({
                profile: config.get('aws.profile')
            });
        }

        this.arn = arn;
        this.qualifier = qualifer || process.env.NODE_ENV;
        this.lambda = new AWS.Lambda(params);
    }

    invoke(payload, eventType) {
        const deferred = Q.defer();
        const params = {
            FunctionName: this.arn,
            InvocationType: eventType,
            Payload: JSON.stringify(payload),
            Qualifier: this.qualifier
        };

        console.log(params);
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