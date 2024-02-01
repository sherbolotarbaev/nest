-- CreateTable
CREATE TABLE "Requests" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "location" JSONB,
    "lastVisit" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Requests_pkey" PRIMARY KEY ("id")
);
