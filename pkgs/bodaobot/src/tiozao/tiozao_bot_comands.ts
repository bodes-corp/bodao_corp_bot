import { DB_API } from "../database_api";
import TG_REQ from "../telegram/RequestManager";
import { Requests } from "../telegram/requests";
import { callback } from "../telegram/requests/button";
import { tg } from "../telegram/updating_messages";
import TG_BOT from "../telegram_bot";
import { tgRequestMethod } from "../types/Types";



export class TIOZAO_BOT_CMDs {

 
     public static async botShowMenu( bot:  TG_BOT ) {
       ;
          const menuButtons: any[] = [
              [ callback(bot.commands['/gp_td'].desc, '/'+bot.commands['/gp_td'].name), callback(bot.commands['/top_gp'].desc, '/'+bot.commands['/top_gp'].name)],
              [ callback(bot.commands['/top_rp'].desc, '/'+bot.commands['/top_rp'].name),callback(bot.commands['/active_gp'].desc,  '/'+bot.commands['/active_gp'].name)],
              [ callback(bot.commands['/trend_gp'].desc, '/'+bot.commands['/trend_gp'].name), callback(bot.commands['/spa'].desc, '/'+bot.commands['/spa'].name)],
              [ callback(bot.commands['/user'].desc, '/'+bot.commands['/user'].name),callback(bot.commands['/chat'].desc,  '/'+bot.commands['/chat'].name )],
              [ callback(bot.commands['/info'].desc, '/'+bot.commands['/info'].name )]
          ];
          return await bot.tgSendButtons(menuButtons, 'Menu:');
      }
      
 
      
      public static async botResponseMedia(bot:  TG_BOT,  json:any) {
            const params = Requests.MediaGroupRequest(bot,json)
            const response = await TG_REQ.tgSendRequest(bot.botINFO.TOKEN,tgRequestMethod.SEND_MEDIA_GROUP,   params );
            return response.result.map((media: { message_id: any; }) => Number(media.message_id));
      }
      
      public static async botAlert(bot:  TG_BOT,  text:string, id_thread:any, message_id:any|null = null) {
        console.log('debug from botAlert')
        const params = Requests.MessageReplyThreadRequest(bot,text, id_thread, message_id);
        console.log('debug from botAlert - params: ',JSON.stringify(params))
        const response =  await TG_REQ.tgSendRequest(bot.botINFO.TOKEN, tgRequestMethod.SEND_MESSAGE,  params );
          //await bot.tgSendMessageThread(bot.botINFO, text, id_thread, message_id);
          console.log('debug from botAlert - response: ',response)
          if(response){
            return Number(response.result.message_id);
          }else{
            return 0;
          }
        
      }
      
      public static async botSendNotify(bot:  TG_BOT, notify:string, id_thread:any, message_id:any) {
        const params = Requests.MessageReplyThreadRequest(bot,notify, id_thread, message_id);
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
              if (Array.isArray(id_msg_array) && (id_msg_array).length > 0 ) {
                                  //const response = await TG_API.tgDeleteMessagesFromChat(bot.botINFO.TOKEN,bot.botINFO.CHATID, chunks);
                                  const message_ids: number [] = id_msg_array;
                                  const  chat_id = bot.botINFO.CHATID;
                                  console.log("delete old messages - params:",  JSON.stringify({chat_id,message_ids}));
                                  const response = await tg.deleteMessages(bot.botINFO.TOKEN,{chat_id, message_ids});
                                  console.log('debug from tgDeleteMessagesFromChat - result:', response);
                                                  
                                  if (response === true) await DB_API.dbDeleteBotNotify(bot.DB, id_msg_array);
                                  Promise.resolve(true);
              }else {
                                  Promise.resolve(false);
              }
              
          }
          return [];
      }

       

      

}