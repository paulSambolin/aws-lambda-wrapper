## Lambda Logger
This npm package enables nodejs to estimate the time it takes a call to a lambda function to return.

- Get the time immediately before calling a lambda function
- Get the time immediately after the call returns
- Log the differene to a Log group with a naming convention of `/metric/lambda/<caller-name>/<invoked-name>`

## When using serverless
- Serverless automatically appends the stage variable to lambda functions when deploying to aws
- It is suggested you add the stage variable as an environment variable  for your lamdba functions.  This allows you to dynamically piece together the correct funciton name for the stage being tested

```javascript
var funcitonName = 'helloworld' + '-' + process.env.STAGE;
```







## Update the Security template
- Give functions permission to:
  - Create log group
  - put cloudwatch metrics

## Update the application template
- Add new npm package




## Usage
```javascript
// Initialize lambda logger
var Lambda = require('lambda-logger');

exports.handler = (event, context, callback) => {
    // Pass the context object to lambda wrapper
    var lambda = new Lambda(context);
}

// Invoke function
var request = {
    FunctionName: 'Helloworld',
    ProcessId: pid,
    TranactionId: tid
};
lambda.invoke(request);

// Chaining calls
lambda.invoke(request)
.then((response) => {
    // Do work ...
    return lambda.invoke();
})
.then(() => {
    // Do final steps
})
.catch((err) => {
    // Error within promsise chain
});
```
