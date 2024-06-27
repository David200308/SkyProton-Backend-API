# Backend API

## Framework
- Backend - Nest.JS (with Express.JS)
- Database - MySQL
- Container - Docker

## Auth Services
- Email & Password
- Google OAuth
- Facebook OAuth

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running on Docker

```bash
$ docker-compose up -d

# .env file: if use docker container for Backend API & the Database host at local -> use "host.docker.internal"
#
# Windows & MacOS: 
#     - just add to dotenv file
#
# Linux:
# 		- a) under /etc/mysql/mysql.conf.d/, mysql.cnf is a blank file; mysqld.cnf had bind-address and mysqlx-bind-address both = 127.0.0.1, I changed only the bind-address to 127.0.0.1,host.docker.internal thensystemctl restart mysql
#     - b) added an entry 172.17.0.1 host.docker.internal to /etc/hosts before
#     - c) CREATE USER 'backend'@'%' IDENTIFIED BY '<password>';
#     - d) GRANT ALL PRIVILEGES ON BACKEND.* to 'backend'@'%';
#
#	Case for Linux Solution souce: https://forums.docker.com/t/nodejs-docker-container-cant-connect-to-mysql-on-host/115221/6
# Thanks @drakeorfeo & @matthiasradde
```
