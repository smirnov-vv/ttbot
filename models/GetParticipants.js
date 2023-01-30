import Base from './Base.js';

export default class GetParticipants extends Base {
  static async respond(update) {
    const cbMessage = update.callback_query.message;
    console.log(`GetParticipants. cbMessage:\n${JSON.stringify(cbMessage)}`);
    await Base.getParticipants(cbMessage);
  }
}
