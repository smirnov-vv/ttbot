/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

import axios from 'axios';
import Base from './Base.js';
// import GetList from './GetList.js';

export default class Leave extends Base {
  async respond(update) {
    const chatId = update.callback_query.message.chat.id;
    const tourId = Number(update.callback_query.message.text.split('.')[0]);
    const tgusername = update.callback_query.from.username;
    const cbMessage = update.callback_query.message;
    cbMessage.text = cbMessage.text.split('\n')[0];

    // Check if there's no such player in the DB
    const playerId = await this.getPlayerId(tgusername);
    console.log(`Leave: playerId is: ${playerId}`);
    if (!playerId) {
      console.log('Leave: Player Id is not found, next steps won\'t run');
      await this.sendMsgToChat({ chat_id: chatId, text: 'Вы не привязаны к сайту tt-saratov.ru' });
      return;
    }

    // Check if the player has already left the tour
    const applicationId = await this.getApplicationId(tourId, playerId);
    if (!applicationId) {
      console.log('Leave: Guard expression is on, next steps won\'t run');
      await this.sendMsgToChat({ chat_id: chatId, text: 'Вас не было в заявке на данный турнир' });
      return;
    }

    // Delete application for the tour in the DB
    const response = await axios.delete(`${process.env.DB_API_URL}/x_CallForTour/${applicationId}`);
    console.log(`\nLeave: The number of deleted records is: ${response.data}`);

    // Show changed participants list
    await this.getParticipants(cbMessage);
  }
}
