## Lambda Logger
- This npm package logs data about calls to lambda functions including:
  - Duration
  - Request/ Response objects
- Log the duration of a call from `<caller-name>` to `<invoked-name>` to a Log group with a naming convention of `/metric/lambda/correlation/<caller-name>/<invoked-name>`

## When using serverless
- Serverless automatically appends the stage variable to lambda functions when deploying to aws
- It is suggested you add the stage variable as an environment variable  for your lamdba functions.  This allows you to dynamically piece together the correct funciton name for the stage being tested

```javascript
var functionName = 'helloworld' + '-' + process.env.STAGE;
```

## Usage
```javascript
// Initialize lambda logger
var Lambda = require('lambda-logger');

exports.handler = (event, context, callback) => {
    // Pass the context object to lambda wrapper
    var lambda = new Lambda(context);

    // Invoke function
    var request = {
        FunctionName: 'Helloworld',
        ProcessId: pid,
        TranactionId: tid
    };
    lambda.invoke(request)
    .then((response) => {
        // Do work ...

        // Chaining calls
        var request = {
            FunctionName: 'Goodbyeworld',
            ProcessId: pid,
            TranactionId: tid
        };
        return lambda.invoke(request);
    })
    .then(() => {
        // Do final steps
    })
    .catch((err) => {
        // Error within promsise chain
    });
}
```

## TODO:
- Update the Security template give functions permission to:
  - Create log group
  - put cloudwatch metrics
- Update the application template
  - Add new npm package
- test promise chaining
- implement callback version
