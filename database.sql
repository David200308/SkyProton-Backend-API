CREATE DATABASE BACKEND;
USE BACKEND;

CREATE TABLE users IF NOT EXISTS (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    isVerify BOOLEAN NOT NULL DEFAULT FALSE,
    isThirdParty BOOLEAN NOT NULL DEFAULT FALSE,
    thirdPartyProvider VARCHAR(255),
    thrirdPartyRefreshToken VARCHAR(255),
    thirdPartyId VARCHAR(255)
);

CREATE TABLE payments IF NOT EXISTS (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(255) NOT NULL,
    userId INTEGER NOT NULL,
    type VARCHAR(255) NOT NULL,
    thirdPartyPaymentId VARCHAR(255),
    createAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updateAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status VARCHAR(255) NOT NULL
);

CREATE TABLE points IF NOT EXISTS (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId VARCHAR(255) NOT NULL,
    points INTEGER NOT NULL,
    updateAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
