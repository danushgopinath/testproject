import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '../config/env'

const s3 = new S3Client({
  region: env.AWS_REGION,
  ...(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
    ? { credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY } }
    : {}),
})

const BUCKET = env.AWS_S3_BUCKET ?? ''

/**
 * Upload a buffer to S3. Returns the object key (not the full URL).
 * Key format: "resumes/{userId}/{timestamp}-{filename}"
 */
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  )
  return key
}

/**
 * Generate a short-lived pre-signed GET URL for a private S3 object.
 * Default expiry: 15 minutes.
 */
export async function getSignedUrl(key: string, expiresInSeconds = 900): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return awsGetSignedUrl(s3, command, { expiresIn: expiresInSeconds })
}