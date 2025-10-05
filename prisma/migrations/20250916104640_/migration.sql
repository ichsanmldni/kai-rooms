/*
  Warnings:

  - A unique constraint covering the columns `[nipp]` on the table `UserRegistration` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `UserRegistration_name_key` ON `userregistration`;

-- CreateIndex
CREATE UNIQUE INDEX `UserRegistration_nipp_key` ON `UserRegistration`(`nipp`);
