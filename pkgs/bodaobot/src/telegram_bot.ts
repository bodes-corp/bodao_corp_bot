import { DB_API } from "./database_api";
import { splitMessage } from "./library";
import TG_ExecutionContext from "./telegram_execution_context";
import TIOZAO_API from "./tiozao/tiozao_api";
import { TIOZAO_BOT_CMDs } from "./tiozao/tiozao_bot_comands";
import Environment from "./types/Envirownment";
import TG_Message, { EditedMessage, Message } from "./types/TelegramMessage";
import TelegramUpdate from "./types/TelegramUpdate";
import Webhook from "./webhook";


function isValidChat(message:any , env:any ) {
     return message.chat_id === parseInt(env.TG_CHATID);
}

type Handler = Record<string, (ctx:TG_ExecutionContext) => Promise<Response>>

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

     /** The telegram update object */
     update: TelegramUpdate = new TelegramUpdate({});

     /** The telegram webhook object */
     webhook: Webhook = new Webhook('', new Request('http://127.0.0.1'));

     /** The current bot context */
     currentContext!: TG_ExecutionContext;

     /** The envirownment variables */
     env:Environment;

     /**
	*	Create a bot
	*	@param token - the telegram secret token
	*/
     constructor(token: string, env:Environment) {
          this.env = env;
		this.token = token;
		this.api = new URL('https://api.telegram.org/bot' + token);
          this.handlers = {
               ':message': this.handleMessage,
               ':edited_message': this.handleEditedMessage,
               ':callback': this.handleCallbackQuery,
           }
	}

    

    


     tgApiUrl(methodName:any, params = {}) {
          const query = params ? `?${new URLSearchParams(params).toString()}` : '';
          return this.api+`/${methodName}${query}`;
     }

     async tgSendRequest(method:string, env:any, params:any) {
          try {
              const response = await fetch(this.tgApiUrl(method, params), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
              });
      
              const data:any = await response.json();
              if (!data.ok) {
                  throw new Error(`Telegram API Error: ${data.description}`);
              }
      
              return data;
          } catch (error) {
              console.error(`Error in ${method} request:`, error);
              throw error;
          }
     }

     async tgSendMessage(env:any, text:string) {
          return await this.tgSendRequest('sendMessage', env, {
              chat_id: env.TG_CHATID,
              message_thread_id: env.TG_THREADBOT,
              text,
              parse_mode: 'html',
              disable_notification: 'true'
          });
      }

     async tgMessage(env:any, text:string) {
          const parts = splitMessage(text, 4096, 100);
          const responses = [];
      
          for (const part of parts) {
              const response = await this.tgSendMessage(env, part);
              responses.push(Number(response.result.message_id));
          }
      
          return responses;
     }
      
     async tgSendMedia(env:any, media:any) {
          return await this.tgSendRequest('sendMediaGroup', env, {
              chat_id: env.TG_CHATID,
              message_thread_id: env.TG_THREADBOT,
              media,
              disable_notification: 'true'
          });
     }
      
     
     async tgSendMessageThread(env:any, text:string, id_thread:any, message_id:any) {
          return await this.tgSendRequest('sendMessage', env, {
              chat_id: env.TG_CHATID,
              message_thread_id: id_thread,
              text,
              parse_mode: 'html',
              disable_notification: 'true',
              reply_to_message_id: message_id
          });
     }
      
     async tgDeleteMessage(env:any, message_id:any) {
          return await this.tgSendRequest('deleteMessage', env, {
              chat_id: env.TG_CHATID,
              message_id
          });
     }
      
     async tgDeleteMessages(env:any, chunk:any) {
          try {
              const deleteParams = { chat_id: env.TG_CHATID, message_ids: chunk };
              const response = await fetch(this.tgApiUrl('deleteMessages'), {
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
              const response = await this.tgSendButton(env, batch, text);
              responses.push(Number(response.result.message_id));
          }
      
          return responses;
     }
      
     async tgSendButton(env:any, buttons:any, text:any) {
          return await this.tgSendRequest('sendMessage', env, {
              chat_id: env.TG_CHATID,
              message_thread_id: env.TG_THREADBOT,
              reply_markup: JSON.stringify({ inline_keyboard: buttons }),
              text,
              disable_notification: 'true'
          });
     }
      
     async tgAnswerCallbackQuery(env:any, callbackQueryId:any, text:string|null = null) {
          const params:any = { callback_query_id: callbackQueryId };
          if (text) params.text = text;
      
          return await this.tgSendRequest('answerCallbackQuery', env, params);
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
	
	//if (this.update.message) {   
	//
	//    await this.handleMessage(env, this.update.message);
	//} else if (this.update.edited_message) {
	//    await this.handleEditedMessage(env, this.update.edited_message);
	//} else if (this.update.callback_query) {
	//    await this.handleCallbackQuery(env, this.update.callback_query);
	//}


     let updType = ':message';
	let args: string[] = [];
	const ctx = new TG_ExecutionContext(this, this.update);
	this.currentContext = ctx;
     console.log('debug ctx update_type: ',ctx.update_type)
	switch (ctx.update_type) {
		case 'message': {
		     args = this.update.message?.text?.split(' ') ?? [];
         
		     break;
		}
          case 'edited_message': {
			args = this.update.message?.text?.split(' ') ?? [];

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
	return await this.handlers[updType](this.currentContext);
 }
 

     /**
      * This method handles the updates from Telegram.
      * when a POST request arrives at the webhooendPoint, thebot reads te JSON
      * body of this request, interpreting this as an Update from Telegram.
      * If the update contains a message, call haldler methods.
      * @param {*} env the worker env variables
      * @param request - the request to handle
	*/
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
	}

     async test(bot: TG_ExecutionContext)  {
          const file_id: string = bot.update.message?.document?.file_id ?? '';
          const file_response = await bot.getFile(file_id);
          const id = crypto.randomUUID().slice(0, 5);
          //await env.R2.put(id, await file_response.arrayBuffer());
          await bot.reply(`https://r2.seanbehan.ca/${id}`);
          return new Response('ok');
     }

     async handleMessage(ctx:TG_ExecutionContext) {
          const messageJson:any = ctx.update.message;
          const message:TG_Message = new Message(messageJson);
          console.log("operation: ", message.operation);
          console.log("env: ", ctx.bot.env);
          //return new Response("Hello, world!");
          if (!isValidChat(message,  ctx.bot.env)) {''
              
              //console.log("invalid chat: ");
              //console.log("env: ", env.json());
              //return new Response("Hello, world!");
             return  new Response('Unauthorized', { status: 403 });
          }
      
          if (message.msg_txt.startsWith('/')) {
              await this.handleBotCommand( ctx.bot.env, message);
          }
          
          switch (message.operation) {
              case 'create_thread':
                  await this.handleCreateThread(message);
                  break;
              case 'new_media':
                  await this.handleNewMedia( ctx.bot.env, message);
                  break;
              case 'new_post':
                  await this.handleNewPost( ctx.bot.env, message);
                  break;
          }

          await DB_API.dbInsertMessage( ctx.bot.env, message);
          return new Response('ok');
     }

     async handleEditedMessage(ctx:TG_ExecutionContext) {
          const messageJson:any = ctx.update.edited_message
          const message:TG_Message = new EditedMessage(messageJson);
      
          switch (message.operation) {
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
      
      async handleCreateThread ( message:TG_Message) {
          let response_ids:any[] = [];
      
          await TIOZAO_API.checkDuplicatedThread(this.env, this, message.threadname, message.id_thread);
          return await this.handleBotResponses(this.env, response_ids);
      }
      
      async handleNewMedia(env:any, message:TG_Message) {
          let response_ids:any[] = [];
      
          response_ids.push(await TIOZAO_API.checkHaveCaption(env, message));
          return await this.handleBotResponses(env, response_ids);
      }
      
      async handleNewPost (env:any, message:TG_Message) {
          let response_ids:any[] = [];
          //console.log("handleNewPost: ", message.operation);
          if (message.is_td_rp || message.is_td) {
              response_ids.push(await confirmTD(env,this,  message, 0));
          }
          return await this.handleBotResponses(env, response_ids);
      }
      
     
      
      async handleEditMedia (env:any, message:any) {
          let response_ids:any[] = [];
      
          response_ids.push(await checkHaveCaption(env, message, true));
          return await this.handleBotResponses(env, response_ids);
      }
      
      async handleEditPost (env:any, message:TG_Message) {
          let response_ids:any[] = [];
      
          if (message.is_td_rp || message.is_td) {
              response_ids.push(await confirmTD(env, this,message, 1));
          }
          return await this.handleBotResponses(env, response_ids);
      
      }
      
      async handleBotCommand(env:any, message:TG_Message) {
          const message_id = message.message_id;
          const id_thread = message.id_thread;
          const id_user = message.id_user;
          const msg_txt = message.msg_txt.trim();
          const command = msg_txt.split(' ')[0];
          let response_ids:any[] = [];
          
          const commands = {
              '/active_gp': { func: TIOZAO_API.listActiveGp, requiresArg: false },
              '/chat': { func: TIOZAO_API.listChat, requiresArg: false },
              '/gp_td': { func: TIOZAO_API.listTdGp, requiresArg: false },
              '/info': { func: (env:any, _:any) => TIOZAO_API.listInfo(env, this, id_user), requiresArg: false },
              '/spa': { func: TIOZAO_API.listSpa, requiresArg: false },
              '/s': {func: TIOZAO_API.searchTerm, requiresArg: true},
              '/top_gp': { func: TIOZAO_API.listTopGp, requiresArg: false },
              '/top_rp': { func: TIOZAO_API.listTopRp, requiresArg: false },
              '/trend_gp': { func: TIOZAO_API.listTrendGp, requiresArg: false },
              '/user': { func: TIOZAO_API.listMembers, requiresArg: false }
          };
      
          const commandEntry:any = Object.entries(commands).find(([prefix]) =>
              msg_txt.startsWith(prefix)
          );
      
          if (commandEntry) {
              const [selectedCommand, { func: commandFunction, requiresArg }] = commandEntry;
              const argument = msg_txt.slice(selectedCommand.length).trim();
      
              if (requiresArg && argument === '') {
                  response_ids.push(await TIOZAO_BOT_CMDs.botAlert(env, this, `O comando ${selectedCommand} precisa de um parâmetro.`, id_thread, message_id));
              } else if (requiresArg && !msg_txt.startsWith(selectedCommand + ' ')) {
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
      
          const commandHandlers:any = {
              '/active_gp': TIOZAO_API.listActiveGp,
              '/chat': TIOZAO_API.listChat,
              '/gp_td': TIOZAO_API.listTdGp,
              '/info': () => TIOZAO_API.listInfo( ctx.bot.env, ctx.bot, user.id),
              '/spa': this.handleSpaCommand,
              '/top_gp': TIOZAO_API.listTopGp,
              '/top_rp': TIOZAO_API.listTopRp,
              '/trend_gp': TIOZAO_API.listTrendGp,
              '/user': TIOZAO_API.listMembers
          };
      
          const commandKey = Object.keys(commandHandlers).find(prefix => command.startsWith(prefix));
      
          if (commandKey) {
              await ctx.bot.tgAnswerCallbackQuery( ctx.bot.env, callbackQuery.id, commandKey);
              const commandFunction:any = commandHandlers[commandKey];
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
              return await TIOZAO_API.listSpa(env,this);
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

