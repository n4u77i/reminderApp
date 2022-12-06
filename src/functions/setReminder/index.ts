import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { APIGatewayProxyEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";

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

        const userId = email || phoneNumber

        const data = {
            // <body> is spreaded at top because if for some reason <pk> is passed to the event, then it shouldn't override the <pk> we defined below
            ...body,
            id: uuid(),
            
            /**
             * TTL is value when the record expires
             * In JS, time is in milli-seconds so <reminderDate> variable will hold the number of milli-secs but TTL requires time in seconds
             * If <reminderDate> is not converted to secs, TTL will consider milli-secs as seconds and it will take much much longer to expire
             */
            TTL: reminderDate / 1000,

            /**
             * We need to extra columns in the database which will be used to query data
             * Partion Key (pk): Used to group things by, in our case it is <userId> on which we will group by
             * Sort key (sk): To define the order in which the query result should come back in
             * Both <pk> and <sk> need to be string values
             */
            pk: userId,
            sk: reminderDate.toString(),
        }

        // Writing to dynamo table
        await dynamo.write(data, tableName)

        return formatJSONResponse({
            data: {
                id: data.id,
                message: `Reminder is set for ${new Date(reminderDate).toDateString()}`,
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
                message: 'Email or phone number is required to create the reminder'
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