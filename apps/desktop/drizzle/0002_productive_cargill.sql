CREATE TABLE `healthRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('weight','blood_pressure','heart_rate','blood_sugar','temperature') NOT NULL,
	`value` text NOT NULL,
	`unit` varchar(20) NOT NULL,
	`note` text,
	`recordedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `healthRecords_id` PRIMARY KEY(`id`)
);
