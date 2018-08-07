--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(50) NOT NULL,
  `email` VARCHAR(50),
  `first_login` DATETIME,
  `last_login` DATETIME,
  PRIMARY KEY (`id`)
);

INSERT INTO `user` (
`user_id`, `password`, `first_login`, `last_login`
) 
VALUES (
"test2", "test2", NOW(), NOW()
);

--
-- Table structure for table `user_gamedata`
--

CREATE TABLE `user_gamedata` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(50) NOT NULL UNIQUE,
  `level` INT DEFAULT 1,
  `rating` INT DEFAULT 0,
  `coin` INT DEFAULT 0,
  `card` VARCHAR(1000),
  `party` VARCHAR(100),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO `user_gamedata` (
`user_id`, `card`, `party`
) 
VALUES (
"test2", "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21", "1,2,3"
);

--
-- Table structure for table `user_gamestat`
--

CREATE TABLE `user_gamestat` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(50) NOT NULL UNIQUE,
  `total_games_played` INT DEFAULT 0,
  `solo_four_games_played` INT DEFAULT 0,
  `solo_two_games_played` INT DEFAULT 0,
  `team_four_games_played` INT DEFAULT 0,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO `user_gamestat` (
`user_id`
) 
VALUES (
"test2"
);

--
-- Table structure for table `gamelog`
--

CREATE TABLE `gamelog` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `room_id` VARCHAR(50) NOT NULL UNIQUE,
  `rank` VARCHAR(200) DEFAULT "0",
  `seed` VARCHAR(50) DEFAULT "0",
  `reward` VARCHAR(50) DEFAULT "0",
  `start_time` DATETIME,
  `end_time` DATETIME,
  PRIMARY KEY (`id`)
);