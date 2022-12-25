import Base from './Base.js';

export default class Start extends Base {
  async respond(update) {
    const replyKeyborad = {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: 'Связать телеграм аккаунт с сайтом tt-saratov',
            request_contact: true,
          },
        ],
      ],
    };

    const msg = {
      chat_id: update.message.chat.id,
      text: 'Для авторизации на сайте tt-saratov.ru нажмите кнопку снизу. Операция завершится успешно, если в базе сайта есть Ваш номер телефона',
      reply_markup: replyKeyborad,
    };

    await this.sendMsgToChat(msg);
  }
}
