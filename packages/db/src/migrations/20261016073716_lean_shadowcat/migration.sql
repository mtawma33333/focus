CREATE TABLE `lists` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`name` text NOT NULL,
	`parentId` integer,
	`isArchived` integer DEFAULT false NOT NULL,
	CONSTRAINT `fk_lists_parentId_lists_id_fk` FOREIGN KEY (`parentId`) REFERENCES `lists`(`id`) ON DELETE CASCADE,
	CONSTRAINT "name_length" CHECK(length(trim("name")) between 1 and 100)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`name` text NOT NULL,
	`parentId` integer,
	CONSTRAINT `fk_tags_parentId_tags_id_fk` FOREIGN KEY (`parentId`) REFERENCES `tags`(`id`) ON DELETE CASCADE,
	CONSTRAINT "name_length" CHECK(length(trim("name")) between 1 and 100)
);
--> statement-breakpoint
CREATE TABLE `todo_depends` (
	`todoId` integer NOT NULL,
	`dependsOnId` integer NOT NULL,
	CONSTRAINT `todo_depends_pk` PRIMARY KEY(`todoId`, `dependsOnId`),
	CONSTRAINT `fk_todo_depends_todoId_todos_id_fk` FOREIGN KEY (`todoId`) REFERENCES `todos`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_todo_depends_dependsOnId_todos_id_fk` FOREIGN KEY (`dependsOnId`) REFERENCES `todos`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `todo_tags` (
	`todoId` integer NOT NULL,
	`tagId` integer NOT NULL,
	CONSTRAINT `todo_tags_pk` PRIMARY KEY(`todoId`, `tagId`),
	CONSTRAINT `fk_todo_tags_todoId_todos_id_fk` FOREIGN KEY (`todoId`) REFERENCES `todos`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_todo_tags_tagId_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`createdAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsec') * 1000 as integer)) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'Todo' NOT NULL,
	`listId` integer NOT NULL,
	`dueAt` integer,
	`scheduledAt` integer,
	`waitAt` integer,
	`priority` numeric DEFAULT 0,
	`estimateMinutes` integer,
	`recur` text,
	`parent` integer,
	`doneAt` integer,
	CONSTRAINT `fk_todos_listId_lists_id_fk` FOREIGN KEY (`listId`) REFERENCES `lists`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_todos_parent_todos_id_fk` FOREIGN KEY (`parent`) REFERENCES `todos`(`id`) ON DELETE SET NULL,
	CONSTRAINT "name_length" CHECK(length(trim("name")) between 1 and 100),
	CONSTRAINT "description_length" CHECK(length(trim("description")) between 1 and 1000),
	CONSTRAINT "priority_range" CHECK("priority" between -10 and 10),
	CONSTRAINT "estimateMinutes_range" CHECK("estimateMinutes" > 0),
	CONSTRAINT "doneAt_match_status" CHECK(("doneAt" is NOT NULL) = ("status" = 'Done'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lists_parent_name_unique` ON `lists` (coalesce("parentId", 0),`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_parent_name_unique` ON `tags` (coalesce("parentId", 0),`name`);--> statement-breakpoint
CREATE INDEX `todo_tags_tag_id_idx` ON `todo_tags` (`tagId`);