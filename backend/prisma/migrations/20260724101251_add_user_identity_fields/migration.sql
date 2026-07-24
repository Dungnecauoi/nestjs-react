-- AlterTable
ALTER TABLE `users` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `date_of_birth` DATETIME(3) NULL,
    ADD COLUMN `gender` VARCHAR(191) NULL,
    ADD COLUMN `identity_card` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;
