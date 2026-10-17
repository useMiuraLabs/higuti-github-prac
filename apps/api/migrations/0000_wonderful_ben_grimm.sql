CREATE TABLE `shops` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`area` text NOT NULL,
	`genre` text NOT NULL,
	`status` text NOT NULL,
	`map_url` text,
	`rating` integer,
	`memo` text,
	`image_url` text,
	`visited_at` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	CONSTRAINT "shops_status_check" CHECK("shops"."status" IN ('want_to_go', 'visited')),
	CONSTRAINT "shops_created_by_check" CHECK("shops"."created_by" IN ('miura', 'yuma')),
	CONSTRAINT "shops_rating_check" CHECK("shops"."rating" BETWEEN 1 AND 5)
);
