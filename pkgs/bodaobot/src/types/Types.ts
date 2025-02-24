export const tgRequestMethod = {
     UNKNOWN: 'unknonw',
     SEND_MESSAGE: 'sendMessage',
     DELETE_MESSAGE: 'deleteMessage',
     DELETE_MESSAGES: 'deleteMessages',
     SEND_MEDIA_GROUP: 'sendMediaGroup',
     SEND_VIDEO: 'sendVideo',
     SEND_PHOTO: 'sendPhoto',
     ANSWER_CALLBACK: 'answerCallbackQuery',
     ANSWER_INLINE: 'answerInlineQuery',
     SEND_CHAT_ACTION: 'sendChatAction',
     GET_FILE: 'getFile'

   } as const;
   
   export type tgRequestMethod_t = typeof tgRequestMethod[keyof typeof  tgRequestMethod];
   