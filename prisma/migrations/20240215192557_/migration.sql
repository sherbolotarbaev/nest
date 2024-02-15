-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "status" SET DEFAULT 'SUCCESS';

-- CreateTable
CREATE TABLE "Views" (
    "id" SERIAL NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "Views_pkey" PRIMARY KEY ("id")
);
