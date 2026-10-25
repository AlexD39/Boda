CREATE TABLE `invitations` (
	`id` text PRIMARY KEY DEFAULT 'main' NOT NULL,
	`config` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guest_name` text NOT NULL,
	`attendance` text NOT NULL,
	`guests` integer DEFAULT 1 NOT NULL,
	`dietary` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`invitation_code` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
