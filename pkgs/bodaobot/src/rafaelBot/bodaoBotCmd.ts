import { DB_API } from "../database_api";
import { TG_HANDLER } from "../handlers/handlers";
import { formatDate } from "../library";
import { Requests } from "../telegram/requests";
import TG_API from "../telegram/telegram_api";
import TG_ExecutionContext from "../telegram_execution_context";
import TIOZAO_CMDS from "../tiozao/tiozao_api";
import { ContextMessage } from "../types/TelegramMessage";
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
    public static async handleATA( ctx: TG_ExecutionContext){
        if (!ctx) return Promise.resolve([]);

        let message:ContextMessage = ctx.update_message;
        let response_ids:any[] = [];
        console.log('debug from handleATA');
	    console.log("debug from handleATA - message: ", JSON.stringify(message))
        
        const resp = await  TIOZAO_CMDS.checkHaveCaption(ctx.bot, message, true);
       
        
        if(Array.isArray(resp)) response_ids.push(resp);
        await ctx.bot.handleBotResponses(response_ids);
        return [];

        
        const media_group_id = ctx.update_message.media_group_id;
        console.log('debug from handleATA -  context: ', JSON.stringify(ctx));
            
        const response =  await TG_HANDLER.handleEditDocument(ctx);
        //console.log('debug from handleATA -  back from Edit document: ', JSON.stringify(response));
        
        //1)Check media database
        //document is already in media database with correct type. This is handled by editMedia Handler
            //if it will execute media edit handler it is not necessary dbupdate here.
            // //otherwise it is
            // await DB_API.dbUpdateMediaType(bot,mediaType.DOCUMENT_ATA, bot.currentContext.update_message.message_id)
            //if not add it to atas database, and create apoll to check visualization and approval
        //verify if it has already a poll for this document
        const hasPoll = await DB_API.checkHasPoll(ctx.bot.DB,media_group_id);
        if(hasPoll) { //ja existe u, poll for the media
            const params = Requests.MessageToBotTopicRequest(ctx.bot,'Já existe um Quiz para esta Ata. não será criado outro')
            await TG_API.sendMessage(ctx.bot.botINFO.TOKEN,params);

        }else { //do not exist a poll for the media
            //2)create and manage the poll
            console.log('debug from handleATA -  message_id: ', ctx.update_message.message_id)
            const questionText = `Aprovação da Ata: ${ctx.update_message.caption}`;
            const opt1 = Requests.pollOptionRequest("Ata está Correta - Aprovada");
            const opt2 = Requests.pollOptionRequest("Ata precisa de Alterações");
            const questionOptions:tgTypes.InputPollOption[] = [];
            questionOptions.push(opt1);
            questionOptions.push(opt2);
            const pollParams = Requests.sendPollRequest(ctx.bot,questionText,questionOptions);
            let pollResponse:any  = null;
            pollResponse= await TG_API.sendPoll(ctx.bot.botINFO.TOKEN, pollParams);
            console.log('[debug from handleATA] poll response: ', JSON.stringify(pollResponse));

            if(pollResponse) {
                console.log('[debug from handleATA] entered poll response if');
                
                const newPollData:tgTypes.Poll|undefined = pollResponse.poll
                console.log('[debug from handleATA] new poll data: ', JSON.stringify(newPollData));
                // const has_protected_content = pollResponse.poll.has_protected_content === true? 1:0; 
                // const is_topic_message = pollResponse.poll.is_topic_message === true? 1:0;
                if (newPollData) {
                    //const responseInsert = await DB_API.dbInsertPoll(ctx.bot.DB,newPollData,Number(ctx.bot.botINFO.THREADBOT), media_group_id)
                   // console.log("debug from handleATA - response insert poll",JSON.stringify(responseInsert));
                    
                    const params = Requests.MessageToBotTopicRequest(ctx.bot,'Foi Inserida uma Nova Ata no Grupo. Por favor leia e responda o quiz')
                    const response  = await TG_API.sendMessage(ctx.bot.botINFO.TOKEN,params);
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
    public static async listAtas(ctx: TG_ExecutionContext) {
        //const env = bot.env
        let response_ids:any[] = [];
        let text = `═════════════════════\n<b>Atass</b>\nAtas dos últimos 4 meses\n═════════════════════\n`;
     
        try {
            const result = await DB_API.dbListMediabyType(ctx.bot.DB, mediaType.DOCUMENT_ATA);
            if (Array.isArray(result) && result.length === 0) {
               text += `Nenhum resultado encontrado`;
            } else if (Array.isArray(result)){
               for (const row of result) {
                  const day = formatDate(row[3]);
                  text += `${day} - <a href="t.me/c/${ctx.bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
               }
            }
            await TIOZAO_CMDS.sendResponse(ctx.bot, text, response_ids);
        } catch (error) {
            console.error('Error during search operation:', error);
            text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
            await TIOZAO_CMDS.sendResponse(ctx.bot, text, response_ids);
        }
     
        return response_ids;
    }

    public static async listPolls(ctx: TG_ExecutionContext) {
        //const env = bot.env
        let response_ids:any[] = [];
        let text = `═════════════════════\n<b>Quizes</b>\nQuizes dos últimos 4 meses\n═════════════════════\n`;
     
        try {
            const result = await DB_API.dbListPolls(ctx.bot.DB);
            if (Array.isArray(result) && result.length === 0) {
               text += `Nenhum resultado encontrado`;
            } else if (Array.isArray(result)){
               for (const row of result) {
                  const day = formatDate(row[3]);
                  text += `${day} - <a href="t.me/c/${ctx.bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
               }
            }
            await TIOZAO_CMDS.sendResponse(ctx.bot, text, response_ids);
        } catch (error) {
            console.error('Error during search operation:', error);
            text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
            await TIOZAO_CMDS.sendResponse(ctx.bot, text, response_ids);
        }
     
        return response_ids;
    }


    


}