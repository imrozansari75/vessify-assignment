/*
  Warnings:

  - Added the required column `date` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `confidence` on table `transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "balance" DOUBLE PRECISION,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "confidence" SET NOT NULL;
