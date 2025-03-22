import { DB_API } from "../database_api";
import { formatDate } from "../library";
import { Requests } from "../telegram/requests";
import TG_API from "../telegram/telegram_api";
import TG_BOT from "../telegram_bot";
import TG_ExecutionContext from "../telegram_execution_context";
import TIOZAO_CMDS from "../tiozao/tiozao_api";
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
        const media_group_id = bot.currentContext.update_message.media_group_id;
           
        //1)Check media database
        //document is already in media database with correct type. This is handled by editMedia Handler
            //if it will execute media edit handler it is not necessary dbupdate here.
            // //otherwise it is
            // await DB_API.dbUpdateMediaType(bot,mediaType.DOCUMENT_ATA, bot.currentContext.update_message.message_id)
            //if not add it to atas database, and create apoll to check visualization and approval
        //verify if it has already a poll for this document
        const hasPoll = await DB_API.checkHasPoll(bot.DB,media_group_id);
        if(hasPoll) { //ja existe u, poll for the media
            const params = Requests.MessageToBotTopicRequest(bot,'Já existe um Quiz para esta Ata. não será criado outro')
            await TG_API.sendMessage(bot.botINFO.TOKEN,params);

        }else { //do not exist a poll for the media
            //2)create and manage the poll
            console.log('debug from handleATA -  message_id: ', bot.currentContext.update_message.message_id)
            const questionText = `Aprovação da Ata: ${bot.currentContext.update_message.caption}`;
            const opt1 = Requests.pollOptionRequest("Ata está Correta - Aprovada");
            const opt2 = Requests.pollOptionRequest("Ata precisa de Alterações");
            const questionOptions:tgTypes.InputPollOption[] = [];
            questionOptions.push(opt1);
            questionOptions.push(opt2);
            const pollParams = Requests.sendPollRequest(bot,questionText,questionOptions);
            let pollResponse:any  = null;
            pollResponse= await TG_API.sendPoll(bot.botINFO.TOKEN, pollParams);
            console.log('[debug from handleATA] poll response: ', JSON.stringify(pollResponse));

            if(pollResponse) {
                console.log('[debug from handleATA] entered poll response if');
                
                const newPollData:tgTypes.Poll|undefined = pollResponse.poll
                console.log('[debug from handleATA] new poll data: ', JSON.stringify(newPollData));
                // const has_protected_content = pollResponse.poll.has_protected_content === true? 1:0; 
                // const is_topic_message = pollResponse.poll.is_topic_message === true? 1:0;
                if (newPollData) {
                    const responseInsert = await DB_API.dbInsertPoll(bot.DB,newPollData,Number(bot.botINFO.THREADBOT), media_group_id)
                    console.log("debug from handleATA - response insert poll",JSON.stringify(responseInsert));
                    
                    const params = Requests.MessageToBotTopicRequest(bot,'Foi Inserida uma Nova Ata no Grupo. Por favor leia e responda o quiz')
                    const response  = await TG_API.sendMessage(bot.botINFO.TOKEN,params);
                    console.log('[debug from handleATA] response from sendMessage:', JSON.stringify(response));
                    
                }
                
                
            }
        }

        return response_ids;
    }

    /**
     * List the media with type = 4 (atas)
     * @param bot The Bot object
     * @returns 
     */
    public static async listAtas(bot:  TG_BOT) {
        //const env = bot.env
        let response_ids:any[] = [];
        let text = `═════════════════════\n<b>Atass</b>\nAtas dos últimos 4 meses\n═════════════════════\n`;
     
        try {
            const result = await DB_API.dbListMediabyType(bot.DB, mediaType.DOCUMENT_ATA);
            if (result.length === 0) {
               text += `Nenhum resultado encontrado`;
            } else {
               for (const row of result) {
                  const day = formatDate(row[3]);
                  text += `${day} - <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
               }
            }
            await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
        } catch (error) {
            console.error('Error during search operation:', error);
            text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
            await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
        }
     
        return response_ids;
    }

    public static async listPolls(bot:  TG_BOT) {
        //const env = bot.env
        let response_ids:any[] = [];
        let text = `═════════════════════\n<b>Quizes</b>\nQuizes dos últimos 4 meses\n═════════════════════\n`;
     
        try {
            const result = await DB_API.dbListPolls(bot.DB);
            if (result.length === 0) {
               text += `Nenhum resultado encontrado`;
            } else {
               for (const row of result) {
                  const day = formatDate(row[3]);
                  text += `${day} - <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
               }
            }
            await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
        } catch (error) {
            console.error('Error during search operation:', error);
            text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
            await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
        }
     
        return response_ids;
    }


    


}