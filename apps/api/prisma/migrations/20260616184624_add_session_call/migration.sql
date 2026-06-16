-- CreateTable
CREATE TABLE "SessionCall" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "dailyRoomName" TEXT NOT NULL,
    "dailyRoomUrl" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionCall_sessionId_key" ON "SessionCall"("sessionId");

-- AddForeignKey
ALTER TABLE "SessionCall" ADD CONSTRAINT "SessionCall_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
