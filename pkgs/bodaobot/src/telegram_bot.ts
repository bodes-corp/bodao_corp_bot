import { DB_API } from "./database_api";
import { isValidChat, splitMessage } from "./library";
import TG_API from "./telegram_api";
import TG_ExecutionContext from "./telegram_execution_context";
import TIOZAO_API from "./tiozao/tiozao_api";
import { TIOZAO_BOT_CMDs } from "./tiozao/tiozao_bot_comands";
import Environment from "./types/Envirownment";
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

     commands:CommandHandler = {}

     /** The telegram update object */
     update: TelegramUpdate = new TelegramUpdate({});

     /** The telegram webhook object */
     webhook: Webhook = new Webhook('', new Request('http://127.0.0.1'));

     /** The current bot context */
     currentContext!: TG_ExecutionContext;

     /** The envirownment variables */
     env:Environment;

     /** The Bot Thread id */
     botThreadId: string;

     /**
	*	Create a bot
	*	@param token - the telegram secret token
	*/
     constructor(token: string, env:Environment) {
          this.env = env;
		this.token = token;
          this.botThreadId = env.TG_THREADBOT;
		this.api = new URL('https://api.telegram.org/bot' + token);
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
           

           this.onCommand('/active_gp', { func: TIOZAO_API.listActiveGp, requiresArg: false })
          .onCommand( '/chat', { func: TIOZAO_API.listChat, requiresArg: false })
          .onCommand('/gp_td', { func: TIOZAO_API.listTdGp, requiresArg: false })
          .onCommand('/spa', { func: TIOZAO_API.listSpa, requiresArg: false })
          .onCommand('/top_gp', { func: TIOZAO_API.listTopGp, requiresArg: false })
          .onCommand('/top_rp', { func: TIOZAO_API.listTopRp, requiresArg: false })
          .onCommand('/trend_gp', { func: TIOZAO_API.listTrendGp, requiresArg: false })
          .onCommand('/user', { func: TIOZAO_API.listMembers, requiresArg: false })
          .onCommand('/s', {func: TIOZAO_API.searchTerm, requiresArg: true})
          
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

     async tgSendMessageToBotThread(env:any, text:string): Promise<botResponse> {
          const params = {
               chat_id: env.TG_CHATID,
               message_thread_id: env.TG_THREADBOT,
               text,
               parse_mode: 'html',
               disable_notification: 'true'
           };
          return await TG_API.tgSendRequest(tgRequestMethod.SEND_MESSAGE, env.SECRET_TELEGRAM_API_TOKEN, params );
      }

     async tgMessage(env:any, text:string) {
          const parts = splitMessage(text, 4096, 100);
          const responses = [];
      
          for (const part of parts) {
              const response:botResponse = await this.tgSendMessageToBotThread(env, part);
              responses.push(Number(response.result.message_id));
          }
      
          return responses;
     }
      
     async tgSendMedia(env:any, media:any) {
          const params = {
               chat_id: env.TG_CHATID,
               message_thread_id: env.TG_THREADBOT,
               media,
               disable_notification: 'true'
           }
          return await TG_API.tgSendRequest(tgRequestMethod.SEND_MEDIA_GROUP,  env.SECRET_TELEGRAM_API_TOKEN, params );
     }
      
     
     async tgSendMessageThread(env:any, text:string, id_thread:any, message_id:any) {
          
          const params = {
               chat_id: env.TG_CHATID,
               message_thread_id: id_thread,
               text,
               parse_mode: 'html',
               disable_notification: 'true',
               reply_to_message_id: message_id
          }
          
          return await TG_API.tgSendRequest(tgRequestMethod.SEND_MESSAGE,  env.SECRET_TELEGRAM_API_TOKEN,params );
     }
      
     async tgDeleteMessage(env:any, message_id:any) {
          const params = {
               chat_id: env.TG_CHATID,
               message_id
          }
          return await TG_API.tgSendRequest(tgRequestMethod.DELETE_MESSAGE,  env.SECRET_TELEGRAM_API_TOKEN,params);
     }
      
     async tgDeleteMessages(env:any, chunk:any) {
          try {
              const deleteParams = { chat_id: env.TG_CHATID, message_ids: chunk };
              const response = await fetch(TG_API.tgApiUrl(tgRequestMethod.DELETE_MESSAGES, this.token), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(deleteParams)
              });
      
              const result:any = await response.json();
              if (!result.ok) {
                  throw new Error(`Failed to delete messages: ${result.description}`);
              }
          } catch (error) {
              console.error('Error deleting messages:', error);
          }
     }
      
     async tgButton(env:any, buttons:string[], text:string) {
          const batchSize = 90;
          const responses = [];
      
          for (let i = 0; i < buttons.length; i += batchSize) {
              const batch = buttons.slice(i, i + batchSize);
              const response:botResponse = await TG_API.sendButtonToBotThread(env.SECRET_TELEGRAM_API_TOKEN, env.TG_CHATID, env.TG_THREADBOT, batch, text);
              //console.log("debug rsponse from bot: ", response);
              responses.push(Number(response.result.message_id));
          }
      
          return responses;
     }
      
     
     async tgAnswerCallbackQuery(env:any, callbackQueryId:any, text:string|null = null) {       
          return await TG_API.tgAnswerCallbackQuery(env.SECRET_TELEGRAM_API_TOKEN, callbackQueryId, text);
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
               await ctx.bot.handleBotCommand( ctx.bot.env, ctx.update_message);
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
          console.log("env: ", ctx.bot.env);
          //return new Response("Hello, world!");
          if (!isValidChat(ctx.update_message,  ctx.bot.env)) {''
              
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
                  await ctx.bot.handleNewMedia( ctx.bot.env, ctx.update_message);
                  break;
              case updOperation.POST_NEW:
                  await ctx.bot.handleNewPost( ctx.bot.env, ctx.update_message);
                  break;
          }

          await DB_API.dbInsertMessage( ctx.bot.env, ctx.update_message);
          return new Response('ok');
     }

     async handleEditedMessage(ctx:TG_ExecutionContext) {
          const messageJson:any = ctx.update.edited_message
          const message:ContextMessage = new ContextMessage(messageJson);
      
          switch (ctx.update_operation) {
              case 'edit_media':
                  await this.handleEditMedia( ctx.bot.env, message);
                  break;
              case 'edit_post':
                  await this.handleEditPost( ctx.bot.env, message);
                  break;
          }
          await DB_API.dbEditMessage( ctx.bot.env, message);
          return new Response('ok');
     }

      
      
      async handleOldMessages () {
          await TIOZAO_BOT_CMDs.removeOldMessages(this.env, this);
      }
      
      async handleBotResponses(env:any, response_ids:any[]) {
          const array = response_ids.flat();
          if (array.length > 0) {
              await DB_API.dbBatchInsertBot(env, array);
          }
      }

      async handleEditThread(ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          const threadName =  message.message.forum_topic_edited?.name;
          await TIOZAO_API.checkDuplicatedThread(this.env, this, threadName, message.id_thread);
          await this.handleBotResponses(this.env, response_ids);
          return new Response('ok');
      }
      
      async handleCreateThread ( ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          const threadName =  message.message.forum_topic_created?.name;
          await TIOZAO_API.checkDuplicatedThread(this.env, this, threadName, message.id_thread);
          await this.handleBotResponses(this.env, response_ids);
          return new Response('ok');
      }
      
      async handleNewMedia(env:any, message:ContextMessage) {
          let response_ids:any[] = [];
      
          response_ids.push(await TIOZAO_API.checkHaveCaption(env, message));
          return await this.handleBotResponses(env, response_ids);
      }
      
      async handleNewPost (env:any, message:ContextMessage) {
          let response_ids:any[] = [];
          //console.log("handleNewPost: ", message.operation);
          if (message.is_td_rp || message.is_td) {
              response_ids.push(await confirmTD(env,this, message.message, 0));
          }
          return await this.handleBotResponses(env, response_ids);
      }
      
     
      
      async handleEditMedia (env:any, message:ContextMessage) {
          let response_ids:any[] = [];
      
          response_ids.push(await checkHaveCaption(env, message, true));
          return await this.handleBotResponses(env, response_ids);
      }
      
      async handleEditPost (env:any, message:ContextMessage) {
          let response_ids:any[] = [];
      
          if (message.is_td_rp || message.is_td) {
              response_ids.push(await confirmTD(env, this, message.message, 1));
          }
          return await this.handleBotResponses(env, response_ids);
      
      }
      
      async handleBotCommand(env:any, message:ContextMessage) {
          const message_id = message.message_id;
          const id_thread = message.id_thread;
          const id_user = message.id_user;
          const msg_txt = message.msg_txt?.trim();
          const command = msg_txt?.split(' ')[0];
          let response_ids:any[] = [];
          this.onCommand('/info', { func: (env:any, _:any) => TIOZAO_API.listInfo(this, id_user), requiresArg: false });
      
          const commandEntry:any = Object.entries(this.commands).find(([prefix]) =>
              msg_txt?.startsWith(prefix)
          );
      
          if (commandEntry) {
              const [selectedCommand, { func: commandFunction, requiresArg }] = commandEntry;
              const argument = msg_txt?.slice(selectedCommand.length).trim();
      
              if (requiresArg && argument === '') {
                  response_ids.push(await TIOZAO_BOT_CMDs.botAlert(env, this, `O comando ${selectedCommand} precisa de um parâmetro.`, id_thread, message_id));
              } else if (requiresArg && !msg_txt?.startsWith(selectedCommand + ' ')) {
                  response_ids.push(await  TIOZAO_BOT_CMDs.botAlert(env,  this, `Adicione espaço entre o ${selectedCommand} e o parâmetro.`, id_thread, message_id));
              } else {
                  response_ids = await commandFunction(env, argument);
              }
          } else {
              response_ids.push(await  TIOZAO_BOT_CMDs.botAlert(env,  this, 'Comando desconhecido: ' + command, id_thread, message_id));
          }
      
          if (commandEntry != '/spa') {
              await TIOZAO_API.showMenu(env, this,response_ids);
          }
          response_ids.push(message_id);
          await this.handleBotResponses(env, response_ids);
          return await this.handleOldMessages();
      }
      
      async handleCallbackQuery(ctx:TG_ExecutionContext) {
          const callbackQuery:any = ctx.update.callback_query
          const { from: user, data: command } = callbackQuery;
          let response_ids:any[] = [];
      
          
      
          const commandKey = Object.keys(this.commands).find(prefix => command.startsWith(prefix));
      
          if (commandKey) {
              await ctx.bot.tgAnswerCallbackQuery( ctx.bot.env, callbackQuery.id, commandKey);
              const commandFunction:any = this.commands[commandKey];
              response_ids = await commandFunction( ctx.bot.env, callbackQuery, command.slice(commandKey.length).trim());
          } else {
              return new Response(`Unknown command: ${command}`, { status: 400 });
          }
          if (command !== '/spa') {
              await  TIOZAO_API.showMenu( ctx.bot.env, ctx.bot, response_ids);
          }
          await  ctx.bot.handleBotResponses( ctx.bot.env, response_ids);
          await  ctx.bot.handleOldMessages();
          return new Response('ok');
      }
      
      async handleSpaCommand(env:any, callbackQuery:any, spa:string) {
          if (spa === '') {
              return await TIOZAO_API.listSpa(this);
          } else {
              await this.tgAnswerCallbackQuery(env, callbackQuery.id, spa);
              return await TIOZAO_API.searchSpa(env, this,spa);
          }
      }
      
     
}

function confirmTD(env: any, bot: any, message: TG_Message, arg3: number): any {
     throw new Error("Function not implemented.");
}
function checkHaveCaption(env: any, message: any, arg2: boolean): any {
     throw new Error("Function not implemented.");
}

