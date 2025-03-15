import { DB_API } from "./database_api";
import { chunkArray, splitMessage } from "./library";
import TG_REQ from "./telegram/RequestManager";
import { Requests } from "./telegram/requests";
import TG_API from "./telegram/telegram_api";
import { InlineKeyboardButton } from "./telegram/types/markup";
import { tg } from "./telegram/updating_messages";
import TG_ExecutionContext from "./telegram_execution_context";
import TIOZAO_CMDS from "./tiozao/tiozao_api";
import { TIOZAO_BOT_CMDs } from "./tiozao/tiozao_bot_comands";
import { BOT_INFO } from "./types/BotInfo";
import { ContextMessage } from "./types/TelegramMessage";
import { checkUserOperationFuncAsync, CheckUserOperationsHandler, commandFunc, CommandHandler, Handler, handlerFunc, Hideable, tgRequestMethod, updOperation, updType } from "./types/Types";
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
     updateHandlers:Handler  = {} as Handler;

     /**command handlers record map */
     commands:CommandHandler = {}
     
     /** The telegram handlers record map */
	userOperationsChecks: CheckUserOperationsHandler  = {} as  CheckUserOperationsHandler;

     
     

     /** The telegram update object */
     update: tgTypes.Update = {} as tgTypes.Update;

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
           
          
	}

     /**
	 * Register a handler on the bot
	 * @param event - the event or command name
	 * @param callback - the bot context
	 */
	on(event: string, callback: handlerFunc) {
		if (!['on', 'handle'].includes(event)) {
			this.updateHandlers[event] = callback;
		}
		return this;
	}


     /**
	 * Register a command on the bot
	 * @param event - the event or command name
	 * @param callback - the method to execute on the command
	 */
	onCommand(event: string, callback: commandFunc) {
		if (!['onCommand', 'handle'].includes(event)) {
			this.commands[event] = callback;
		}
		return this;
	}

     /**
	 * Register a user checkFunction on the bot
	 * @param key - key will be used to identify the operation
	 * @param callbackCheck - callback to check if the update has a user defned condition
      * @param callback - the handler to execute on callbackCheck returning true
	 */
	onCheck(key: string, callbackCheck: checkUserOperationFuncAsync, callback: commandFunc) {
          if (!['oncheck', 'handle'].includes(key)) {
               this.userOperationsChecks[key] = callbackCheck;
               this.onCommand(key,callback);
          }
          
          return this;
     }


     /**this method will be called by the ContextMessage to check if user defined operations, specific for that bot */
     async checkUserOperations(ctx:TG_ExecutionContext) :Promise<string[]>{
     
               const operations:string[] =[];
               const keys:string[] = Object.keys(this.userOperationsChecks) as (keyof typeof this.userOperationsChecks)[];
               if(keys.length > 0){
                    const promises:any = [];
                    keys.forEach( (key) => {
                         promises.push(new Promise(async (resolve) => {
                          // setTimeout(async () => {
                              const response = await this.userOperationsChecks[key](ctx);
                              if (response){
                                   operations.push(key);
                                   console.log(`debug from checkUserOperations - key ${key} / response: `, response);
                                   resolve(true);
                              }else {
                                   console.log(`debug from checkUserOperations - key ${key} / response: `, response);
                                   resolve(false);
                              }
                             
                           //}, 1000);
                         }));
                       });
                     
                    await Promise.all(promises);
                    return operations;
                   
               }else {
                    return Promise.resolve([]);
               }
               
                       
                         console.log(`debug from checkUserOperations - returning array: `,JSON.stringify(operations));
               
     
     }

      /**
       * Send a Text Message to the bot thread
       * @param text text to send, if it is a lont text, then it is splitted
       * @returns responses
       */
     async tgSendMessage(text:string) {
          const parts = splitMessage(text, 4096, 100);
          const responses = [];
      
          for (const part of parts) {
               const params = Requests.MessageToBotTopicRequest(this,part);
               const response:tgTypes.Message = await TG_REQ.callApi(this.botINFO.TOKEN,tgRequestMethod.SEND_MESSAGE, params );
               //console.log("debug from: tgSendMessage / response from bot: ", response);
               //const response:botResponse = await this.tgSendMessageToBotThread(part);
               responses.push(Number(response.message_id));
          }
      
          return responses;
     }
     
     /**
      * Send Buttons with caption
      * @param buttons buttons Markup to send
      * @param caption text caption to appent to buttons
      * @returns message_id[]
      */
     async tgSendButtons(buttons:Hideable<InlineKeyboardButton.CallbackButton>[], caption:string) {
          if(!Array.isArray(buttons) || !caption) {
               return Promise.resolve([]);
          }
          const batchSize = 90;
          const responses = [];
      
          for (let i = 0; i < buttons.length; i += batchSize) {
              const batch = buttons.slice(i, i + batchSize);
               
              const params = Requests.sendButtonToBotThreadRequest(this, caption, batch);

               const response:tgTypes.Message = await TG_REQ.callApi(this.botINFO.TOKEN,tgRequestMethod.SEND_MESSAGE, params);
               //console.log("debug from: tgButton / response from bot: ", response);
               responses.push(Number(response.message_id));
          }
      
          return responses;
     }
      
     
     async tgAnswerCallbackQuery(callbackQueryId:any, text:string|null = null) { 

          const params = Requests.answerCallBackRequest(this,callbackQueryId, text)
          return await TG_API.answerCallbackQuery(this.botINFO.TOKEN, params);
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
          const id_msg_array:number[] = [];
          try {
              
               const chunks:any[] = await TG_BOT.dbGetBotMessages(bot,old);
               for (const row of chunks) {
                    const message_id = row[0];
                    id_msg_array.push(message_id);
                }
               if (Array.isArray(id_msg_array) && ( id_msg_array).length > 0 ) {
                    //const response = await TG_API.tgDeleteMessagesFromChat(bot.botINFO.TOKEN,bot.botINFO.CHATID, chunks);
                    const message_ids: number [] = id_msg_array;
                    const  chat_id = bot.botINFO.CHATID;
                    console.log("delete from removeOldMessages - params:",  JSON.stringify({chat_id,message_ids}));
                    const response:boolean = await tg.deleteMessages(bot.botINFO.TOKEN,{chat_id, message_ids});
                    console.log('debug from removeOldMessages - result:', response);
                                    
                    if (response === true) await DB_API.deleteMessagesFromDB(bot.DB,old);
                    Promise.resolve(true);
               }else {
                    Promise.resolve(false);
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
     async handleUpdate(update: tgTypes.Update) {
          this.update = update;
          
          let handlerName /*: updType_t*/  = ':message';
          let args: string[] = [];
          const ctx = new TG_ExecutionContext(this, this.update);
          const userOper = await  this.checkUserOperations(ctx);
          console.log ('debug from handleUpdate - useroper: ' ,JSON.stringify(userOper))
          ctx.user_operations = userOper;
          this.currentContext = ctx;
          console.log('debug from handleUpdate - debug ctx update_type: ',ctx.update_type);
          console.log("debug from handleUpdate - debug ctx message:", ctx.update.message);
          console.log('debug from handleUpdate - operation: ',ctx.update_operation)
          //console.log("debug ctx message user:", ctx.update?.message?.from.id)
          //console.log("debug ctx message user:",ctx.update_message.id_user);
          
          switch (ctx.update_type) {
               case updType.MESSAGE: {
                    args = ctx.update.message?.text?.split(' ') ?? [];
                    handlerName = ':message';
               switch(ctx.update_operation){
                         case updOperation.THREAD_CREATE:
                              handlerName = ':create_thread';
                              break;
                         case updOperation.THREAD_EDIT:
                              handlerName = ':edit_thread';
                              break;
                         case updOperation.MEMBER_JOIN:
                              handlerName = ':handle_member';
                              break;
                         case updOperation.MEMBER_LEFT:
                              handlerName = ':handle_member';
                              break;
                         
                    }
                    break;
               }
               case updType.MESSAGE_EDIT: {
                    args = ctx.update.message?.text?.split(' ') ?? [];
                    handlerName = ':edited_message';
                    break;
               }
               case updType.MESSAGE_BUSINESS: {
                    args = ctx.update.message?.text?.split(' ') ?? [];
                    break;
               }
               case updType.INLINE_QUERY: {
                    args = ctx.update.inline_query?.query.split(' ') ?? [];
                    break;
               }
               case updType.CALLBACK: {
                    handlerName = ':callback';
                    break;
               }
               case updType.POLL: {
                    handlerName = ':poll';
                    break;
               }
               case updType.POLL_ANSWER: {
                    handlerName = ':poll_answer';
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
               handlerName= args.at(0)?.slice(1) ?? ':message';
          }
          if (!( handlerName in this.updateHandlers)) {
               handlerName = ':message';
          }
          if (ctx.commandFlag) {
               await ctx.bot.handleBotCommand(ctx);
          }
          if (ctx.user_operations.length >0 ) {
               await ctx.bot.handleUserDefinedOperation(ctx);
          }
               
          //updateHandlers do not receive the this pointer.
          //remember to not use them in inside the methods
          //the best way is to make them static methods
          return await this.updateHandlers[handlerName](this.currentContext);
          
          
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


     // internal Handlers     
      
     async handleOldMessages () {
          await TG_BOT.removeOldMessages(this);
      }
      
     async handleBotResponses(response_ids:any[]) {
          const array = response_ids.flat();
          if (array.length > 0) {
              await DB_API.dbBatchInsertBot(this.DB, array);
          }
      }

     async handleNewMedia(ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
      
          response_ids.push(await TIOZAO_CMDS.checkHaveCaption(ctx.bot, message));
          return await ctx.bot.handleBotResponses(response_ids);
      }

     async handleNewDocument(ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
      
          response_ids.push(await TIOZAO_CMDS.checkHaveCaption(ctx.bot, message));
          return await ctx.bot.handleBotResponses(response_ids);
      }
      
     async handleNewPost (ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          //console.log("handleNewPost: ", message.operation);
          const isTD = ctx.checkUserOperation('isTD');
          const isRP = ctx.checkUserOperation('isRP');
          if (isRP || isTD) {
              response_ids.push(await TIOZAO_CMDS.confirmTD(ctx.bot, ctx.bot.currentContext.update_message, 0));
          }
          return await ctx.bot.handleBotResponses(response_ids);
      }
      
     
      
     async handleEditMedia (ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
      
          response_ids.push(await  TIOZAO_CMDS.checkHaveCaption(ctx.bot, message, true));
          return await ctx.bot.handleBotResponses(response_ids);
      }


     async handleEditDocument (ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          console.log('debug from handleEditDocument')
          response_ids.push(await  TIOZAO_CMDS.checkHaveCaption(ctx.bot, message, true));
          return await ctx.bot.handleBotResponses(response_ids);
      }
      
     async handleEditPost (ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
      
          const isTD = ctx.checkUserOperation('isTD');
          const isRP = ctx.checkUserOperation('isRP');
          if (isRP || isTD) {
              response_ids.push(await TIOZAO_CMDS.confirmTD(ctx.bot, ctx.bot.currentContext.update_message, 1));
          }
          return await ctx.bot.handleBotResponses(response_ids);
      
      }

     async handleUserDefinedOperation( ctx: TG_ExecutionContext ) {
          console.log('debug from handleUserDefinedOperation')
          let message:ContextMessage = ctx.update_message;
          const message_id = message.message_id;
          const id_thread = message.id_thread;
          const id_user = message.id_user;
          const msg_txt = message.msg_txt?.trim();
          let response_ids:any[] = [];
          ctx.user_operations.forEach(async (prefix) => {
               //console.log('debug from handleUserDefinedOperation: find command for prefix: ',prefix)
               const commandEntry:any= Object.entries(ctx.bot.commands).find((row) => row[0]===prefix);
              // console.log(`debug from handleUserDefinedOperation - commandHandler::`, JSON.stringify(commandEntry))
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
               }else{
                    response_ids.push(await  TIOZAO_BOT_CMDs.botAlert(ctx.bot, 'Handler not found for user defined operation: ' + prefix, id_thread, message_id));
               }

          })     

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
          //ctx.bot.onCommand('/info', { func: (env:any, _:any) => TIOZAO_CMDS.listInfo(ctx.bot), requiresArg: false });
      
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
      
      
}



