-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `meeting` DROP FOREIGN KEY `Meeting_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `meeting` DROP FOREIGN KEY `Meeting_organizerUnitId_fkey`;

-- DropForeignKey
ALTER TABLE `meetingattendee` DROP FOREIGN KEY `MeetingAttendee_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `meetingattendee` DROP FOREIGN KEY `MeetingAttendee_meetingId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_settingId_fkey`;

-- DropIndex
DROP INDEX `Employee_unitId_fkey` ON `employee`;

-- DropIndex
DROP INDEX `Meeting_createdById_fkey` ON `meeting`;

-- DropIndex
DROP INDEX `Meeting_organizerUnitId_fkey` ON `meeting`;

-- DropIndex
DROP INDEX `MeetingAttendee_employeeId_fkey` ON `meetingattendee`;

-- DropIndex
DROP INDEX `MeetingAttendee_meetingId_fkey` ON `meetingattendee`;

-- DropIndex
DROP INDEX `Notification_userId_fkey` ON `notification`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_settingId_fkey` FOREIGN KEY (`settingId`) REFERENCES `Setting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meeting` ADD CONSTRAINT `Meeting_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meeting` ADD CONSTRAINT `Meeting_organizerUnitId_fkey` FOREIGN KEY (`organizerUnitId`) REFERENCES `Unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeetingAttendee` ADD CONSTRAINT `MeetingAttendee_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeetingAttendee` ADD CONSTRAINT `MeetingAttendee_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
