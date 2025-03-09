import { DB_API } from "../database_api";
import { Requests } from "../requests";
import TG_API from "../telegram/telegram_api";
import TG_BOT from "../telegram_bot";
import TG_ExecutionContext from "../telegram_execution_context";
import { mediaType } from "../types/Types";

export default class BODAO_CMDS {

    /**
     * Check if a docuemt uploaded is an Ata
     * @param ctx the context
     * @returns true if the document was named as ATA.
     */
    public static async checkATA(ctx: TG_ExecutionContext): Promise<boolean> {
        //bot:  TG_BOT, message: ContextMessage, edit:any) 
      
        if (!ctx) return Promise.resolve(false);
        //check if it is a document
        if(ctx.update.message?.document && ctx.update.message?.caption) {
            const msg_caption = ctx.update.message?.caption

            if(msg_caption){
                const keywords = ["Ata"];
                const result =  keywords.every(keyword => JSON.stringify(msg_caption.toLowerCase()).includes(keyword.toLowerCase())) ? true : false;
                console.log('debug from confirmATA: result: ', result)
                return Promise.resolve(result);
            }
    
        }
        
        return Promise.resolve(false);
    }

    /**
     * Handler to be used when the bot detec a new ata
     * @param bot TG_BOT object
     * @returns 
     */
    public static async handleATA(bot: TG_BOT){
        if (!bot) return Promise.resolve([]);
        let response_ids:any[] = [];


        //check if the document is in database
        console.log('debug from handleATA -  message_id: ', bot.currentContext.update_message.message_id)
        await DB_API.dbUpdateMediaType(bot,mediaType.DOCUMENT_ATA, bot.currentContext.update_message.message_id)
        //if not add it to atas database, and create apoll to check visualization and approval
        //if yes verify if there is approvation pool.
        //create a poll to aprove the document

        const markup = {
            inline_keyboard: [[{ text: 'I Accept', callback_data: 'accept_rules' }]]
        }
        const params = Requests.MessageToBotTopicWithMarkup(bot,'Welcome to my bot! Press the button to accept my rules!', markup)
        await TG_API.sendMessage(bot.botINFO.TOKEN,params);
        return response_ids;
     }
    


}