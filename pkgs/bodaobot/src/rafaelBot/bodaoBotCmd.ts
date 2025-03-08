import TG_ExecutionContext from "../telegram_execution_context";

export default class BODAO_CMDS {

      public static async confirmATA(ctx: TG_ExecutionContext): Promise<boolean> {
        //bot:  TG_BOT, message: ContextMessage, edit:any) 
      
        if (!ctx) return Promise.resolve(false);
  
        const msg_txt = ctx.update.message?.text

        return Promise.resolve(true);
      }
}