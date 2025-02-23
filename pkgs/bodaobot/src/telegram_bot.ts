import splitMessage from "./library";

/**
 * Class representinhg a Telegram Bot
 */
export default class TgBot {
/** The telegram token */
token: string;
/** The telegram api URL */
api: URL;

/**
	*	Create a bot
	*	@param token - the telegram secret token
	*/
     constructor(token: string) {
		this.token = token;
		this.api = new URL('https://api.telegram.org/bot' + token);
	}


     tgApiUrl(methodName:any, params = {}) {
          const query = params ? `?${new URLSearchParams(params).toString()}` : '';
          return this.api+`/${methodName}${query}`;
     }

     async tgSendRequest(method:string, env:any, params:any) {
          try {
              const response = await fetch(this.tgApiUrl(method, params), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
              });
      
              const data:any = await response.json();
              if (!data.ok) {
                  throw new Error(`Telegram API Error: ${data.description}`);
              }
      
              return data;
          } catch (error) {
              console.error(`Error in ${method} request:`, error);
              throw error;
          }
     }

     async tgSendMessage(env:any, text:string) {
          return await this.tgSendRequest('sendMessage', env, {
              chat_id: env.TG_CHATID,
              message_thread_id: env.TG_THREADBOT,
              text,
              parse_mode: 'html',
              disable_notification: 'true'
          });
      }

      async tgMessage(env:any, text:string) {
          const parts = splitMessage(text, 4096, 100);
          const responses = [];
      
          for (const part of parts) {
              const response = await this.tgSendMessage(env, part);
              responses.push(Number(response.result.message_id));
          }
      
          return responses;
      }
      
      async tgSendMedia(env:any, media:any) {
          return await this.tgSendRequest('sendMediaGroup', env, {
              chat_id: env.TG_CHATID,
              message_thread_id: env.TG_THREADBOT,
              media,
              disable_notification: 'true'
          });
      }
      
     
      async tgSendMessageThread(env:any, text:string, id_thread:any, id_msg:any) {
          return await this.tgSendRequest('sendMessage', env, {
              chat_id: env.TG_CHATID,
              message_thread_id: id_thread,
              text,
              parse_mode: 'html',
              disable_notification: 'true',
              reply_to_message_id: id_msg
          });
      }
      
      async tgDeleteMessage(env:any, message_id:any) {
          return await this.tgSendRequest('deleteMessage', env, {
              chat_id: env.TG_CHATID,
              message_id
          });
      }
      
      async tgDeleteMessages(env:any, chunk:any) {
          try {
              const deleteParams = { chat_id: env.TG_CHATID, message_ids: chunk };
              const response = await fetch(this.tgApiUrl('deleteMessages'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(deleteParams)
              });
      
              const result:any = await response.json();
              if (!result.ok) {
                  throw new Error(`Failed to delete messages: ${result.description}`);
              }
          } catch (error) {
              console.error('Error deleting messages:', error);
          }
      }
      
      async tgButton(env:any, buttons:string[], text:string) {
          const batchSize = 90;
          const responses = [];
      
          for (let i = 0; i < buttons.length; i += batchSize) {
              const batch = buttons.slice(i, i + batchSize);
              const response = await this.tgSendButton(env, batch, text);
              responses.push(Number(response.result.message_id));
          }
      
          return responses;
      }
      
      async tgSendButton(env:any, buttons:any, text:any) {
          return await this.tgSendRequest('sendMessage', env, {
              chat_id: env.TG_CHATID,
              message_thread_id: env.TG_THREADBOT,
              reply_markup: JSON.stringify({ inline_keyboard: buttons }),
              text,
              disable_notification: 'true'
          });
      }
      
      async tgAnswerCallbackQuery(env:any, callbackQueryId:any, text:string|null = null) {
          const params:any = { callback_query_id: callbackQueryId };
          if (text) params.text = text;
      
          return await this.tgSendRequest('answerCallbackQuery', env, params);
      }
      
     
}