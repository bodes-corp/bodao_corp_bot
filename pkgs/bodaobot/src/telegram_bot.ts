import { DB_API } from "./database_api";
import { chunkArray, isValidChat, splitMessage } from "./library";
import TG_API from "./telegram_api";
import TG_ExecutionContext from "./telegram_execution_context";
import TIOZAO_CMDS from "./tiozao/tiozao_api";
import { TIOZAO_BOT_CMDs } from "./tiozao/tiozao_bot_comands";
import { BOT_INFO, BotINFO } from "./types/BotInfo";
import { ContextMessage, TG_Message } from "./types/TelegramMessage";
import TelegramUpdate from "./types/TelegramUpdate";
import { botResponse, buttons_t, commandFunc, CommandHandler, Handler, handlerFunc, tgRequestMethod, updOperation, updType } from "./types/Types";
import Webhook from "./webhook";






/**
 * Class representinhg a Telegram Bot
 */
export default class TG_BOT {

     /** The telegram token */
     token: string;

     /** The telegram api URL */
     api: URL;

     /** The telegram handlers record map */
     handlers:Handler  = {};

     /**command handlers record map */
     commands:CommandHandler = {}

     /** The telegram update object */
     update: TelegramUpdate = new TelegramUpdate({});

     /** The telegram webhook object */
     webhook: Webhook = new Webhook('', new Request('http://127.0.0.1'));

     /** The current bot context */
     currentContext!: TG_ExecutionContext;

     /** The envirownment variables */
     //env:Environment;

     /** The Bot Thread id */
     botThreadId: string;

     /**information necessary to dentify bot in telegram ans send messages to the 
      * correct thread and chat
      */
     botINFO:BOT_INFO;

     /**webhook secret */
     secret:string;

     /**Bot Database */
     DB:any;

     /**
	*	Create a bot
	*	@param token - the telegram secret token
	*/
     constructor(info:BOT_INFO,secret:string,database:any=null) {
          this.secret = secret;
		this.token = info.TOKEN;
          this.botThreadId = info.THREADBOT;
          this.botINFO = new BOT_INFO(
               info.TOKEN,
               info.CHATID,
               info.THREADBOT
          )
          this.DB=database;
		this.api = new URL('https://api.telegram.org/bot' + info.TOKEN);
         /* this.handlers = {
               ':message': this.handleMessage,
               ':edited_message': this.handleEditedMessage,
               ':callback': this.handleCallbackQuery,
               ':edit_thread':this.handleEditThread,
               ':create_thread':this.handleCreateThread
           }*/

           this.on(':message', this.handleMessage)
           .on(':edited_message',this.handleEditedMessage)
           .on(':callback',TG_BOT.handleCallbackQuery)
           .on(':edit_thread',this.handleEditThread)
           .on(':create_thread',this.handleCreateThread);
           

          
          
	}

     /**
	 * Register a handler on the bot
	 * @param event - the event or command name
	 * @param callback - the bot context
	 */
	on(event: string, callback: handlerFunc) {
		if (!['on', 'handle'].includes(event)) {
			this.handlers[event] = callback;
		}
		return this;
	}


     /**
	 * Register a command on the bot
	 * @param event - the event or command name
	 * @param callback - the bot context
	 */
	onCommand(event: string, callback: commandFunc) {
		if (!['onCommand', 'handle'].includes(event)) {
			this.commands[event] = callback;
		}
		return this;
	}

     /**
      * Send a Text Message to the Bot Thread
      * @param text message text to send
      * @returns bot Response
      */
     async tgSendMessageToBotThread( text:string): Promise<botResponse> {
          if (!this.botINFO) {
               return Promise.resolve({
                    "ok": false,
                    "result": {} as TG_Message
               } );
          }
          const params = {
               chat_id: this.botINFO.CHATID,
               message_thread_id: this.botINFO.THREADBOT,
               text,
               parse_mode: 'html',
               disable_notification: 'true'
           };
          return await TG_API.tgSendRequest(tgRequestMethod.SEND_MESSAGE, this.botINFO.TOKEN, params );
      }

