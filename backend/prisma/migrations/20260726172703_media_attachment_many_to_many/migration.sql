/*
  Warnings:

  - You are about to drop the column `attachable_id` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `attachable_type` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `collection` on the `media` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `media_attachable_type_attachable_id_idx` ON `media`;

-- AlterTable
ALTER TABLE `media` DROP COLUMN `attachable_id`,
    DROP COLUMN `attachable_type`,
    DROP COLUMN `collection`;

-- CreateTable
CREATE TABLE `media_attachments` (
    `id` VARCHAR(191) NOT NULL,
    `media_id` VARCHAR(191) NOT NULL,
    `attachable_type` VARCHAR(191) NOT NULL,
    `attachable_id` VARCHAR(191) NOT NULL,
    `collection` VARCHAR(191) NOT NULL DEFAULT 'default',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `media_attachments_media_id_idx`(`media_id`),
    INDEX `media_attachments_attachable_type_attachable_id_collection_idx`(`attachable_type`, `attachable_id`, `collection`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `media_attachments` ADD CONSTRAINT `media_attachments_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
