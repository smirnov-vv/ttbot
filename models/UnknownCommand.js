/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */

import Base from './Base.js';
/*
const findChatId = (obj) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      console.log(`${key} - ${typeof obj[key]}`);
      if (typeof obj[key] === 'object') {
        if (key === 'chat') {
          console.log(`I found id: ${obj[key].id}`);
          this.chat_id = obj[key].id;
          return;
        }
        findChatId(obj[key]);
      }
    }
  }
  return;
}; */

const findChatId = (obj) => {
  let currentLevelObj = obj;
  console.log(`searching chat Id...\n${currentLevelObj}`);
  if (currentLevelObj[0] === 'chat') {
    console.log(currentLevelObj[1].id);
    return currentLevelObj[1].id;
  }
  if ((typeof currentLevelObj === 'object') && (!Array.isArray(obj))) {
    currentLevelObj = Object.entries(obj);
    console.log(currentLevelObj);
  }
  if (!Array.isArray(currentLevelObj)) {
    console.log('-----');
    return [];
  }
  console.log('-----');
  const children = currentLevelObj.flatMap(findChatId);
  return children;
};

export default class UnknownCommand extends Base {
  async respond(update) {
    const resultArray = findChatId(Object.entries(update));
    const chatId = resultArray[0];
    console.log(`UnknownCommand: chatId is ${chatId}, type of chatId is ${typeof chatId}`);

    let msg = '';
    if (chatId) {
      msg = {
        chat_id: chatId,
        text: 'Я не знаю такой комманды',
      };
    } else {
      throw 'Somebody sent something unknown, without chat.id';
    }

    await this.sendMsgToChat(msg);
  }
}
