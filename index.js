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
        this.getDuration(event)
        .then(this.putMetricData)
        .then(this.createLogGroup)
        .then(() => {
            resolve(response);
        });
    }

    getDuration(event) {
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
                var duration = endTime - startTime;

                if (err) {
                    reject(err);
                } else {
                    // Log the result of the call
                    var log = {
                        request: request,
                        response: response,
                        duration: duration,
                        function:  request.FunctionName,
                        version: response.FunctionVersion
                    };
                    console.log(JSON.stringify(log));

                    var pmParams = {
                        MetricData: [
                            {
                                MetricName: 'Duration',
                                Timestamp: new Date(),
                                Unit: 'Milliseconds',
                                Value: duration,
                                Dimensions: [{
                                    Name: 'Correlation',
                                    Value: this.context.functionName+'/'+event.functionName
                                }]
                            },
                        ],
                        Namespace: 'CUSTOM/Lambda'
                    };
                    resolve(pmParams);
                }
            });
        });
    }

    putMetricData(metric) {
        return new Promise((resolve) => {
            cloudwatch.putMetricData(metric, function(err, data) {
                resolve(metric.MetricData[0].MetricName);
            });
        });
    }

    createLogGroup(logGroupName) {
        return new Promise((resolve) => {
            var lgParams = {
                logGroupName: '/metric/lambda/correlation/'+logGroupName
            };
            cloudwatchlogs.createLogGroup(lgParams, function(err, data) {
                resolve();
            });
        });
    }
}

module.exports = Lambda;
