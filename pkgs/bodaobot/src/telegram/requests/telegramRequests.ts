import TG_BOT from "../../telegram_bot";
import { inlineKeyboard } from "./markup";


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
export function MessageToBotTopicRequest(bot:TG_BOT, text:string): tgOptions.sendMessage{
     const params ={
          chat_id: bot.botINFO.CHATID,
          message_thread_id: Number(bot.botINFO.THREADBOT),
          text,
          parse_mode: 'html',
          disable_notification: true
      }
      return params;
}

export function MessageToBotTopicWithMarkupRequest(bot:TG_BOT,text: string,markup:any): tgOptions.sendMessage{
     
     const hasreply = Object.hasOwn(markup, 'reply_markup')
     let myMarkup;
     const params = {
          text: text,
          chat_id: bot.botINFO.CHATID,
          message_thread_id:Number(bot.botINFO.THREADBOT), //without this the message goes to general thread of the chat
      }
      if(hasreply) {
          myMarkup = markup
          
      }else{
          myMarkup = {
               reply_markup: markup
          }
      }
      let objectC = {...params, ...myMarkup}; // this is the answer
      return objectC;
}

/**
 * get Params to send a Message with Media
 * @param bot the TG_BOt object
 * @param media media to send
 * @returns param object
 */
export function MediaGroupRequest(bot:TG_BOT,media:(tgTypes.InputMediaAudio | tgTypes.InputMediaDocument | tgTypes.InputMediaPhoto | tgTypes.InputMediaVideo)[]): tgOptions.sendMediaGroup{
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
export function sendButtonToBotThreadRequest(bot: TG_BOT,text:string, buttonsMarkup:any) {
     const myMarkup =   inlineKeyboard([buttonsMarkup])
     const params = {
          chat_id: bot.botINFO.CHATID,
          message_thread_id: Number(bot.botINFO.THREADBOT),
          //reply_markup:JSON.stringify( { inline_keyboard: buttonsMarkup }),
          text,
          disable_notification: true
     }
     let objectC = {...params, ...myMarkup}; // this is the answer
     return objectC;
}
/**
 * return minimum params to answer a callback
 * @param bot the TG_BOT object
 * @param callbackQueryId the callBack Query Id to answer
 * @param caption the text to add to the answer
 * @returns 
 */
export function answerCallBackRequest(bot:TG_BOT, callbackQueryId:string, caption:string|null):tgOptions.answerCallbackQuery{
     const params:any = { 
          callback_query_id: callbackQueryId,
     };
     if (caption) params.text = caption;

     return params;
}

export function sendPollRequest(bot:TG_BOT,question:string,options: tgTypes.InputPollOption[],multiple:boolean=false,){

     const params:any = { 
        
         /**
          * Yes 	Unique identifier for the target chat or username of the target channel (in the format @channelusername)
          */
         chat_id: bot.botINFO.CHATID,
         /**
          * Integer 	Optional 	Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
          */
         message_thread_id:bot.botINFO.THREADBOT,
         /**
          * Yes 	Poll question, 1-300 characters
          */
         question: question,
         /**
          * Optional 	Mode for parsing entities in the question. See formatting options for more details. Currently, only custom emoji entities are allowed
          */
         //question_parse_mode?: string;
         /**
          * Array of MessageEntity 	Optional 	A JSON-serialized list of special entities that appear in the poll question. 
          * It can be specified instead of question_parse_mode
          */
         //question_entities?: tgTypes.MessageEntity[];
         options: options,
         is_anonymous:	false, // 	Optional 	True, if the poll needs to be anonymous, defaults to True
         type: 'regular',// 	Optional 	Poll type, “quiz” or “regular”, defaults to “regular”
         allows_multiple_answers: multiple,// 	Optional 	True, if the poll allows multiple answers, ignored for polls in quiz mode, defaults to False
         //correct_option_id?: number;// 	Integer 	Optional 	0-based identifier of the correct answer option, required for polls in quiz mode
         //explanation?: string;// 	Optional 	Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll, 0-200 characters with at most 2 line feeds after entities parsing
         //explanation_parse_mode?: string;// 	Optional 	Mode for parsing entities in the explanation. See formatting options for more details.
         //explanation_entities?: tgTypes.MessageEntity[];// 	Array of MessageEntity 	Optional 	A JSON-serialized list of special entities that appear in the poll explanation. It can be specified instead of explanation_parse_mode
         //open_period?: number;// 	Integer 	Optional 	Amount of time in seconds the poll will be active after creation, 5-600. Can't be used together with close_date.
         //close_date?: number;// 	Integer 	Optional 	Point in time (Unix timestamp) when the poll will be automatically closed. Must be at least 5 and no more than 600 seconds in the future. Can't be used together with open_period.
         //is_closed?: boolean;// 	Optional 	Pass True if the poll needs to be immediately closed. This can be useful for poll preview.
         disable_notification: false, //boolean;// 	Optional 	Sends the message silently. Users will receive a notification with no sound.
         protect_content: true,// 	Optional 	Protects the contents of the sent message from forwarding and saving
         //allow_paid_broadcast?: boolean;// 	Optional 	Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message. The relevant Stars will be withdrawn from the bot's balance
         //message_effect_id?: string;// 	Optional 	Unique identifier of the message effect to be added to the message; for private chats only
         /**
          * Optional 	Description of the message to reply to
          */
         //reply_parameters?: 	tgTypes.ReplyParameters;
         /**
          * InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply 	Optional 	Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user
          */
         //reply_markup?:tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
         
     };

     return params;

}

export function pollOptionRequest(text:string){
     const params: tgTypes.InputPollOption ={
          /**
           * Option text, 1-100 characters
           */
          text: text,
          /**
           * _Optional_. Mode for parsing entities in the text.
           * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
           * Currently, only custom emoji entities are allowed
           */
          //text_parse_mode?: string;
          /**
           * _Optional_. A JSON-serialized list of special entities that appear in the poll option text.
           * It can be specified instead of text_parse_mode
           */
          //text_entities?: tgTypes.MessageEntity[];
      }
      return params;
}