      /**
       * Send a Text Message to the bot thread
       * @param text text to send
       * @returns responses
       */
     async tgSendMessage(text:string) {
          const parts = splitMessage(text, 4096, 100);
          const responses = [];
      
          for (const part of parts) {
              const response:botResponse = await this.tgSendMessageToBotThread(part);
              responses.push(Number(response.result.message_id));
          }
      
          return responses;
     }
      
     async tgSendMedia(info:BotINFO, media:any) {
          const params = {
               chat_id: info.CHATID,
               message_thread_id: info.THREADBOT,
               media,
               disable_notification: 'true'
           }
          return await TG_API.tgSendRequest(tgRequestMethod.SEND_MEDIA_GROUP,  info.TOKEN, params );
     }
      
     
     async tgSendMessageThread(info:BotINFO, text:string, id_thread:any, message_id:any) {
          
          const params = {
               chat_id: info.CHATID,
               message_thread_id: id_thread,
               text,
               parse_mode: 'html',
               disable_notification: 'true',
               reply_to_message_id: message_id
          }
          
          return await TG_API.tgSendRequest(tgRequestMethod.SEND_MESSAGE,  info.TOKEN ,params );
     }
      
       
     
     async tgButton(buttons:buttons_t, text:string) {
          if(!Array.isArray(buttons) || !text) {
               return Promise.resolve([]);
          }
          const batchSize = 90;
          const responses = [];
      
          for (let i = 0; i < buttons.length; i += batchSize) {
              const batch = buttons.slice(i, i + batchSize);
              const response:botResponse = await TG_API.sendButtonToBotThread(this.botINFO.TOKEN, this.botINFO.CHATID, this.botINFO.THREADBOT, batch, text);
              //console.log("debug rsponse from bot: ", response);
              responses.push(Number(response.result.message_id));
          }
      
          return responses;
     }
      
     
     async tgAnswerCallbackQuery(callbackQueryId:any, text:string|null = null) {       
          return await TG_API.tgAnswerCallbackQuery(this.botINFO.TOKEN, callbackQueryId, text);
     }

     async sendResponseButtons(buttons:buttons_t, text:string) {
          return await this.tgButton(buttons, text);
     }

      
      
     async sendResponseText( text:string) {
          return await this.tgSendMessage(text);
     }

     async tgDeleteMessagesFromChat (chunks:any)
     {
          if(!Array.isArray(chunks)){
               Promise.resolve()
          }

          for (const chunk of chunks) {
               await TG_API.tgDeleteMessagesFromChat(this.botINFO.TOKEN,this.botINFO.CHATID, chunk);
           }
     }
     public static async dbGetBotMessages(bot:  TG_BOT,old:number):Promise<number[]>{
          
          const query = 'SELECT id_msg FROM tg_bot WHERE msg_date < ?';
          const data = await bot.DB.prepare(query).bind(old).all();
          const messageIds = data.results.map((row: any ) => row.id_msg);
      
          if (messageIds.length === 0) return []
      
          const chunks = chunkArray(messageIds, 100);
          return chunks;
     }

     


     public static async removeOldMessages(bot: TG_BOT) {

          
          const now:number = Math.floor(Date.now() / 1000);
          const old:number = now - 60;
      
          try {
              
               const chunks = await TG_BOT.dbGetBotMessages(bot,old);
               if ((chunks).length>0 ) {
                     await bot.tgDeleteMessagesFromChat(chunks);
                     await DB_API.deleteMessagesFromDB(bot.DB,old);
               }
      
             
          } catch (error) {
              console.error('Error during removeOldMessages operation:', error);
          }
     }

