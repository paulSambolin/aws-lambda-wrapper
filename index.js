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
        return this.getDuration(event)
        .then(() => {
            this.putMetricData
        })
        .then(() => {
            this.createLogGroup
        })
        .catch((err) => {
            console.log('Lambda log Wrapper error: ',err);
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
                    var obj = {
                        pmParams: pmParams,
                        response: response
                    };

                    resolve(obj);
                }
            });
        });
    }

    putMetricData(obj) {
        return new Promise((resolve) => {
            this.cloudwatch.putMetricData(obj.pmParams, function(err, data) {
                resolve(obj);
            });
        });
    }

    createLogGroup(obj) {
        return new Promise((resolve) => {
            var lgParams = {
                logGroupName: '/metric/lambda/correlation/'+obj.pmParams.metric.MetricData[0].MetricName
            };
            this.cloudwatchlogs.createLogGroup(lgParams, function(err, data) {
                resolve(obj.response);
            });
        });
    }
}

module.exports = Lambda;
