-- Rode este script no seu banco MySQL (ex: pelo phpMyAdmin, DBeaver ou terminal)

CREATE DATABASE IF NOT EXISTS site_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE site_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Depois de criar sua conta pelo formulário de registro do site,
-- rode o comando abaixo (trocando o e-mail) pra virar admin:
--
-- UPDATE users SET role = 'admin' WHERE email = 'seuemail@email.com';
