import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutCommand, PutCommandInput, GetCommand, GetCommandInput } from '@aws-sdk/lib-dynamodb'

// Optionally pass region but by default it sets region where Lambda is deployed
const dynamoClient = new DynamoDBClient({})

export const dynamo = {
    // Variable <data> will be of type Object which takes string as key and anything as value - Record<string, any>
    write: async (data: Record<string, any>, tableName: string) => {
        
        // PutCommandInput will prepare the input data we need to write to the dynamo table
        const params: PutCommandInput = {
            TableName: tableName,
            Item: data
        }

        // PutCommand will create the command for write
        const command = new PutCommand(params)
        
        await dynamoClient.send(command)

        return data
    },

    get: async (code: string, tableName: string) => {
        
        // GetCommandInput will prepare the input data we need to query from dynamo table
        const params: GetCommandInput = {
            TableName: tableName,
            Key: {
                id: code
            }
        }

        // GetCommand will create the command for query/read
        const command = new GetCommand(params)

        const response = await dynamoClient.send(command)

        // <response> variable is of type GetCommandOutput which has Item property which contains JSONified data
        return response.Item
    }
}