ALTER TABLE `sales` ADD `time_precision` text DEFAULT 'second' NOT NULL;--> statement-breakpoint
ALTER TABLE `sales` ADD `historical` integer DEFAULT 0 NOT NULL;