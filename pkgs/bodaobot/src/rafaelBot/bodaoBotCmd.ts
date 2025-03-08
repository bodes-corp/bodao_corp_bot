import TG_ExecutionContext from "../telegram_execution_context";

export default class BODAO_CMDS {

      public static async confirmATA(ctx: TG_ExecutionContext): Promise<boolean> {
        //bot:  TG_BOT, message: ContextMessage, edit:any) 
      
        if (!ctx) return Promise.resolve(false);
  
        const msg_caption = ctx.update.message?.caption

        if(msg_caption){
            const keywords = ["Ata"];
	        const result =  keywords.every(keyword => JSON.stringify(msg_caption.toLowerCase()).includes(keyword.toLowerCase())) ? true : false;
            console.log('debug from confirmATA: result: ', result)
            return Promise.resolve(result);
        }

        return Promise.resolve(false);
      }
}