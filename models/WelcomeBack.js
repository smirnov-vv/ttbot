import Base from './Base.js';

export default class WelcomeBack extends Base {
  static async respond(update) {
    const msg = {
      chat_id: 391389223,
      text: `Somebody initiated my_chat_member update: ${JSON.stringify(update)}`,
    };

    await Base.sendMsgToChat(msg);
  }
}
