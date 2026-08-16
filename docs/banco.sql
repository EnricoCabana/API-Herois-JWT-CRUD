DROP SCHEMA IF EXISTS `universo_herois`;

CREATE SCHEMA IF NOT EXISTS `universo_herois` DEFAULT CHARACTER SET utf8;
USE `universo_herois`;

DROP TABLE IF EXISTS `Herois`;
DROP TABLE IF EXISTS `Viloes`;
DROP TABLE IF EXISTS `Poderes`;

CREATE TABLE IF NOT EXISTS `Poderes` (
  `idPoder` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nomePoder` VARCHAR(100) NOT NULL,
  `descricao` TEXT NULL,
  PRIMARY KEY (`idPoder`),
  UNIQUE INDEX `idPoder_UNIQUE` (`idPoder` ASC),
  UNIQUE INDEX `nomePoder_UNIQUE` (`nomePoder` ASC)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `Herois` (
  `idHeroi` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nomeHeroi` VARCHAR(100) NOT NULL,
  `identidadeSecreta` VARCHAR(100) NULL,
  `Poderes_idPoder` INT UNSIGNED NULL, -- Permite NULL se um herói não tiver poder (ex: Batman)
  PRIMARY KEY (`idHeroi`),
  UNIQUE INDEX `idHeroi_UNIQUE` (`idHeroi` ASC),
  INDEX `fk_Herois_Poderes_idx` (`Poderes_idPoder` ASC),
  CONSTRAINT `fk_Herois_Poderes`
    FOREIGN KEY (`Poderes_idPoder`)
    REFERENCES `Poderes` (`idPoder`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `Viloes` (
  `idVilao` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nomeVilao` VARCHAR(100) NOT NULL,
  `identidadeSecreta` VARCHAR(100) NULL,
  `Poderes_idPoder` INT UNSIGNED NULL,
  PRIMARY KEY (`idVilao`),
  UNIQUE INDEX `idVilao_UNIQUE` (`idVilao` ASC),
  INDEX `fk_Viloes_Poderes_idx` (`Poderes_idPoder` ASC),
  CONSTRAINT `fk_Viloes_Poderes`
    FOREIGN KEY (`Poderes_idPoder`)
    REFERENCES `Poderes` (`idPoder`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

INSERT INTO `Poderes` (`idPoder`, `nomePoder`, `descricao`) VALUES
(1, 'Super Força', 'Capacidade de exercer força física sobre-humana.'),
(2, 'Voo', 'Capacidade de voar sem assistência.'),
(3, 'Rajadas de Energia', 'Capacidade de disparar energia concussiva.'),
(4, 'Intelecto Genial', 'Inteligência e capacidade tática no nível de gênio.'),
(5, 'Regeneração', 'Capacidade de curar ferimentos em ritmo acelerado.');

INSERT INTO `Herois` (`nomeHeroi`, `identidadeSecreta`, `Poderes_idPoder`)
VALUES
('Superman', 'Clark Kent', 1), -- Tem Super Força (neste modelo, só pode ter um)
('Lanterna Verde', 'Hal Jordan', 3), -- Tem Rajadas de Energia
('Batman', 'Bruce Wayne', 4), -- Tem Intelecto Genial
('Wolverine', 'James "Logan" Howlett', 5); -- Tem Regeneração

INSERT INTO `Viloes` (`nomeVilao`, `identidadeSecreta`, `Poderes_idPoder`)
VALUES
('General Zod', 'Dru-Zod', 1), -- Tem Super Força
('Lex Luthor', 'Alexander Luthor', 4), -- Tem Intelecto Genial
('Coringa', 'Desconhecido', NULL), -- Não tem super-poder (FK é NULA)
('Sinestro', 'Thaal Sinestro', 3); -- Tem Rajadas de Energia

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user' ou 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from Herois;

select * from Poderes;

select * from usuarios;

INSERT INTO `usuarios` (`username`, `email`, `password_hash`, `role`)
VALUES
('seu_nome', 'teste@exemplo.com', '$2b$12$R3m3AU4S362lx4XWZQeYOuExGl3S4BP.Nkkbss33BU7Jr72NPFLpm', 'admin');