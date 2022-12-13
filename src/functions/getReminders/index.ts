import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
    try {
        // Getting table name from serverless.ts file
        const tableName = process.env.reminderTable

        // Getting <userId> passed in the URL path params
        const { userId } = event.pathParameters || {}

        if (!userId) {
            return formatJSONResponse({
                statusCode: 400,
                data: {
                    message: 'Missing userId in path of URL'
                }
            })
        }

        // TODO: Implementation of dynamo.query() function
        const data = await dynamo.query({ tableName, index: 'index', pkValue: userId })

        return formatJSONResponse({
            data,
        })

    } catch (error) {
        console.log('Error', error)
        return formatJSONResponse({
            statusCode: 502,
            data: {
                message: error.message
            }
        })
    }
}