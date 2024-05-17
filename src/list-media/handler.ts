import { APIGatewayProxyHandler } from "aws-lambda";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

/**
 * Lambda function that lists the contents of the specified Amazon S3 bucket
 */
export const main: APIGatewayProxyHandler = async (event) => {
  try {
    const { BUCKET_NAME, BUCKET_REGION } = process.env;

    if (!BUCKET_NAME || !BUCKET_REGION) {
      throw {
        statusCode: 500,
        message: "Invalid lambda environment variables",
      };
    }

    const s3Client = new S3Client({ region: BUCKET_REGION });
    const path = event.queryStringParameters?.path || "";
    
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: path,
    });

    const { Contents } = await s3Client.send(listObjectsCommand);

    const files = Contents ? Contents.map((obj: any) => obj.Key) : [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        error: false,
        data: files,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: error.statusCode ?? 500,
      body: JSON.stringify({
        error: true,
        message: error.message,
      }),
    };
  }
};
