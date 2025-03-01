import { DB_API } from "../database_api";
import { chunkArray } from "../library";
import TG_API from "../telegram_api";
import TG_BOT from "../telegram_bot";

export class TIOZAO_BOT_CMDs {

 
     public static async botShowMenu( bot:  TG_BOT ) {
          const menu = [
              [{ text: 'Lista GPs', callback_data: '/gp_td'}, { text: 'Top GPs', callback_data: '/top_gp'}],
              [{ text: 'Top Repetecos', callback_data: '/top_rp'},{ text: 'GPs Ativas', callback_data: '/active_gp'}],
              [{ text: 'GPs Tendência', callback_data: '/trend_gp'}, { text: 'Clínicas', callback_data: '/spa'}],
              [{ text: 'Membros', callback_data: '/user' },{ text: 'Bate Papo', callback_data: '/chat' }],
              [{ text: 'Perfil', callback_data: '/info' }]
          ];
          return await this.ResponseButton(bot, menu, 'Menu:');
      }
      
      public static async ResponseButton(bot:  TG_BOT, buttons:any[], text:string) {
          return await bot.tgButton(buttons, text);
      }
      
      public static async botResponseTxt(bot:  TG_BOT, text:string) {
          return await bot.tgMessage(text);
      }
      
      public static async botResponseMedia(bot:  TG_BOT,  json:any) {
          const response = await bot.tgSendMedia(bot.botINFO, json);
          return response.result.map((media: { message_id: any; }) => Number(media.message_id));
      }
      
      public static async botAlert(bot:  TG_BOT,  text:string, id_thread:any, message_id:any|null = null) {
          const response = await bot.tgSendMessageThread(bot.botINFO, text, id_thread, message_id);
          return Number(response.result.message_id);
      }
      
      public static async botSendNotify(bot:  TG_BOT, notify:string, id_thread:any, message_id:any) {
          const response = await bot.tgSendMessageThread(bot.botINFO, notify, id_thread, message_id);
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

       
public static async removeOldMessages(bot:  TG_BOT,) {
	const now = Math.floor(Date.now() / 1000);
	const old = now - 60;
 
	try {
	    const query = 'SELECT id_msg FROM tg_bot WHERE msg_date < ?';
	    const data = await bot.DB.prepare(query).bind(old).all();
	    const messageIds = data.results.map((row: any ) => row.id_msg);
 
	    if (messageIds.length === 0) return;
 
	    const chunks = chunkArray(messageIds, 100);
 
	    for (const chunk of chunks) {
		   await TG_API.tgDeleteMessagesFromChat(bot.botINFO.TOKEN,bot.botINFO.CHATID, chunk);
	    }
 
	    const deleteQuery = 'DELETE FROM tg_bot WHERE id_msg IN (SELECT id_msg FROM tg_bot WHERE msg_date < ?)';
	    await bot.DB.prepare(deleteQuery).bind(old).run();
	} catch (error) {
	    console.error('Error during removeOldMessages operation:', error);
	}
 }
      

}