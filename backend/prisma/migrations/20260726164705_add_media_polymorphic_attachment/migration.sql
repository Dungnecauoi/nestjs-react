-- AlterTable
ALTER TABLE `media` ADD COLUMN `attachable_id` VARCHAR(191) NULL,
    ADD COLUMN `attachable_type` VARCHAR(191) NULL,
    ADD COLUMN `collection` VARCHAR(191) NULL DEFAULT 'default';

-- CreateIndex
CREATE INDEX `media_attachable_type_attachable_id_idx` ON `media`(`attachable_type`, `attachable_id`);
