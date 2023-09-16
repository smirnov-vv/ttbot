import axios from 'axios';
import Base from './Base.js';

export default class Leave extends Base {
  static async respond(update) {
    const chatId = update.callback_query.message.chat.id;
    const tourId = Number(update.callback_query.message.text.split('.')[0]);
    const tgusername = update.callback_query.from.username;
    const cbMessage = update.callback_query.message;
    const [tourHeader] = cbMessage.text.split('\n');
    cbMessage.text = tourHeader;

    // Check if there's no such player in the DB
    const playerId = await Base.getPlayerId(tgusername);
    console.log(`Leave: playerId is: ${playerId}`);
    if (!playerId) {
      // console.log('Leave: Player Id is not found, next steps won\'t run');
      await Base.sendMsgToChat({ chat_id: chatId, text: 'Вы не привязаны к сайту tt-saratov.ru' });
      return;
    }

    // Check if the player has already left the tour
    const applicationId = await Base.getApplicationId(tourId, playerId);
    if (!applicationId) {
      // console.log('Leave: Guard expression is on, next steps won\'t run');
      await Base.sendMsgToChat({ chat_id: chatId, text: 'Вас не было в заявке на данный турнир' });
      return;
    }

    // Delete application for the tour in the DB
    const response = await axios.delete(`${process.env.DB_API_URL}/x_CallForTour/${applicationId}`);
    console.log(`\nLeave: The number of deleted records is: ${response.data}`);

    // Clear cache on the web-site
    await axios.get('http://tt-saratov.ru/statistics/mvc/?ctrl=Admin&act=ForceClearCache');

    // Show changed participants list
    await Base.getParticipants(cbMessage);
  }
}
