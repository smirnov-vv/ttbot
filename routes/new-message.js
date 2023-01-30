import express from 'express';
import axios from 'axios';

import TextIncome from '../models/TextIncome.js';
import ContactIncome from '../models/ContactIncome.js';
import Start from '../models/Start.js';
import GetTournaments from '../models/GetTournaments.js';
import GetParticipants from '../models/GetParticipants.js';
import GetResults from '../models/GetResults.js';
import Join from '../models/Join.js';
import Leave from '../models/Leave.js';
import WelcomeBack from '../models/WelcomeBack.js';
import UnknownCommand from '../models/UnknownCommand.js';

const router = express.Router();
const TELEGRAM_LOGS_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_LOGS_TOKEN}/sendMessage`;

const classes = {
  text: TextIncome,
  contact: ContactIncome,
  start: Start,
  get_tournaments: GetTournaments,
  get_results: GetResults,
  cb_get_participants: GetParticipants,
  cb_join: Join,
  cb_leave: Leave,
  welcomeBack: WelcomeBack,
  unknown: UnknownCommand,
};

const updateTypes = [
  {
    checkCondition: (update) => update.callback_query !== undefined,
    getUpdateType: (update) => update.callback_query.data,
  },
  {
    checkCondition: (update) => update.message !== undefined,
    getUpdateType: (update) => {
      const knownMsgTypes = ['text', 'contact'];
      const incomingMsgTypes = Object.keys(update.message);
      const msgType = knownMsgTypes.find((item) => incomingMsgTypes.includes(item));

      const botCommand = update.message.entities?.[0].type === 'bot_command'
        ? update.message.text.toLowerCase().trim().slice(1)
        : undefined;
      const knownBotCmds = ['start', 'get_tournaments', 'get_results'];
      const isBotCmdRight = knownBotCmds.includes(botCommand);

      const result = isBotCmdRight ? botCommand : msgType || 'unknown';
      console.log(`msgType is: ${result}\n`);
      return result;
    },
  },
  {
    checkCondition: (update) => update.my_chat_member !== undefined,
    getUpdateType: () => 'welcomeBack',
  },
];

const getStrategy = (update) => {
  const { getUpdateType } = updateTypes.find(({ checkCondition }) => checkCondition(update));
  const updateType = getUpdateType ? getUpdateType(update) : 'unknown';
  const ClassName = classes[updateType];
  return ClassName;
};

/* new messages listing. */
router.post('/', async (req, res) => {
  const update = req.body;
  console.log(`\nNew-message. Incoming update:\n ${JSON.stringify(update)}\n`);
  const strategy = getStrategy(update);

  try {
    await strategy.respond(update);
    res.send('Done'); // Should it be here? If I get correct update anyway. In order to escape an attack?
  } catch (e) {
    console.log('\nCaught an error:');
    console.log(e);

    let error = '';
    if (e.response) {
      error = `The request was made and the server responded with
      error.response.data:
      ${JSON.stringify(e.response.data)}\n
      error.response.headers:
      ${JSON.stringify(e.response.headers)}\n
      error.response.config:
      ${JSON.stringify(e.response.config)}\n`;
    } else if (e.request) {
      error = `The request was made but no response was received
      error.cause:
      ${e.cause}\n
      error.config:
      ${JSON.stringify(e.config)}`;
    } else {
      error = `Something happened in setting up the request that triggered the error:\n${e}`;
    }

    const msg = {
      chat_id: 391389223,
      text: `An error ocurred.\n\ncoming Update object:\n${JSON.stringify(update)}\n\nError:\n${error}`,
      disable_web_page_preview: true,
    };
    axios.post(TELEGRAM_LOGS_URI, msg);
    res.send(e); // Do i need it? As I understand after this telegram trying to repeat update
  }
});

export default router;
