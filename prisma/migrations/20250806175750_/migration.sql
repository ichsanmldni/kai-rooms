/*
  Warnings:

  - You are about to drop the column `autoCancelIfEmpty` on the `setting` table. All the data in the column will be lost.
  - You are about to drop the column `bookingTimeLimitMins` on the `setting` table. All the data in the column will be lost.
  - You are about to drop the column `darkMode` on the `setting` table. All the data in the column will be lost.
  - You are about to drop the column `defaultCapacity` on the `setting` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `setting` table. All the data in the column will be lost.
  - You are about to drop the column `roomStatusUpdate` on the `setting` table. All the data in the column will be lost.
  - You are about to drop the column `timeZone` on the `setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `setting` DROP COLUMN `autoCancelIfEmpty`,
    DROP COLUMN `bookingTimeLimitMins`,
    DROP COLUMN `darkMode`,
    DROP COLUMN `defaultCapacity`,
    DROP COLUMN `language`,
    DROP COLUMN `roomStatusUpdate`,
    DROP COLUMN `timeZone`;
