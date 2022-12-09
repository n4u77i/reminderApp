import type { AWS } from '@serverless/typescript';

const functions: AWS["functions"] = {
    // Any function name
    setReminder: {
        // Lambda function path
        handler: 'src/functions/setReminder/index.handler',

        // Event to trigger lambda function
        events: [
            {
                httpApi: {
                    path: '/',
                    method: 'post'
                }
            }
        ]
    },

    getReminders: {
        // Lambda function path
        handler: 'src/functions/getReminders/index.handler',

        // Event to trigger lambda function
        events: [
            {
                httpApi: {
                    path: '/{userId}',
                    method: 'get'
                }
            }
        ]
    },

    sendReminder: {
        // Lambda function path
        handler: 'src/functions/sendReminder/index.handler',

        // Event to trigger lambda function
        events: [
            {
                // Stream input event type
                stream: {
                    type: 'dynamodb',
                    
                    // Setting ARN for dynamoDB dynamically by getting attribute of dynamodb <reminderTable>
                    arn : {
                        // Getting StreamArn attribute from <reminderTabe> defined in dynamoResources.ts
                        'Fn::GetAtt': [
                            'reminderTable',
                            'StreamArn',
                        ]
                    },

                    // Lambda will only get triggered when the REMOVE event will happen (record will be deleted)
                    filterPatterns: [
                        {
                            eventName: ['REMOVE']
                        }
                    ]
                }
            }
        ],

        /**
         * By using serverless-iam-roles-per-function plugin to assign permission to specific lamda
         * We are extending the type of AWS.functions and the iam object doesn't match with type of AWS.functions so definitions doesn't match
         * iam doesn't exist in AWS.functions and it will throw error
         * AWS.functions type functionality can be implememnted by ourselves and extend the functionality by adding iam object but there's a easier way 
         * By @ts-expect-error, we accept that it will throw error but ignore it
         */
        // @ts-expect-error
        iamRoleStatements: [
            {
              Effect: "Allow",
              Action: ["ses:sendEmail", "sns:Publish"],
              Resource: "*",
            },
        ],
    }
}

export default functions