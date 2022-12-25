/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

// import dotenv from 'dotenv';
// dotenv.config();

import express from 'express';
import path from 'path';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import __dirname from './dirname.js';

import router from './routes/new-message.js';
import announcement from './routes/announcement.js';

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'pug');
/*
app.use((req, res, next) => {
  console.log(`req.baseUrl is ${req.baseUrl} and its type is ${typeof req.baseUrl}`);
  console.log(`req.hostname is ${req.hostname} and its type is ${typeof req.hostname}`);
  console.log(`req.originalUrl is ${req.originalUrl} and its type is ${typeof req.originalUrl}`);
  console.log(`req.subdomains is\n${req.subdomains}\nand its type is ${typeof req.subdomains}\n isArray: ${Array.isArray(req.subdomains)}`);
  next();
});
*/
app.use(express.static(path.join(__dirname, 'public')));
app.use('/health-check', (req, res) => res.sendStatus(200));
app.use('/new-message', router);
app.use('/announcement', announcement);

app.use((req, res, next) => {
  res.status(404).json({ message: "We couldn't find what you were looking for 😞" });
});

app.use((err, req, res, next) => {
  console.log('app.js: catch');
  console.error(err.stack);
  res.status(500).json(err);
});

export default app;
