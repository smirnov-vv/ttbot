import Base from './Base.js';

export default class TextIncome extends Base {
  async respond(update) {
    const msg = {
      chat_id: update.message.chat.id,
      text: `Вы написали: "_${update.message.text.trim()}_". Но я не умею обрабатывать текстовые команды`,
      parse_mode: 'Markdown',
    };

    await this.sendMsgToChat(msg);
  }
}
