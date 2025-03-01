export interface BotINFO {
     TOKEN: string; 
     CHATID: string; 
     THREADBOT:string;
}

export class BOT_INFO implements BotINFO {
     TOKEN: string; 
     CHATID: string; 
     THREADBOT:string
     constructor(token:string, chat_id:string, thread_id:string){
          this.TOKEN = token;
          this.CHATID = chat_id;
          this.THREADBOT = thread_id
     }
}