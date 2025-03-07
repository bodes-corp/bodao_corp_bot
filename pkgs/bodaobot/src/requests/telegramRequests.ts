import TG_BOT from "../telegram_bot";

/**
 * create a object with items to send a message to the 
 * CHAT of the BOT and to a specif thread (topic)
 * @param bot the TG_BOT object
 * @param text the text of the message
 * @param id_thread the thread (topic) to send the message
 * @param message_id the message_id to respond
 * @returns the object with the request
 */
export function MessageThreadRequest(bot:TG_BOT, text:string, id_thread:any, message_id:any): Record<string, any> {
          const params = {
               chat_id: bot.botINFO.CHATID,
               message_thread_id: id_thread,
               text,
               parse_mode: 'html',
               disable_notification: 'true',
               reply_to_message_id: message_id
          }
          return params; 
}

export function MessageToBotTopicWithMarkup(bot:TG_BOT,text: string,markup:any): tgOptions.sendMessage{
     const params = {
          text: text,
          chat_id: bot.botINFO.CHATID,
          message_thread_id:Number(bot.botINFO.THREADBOT), //without this the message goes to general thread of the chat
          reply_markup: markup
      }
      return params;
}

export function MediaGroup(bot:TG_BOT,media:(tgTypes.InputMediaAudio | tgTypes.InputMediaDocument | tgTypes.InputMediaPhoto | tgTypes.InputMediaVideo)[]): tgOptions.sendMediaGroup{
     const params = {
          chat_id: bot.botINFO.CHATID,
          message_thread_id: Number(bot.botINFO.THREADBOT),
          media,
          disable_notification: true
     }
     return params;
 
}

export function sendButtonToBotThread(bot: TG_BOT,text:string, buttonsMarkup:any) {
     const param = {
          chat_id: bot.botINFO.CHATID,
          message_thread_id: Number(bot.botINFO.THREADBOT),
          reply_markup:JSON.stringify( { inline_keyboard: buttonsMarkup }),
          text,
          disable_notification: true
     }
     return param
}