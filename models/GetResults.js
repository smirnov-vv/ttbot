import axios from 'axios';
import Base from './Base.js';
import getYearMonth from './helpers.js';

const DB = process.env.DB_API_URL;

export default class GetResults extends Base {
  static async respond(update) {
    const dateNow = new Date();
    // Get tournaments list of current and previous months
    const xTours = await axios.get(`${DB}/x_Tours?filter[]=t_DateTime,sw,${getYearMonth(dateNow)}&filter[]=t_DateTime,sw,${getYearMonth(dateNow, -1)}&satisfy=any`);
    // console.log(`\nGetResults: Columns in x_Tours table:\n${xTours.data.x_Tours.columns}`);
    // console.log(xTours.data.x_Tours.columns);
    const rawTours = xTours.data.x_Tours.records;

    // Prepare tournaments of past two weeks to display
    const twoWeeksAgo = new Date(new Date().getTime() - (14 * 24 * 3600 * 1000));
    const pastTours = rawTours
      .filter(([, , , tDateTime]) => {
        const dateTour = new Date(tDateTime);
        return (dateNow > dateTour) && (dateTour > twoWeeksAgo);
      })
      .map(([tId, , , tDateTime, tSite, , tName, , , , tUrl]) => (
        `<a href="${tUrl}">${tId}. ${tDateTime} - ${tSite} - ${tName}</a>`));

    if (pastTours.length === 0) {
      const msg = { chat_id: update.message.chat.id, text: 'За последние две недели не найдено турниров' };
      await Base.sendMsgToChat(msg);
      return;
    }

    await pastTours.reduce(async (memo, tour) => {
      await memo; // wait for the previous result
      const msg = {
        chat_id: update.message.chat.id,
        text: `Результаты турнира:\n${tour}`,
        parse_mode: 'HTML',
      };
      await Base.sendMsgToChat(msg);
    }, undefined);

    /*
    pastTours.forEach(async (tour) => {
      const msg = {
        chat_id: update.message.chat.id,
        text: `Результаты турнира:\n${tour}`,
        parse_mode: 'HTML',
      };
      await Base.sendMsgToChat(msg);
    });
    */
  }
}
