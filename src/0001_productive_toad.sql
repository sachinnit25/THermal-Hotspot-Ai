CREATE TABLE `hotspots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(128) NOT NULL,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`detectedAt` timestamp NOT NULL,
	`source` varchar(64) NOT NULL,
	`satelliteConfidence` double,
	`classification` enum('industrial','wildfire','agricultural','gas_flare','mining','unknown') NOT NULL DEFAULT 'unknown',
	`assessmentConfidence` double,
	`industrialRisk` double,
	`evidenceJson` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hotspots_id` PRIMARY KEY(`id`),
	CONSTRAINT `hotspots_externalId_unique` UNIQUE(`externalId`)
);
