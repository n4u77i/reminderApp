import type { AWS } from '@serverless/typescript';

// Defining the dynamoDB resource
const dynamoResources: AWS['resources']['Resources'] = {
    reminderTable: {
        Type: 'AWS::DynamoDB::Table',       // Type of resource
        Properties: {
            // Using serverless CUSTOM variable, the value will be defined in serverles.ts and referenced here
            TableName: '${self:custom.reminderTable}',

            // Defining table attributes (fields)
            AttributeDefinitions: [
                {
                    // ID attribute of type string
                    AttributeName: 'id',
                    AttributeType: 'S'
                }
            ],

            // Defining the key for table to lookup
            KeySchema: [
                {
                    // ID attribute will be the key and will hashes in it
                    AttributeName: 'id',
                    KeyType: 'HASH'
                }
            ],

            // Defining the type of billing we want to use
            BillingMode: 'PAY_PER_REQUEST',

            // Need to setup stream so whenever data changes (delete in our case), this prop will stream data to lambda (send data to lambda)
            StreamSpecification: {
                /**
                 * StreamViewTypes determines what kind of data we want to send in the stream to view
                 * There are four types of StreamViewTypes
                 * KEYS_ONLY - Only the key attributes of updated object
                 * NEW_IMAGE - The updated or newly created object
                 * OLD_IMAGE - The deleted or before the object was updated
                 * NEW_AND_OLD_IMAGES - Both before and after the object was updated 
                 */
                StreamViewType: 'OLD_IMAGE'
            },

            /**
             * Adding a TTL, which will delete the record at the specified TTL
             * A dynamo stream will be then added which will trigger the lambda to get the deleted record everytime it is deleted
             * A dynamo stream is used to trigger AWS services whenever there is a change in the dynamo db table data
             */
            TimeToLiveSpecification: {
                AttributeName: 'TTL',
                Enabled: true,                  // Sets to true to enable TTL deletion
            }
        }
    }
}

export default dynamoResources