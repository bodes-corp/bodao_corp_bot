import { DB_API } from "../database_api";
import { chunkArray } from "../library";
import TG_BOT from "../telegram_bot";

export class TIOZAO_BOT_CMDs {

 
     public static async botShowMenu(env:any, bot:  TG_BOT ) {
          const menu = [
              [{ text: 'Lista GPs', callback_data: '/gp_td'}, { text: 'Top GPs', callback_data: '/top_gp'}],
              [{ text: 'Top Repetecos', callback_data: '/top_rp'},{ text: 'GPs Ativas', callback_data: '/active_gp'}],
              [{ text: 'GPs Tendência', callback_data: '/trend_gp'}, { text: 'Clínicas', callback_data: '/spa'}],
              [{ text: 'Membros', callback_data: '/user' },{ text: 'Bate Papo', callback_data: '/chat' }],
              [{ text: 'Perfil', callback_data: '/info' }]
          ];
          return await this.ResponseButton(env, bot, menu, 'Menu:');
      }
      
      public static async ResponseButton(env:any,  bot:  TG_BOT, buttons:any[], text:string) {
          return await bot.tgButton(env, buttons, text);
      }
      
      public static async botResponseTxt(env:any,  bot:  TG_BOT, text:string) {
          return await bot.tgMessage(env, text);
      }
      
      public static async botResponseMedia(env:any, bot:  TG_BOT,  json:any) {
          const response = await bot.tgSendMedia(env, json);
          return response.result.map((media: { message_id: any; }) => Number(media.message_id));
      }
      
      public static async botAlert(env:any, bot:  TG_BOT,  text:string, id_thread:any, message_id:any|null = null) {
          const response = await bot.tgSendMessageThread(env, text, id_thread, message_id);
          return Number(response.result.message_id);
      }
      
      public static async botSendNotify(env:any,  bot:  TG_BOT, notify:string, id_thread:any, message_id:any) {
          const response = await bot.tgSendMessageThread(env, notify, id_thread, message_id);
          return await DB_API.dbInsertBotNotify(env, Number(response.result.message_id), message_id);  
      }
      
      public static async botRemoveNotify(env:any,  bot:  TG_BOT, id_msg_ref:any) {
          const result = await DB_API.dbSearchNotify(env, id_msg_ref);
          const id_msg_array = [];
      
          if (result.length != 0) {
              for (const row of result) {
                  const message_id = row[0];
                  id_msg_array.push(message_id);
              }
              await bot.tgDeleteMessages(env, id_msg_array);
              await DB_API.dbDeleteBotNotify(env, id_msg_array);
          }
          return [];
      }

       
public static async removeOldMessages(env:any, bot:  TG_BOT,) {
	const now = Math.floor(Date.now() / 1000);
	const old = now - 60;
 
	try {
	    const query = 'SELECT message_id FROM tg_bot WHERE msg_date < ?';
	    const data = await env.DB.prepare(query).bind(old).all();
	    const messageIds = data.results.map((row: any ) => row.message_id);
 
	    if (messageIds.length === 0) return;
 
	    const chunks = chunkArray(messageIds, 100);
 
	    for (const chunk of chunks) {
		   await bot.tgDeleteMessages(env, chunk);
	    }
 
	    const deleteQuery = 'DELETE FROM tg_bot WHERE message_id IN (SELECT message_id FROM tg_bot WHERE msg_date < ?)';
	    await env.DB.prepare(deleteQuery).bind(old).run();
	} catch (error) {
	    console.error('Error during removeOldMessages operation:', error);
	}
 }
      

}