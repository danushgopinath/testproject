-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyMarketing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyNewMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySessionConfirmed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySessionReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySessionRequests" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "profileIsPublic" BOOLEAN NOT NULL DEFAULT true;
