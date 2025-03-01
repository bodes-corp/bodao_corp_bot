import { DB_API } from "./database_api";
import { isValidChat, splitMessage } from "./library";
import TG_API from "./telegram_api";
import TG_ExecutionContext from "./telegram_execution_context";
import TIOZAO_CMDS from "./tiozao/tiozao_api";
import { TIOZAO_BOT_CMDs } from "./tiozao/tiozao_bot_comands";
import { BOT_INFO, BotINFO } from "./types/BotInfo";
import { ContextMessage, TG_Message } from "./types/TelegramMessage";
import TelegramUpdate from "./types/TelegramUpdate";
import { botResponse, commandFunc, CommandHandler, Handler, handlerFunc, tgRequestMethod, updOperation, updType } from "./types/Types";
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
           .on(':callback',this.handleCallbackQuery)
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
		if (!['on', 'handle'].includes(event)) {
			this.commands[event] = callback;
		}
		return this;
	}

     async tgSendMessageToBotThread(botInfo:BotINFO, text:string): Promise<botResponse> {
          if (!botInfo) {
               return Promise.resolve({
                    "ok": false,
                    "result": {} as TG_Message
               } );
          }
          const params = {
               chat_id: botInfo.CHATID,
               message_thread_id: botInfo.THREADBOT,
               text,
               parse_mode: 'html',
               disable_notification: 'true'
           };
          return await TG_API.tgSendRequest(tgRequestMethod.SEND_MESSAGE, botInfo.TOKEN, params );
      }

     async tgMessage(text:string) {
          const parts = splitMessage(text, 4096, 100);
          const responses = [];
      
          for (const part of parts) {
              const response:botResponse = await this.tgSendMessageToBotThread(this.botINFO, part);
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
          
          return await TG_API.tgSendRequest(tgRequestMethod.SEND_MESSAGE,  info.TOKEN,params );
     }
      
       
     
     async tgButton(buttons:string[], text:string) {
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
          console.log('debug ctx update_type: ',ctx.update_type)
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
               await ctx.bot.handleBotCommand(ctx.update_message);
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
      
          
          
          switch (ctx.update_operation) {
              case updOperation.THREAD_EDIT:
               await ctx.bot.handleEditThread(ctx);
               break;
              case updOperation.THREAD_CREATE:
                  await ctx.bot.handleCreateThread(ctx);
                  break;
              case updOperation.MEDIA_NEW:
                  await ctx.bot.handleNewMedia(ctx.update_message);
                  break;
              case updOperation.POST_NEW:
                  await ctx.bot.handleNewPost(ctx.update_message);
                  break;
          }

          await DB_API.dbInsertMessage(this, ctx.update_message);
          return new Response('ok');
     }

     async handleEditedMessage(ctx:TG_ExecutionContext) {
          const messageJson:any = ctx.update.edited_message
          const message:ContextMessage = new ContextMessage(messageJson);
      
          switch (ctx.update_operation) {
              case 'edit_media':
                  await this.handleEditMedia(message);
                  break;
              case 'edit_post':
                  await this.handleEditPost(message);
                  break;
          }
          await DB_API.dbEditMessage( this, message);
          return new Response('ok');
     }

      
      
      async handleOldMessages () {
          await TIOZAO_BOT_CMDs.removeOldMessages(this);
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
          await TIOZAO_CMDS.checkDuplicatedThread(this, threadName, message.id_thread);
          await this.handleBotResponses(response_ids);
          return new Response('ok');
      }
      
      async handleCreateThread ( ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          const threadName =  message.message.forum_topic_created?.name;
          await TIOZAO_CMDS.checkDuplicatedThread(this, threadName, message.id_thread);
          await this.handleBotResponses(response_ids);
          return new Response('ok');
      }
      
      async handleNewMedia(message:ContextMessage) {
          let response_ids:any[] = [];
      
          response_ids.push(await TIOZAO_CMDS.checkHaveCaption(this, message));
          return await this.handleBotResponses(response_ids);
      }
      
      async handleNewPost (message:ContextMessage) {
          let response_ids:any[] = [];
          //console.log("handleNewPost: ", message.operation);
          if (message.is_td_rp || message.is_td) {
              response_ids.push(await TIOZAO_CMDS.confirmTD(this, this.currentContext.update_message, 0));
          }
          return await this.handleBotResponses(response_ids);
      }
      
     
      
      async handleEditMedia (message:ContextMessage) {
          let response_ids:any[] = [];
      
          response_ids.push(await  TIOZAO_CMDS.checkHaveCaption(this, message, true));
          return await this.handleBotResponses(response_ids);
      }
      
      async handleEditPost (message:ContextMessage) {
          let response_ids:any[] = [];
      
          if (message.is_td_rp || message.is_td) {
              response_ids.push(await TIOZAO_CMDS.confirmTD(this, this.currentContext.update_message, 1));
          }
          return await this.handleBotResponses(response_ids);
      
      }
      
      async handleBotCommand(message:ContextMessage) {
          const message_id = message.message_id;
          const id_thread = message.id_thread;
          const id_user = message.id_user;
          const msg_txt = message.msg_txt?.trim();
          const command = msg_txt?.split(' ')[0];
          let response_ids:any[] = [];
          console.log('debug command:', command);
          //this.onCommand('/info', { func: (env:any, _:any) => TIOZAO_CMDS.listInfo(this), requiresArg: false });
      
          const commandEntry:any = Object.entries(this.commands).find(([prefix]) =>
              msg_txt?.startsWith(prefix)
          );
         
          if (commandEntry) {
              const [selectedCommand, { func: commandFunction, requiresArg }] = commandEntry;
              const argument = msg_txt?.slice(selectedCommand.length).trim();
              await TIOZAO_BOT_CMDs.botAlert(this, `Voce usou o comando ${selectedCommand}`, id_thread, message_id);
              
              if (requiresArg && argument === '') {
                  response_ids.push(await TIOZAO_BOT_CMDs.botAlert( this, `O comando ${selectedCommand} precisa de um parâmetro.`, id_thread, message_id));
              } else if (requiresArg && !msg_txt?.startsWith(selectedCommand + ' ')) {
                  response_ids.push(await  TIOZAO_BOT_CMDs.botAlert(this, `Adicione espaço entre o ${selectedCommand} e o parâmetro.`, id_thread, message_id));
              } else {
                  response_ids = await commandFunction(this, argument);
              }
          } else {
              response_ids.push(await  TIOZAO_BOT_CMDs.botAlert(this, 'Comando desconhecido: ' + command, id_thread, message_id));
          }
      
          if (commandEntry != '/spa') {
              await TIOZAO_CMDS.showMenu(this,response_ids);
          }
          response_ids.push(message_id);
          await this.handleBotResponses(response_ids);
          return await this.handleOldMessages();
      }
      
      async handleCallbackQuery(ctx:TG_ExecutionContext) {
          const callbackQuery:any = ctx.update.callback_query
          const { from: user, data: command } = callbackQuery;
          let response_ids:any[] = [];
      
          
      
          const commandKey = Object.keys(this.commands).find(prefix => command.startsWith(prefix));
      
          if (commandKey) {
              await ctx.bot.tgAnswerCallbackQuery(callbackQuery.id, commandKey);
              const commandFunction:any = ctx.bot.commands[commandKey];
              response_ids = await commandFunction(ctx.bot, callbackQuery, command.slice(commandKey.length).trim());
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



