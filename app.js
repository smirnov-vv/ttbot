import express from 'express';
import path from 'path';

import cookieParser  from 'cookie-parser';
import cors  from 'cors';
import logger  from 'morgan';
import axios from 'axios'
import __dirname  from './dirname.js';

import usersRouter  from './routes/users.js';

const app = express();

const TELEGRAM_URI = 'https://api.telegram.org/bot5481083637:AAHwvT51WLY0v_y8pr2ss0_Bto3Hi-Zh6js/sendMessage';

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use('/users', usersRouter);
app.post('/new-message', async (req, res) => {
  const { message } = req.body
  const messageText = message?.text?.toLowerCase()?.trim()
  const chatId = message?.chat?.id
  if (!messageText || !chatId) {
    return res.sendStatus(400)
  }
  try {
    await axios.post(TELEGRAM_URI, {
      chat_id: chatId,
      text: responseText
    })
    res.send('Done')
  } catch (e) {
    console.log(e)
    res.send(e)
  }
});

app.use(function (req, res, next) {
  res.status(404).json({message: "We couldn't find what you were looking for 😞"})
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).json(err)
})

export default app;
