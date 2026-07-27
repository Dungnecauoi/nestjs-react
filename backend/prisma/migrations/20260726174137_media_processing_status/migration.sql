-- AlterTable
ALTER TABLE `media` ADD COLUMN `processing_status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    ADD COLUMN `thumbnail_url` VARCHAR(191) NULL;
