/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `UserRegistration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `UserRegistration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `UserRegistration_name_key` ON `UserRegistration`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `UserRegistration_email_key` ON `UserRegistration`(`email`);
