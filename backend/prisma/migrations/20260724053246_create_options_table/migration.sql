-- CreateTable
CREATE TABLE `options` (
    `id` VARCHAR(191) NOT NULL,
    `option_name` VARCHAR(191) NOT NULL,
    `option_value` TEXT NULL,
    `autoload` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `options_option_name_key`(`option_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
