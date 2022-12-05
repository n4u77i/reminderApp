import type { AWS } from '@serverless/typescript';

const functions: AWS["functions"] = {
    // Any function name
    setUrl: {
        // Lambda function path
        handler: 'src/functions/setUrl/index.handler',

        // Event to trigger lambda function
        events: [
            {
                httpApi: {
                    path: '/',
                    method: 'post'
                }
            }
        ]
    },

    getUrl: {
        // Lambda function path
        handler: 'src/functions/getUrl/index.handler',

        // Event to trigger lambda function
        events: [
            {
                httpApi: {
                    path: '/{code}',                                // Code is a variable passed in the path of url i.e https://some-url/646353
                    method: 'get'
                }
            }
        ]
    }
}

export default functions