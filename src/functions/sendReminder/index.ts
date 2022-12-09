import { DynamoDBStreamEvent } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { SNSClient, PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";

const sesClient = new SESClient({})
const snsClient = new SNSClient({})

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
                await sendSMS({ phoneNumber, reminder })
            }

            if (email) {
                await sendEmail({ email, reminder })
            }
        })

        await Promise.all(reminderPromises)
    } catch (error) {
        console.log('Error', error)
    }
}

const sendEmail = async ({
    email,
    reminder
}: {
    email: string,
    reminder: string
}) => {
    // SendEmailCommandInput will prepare the input data to send email from SES
    const params: SendEmailCommandInput = {
        Source: 'batch17.94@gmail.com',
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Subject: {
                Charset: 'UTF-8',
                Data: 'Your Reminder!'
            },
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: reminder
                }
            }
        }
    }

    // SendEmailCommand will create the command for sending email
    const command = new SendEmailCommand(params)
    const response = await sesClient.send(command)

    return response.MessageId
}

const sendSMS = async ({
    phoneNumber,
    reminder
}: {
    phoneNumber: string,
    reminder: string
}) => {
    // PublishCommandInput will prepare the input data to send SMS from SNS
    const params: PublishCommandInput = {
        PhoneNumber: phoneNumber,
        Message: reminder
    }

    // PublishCommand will create the command for sending SMS
    const command = new PublishCommand(params)
    const response = await snsClient.send(command)

    return response.MessageId
}