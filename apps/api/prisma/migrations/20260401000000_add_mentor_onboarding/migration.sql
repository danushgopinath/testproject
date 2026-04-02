-- AlterTable: Add mentor onboarding fields to GuideProfile
ALTER TABLE "GuideProfile" ADD COLUMN "phone" TEXT;
ALTER TABLE "GuideProfile" ADD COLUMN "linkedinUrl" TEXT;
ALTER TABLE "GuideProfile" ADD COLUMN "githubUrl" TEXT;
ALTER TABLE "GuideProfile" ADD COLUMN "resumeFileName" TEXT;
ALTER TABLE "GuideProfile" ADD COLUMN "resumeData" TEXT;
ALTER TABLE "GuideProfile" ADD COLUMN "resumeIsPublic" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable: Education
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "guideProfileId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Experience
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "guideProfileId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_guideProfileId_fkey" FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_guideProfileId_fkey" FOREIGN KEY ("guideProfileId") REFERENCES "GuideProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;