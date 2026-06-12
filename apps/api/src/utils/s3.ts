import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3'
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

/**
 * Delete every object whose key starts with `prefix`. Paginates through
 * ListObjectsV2 in batches of 1000 (S3's per-request cap) and uses
 * DeleteObjects to remove each batch.
 */
export async function deletePrefix(prefix: string): Promise<number> {
  let total = 0
  let continuationToken: string | undefined

  do {
    const list = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    )
    const objects = (list.Contents ?? [])
      .map((obj) => (obj.Key ? { Key: obj.Key } : null))
      .filter((x): x is { Key: string } => x !== null)

    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET,
          Delete: { Objects: objects, Quiet: true },
        }),
      )
      total += objects.length
    }

    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined
  } while (continuationToken)

  return total
}