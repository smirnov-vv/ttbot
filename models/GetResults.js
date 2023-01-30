import axios from 'axios';
import Base from './Base.js';

export default class GetResults extends Base {
  static async respond(update) {
    // Get list of all tournaments
    const xTours = await axios.get(`${process.env.DB_API_URL}/x_Tours`);
    console.log(`\nGetResults: Columns in x_Tours table:\n${xTours.data.x_Tours.columns}`);
    const allTours = xTours.data.x_Tours.records;

    // Find tournaments during past two weeks
    const now = new Date();
    const twoWeeksAgo = new Date(new Date().getTime() - (14 * 24 * 3600 * 1000));
    const pastTours = allTours
      .filter((tour) => (now > new Date(tour[3])) && (new Date(tour[3]) > twoWeeksAgo))
      .map(([tId, , , tDateTime, tSite, , tName, , , , tUrl]) => (
        `<a href="${tUrl}">${tId}. ${tDateTime} - ${tSite} - ${tName}</a>`));

    if (pastTours.length === 0) {
      const msg = { chat_id: update.message.chat.id, text: 'За последние две недели не найдено турниров' };
      await Base.sendMsgToChat(msg);
      return;
    }

    pastTours.forEach(async (tour) => {
      const msg = {
        chat_id: update.message.chat.id,
        text: `Результаты турнира:\n${tour}`,
        parse_mode: 'HTML',
      };
      await Base.sendMsgToChat(msg);
    });
  }
}
