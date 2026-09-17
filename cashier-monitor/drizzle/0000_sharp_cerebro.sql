CREATE TABLE `mappings` (
	`branch_id` text NOT NULL,
	`register_id` text NOT NULL,
	`device` text NOT NULL,
	`channel` integer NOT NULL,
	`offset_seconds` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`branch_id`, `register_id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`branch_id` text NOT NULL,
	`register_id` text NOT NULL,
	`cashier` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`payment` text NOT NULL,
	`products` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`clip_key` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`next_attempt` integer NOT NULL,
	`lease` text,
	`lease_until` integer,
	`error` text
);
--> statement-breakpoint
CREATE INDEX `idx_sales_created` ON `sales` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_sales_jobs` ON `sales` (`status`,`next_attempt`);