ALTER TABLE "Post"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "negativeReportsCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "Like" (
  "id" SERIAL NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" INTEGER NOT NULL,
  "postId" INTEGER NOT NULL,

  CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");
CREATE INDEX "Like_userId_idx" ON "Like"("userId");
CREATE INDEX "Like_postId_idx" ON "Like"("postId");
CREATE INDEX "Post_isActive_idx" ON "Post"("isActive");

ALTER TABLE "Like"
ADD CONSTRAINT "Like_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Like"
ADD CONSTRAINT "Like_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "Post"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
