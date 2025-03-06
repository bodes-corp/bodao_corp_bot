import { DB_API } from "../database_api";
import { Requests } from "../requests/";
import TG_REQ from "../telegram/RequestManager";
import TG_API from "../telegram/telegram_api";
import TG_BOT from "../telegram_bot";
import { tgRequestMethod, two_buttons_t } from "../types/Types";



export class TIOZAO_BOT_CMDs {

 
     public static async botShowMenu( bot:  TG_BOT ) {
       
          const menu:two_buttons_t[] = [
              [{ text: bot.commands['/gp_td'].desc, callback_data: '/'+bot.commands['/gp_td'].name}, { text:  bot.commands['/top_gp'].desc, callback_data: '/'+bot.commands['/top_gp'].name}],
              [{ text: bot.commands['/top_rp'].desc, callback_data: '/'+bot.commands['/top_rp'].name},{ text:  bot.commands['/active_gp'].desc, callback_data: '/'+bot.commands['/active_gp'].name}],
              [{ text: bot.commands['/trend_gp'].desc, callback_data: '/'+bot.commands['/trend_gp'].name}, { text:  bot.commands['/spa'].desc, callback_data: '/'+bot.commands['/spa'].name}],
              [{ text: bot.commands['/user'].desc, callback_data: '/'+bot.commands['/user'].name },{ text:  bot.commands['/chat'].desc, callback_data: '/'+bot.commands['/chat'].name }],
              [{ text: bot.commands['/info'].desc, callback_data: '/'+bot.commands['/info'].name }]
          ];
          return await bot.sendResponseButtons(menu, 'Menu:');
      }
      
 
      
      public static async botResponseMedia(bot:  TG_BOT,  json:any) {
          const response = await bot.tgSendMedia(bot.botINFO, json);
          return response.result.map((media: { message_id: any; }) => Number(media.message_id));
      }
      
      public static async botAlert(bot:  TG_BOT,  text:string, id_thread:any, message_id:any|null = null) {
        const params = Requests.MessageThreadRequest(bot,text, id_thread, message_id);
        const response =  await TG_REQ.tgSendRequest(bot.botINFO.TOKEN, tgRequestMethod.SEND_MESSAGE,  params );
          //await bot.tgSendMessageThread(bot.botINFO, text, id_thread, message_id);
        return Number(response.result.message_id);
      }
      
      public static async botSendNotify(bot:  TG_BOT, notify:string, id_thread:any, message_id:any) {
        const params = Requests.MessageThreadRequest(bot,notify, id_thread, message_id);
        const response =  await TG_REQ.tgSendRequest(bot.botINFO.TOKEN, tgRequestMethod.SEND_MESSAGE,  params );
        //const response = await bot.tgSendMessageThread(bot.botINFO, notify, id_thread, message_id);
          return await DB_API.dbInsertBotNotify(bot.DB, Number(response.result.message_id), message_id);  
      }
      
      public static async botRemoveNotify(bot:  TG_BOT, id_msg_ref:any) {
          const result = await DB_API.dbSearchNotify(bot.DB, id_msg_ref);
          const id_msg_array:number[] = [];
      
          if (result.length != 0) {
              for (const row of result) {
                  const message_id = row[0];
                  id_msg_array.push(message_id);
              }
              
              await TG_API.tgDeleteMessagesFromChat(bot.botINFO.TOKEN,bot.botINFO.CHATID, id_msg_array);
              await DB_API.dbDeleteBotNotify(bot.DB, id_msg_array);
          }
          return [];
      }

       

      

}