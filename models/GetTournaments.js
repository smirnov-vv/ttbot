/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

import axios from 'axios';
import Base from './Base.js';

const ENV = process.env.ENV;
const DB = process.env.DB_API_URL;

export default class GetTournaments extends Base {
  async respond(update) {
    let afterDate;
    if (ENV === 'prod') {
      afterDate = new Date();
    } else {
      afterDate = new Date('2016-10-18T11:24:00');
    }

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

    // Get list of future tournaments
    const xTours = await axios.get(`${DB}/x_Tours`);
    console.log('\nGetTournaments: There\'re following columns in x_Tours table:');
    console.log(xTours.data.x_Tours.columns);
    const allTours = xTours.data.x_Tours.records;
    const futureTours = allTours.filter((tour) => new Date(tour[3]) > afterDate)
      .map((tour) => {
        const tId = tour[0];
        const tDateTime = tour[3];
        const tSite = tour[4];
        const tName = tour[6];
        const tUrl = tour[10];
        const qsOfAnnouncement = tour[10]?.split('?')[1];

        // Check if provided URL has a query string
        if (qsOfAnnouncement) {
          // return `<a href="https://ttbot.smirnov.solutions:${PORT}/announcement?${qsOfAnnouncement}">${tId}. ${tDateTime} - ${tSite} - ${tName}</a>`;
          return `<a href="${tUrl}">${tId}. ${tDateTime} - ${tSite} - ${tName}</a>`;
        }
        return `${tId}. ${tDateTime} - ${tSite} - ${tName}`;
      });

    if (futureTours.length === 0) {
      const msg = {
        chat_id: update.message.chat.id,
        text: 'Объявлений о новых турнирах пока нет, попробуйте позже.',
      };
      await this.sendMsgToChat(msg);
      return;
    }

    const sendResult = async (tours) => {
      for (const tour of tours) {
        const msg = {
          chat_id: update.message.chat.id,
          text: tour,
          reply_markup: inlineKeyboard,
          parse_mode: 'HTML',
        };
        await this.sendMsgToChat(msg);
      }
    };

    sendResult(futureTours);

    /*
    futureTours.forEach(async (tour) => {
      const msg = {
        chat_id: update.message.chat.id,
        text: tour,
        reply_markup: inlineKeyboard,
        parse_mode: 'HTML',
      };
      await this.sendMsgToChat(msg);
    }); */
  }
}
