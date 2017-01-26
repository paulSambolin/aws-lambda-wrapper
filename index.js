'use strict';

const AWS = require('aws-sdk');

class Lambda {
    constructor(context) {
        this.context = context;
        this.lambda = new AWS.Lambda();
        this.cloudwatch = new AWS.CloudWatch();
        this.cloudwatchlogs = new AWS.CloudWatchLogs();
    }

    invoke(event) {
        return new Promise((resolve, reject) => {
            var caller = {
                FunctionName: this.context.functionName,
                RequestId: this.context.awsRequestId
                //The ARN used to invoke this function (not sure of it's use/value)
                //,InvokedFucntionArn: this.context.invokedFunctionArn
            };

            event.caller = caller;
            const request = {
                FunctionName: event.FunctionName,
                InvocationType: 'RequestResponse',
                Payload: JSON.stringify(event),
                LogType: 'Tail'
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
                    console.log(log);
                    console.log(JSON.stringify(log));
                    
                    // Put duration metric in unique Cloudwatch metric <controller>/<service>
                    var pmParams = {
                        MetricData: [
                            {
                                MetricName: 'Duration',
                                Timestamp: new Date(),
                                Unit: 'Milliseconds',
                                Value: duration,
                                Dimensions: [{
                                    Name: 'Correlation',
                                    Value: this.context.fucntionName+'/'+event.functionName
                                }]
                            },
                        ],
                        Namespace: 'CUSTOM/Lambda'
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
            logGroupName: '/metric/lambda/correlation/'+logGroupName
        };
        cloudwatchlogs.createLogGroup(lgParams, function(err, data) {
            resolve();
        });
    });
}
