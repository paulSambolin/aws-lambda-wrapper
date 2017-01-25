'use strict';

const AWS = require('aws-sdk');

class Lambda {
    constructor(context) {
        this.context = context;
        this.lambda = new AWS.Lambda();
        this.cloudwatch = new AWS.CloudWatch();
        this.cloudwatchlogs = new AWS.CloudWatchLogs();
    }

    invoke(functionName, event) {
        return new Promise((resolve, reject) => {
            var caller = {
                FunctionName: this.context.fucntionName,
                RequestId: this.context.awsRequestId
                //The ARN used to invoke this function (not sure of it's use/value)
                //,InvokedFucntionArn: this.context.invokedFunctionArn
            };

            event.caller = caller;
            const request = {
                FunctionName: functionName,
                InvocationType: 'RequestResponse',
                Payload: JSON.stringify(event)
            };

            var startTime = Date.now();
            this.lambda.invoke(request, (err, response) => {
                var endTime = Date.now();

                if (err) {
                    reject(err);
                } else {
                    // Log the call data into the Controller's log group
                    var log = {
                        request: request,
                        response: response,
                        duration: duration,
                        function:  request.FunctionName,
                        version: response.FunctionVersion
                    };
                    console.log(JSON.stringify(log));
                    
                    // Put duration metric in unique Cloudwatch metric <controller>/<service>
                    var pmParams = {
                        MetricData: [
                            {
                                MetricName: this.context.fucntionName+'/'+functionName,
                                Timestamp: new Date(),
                                Unit: 'Milliseconds',
                                Value: duration
                            },
                        ],
                        Namespace: 'CUSTOM/lambda'
                    };

                    putMetricData(pmParams)
                    .then(createLogGroup)
                    .then(() => {
                        resolve(response);
                    });                    
                }
            });
        });
    }
}

module.exports = Lambda;

function putMetricData(metric) {
    return new Promise((resolve) => {
        cloudwatch.putMetricData(metric, function(err, data) {
            resolve(metric.MetricData[0].MetricName);
        });
    });
}

function createLogGroup(logGroupName) {
    return new Promise((resolve) => {
        var lgParams = {
            logGroupName: logGroupName
        };
        cloudwatchlogs.createLogGroup(lgParams, function(err, data) {
            resolve(resource);
        });
    });
}