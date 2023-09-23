import axios from 'axios';

const TELEGRAM_URI = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/sendMessage`;

const inlineKeyboard = {
  join: {
    inline_keyboard: [
      [
        {
          text: 'Подать заявку',
          callback_data: 'cb_join',
        },
      ],
    ],
  },
  leave: {
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

export default class Base {
  static async sendMsgToChat(msg) {
    await axios.post(TELEGRAM_URI, msg);
  }

  static async getApplicationId(tourId, playerId) {
    // Getting all applications for the tournament
    const xCallForTour = await axios.get(`${process.env.DB_API_URL}/x_CallForTour?filter=cft_TourId,eq,${tourId}`);
    console.log('\nBase.getApplicationId: There\'re following columns in "x_CallForTour" table:');
    console.log(xCallForTour.data.x_CallForTour.columns);
    const allApps = xCallForTour.data.x_CallForTour.records;

    // Find application of the player for the tournament
    const application = allApps.find(([, cftTourId, , cftPlayerId]) => (
      cftTourId === tourId && cftPlayerId === playerId));
    console.log(`Base.getApplicationId: if the application is found there will be a result: ${application}`);

    // The application's ID in x_CallForTour table that's stored in cftID field
    const cftID = application?.[0];
    console.log(`Base.getApplicationId: cftId (Id of found record in the table) is ${cftID}`);
    return cftID;
  }

  static async getPlayerId(tgusername) {
    // Find player in the database with the tgusername
    const xPlayers = await axios.get(`${process.env.DB_API_URL}/x_Players?filter=p_tgusername,eq,${tgusername}`);
    console.log('\nBase.getPlayerId: There\'re following columns in x_Players table:');
    console.log(xPlayers.data.x_Players.columns);
    const player = xPlayers.data.x_Players.records[0];
    const [pId, pName, , , , , , , , , , , , , , , pTgusername] = player;
    console.log(`Base.getPlayerId: found player id: ${pId}, name: ${pName}, tg username: ${pTgusername}`);
    console.log(`Base.getPlayerId: typeof tgusername is ${typeof tgusername}, typeof pId is ${typeof pId}`);
    // Return the player ID
    return pId;
  }

  static async getPlayerName(tgusername) {
    // Find player in the database with the tgusername
    const xPlayers = await axios.get(`${process.env.DB_API_URL}/x_Players?filter=p_tgusername,eq,${tgusername}`);
    console.log('\nBase.getPlayerName: There\'re following columns in x_Players table:');
    console.log(xPlayers.data.x_Players.columns);
    const player = xPlayers.data.x_Players.records[0];
    const [pId, pName, , , , , , , , , , , , , , , pTgusername] = player;
    console.log(`Base.getPlayerName: found player id: ${pId}, name: ${pName}, tg username: ${pTgusername}`);
    console.log(`Base.getPlayerName: typeof tgusername is ${typeof tgusername}, typeof pName is ${typeof pName}`);
    // Return the player name
    return pName || 'Не удалось найти Ваше имя в базе игроков';
  }

  static async getParticipants(cbMessage) {
    const tourId = Number(cbMessage.text.split('.')[0]);

    // Getting participants list of the tournament
    const vCallForTour = await axios.get(`${process.env.DB_API_URL}/v_CallForTour?filter=cft_TourId,eq,${tourId}`);
    console.log(`\nBase.getParticipants: Columns in v_CallForTour:\n${vCallForTour.data.v_CallForTour.columns}\n`);
    const allParticipants = vCallForTour.data.v_CallForTour.records;
    console.log(`Base.getParticipants: allParticipants: \n${allParticipants} isArray(allParticipants): ${Array.isArray(allParticipants)}\n`);
    const participantsToDisplay = allParticipants.map(([, , pName, , profileURLArgs], index) => (
      `<a href="${process.env.URL}${profileURLArgs}&mobileview=true">${index + 1}. ${pName}</a>\n`));
    const participantsList = participantsToDisplay.join('');
    console.log(`\nBase.getParticipants:\nTour's number is ${tourId}\nList of finished participants:\n${participantsList}`);

    // Choose suitable keyboard
    const playerId = await Base.getPlayerId(cbMessage.chat.username);
    const applicationId = await Base.getApplicationId(tourId, playerId);
    const keyboardType = applicationId ? 'leave' : 'join';

    // Send msg to chat
    const tourHeader = cbMessage.text;
    const msg = {
      chat_id: cbMessage.chat.id,
      text: `${tourHeader}\n${participantsList}`,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: inlineKeyboard[keyboardType],
    };

    await Base.sendMsgToChat(msg);
  }
}
