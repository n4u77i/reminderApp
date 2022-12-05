import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from 'uuid'

export const handler = async (event: APIGatewayProxyEvent) => {
    try {
        // Converting the stringified body to JSON
        const body = JSON.parse(event.body)

        // Getting env variables from serverless.ts file environment variables
        const tableName = process.env.reminderTable
        const baseUrl = process.env.baseUrl

        const originalUrl = body.url;
        const code = uuid().slice(0, 8)
        const shortUrl = `${baseUrl}/${code}`

        const data = {
            id: code,
            shortUrl,
            originalUrl
        }

        // Writing to dynamo table
        return await dynamo.write(data, tableName)

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