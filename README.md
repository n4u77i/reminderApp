# Serverless - AWS Node.js Typescript

This project has been generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).

## Installation/deployment instructions

Depending on your preferred package manager, follow the instructions below to deploy your project.

> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

### Using Yarn

- Run `yarn` to install the project dependencies
- Run `yarn sls deploy` to deploy this stack to AWS

### Using Serverless

- Run `sls deploy` to deploy this stack to AWS

## Test your service

This template contain three lambda functions two of them are triggered by an HTTP request made on the provisioned API Gateway REST API `/` route with `POST` and `/{userId}` route with `GET` methods. And the third lambda function is triggered by the dynamodb stream on the `REMOVE` event. The body structure is tested by API Gateway against the following:
1. `src/functions/setReminder/index.ts`
2. `src/functions/getReminder/index.ts`
3. `src/functions/sendReminder/index.ts`

Valid paths for API are `/` with `POST` method with HTTP status code of `200` and `/{userId}` with `GET` method with HTTP status code of `200`
 - The `/` route with `POST` method requires data in the body in a **JSON** format. 
    - The required params are `reminder` and `reminderDate` of type string and number respectively.
    - Third param can either be `phoneNumber` or `email` of string. Country code is required before number.
    ```
    {
        "phoneNumber": "+920000000000",
        "reminder": "Buy course from Udemy",
        "reminderDate": 1671049600000
    }
    ```
    **OR**
    ```
    {
        "phoneNumber": "youremail@gmail.com",
        "reminder": "Buy course from Udemy",
        "reminderDate": 1671049600000
    }
    ```
    - To convert the time into number use following JS method as an example
    
         `new Date('15 Dec 2022 01:25:00').getTime()`
         
         Outputs: `1671049500000` which needs to be entered in `reminderDate`
    - Be sure to convert your local time to the time where the resources are deployed. For example: To trigger reminder in **Pakistan** at `25 Dec 2022 11:45:00`, and resources are deployed in **us-east-1** then in the `Date()` method we need to add converted time `25 Dec 2022 01:45:00`.
- The `/{userId}` route with a `GET` method requires the `userId` which can be a `phoneNumber` or `email` entered when setting reminder.

> :warning: As is, this template, once deployed, opens a **public** endpoint within your AWS account resources. Anybody with the URL can actively execute the API Gateway endpoint and the corresponding lambda. You should protect this endpoint with the authentication method of your choice.

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── src
│   ├── functions               # Lambda configuration and source code folder
│   │   ├── getReminder
│   │   │   └── index.ts        # Export of handler for getReminder lambda function
│   │   ├── sendReminder
│   │   │   └── index.ts        # Export of handler for sendReminder lambda function
│   │   └── setReminder
│   │       └── index.ts        # Export of handler for setReminder lambda function
│   └── libs                    
│       ├── apiGateway.ts       # API Gateway specific helper functions
|       └── dynamo.ts           # Methods for interacting with dynaomo db 
├── serverless
│   ├── functions.ts            # Handler for lambda function
|   └── dynamoResources.ts      # To add aws dynamo db resource
├── package.json
├── serverless.ts               # Serverless service file
├── tsconfig.json               # Typescript compiler configuration
├── tsconfig.paths.json         # Typescript paths
└── webpack.config.js           # Webpack configuration
```