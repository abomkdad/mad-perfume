CREATE TABLE `integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`updated_at` integer NOT NULL,
	`last_success` integer NOT NULL
);
