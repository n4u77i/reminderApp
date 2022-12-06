import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEvent) => {
    try {
        // Converting the stringified body to JSON
        const body = JSON.parse(event.body)

        // Getting env variables from serverless.ts file environment variables
        const tableName = process.env.reminderTable

        const { email, phoneNumber, reminder, reminderDate } = body
        const validationErrors = validateInput({email, phoneNumber, reminder, reminderDate})

        if (validationErrors) {
            return validationErrors
        }

        const data = {
            
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

const validateInput = ({
    email, 
    phoneNumber, 
    reminder, 
    reminderDate
}: {
    email?: string,
    phoneNumber?: string
    reminder: string,
    reminderDate: number
}) => {
    if (!email && !phoneNumber) {
        return formatJSONResponse({
            statusCode: 400,
            data: {
                message: 'Email or phone number is missing to create the reminder'
            }
        })
    }

    if (!reminder) {
        return formatJSONResponse({
            statusCode: 400,
            data: {
                message: 'Reminder is required to create the reminder'
            }
        })
    }

    if (!reminderDate) {
        return formatJSONResponse({
            statusCode: 400,
            data: {
                message: 'Reminder date is required to create the reminder'
            }
        })
    }

    return
}