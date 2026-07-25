-- AlterTable
ALTER TABLE `media` ADD COLUMN `deleted_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `roles` ADD COLUMN `deleted_at` DATETIME(3) NULL;
