import axios from 'axios';
import Base from './Base.js';

const ENV = process.env.environment;
const DB = process.env.DB_API_URL;

const inlineKeyboard = {
  inline_keyboard: [
    [
      {
        text: 'Посмотреть список участников',
        callback_data: 'cb_get_participants',
      },
    ],
  ],
};

export default class GetTournaments extends Base {
  static async respond(update) {
    const afterDate = ENV === 'prod' ? new Date() : new Date('2016-10-18T11:24:00');

    // Get list of future tournaments
    const xTours = await axios.get(`${DB}/x_Tours`);
    console.log('\nGetTournaments: There\'re following columns in x_Tours table:');
    console.log(xTours.data.x_Tours.columns);
    const allTours = xTours.data.x_Tours.records;
    const futureTours = allTours.filter((tour) => new Date(tour[3]) > afterDate)
      .map(([tId, , , tDateTime, tSite, , tName, , , , tUrl]) => (tUrl
        ? `<a href="${tUrl}">${tId}. ${tDateTime} - ${tSite} - ${tName}</a>`
        // return `<a href="https://ttbot.smirnov.solutions:${PORT}/announcement?${qsOfAnnouncement}">${tId}. ${tDateTime} - ${tSite} - ${tName}</a>`;
        : `${tId}. ${tDateTime} - ${tSite} - ${tName}`));

    if (futureTours.length === 0) {
      const msg = { chat_id: update.message.chat.id, text: 'Объявлений о новых турнирах пока нет, попробуйте позже.' };
      await Base.sendMsgToChat(msg);
      return;
    }

    await futureTours.reduce(async (memo, tour) => {
      await memo; // wait for the previous result
      const msg = {
        chat_id: update.message.chat.id,
        text: tour,
        reply_markup: inlineKeyboard,
        parse_mode: 'HTML',
      };
      await Base.sendMsgToChat(msg);
    }, undefined);

    /*
    const sendResult = async (tours) => {
      /* eslint-disable-next-line */
    /*
      for (const tour of tours) {
        const msg = {
          chat_id: update.message.chat.id,
          text: tour,
          reply_markup: inlineKeyboard,
          parse_mode: 'HTML',
        };
        /* eslint-disable-next-line */
    /*
        await Base.sendMsgToChat(msg);
      }
    };

    sendResult(futureTours); */

    /*
    futureTours.forEach(async (tour) => {
      const msg = {
        chat_id: update.message.chat.id,
        text: tour,
        reply_markup: inlineKeyboard,
        parse_mode: 'HTML',
      };
      await Base.sendMsgToChat(msg);
    }); */
  }
}
