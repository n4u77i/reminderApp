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
        ]
    }
}

export default functions