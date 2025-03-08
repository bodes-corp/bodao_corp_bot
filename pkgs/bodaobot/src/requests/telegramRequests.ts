import TG_BOT from "../telegram_bot";

/**
 * create a object with items to send a message to the 
 * CHAT of the BOT and to a specif thread (topic)
 * @param bot the TG_BOT object
 * @param text the text of the message
 * @param id_thread the thread (topic) to send the message
 * @param message_id the message_id to reply
 * @returns the object with the request
 */
export function MessageReplyThreadRequest(bot:TG_BOT, text:string, id_thread:any, message_id:any): Record<string, any> {
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

/**
 * Get Params to send a message to the bot Topic
 * @param bot the TG_Bot Object
 * @param text The text to send
 * @returns param object
 */
export function MessageToBotTopic(bot:TG_BOT, text:string): tgOptions.sendMessage{
     const params ={
          chat_id: bot.botINFO.CHATID,
          message_thread_id: Number(bot.botINFO.THREADBOT),
          text,
          parse_mode: 'html',
          disable_notification: true
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

/**
 * get Params to send a Message with Media
 * @param bot the TG_BOt object
 * @param media media to send
 * @returns param object
 */
export function MediaGroup(bot:TG_BOT,media:(tgTypes.InputMediaAudio | tgTypes.InputMediaDocument | tgTypes.InputMediaPhoto | tgTypes.InputMediaVideo)[]): tgOptions.sendMediaGroup{
     const params = {
          chat_id: bot.botINFO.CHATID,
          message_thread_id: Number(bot.botINFO.THREADBOT),
          media,
          disable_notification: true
     }
     return params;
 
}

/**
 * Get Params to send a Message with a button Markup in markup
 * @param bot the TG_BOt object
 * @param text the text 9caption for the button
 * @param buttonsMarkup button markup
 * @returns the param object
 */
export function sendButtonToBotThread(bot: TG_BOT,text:string, buttonsMarkup:any) {
     const params = {
          chat_id: bot.botINFO.CHATID,
          message_thread_id: Number(bot.botINFO.THREADBOT),
          reply_markup:JSON.stringify( { inline_keyboard: buttonsMarkup }),
          text,
          disable_notification: true
     }
     return params
}
/**
 * return minimum params to answer a callback
 * @param bot the TG_BOT object
 * @param callbackQueryId the callBack Query Id to answer
 * @param caption the text to add to the answer
 * @returns 
 */
export function answerCallBack(bot:TG_BOT, callbackQueryId:string, caption:string|null):tgOptions.answerCallbackQuery{
     const params:any = { 
          callback_query_id: callbackQueryId,
     };
     if (caption) params.text = caption;

     return params;
}