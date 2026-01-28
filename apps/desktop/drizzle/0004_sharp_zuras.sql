CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`type` enum('medication','exercise','checkup','custom') NOT NULL,
	`frequency` enum('daily','weekly','monthly','once') NOT NULL,
	`time` varchar(10) NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`lastTriggered` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
