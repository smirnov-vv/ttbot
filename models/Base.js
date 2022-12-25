/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

import axios from 'axios';

const TELEGRAM_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`;

export default class Base {
  async sendMsgToChat(msg) {
    await axios.post(TELEGRAM_URI, msg);
  }

  async getApplicationId(tourId, playerId) {
    // Getting all applications for all tournaments
    const xCallForTour = await axios.get(`${process.env.DB_API_URL}/x_CallForTour`);
    console.log('\nBase.getApplicationId: There\'re following columns in "x_CallForTour" table:');
    console.log(xCallForTour.data.x_CallForTour.columns);
    const allApps = xCallForTour.data.x_CallForTour.records;

    // Find application of the player for the tournament
    const application = allApps.find((app) => (app[1] === tourId && app[3] === playerId));
    console.log(`Base.getApplicationId: if the application is found there will be a result: ${application}`);

    // The application's ID in x_CallForTour table that's stored in cftID field
    const cftID = application?.[0];
    console.log(`Base.getApplicationId: cftId (Id of found record in the table) is ${cftID}`);
    return cftID;
  }

  async getPlayerId(tgusername) {
    // Getting all players from the database
    const xPlayers = await axios.get(`${process.env.DB_API_URL}/x_Players`);
    console.log('\nBase.getPlayerId: There\'re following columns in x_Players table:');
    console.log(xPlayers.data.x_Players.columns);
    const allPlayers = xPlayers.data.x_Players.records;

    // Find player by their phone number of telegram account
    const result = allPlayers.find((player) => player[16] === tgusername);

    // Return the player ID
    const playerId = result?.[0];
    console.log(`Base.getPlayerId: playerId is ${playerId}`);
    console.log(`Base.getPlayerId:  typeof playerId is ${typeof playerId}`);

    return playerId;
  }

  async getPlayerName(tgusername) {
    // Getting all players from the database
    const xPlayers = await axios.get(`${process.env.DB_API_URL}/x_Players`);
    console.log('\nBase.getPlayerName: There\'re following columns in x_Players table:');
    console.log(xPlayers.data.x_Players.columns);
    const allPlayers = xPlayers.data.x_Players.records;

    // Find player by their phone number of telegram account
    const result = allPlayers.find((player) => player[16] === tgusername);
    console.log(`Base.getPlayerName: tgusername is ${tgusername}`);
    console.log(`Base.getPlayerName: typeof tgusername is ${typeof tgusername}`);
    console.log(`Base.getPlayerName: player is ${result}`);

    // Return the player name
    const playerName = result?.[1];
    console.log(`Base.getPlayerName: playerName is ${playerName}`);
    console.log(`Base.getPlayerName: typeof playerName is ${typeof playerName}`);

    return playerName;
  }

  async getParticipants(cbMessage) {
    const tourId = Number(cbMessage.text.split('.')[0]);

    const inlineKeyboard = {
      false: {
        inline_keyboard: [
          [
            {
              text: 'Подать заявку',
              callback_data: 'cb_join',
            },
          ],
        ],
      },
      true: {
        inline_keyboard: [
          [
            {
              text: 'Снять заявку',
              callback_data: 'cb_leave',
            },
          ],
        ],
      },
    };

    // Getting participants list of the tournament
    const vCallForTour = await axios.get(`${process.env.DB_API_URL}/v_CallForTour`);
    console.log('\nBase.GetParticipants: There\'re following columns in v_CallForTour table:');
    console.log(vCallForTour.data.v_CallForTour.columns);
    const allParticipants = vCallForTour.data.v_CallForTour.records;
    const filteredParticipants = allParticipants.filter((user) => user[0] === tourId)
      .map((user, index) => `<a href="${process.env.URL}${user[4]}&mobileview=true">${index + 1}. ${user[2]} - ${Math.round(user[3])}</a>\n`);
    const result = filteredParticipants.join('');
    console.log(`\nBase.GetParticipants: tour's number is ${tourId}`);
    console.log(`\nBase.GetParticipants: list of participants:\n${result}`);

    // Choose suitable keyboard
    const playerId = await this.getPlayerId(cbMessage.chat.username);
    const applicationId = await this.getApplicationId(tourId, playerId);
    let keyboard = '';
    if (applicationId) {
      keyboard = 'true';
    } else {
      keyboard = 'false';
    }

    // Send msg to chat
    const msg = {
      chat_id: cbMessage.chat.id,
      text: `${cbMessage.text}\n${result}`,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: inlineKeyboard[keyboard],
    };

    await this.sendMsgToChat(msg);
  }
}
