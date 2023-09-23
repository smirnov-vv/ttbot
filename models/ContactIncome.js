import axios from 'axios';
import Base from './Base.js';

export default class ContactIncome extends Base {
  static async respond(update) {
    const phoneNumber = update.message.contact.phone_number;
    const chatId = update.message.chat.id;
    const DB = process.env.DB_API_URL;

    // If someone else's contact was shared
    if (update.message.contact.vcard) {
      await Base.sendMsgToChat({ chat_id: chatId, text: 'Если вы сейчас отправили свой контакт, обратитесь к администрации сайта tt-saratov.ru' });
      return;
    }

    // Find player with shared phone number
    const xPlayers = await axios.get(`${DB}/x_Players?filter=p_Contacts,cs,${phoneNumber.slice(-10)}`);
    // console.log('\nContactIncome: There\'re following columns in x_Players table:');
    // console.log(xPlayers.data.x_Players.columns);
    const players = xPlayers.data.x_Players.records;

    // Find player who owns shared phone number
    // const player = allPlayers.find((item) => item[5]?.slice(-10) === phoneNumber.slice(-10));
    // console.log('\nContactIncome: Found player is');
    // console.log(player);
    // console.log('\nContactIncome: the player\'s ID in the DB is');
    const playerId = Number(players[0][0]);
    // console.log(playerRecord);
    // console.log('\nContactIncome: preparing to record username: ');
    // console.log(`tg username is ${update.message.from.username}`);
    // console.log(`type of tg username is ${typeof update.message.from.username}`);

    // If there's no such player then stop
    if (players.length === 0) {
      await Base.sendMsgToChat({ chat_id: chatId, text: 'Номер Вашего телефона не найден в базе сайта tt-saratov.ru, обратитесь к администрации сайта tt-saratov.ru' });
      return;
    }

    // Otherwise update player's record in the DB
    // const putUsername = await axios.put(
    await axios.put(
      `${DB}/x_Players/${playerId}`,
      {
        p_tgusername: `${update.message.from.username}`,
      },
    );

    // const foundPlayer = await axios.get(`${DB}/x_Players/${playerRecord}`); // just to check
    // await axios.get(`${DB}/x_Players/${playerId}`); // just to check
    // console.log('foundPlayer directly from the DB');
    // console.log(foundPlayer.data);
    // console.log(`their typeof p_tgusername is ${typeof foundPlayer.data.p_tgusername}`);

    // Result of putUsername
    // console.log(`ContactIncome: ${putUsername.data} records was updated`);

    const playerName = await Base.getPlayerName(update.message.from.username);

    await Base.sendMsgToChat({ chat_id: chatId, text: `Ваш телеграм аккаунт привязан к игроку по имени ${playerName}, если это не Вы обратитесь к администрации сайта` });
  }
}
