/*
  Warnings:

  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Request";

-- DropEnum
DROP TYPE "HttpMethods";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Connections" (
    "id" SERIAL NOT NULL,
    "connection" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connections_pkey" PRIMARY KEY ("id")
);
