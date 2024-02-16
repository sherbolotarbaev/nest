/*
  Warnings:

  - Added the required column `lastViewAt` to the `Views` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Views" ADD COLUMN     "lastViewAt" TEXT NOT NULL;
