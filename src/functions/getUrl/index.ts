import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
    try {
        /**
         * Destructuring <event.pathParameters> variable to <code> variable which contains code passed by user after url
         * https://some-url/645872
         * Empty dictionary will be assigned if <code> will be null i.e user did not supplied code
         */
        const { code } = event.pathParameters || {}

        if (!code) {
            return formatJSONResponse({
                statusCode: 400,
                data: {
                    message: 'Missing "code" in the path of url'
                }
            })
        }

        // Getting env variables from serverless.ts file environment variables
        const tableName = process.env.reminderTable

        const record = await dynamo.get(code, tableName)
        const originalUrl = record.originalUrl

        return formatJSONResponse({
            statusCode: 301,                    // 301 is HTTP status for Redirection
            headers: {
                Location: originalUrl
            }
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