     /**
      * This method handles the updates from Telegram.
      * when a POST request arrives at the webhooendPoint, thebot reads te JSON
      * body of this request, interpreting this as an Update from Telegram.
      * If the update contains a message, call haldler methods.
      * @param {*} env the worker env variables
      * @param {*} update the request object json formated
     */
     async handleUpdate(update: TelegramUpdate) {
          this.update = update;
          
          let handlerName = ':message';
          let args: string[] = [];
          const ctx = new TG_ExecutionContext(this, this.update);
          this.currentContext = ctx;
          console.log('debug ctx update_type: ',ctx.update_type);
          console.log("debug ctx message:", ctx.update.message);
          //console.log("debug ctx message user:", ctx.update?.message?.from.id)
          //console.log("debug ctx message user:",ctx.update_message.id_user);
          switch (ctx.update_type) {
               case updType.MESSAGE: {
                    args = this.update.message?.text?.split(' ') ?? [];
                    handlerName = ':message';
                    switch(ctx.update_operation){
                         case updOperation.THREAD_CREATE:
                              handlerName = ':create_thread';
                              break;
                         case updOperation.THREAD_EDIT:
                              handlerName = ':edit_thread';
                              break;
                         case updOperation.POST_NEW:
                              handlerName = ':message';
                              break;
                         case updOperation.POST_EDIT:
                              handlerName = ':edited_message';
                              break;
                    }
                    break;
               }
               case updType.MESSAGE_EDIT: {
                    args = this.update.message?.text?.split(' ') ?? [];
                    handlerName = ':edited_message';
                    break;
               }
               case updType.MESSAGE_BUSINESS: {
                    args = this.update.message?.text?.split(' ') ?? [];
                    break;
               }
               case updType.INLINE_QUERY: {
                    args = this.update.inline_query?.query.split(' ') ?? [];
                    break;
               }
               case updType.CALLBACK: {
                    handlerName = ':callback';
                    break;
               }
               /*
               case 'edit_thread': {
                    handlerName = ':edit_thread';
                    break;
               }
               case 'create_thread': {
                    handlerName = ':create_thread';
                    break;
               }
               case 'photo': {
                    handlerName = ':photo';
                    break;
               }
               case 'document': {
                    handlerName = ':document';
                    break;
               }*/
               default:
               break;
          }
          if (args.at(0)?.startsWith('/')) { //check replication
               handlerName = args.at(0)?.slice(1) ?? ':message';
          }
          if (!( handlerName in this.handlers)) {
               handlerName = ':message';
          }
          if (ctx.commandFlag) {
               await ctx.bot.handleBotCommand(ctx);
          }
               
          return await this.handlers[handlerName](this.currentContext);
          
          
     }
 

     /**
      * This method handles the updates from Telegram.
      * when a POST request arrives at the webhooendPoint, thebot reads te JSON
      * body of this request, interpreting this as an Update from Telegram.
      * If the update contains a message, call haldler methods.
      * @param {*} env the worker env variables
      * @param request - the request to handle
	
	async handle(env:any, request: Request): Promise<Response> {
          console.log(`[LOGGING FROM /handle]: Request came from ${request.url}`);
		this.webhook = new Webhook(this.token, request);
		const url = new URL(request.url);
          console.log(`[LOGGING FROM /handle]: this token: ${this.token}`);

		//if (`/${this.token}` === url.pathname) {
			switch (request.method) {
				case 'POST': {
					this.update = await request.json();
					console.log(this.update);
					let updType = ':message';
					let args: string[] = [];
					const ctx = new TG_ExecutionContext(this, this.update);
					this.currentContext = ctx;
                         console.log('debug ctx update_type: ',ctx.update_type)
					switch (ctx.update_type) {
						case 'message': {
							args = this.update.message?.text?.split(' ') ?? [];
                                   await this.handleMessage(ctx);
							break;
						}
                              case 'edited_message': {
							args = this.update.message?.text?.split(' ') ?? [];
                                   await this.handleEditedMessage(ctx);
							break;
						}
						case 'business_message': {
							args = this.update.message?.text?.split(' ') ?? [];
							break;
						}
						case 'inline': {
							args = this.update.inline_query?.query.split(' ') ?? [];
							break;
						}
						case 'photo': {
							updType = ':photo';
							break;
						}
						case 'document': {
							updType = ':document';
							break;
						}
						case 'callback': {
							updType = ':callback';
                                   await this.handleCallbackQuery(ctx);
							break;
						}
						default:
							break;
					}
					if (args.at(0)?.startsWith('/')) {
						updType = args.at(0)?.slice(1) ?? ':message';
					}
					if (!(updType in this.handlers)) {
						updType = ':message';
					}
					return await this.handlers[updType](ctx);
				}
				case 'GET': {
					switch (url.searchParams.get('command')) {
						case 'set':
							return this.webhook.set();

						default:
							break;
					}
					break;
				}

				default:
					break;
			}
		//}
		//return new Response('ok');
	}*/


