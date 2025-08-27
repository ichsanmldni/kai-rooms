/*
  Warnings:

  - A unique constraint covering the columns `[nipp]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nipp]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `nipp` on table `employee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nipp` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `employee` MODIFY `nipp` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `nipp` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Employee_nipp_key` ON `Employee`(`nipp`);

-- CreateIndex
CREATE UNIQUE INDEX `User_nipp_key` ON `User`(`nipp`);
