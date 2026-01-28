CREATE TABLE `healthReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`trendAnalysis` text NOT NULL,
	`riskAssessment` text NOT NULL,
	`recommendations` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `healthReports_id` PRIMARY KEY(`id`)
);
