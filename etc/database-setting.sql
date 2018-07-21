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

--
-- Table structure for table `gamelog`
--

CREATE TABLE `gamelog` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `match_id` VARCHAR(50) NOT NULL UNIQUE,
  `rank` VARCHAR(200) NOT NULL,
  `seed` VARCHAR(50) NOT NULL,
  `reward` VARCHAR(50) NOT NULL,
  `first_login` DATETIME,
  `last_login` DATETIME,
  PRIMARY KEY (`id`)
);