     //HANDLERS

     async handleMessage(ctx:TG_ExecutionContext) {
         
          console.log("operation: ", ctx.update_operation);
          //console.log("env: ", ctx.bot.env);
          //return new Response("Hello, world!");
          if (!isValidChat(ctx.update_message,  ctx.bot.botINFO.CHATID)) {''
              
              //console.log("invalid chat: ");
              //console.log("env: ", env.json());
              //return new Response("Hello, world!");
             return  new Response('Unauthorized', { status: 403 });
          }
      
          
          //only for messages without specif handlers like create and edit thread
          switch (ctx.update_operation) {
              /*case updOperation.THREAD_EDIT:
               await ctx.bot.handleEditThread(ctx);
               break;
              
              case updOperation.THREAD_CREATE: //case ther is no specific handler
               console.log('debug from handleMessage- will execute db handleCreteTrhread')
          
                  await ctx.bot.handleCreateThread(ctx);
                  break;*/
              case updOperation.MEDIA_NEW:
                  await ctx.bot.handleNewMedia(ctx);
                  break;
              case updOperation.POST_NEW:
                  await ctx.bot.handleNewPost(ctx);
                  break;
          }
          console.log('debug from handleMessage- returned from handleCreteTrhread and will execute db insert')
          await DB_API.dbInsertMessage(ctx.bot, ctx.update_message);
          return new Response('ok');
     }

     async handleEditedMessage(ctx:TG_ExecutionContext) {
          const messageJson:any = ctx.update.edited_message
          const message:ContextMessage = new ContextMessage(messageJson);
      
          switch (ctx.update_operation) {
              case 'edit_media':
                  await this.handleEditMedia(ctx);
                  break;
              case 'edit_post':
                  await this.handleEditPost(ctx);
                  break;
          }
          await DB_API.dbEditMessage( this, message);
          return new Response('ok');
     }

      
      
      async handleOldMessages () {
          await TG_BOT.removeOldMessages(this);
      }
      
      async handleBotResponses(response_ids:any[]) {
          const array = response_ids.flat();
          if (array.length > 0) {
              await DB_API.dbBatchInsertBot(this.DB, array);
          }
      }

      async handleEditThread(ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          const threadName =  message.message.forum_topic_edited?.name;
          await TIOZAO_CMDS.checkDuplicatedThread(ctx.bot, threadName, message.id_thread);
          await ctx.bot.handleBotResponses(response_ids);
          return new Response('ok');
      }
      
      async handleCreateThread (ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          const threadName =  message.message.forum_topic_created?.name;
          await TIOZAO_CMDS.checkDuplicatedThread(ctx.bot, threadName, message.id_thread);
          await ctx.bot.handleBotResponses(response_ids);
          console.log('debug from handleCreateThread- returned from checkDuplicatedThread and will execute db insert')
          await DB_API.dbInsertMessage(ctx.bot, ctx.update_message);
          return new Response('ok');
      }
      
      async handleNewMedia(ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
      
          response_ids.push(await TIOZAO_CMDS.checkHaveCaption(ctx.bot, message));
          return await ctx.bot.handleBotResponses(response_ids);
      }
      
