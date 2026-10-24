CREATE TABLE `approach_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sort` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sort` integer NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sort` integer NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`year` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`url` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`published` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`hero_title` text DEFAULT '' NOT NULL,
	`hero_title_accent` text DEFAULT '' NOT NULL,
	`hero_text` text DEFAULT '' NOT NULL,
	`hero_cta_primary` text DEFAULT '' NOT NULL,
	`hero_cta_secondary` text DEFAULT '' NOT NULL,
	`stack_eyebrow` text DEFAULT '' NOT NULL,
	`stack_title` text DEFAULT '' NOT NULL,
	`stack_subtitle` text DEFAULT '' NOT NULL,
	`projects_eyebrow` text DEFAULT '' NOT NULL,
	`projects_title` text DEFAULT '' NOT NULL,
	`approach_eyebrow` text DEFAULT '' NOT NULL,
	`approach_title` text DEFAULT '' NOT NULL,
	`contact_eyebrow` text DEFAULT '' NOT NULL,
	`contact_title` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`footer_year` text DEFAULT '' NOT NULL,
	`seo_title` text DEFAULT '' NOT NULL,
	`seo_description` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stack_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sort` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL
);
