-- CreateIndex
CREATE INDEX `audit_logs_created_at_idx` ON `audit_logs`(`created_at`);

-- CreateIndex
CREATE INDEX `departments_deleted_at_idx` ON `departments`(`deleted_at`);

-- CreateIndex
CREATE INDEX `media_deleted_at_idx` ON `media`(`deleted_at`);

-- CreateIndex
CREATE INDEX `roles_deleted_at_idx` ON `roles`(`deleted_at`);

-- CreateIndex
CREATE INDEX `user_sessions_expires_at_idx` ON `user_sessions`(`expires_at`);

-- CreateIndex
CREATE INDEX `user_sessions_is_revoked_idx` ON `user_sessions`(`is_revoked`);

-- CreateIndex
CREATE INDEX `user_tokens_expires_at_idx` ON `user_tokens`(`expires_at`);

-- CreateIndex
CREATE INDEX `users_deleted_at_idx` ON `users`(`deleted_at`);

-- CreateIndex
CREATE INDEX `users_isActive_idx` ON `users`(`isActive`);
