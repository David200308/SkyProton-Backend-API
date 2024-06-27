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
# # .env file: if use docker container for Backend API & the Database host at local -> use "host.docker.internal"
$ docker-compose up -d
```
