import { DB_API } from "../database_api";
import { Requests } from "../telegram/requests";
import TG_API from "../telegram/telegram_api";
import TG_BOT from "../telegram_bot";
import TG_ExecutionContext from "../telegram_execution_context";

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
        if(hasPoll) {
            const params = Requests.MessageToBotTopicRequest(bot,'Já existe um Quiz para essa Ata')
            await TG_API.sendMessage(bot.botINFO.TOKEN,params);
            const params2 = Requests.MessageToBotTopicRequest(bot,'Já existe um Quiz para esta Ata. não será criado outro')
            await TG_API.sendMessage(bot.botINFO.TOKEN,params2);

        }else {
            //2)create and manage the poll
            console.log('debug from handleATA -  message_id: ', bot.currentContext.update_message.message_id)
            const questionText = `Aprovação da Ata: ${bot.currentContext.update_message.caption}`;
            const opt1 = Requests.pollOptionRequest("Ata está Correta - Aprovada");
            const opt2 = Requests.pollOptionRequest("Ata precisa de Alterações");
            const questionOptions:tgTypes.InputPollOption[] = [];
            questionOptions.push(opt1);
            questionOptions.push(opt2);
            const pollParams = Requests.sendPollRequest(bot,questionText,questionOptions);
            const pollResponse:any = await TG_API.sendPoll(bot.botINFO.TOKEN, pollParams);
            //console.log('debug from handleATA -  poll response: ', JSON.stringify(pollResponse));

            if(pollResponse) {
                const params = Requests.MessageToBotTopicRequest(bot,'Foi Inserida uma Nova Ata no Grupo. Por favor leia e responda o quiz')
                await TG_API.sendMessage(bot.botINFO.TOKEN,params);
                const newPollData:tgTypes.Poll|undefined = pollResponse.poll
                // const has_protected_content = pollResponse.poll.has_protected_content === true? 1:0; 
                // const is_topic_message = pollResponse.poll.is_topic_message === true? 1:0;
                if (newPollData) await DB_API.dbInsertPoll(bot.DB,newPollData,Number(bot.botINFO.THREADBOT), media_group_id)
                //add options
                const options = pollResponse.poll.options;
                const pollID = pollResponse.poll.id;
                //console.log("debug from handleATA - option/ids",JSON.stringify(options),pollID)
                await DB_API.dbInsertPollOptions(bot.DB,pollID,options);
                
            }
        }

        return response_ids;
    }


    


}