import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutCommand, PutCommandInput, GetCommand, GetCommandInput, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb'

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
    },

    query: async ({
        tableName,
        index,
        
        // Value of the partition key (required)
        pkValue,

        /**
         * If querying on index1, the <pkKey> will be 'pk'
         * But if querying on index2 in the future, that could be a different partion key
         * For now, defaulting it to 'pk
         */
        pkKey = 'pk',

        // Value of the sort key (optional)
        skValue,

        // Defaulting it to 'sk' but can be overridden (optional)
        skKey = 'sk',

        sortAscending = true
    }: {
        tableName: string,
        index: string,
        pkValue: string,
        pkKey?: string,
        skValue?: string,
        skKey?: string,
        sortAscending?: boolean
    }) => {
        // If sort key value is passed
        const skExpression = skValue ? ` AND ${skKey} = :rangeValue` : ''

        // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#API_Query_RequestSyntax
        const params: QueryCommandInput = {
            TableName: tableName,
            IndexName: index,

            /**
             * A little bit kind of query to interact with data like SQL query but works very slightly differently
             * :hashValue is a substitution for adding values dynamically
             * https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#DDB-Query-request-KeyConditionExpression
             * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/queryinput.html#keyconditionexpression
             */
            KeyConditionExpression: `${pkKey} = :hashValue${skExpression}`,

            /**
             * A kind of substitution table to define value for a substitution
             * https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#DDB-Query-request-ExpressionAttributeValues
             * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/queryinput.html#expressionattributevalues
             */
            ExpressionAttributeValues: {
                ':hashValue': pkValue
            },

            /**
             * Define sort order for the query result
             * https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#DDB-Query-request-ScanIndexForward
             * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/interfaces/queryinput.html#scanindexforward
             */
            ScanIndexForward: sortAscending,
        }

        // Is sort key value is passed, adding value for <skKey> substitution
        if (skValue) {
            params.ExpressionAttributeValues[':rangeValue'] = skValue
        }

        const command = new QueryCommand(params)
        const response = await dynamoClient.send(command)

        // Array of items which matches the query
        return response.Items
    }
}