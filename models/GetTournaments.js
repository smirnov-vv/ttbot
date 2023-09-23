import axios from 'axios';
import Base from './Base.js';
import getYearMonth from './helpers.js';

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
    const xTours = await axios.get(`${DB}/x_Tours?filter[]=t_DateTime,sw,${getYearMonth(afterDate)}&filter[]=t_DateTime,sw,${getYearMonth(afterDate, 1)}&satisfy=any`);
    // console.log('\nGetTournaments: There\'re following columns in x_Tours table:');
    // console.log(xTours.data.x_Tours.columns);
    const allTours = xTours.data.x_Tours.records;
    const futureTours = allTours.filter(([, , , tDateTime]) => new Date(tDateTime) > afterDate);

    const toursToDisplay = await futureTours.reduce(async (memo, tour) => {
      const results = await memo; // wait for the previous result
      const [tId, , , tDateTime, , tCourtId, tName, , , , tUrl] = tour;
      const xCourts = await axios.get(`${DB}/x_Courts?filter=c_Id,eq,${Number(tCourtId)}`);
      const courtName = xCourts.data.x_Courts.records[0][1];
      const tourView = tUrl ? `<a href="${tUrl}">${tId}. ${tDateTime} - ${courtName} - ${tName}</a>` : `${tId}. ${tDateTime} - ${courtName} - ${tName}`;
      return [...results, tourView];
    }, []);
    /*
    const maxIter = futureTours.length;
    const toursToDisplay = [];
    for (let i = 0; i < maxIter; i += 1) {
      const [tId, , , tDateTime, , tCourtId, tName, , , , tUrl] = futureTours[i];
      const xCourts = await axios.get(`${DB}/x_Courts?filter=c_Id,eq,${Number(tCourtId)}`);
      const courtName = xCourts.data.x_Courts.records[0][1];
      const tourView = tUrl
        ? `<a href="${tUrl}">${tId}. ${tDateTime} - ${courtName} - ${tName}</a>`
        : `${tId}. ${tDateTime} - ${courtName} - ${tName}`;
      toursToDisplay.push(tourView);
    }
    */
    if (toursToDisplay.length === 0) {
      const msg = { chat_id: update.message.chat.id, text: 'Объявлений о новых турнирах пока нет, попробуйте позже.' };
      await Base.sendMsgToChat(msg);
      return;
    }

    await toursToDisplay.reduce(async (memo, tour) => {
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
