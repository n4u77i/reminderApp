import { DynamoDBStreamEvent } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

export const handler = async (event: DynamoDBStreamEvent) => {
    try {
        const reminderPromises = event.Records.map(async (record) => {
            /**
             * Unmarshalling is the process of converting data from DynamoDB JSON format to normal JSON format
             * DynamoDB JSON format: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.LowLevelAPI.html
             * 
             * Explicitly defining the type of <record.dynamodb.OldImage> if the <OldImage> doesn't exist instead if we had set it to <NewImage>
             */
            const data = unmarshall(record.dynamodb.OldImage as Record<string, AttributeValue>)

            const { email, phoneNumber, reminder } = data

            if (phoneNumber) {
                // TODO: Implement with SNS
                // await sendSMS({ phoneNumber, reminder })
            }

            if (email) {
                // TODO: Implement with SES
                // await sendEmail({ email, reminder })
            }
        })

        await Promise.all(reminderPromises)
    } catch (error) {
        console.log('Error', error)
    }
}