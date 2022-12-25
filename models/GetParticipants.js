/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

import Base from './Base.js';

export default class GetParticipants extends Base {
  async respond(update) {
    const cbMessage = update.callback_query.message;
    console.log(`GetParticipants. cbMessage:\n${JSON.stringify(cbMessage)}`);
    await this.getParticipants(cbMessage);
  }
}
