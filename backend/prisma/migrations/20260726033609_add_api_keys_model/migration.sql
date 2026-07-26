-- CreateTable
CREATE TABLE `api_keys` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `key_hash` TEXT NOT NULL,
    `permissions` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_used_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
