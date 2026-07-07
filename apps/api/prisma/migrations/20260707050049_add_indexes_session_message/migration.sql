-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_isRead_idx" ON "Message"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX "Message_sessionId_idx" ON "Message"("sessionId");

-- CreateIndex
CREATE INDEX "Session_seekerId_status_idx" ON "Session"("seekerId", "status");

-- CreateIndex
CREATE INDEX "Session_guideId_status_idx" ON "Session"("guideId", "status");

-- CreateIndex
CREATE INDEX "Session_status_scheduledAt_idx" ON "Session"("status", "scheduledAt");
