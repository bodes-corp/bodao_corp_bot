import { DB_API } from "../database_api";
import TG_BOT from "../telegram_bot";
import { TIOZAO_BOT_CMDs } from "../tiozao/tiozao_bot_comands";
import { ContextMessage } from "../types/TelegramMessage";

export default class BODAO_CMDS {

      public static async confirmATA(bot:  TG_BOT, message: ContextMessage, edit:any) {
      
          const result = await DB_API.dbSearchTDUserThread(bot.DB, message.id_user, message.id_thread);
          const number_rp = result.length;
          let text = '';
      
          // Determine if the user has a TD in the thread
          if (number_rp > 0) {
              message.is_td = 1;
          } else if (message.is_td_rp) {
              text = 'Falta o seu primeiro TD nesse tópico.\nSeguir o padrão: https://gpsp.xyz/td\n';
              message.is_td = 0;
              return await TIOZAO_BOT_CMDs.botAlert(bot, text, message.id_thread, message.message_id);
          }
      
          // Determine the response text based on the TD status and whether it's an edit
          if (edit) {
              text = `TD Editado ✅`;
          } else {
              text = message.is_td && number_rp > 0 
                  ? `Repeteco ${number_rp} ✅ ` 
                  : (message.is_td ? "TD ✅" : "");
          }
      
          // Send the response if the message has a TD
          if (message.is_td) {
              return await TIOZAO_BOT_CMDs.botAlert(bot, text, message.id_thread, message.message_id);
          }
      }
}