      async handleNewPost (ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          //console.log("handleNewPost: ", message.operation);
          if (message.is_td_rp || message.is_td) {
              response_ids.push(await TIOZAO_CMDS.confirmTD(ctx.bot, this.currentContext.update_message, 0));
          }
          return await ctx.bot.handleBotResponses(response_ids);
      }
      
     
      
      async handleEditMedia (ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
      
          response_ids.push(await  TIOZAO_CMDS.checkHaveCaption(ctx.bot, message, true));
          return await ctx.bot.handleBotResponses(response_ids);
      }
      
      async handleEditPost (ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
      
          if (message.is_td_rp || message.is_td) {
              response_ids.push(await TIOZAO_CMDS.confirmTD(ctx.bot, this.currentContext.update_message, 1));
          }
          return await ctx.bot.handleBotResponses(response_ids);
      
      }
      
      async handleBotCommand(ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          const message_id = message.message_id;
          const id_thread = message.id_thread;
          const id_user = message.id_user;
          const msg_txt = message.msg_txt?.trim();
          const command = msg_txt?.split(' ')[0];
          let response_ids:any[] = [];
          console.log('debug command:', command);
          //ctx.bot.onCommand('/info', { func: (env:any, _:any) => TIOZAO_CMDS.listInfo(this), requiresArg: false });
      
          const commandEntry:any = Object.entries(ctx.bot.commands).find(([prefix]) =>
              msg_txt?.startsWith(prefix)
          );
         
          if (commandEntry) {
              const [selectedCommand, { func: commandFunction, requiresArg }] = commandEntry;
              const argument = msg_txt?.slice(selectedCommand.length).trim();
              await TIOZAO_BOT_CMDs.botAlert(ctx.bot, `Voce usou o comando ${selectedCommand}`, id_thread, message_id);
              
              if (requiresArg && argument === '') {
                  response_ids.push(await TIOZAO_BOT_CMDs.botAlert( ctx.bot, `O comando ${selectedCommand} precisa de um parâmetro.`, id_thread, message_id));
              } else if (requiresArg && !msg_txt?.startsWith(selectedCommand + ' ')) {
                  response_ids.push(await  TIOZAO_BOT_CMDs.botAlert(ctx.bot, `Adicione espaço entre o ${selectedCommand} e o parâmetro.`, id_thread, message_id));
              } else {
                  response_ids = await commandFunction(ctx.bot, argument);
              }
          } else {
              response_ids.push(await  TIOZAO_BOT_CMDs.botAlert(ctx.bot, 'Comando desconhecido: ' + command, id_thread, message_id));
          }
      
          if (commandEntry != '/spa') {
              await TIOZAO_CMDS.showMenu(ctx.bot,response_ids);
          }
          response_ids.push(message_id);
          await ctx.bot.handleBotResponses(response_ids);
          return await ctx.bot.handleOldMessages();
      }
      
      public static async handleCallbackQuery(ctx:TG_ExecutionContext) {
          const callbackQuery:any = ctx.update.callback_query
          const { from: user, data: command } = callbackQuery;
          let response_ids:any[] = [];
          
          const commandKey = Object.keys(ctx.bot.commands).find(prefix => command.startsWith(prefix));
      
          if (commandKey) {
              await ctx.bot.tgAnswerCallbackQuery(callbackQuery.id, commandKey);
              const commandFunction:commandFunc = ctx.bot.commands[commandKey];
              response_ids = await commandFunction.func(ctx.bot, callbackQuery, command.slice(commandKey.length).trim());
          } else {
              return new Response(`Unknown command: ${command}`, { status: 400 });
          }
          if (command !== '/spa') {
              await  TIOZAO_CMDS.showMenu( ctx.bot, response_ids);
          }
          await  ctx.bot.handleBotResponses( response_ids);
          await  ctx.bot.handleOldMessages();
          return new Response('ok');
     }

     //Basic BOT Database Handler

     
      
      
      
     
}



