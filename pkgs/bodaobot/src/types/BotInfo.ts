export interface BotINFO {
     TOKEN: string;  /** The telegram token */
     CHATID: string; 
     THREADBOT:string; /** the thread ID of the bot */
     APILINK: URL; /** The telegram api URL */
}

export class BOT_INFO implements BotINFO {
     TOKEN: string; 
     CHATID: string; 
     THREADBOT:string
     APILINK: URL;
     constructor(token:string, chat_id:string, thread_id:string,apilink: URL){
          this.TOKEN = token;
          this.CHATID = chat_id;
          this.THREADBOT = thread_id
          this.APILINK = apilink
     }
}