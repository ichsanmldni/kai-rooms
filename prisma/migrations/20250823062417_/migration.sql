/*
  Warnings:

  - You are about to drop the column `isVerified` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `verifyToken` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `verifyTokenExpires` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employee` ADD COLUMN `nipp` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `meeting` ADD COLUMN `notes` TEXT NULL,
    MODIFY `title` VARCHAR(255) NOT NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `startTime` DATETIME(3) NULL,
    MODIFY `endTime` DATETIME(3) NULL,
    MODIFY `linkMeet` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `notification` MODIFY `title` TEXT NOT NULL,
    MODIFY `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `isVerified`,
    DROP COLUMN `verifyToken`,
    DROP COLUMN `verifyTokenExpires`,
    ADD COLUMN `nipp` VARCHAR(191) NULL;
