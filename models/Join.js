/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

import axios from 'axios';
import Base from './Base.js';

export default class Join extends Base {
  async respond(update) {
    const chatId = update.callback_query.message.chat.id;
    const tourId = Number(update.callback_query.message.text.split('.')[0]);
    const tgusername = update.callback_query.from.username;
    const cbMessage = update.callback_query.message;
    cbMessage.text = cbMessage.text.split('\n')[0];

    // Check if there's no such player in the DB
    const playerId = await this.getPlayerId(tgusername);
    console.log(`Join: playerId is: ${playerId}`);
    if (!playerId) {
      console.log('Join: Player ID is not found, next steps won\'t run');
      await this.sendMsgToChat({ chat_id: chatId, text: 'Вы не привязаны к сайту tt-saratov.ru' });
      return;
    }

    // Check if the player has already joined the tour
    const applicationId = await this.getApplicationId(tourId, playerId);
    if (applicationId) {
      console.log('Join: Guard expression is on, next steps won\'t run');
      await this.sendMsgToChat({ chat_id: chatId, text: 'Вы уже есть в заявке на данный турнир' });
      return;
    }

    // Add application for the tour to the DB
    const response = await axios.post(
      `${process.env.DB_API_URL}/x_CallForTour`,
      {
        cft_TourId: tourId,
        cft_PlayerId: playerId,
      },
    );
    console.log(`\nJoin: In the table record №${response.data} was added`);

    // Show changed participants list
    await this.getParticipants(cbMessage);
  }
}
