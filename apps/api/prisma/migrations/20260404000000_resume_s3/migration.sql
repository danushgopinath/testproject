-- Migration: swap resumeData (base64 blob) for resumeUrl (S3 object key)
ALTER TABLE "GuideProfile" ADD COLUMN "resumeUrl" TEXT;
ALTER TABLE "GuideProfile" DROP COLUMN IF EXISTS "resumeData";