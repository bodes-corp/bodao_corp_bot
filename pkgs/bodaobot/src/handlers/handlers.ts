/*const updateHandlers: Map<keyof tgTypes.Update, (update: any) => Promise<void>> = new Map([
     ['message', (update) => handlers.handleMessage(update as tgTypes.Message)],
     ['edited_message', (update) => handlers.handleEditedMessage(update as tgTypes.Message)],
     ['channel_post', (update) => handlers.handleChannelPost(update as tgTypes.Message)],
     ['edited_channel_post', (update) => handlers.handleEditedChannelPost(update as tgTypes.Message)],
     ['business_connection', (update) => handlers.handleBusinessConnection(update as tgTypes.BusinessConnection)],
     ['business_message', (update) => handlers.handleBusinessMessage(update as tgTypes.Message)],
     ['edited_business_message', (update) => handlers.handleEditedBusinessMessage(update as tgTypes.Message)],
     ['deleted_business_messages', (update) => handlers.handleDeletedBusinessMessages(update as tgTypes.BusinessMessagesDeleted)],
     ['message_reaction', (update) => handlers.handleMessageReaction(update as tgTypes.MessageReactionUpdated)],
     ['message_reaction_count', (update) => handlers.handleMessageReactionCount(update as tgTypes.MessageReactionCountUpdated)],
     ['inline_query', (update) => handlers.handleInlineQuery(update as tgTypes.InlineQuery)],
     ['chosen_inline_result', (update) => handlers.handleChosenInlineResult(update as tgTypes.ChosenInlineResult)],
     ['callback_query', (update) => handlers.handleCallbackQuery(update as CallbackQuery)],
     ['shipping_query', (update) => handlers.handleShippingQuery(update as tgTypes.ShippingQuery)],
     ['pre_checkout_query', (update) => handlers.handlePreCheckoutQuery(update as tgTypes.PreCheckoutQuery)],
     ['poll', (update) => handlers.handlePoll(update as tgTypes.Poll)],
     ['poll_answer', (update) => handlers.handlePollAnswer(update as tgTypes.PollAnswer)],
     ['my_chat_member', (update) => handlers.handleMyChatMember(update as tgTypes.ChatMemberUpdated)],
     ['chat_member', (update) => handlers.handleChatMember(update as tgTypes.ChatMemberUpdated)],
     ['chat_join_request', (update) => handlers.handleChatJoinRequest(update as tgTypes.ChatJoinRequest)],
     ['chat_boost', (update) => handlers.handleChatBoost(update as tgTypes.ChatBoostUpdated)],
     ['removed_chat_boost', (update) => handlers.handleRemovedChatBoost(update as tgTypes.ChatBoostRemoved)],
 ]);
 */

import { DB_API } from "../database_api";
import { isValidChat } from "../library";
import TG_ExecutionContext from "../telegram_execution_context";
import TIOZAO_CMDS from "../tiozao/tiozao_api";
import { ContextMessage } from "../types/TelegramMessage";
import { commandFunc, mediaType, updOperation } from "../types/Types";

 export class TG_HANDLER {

     public static async handleMessage(ctx:TG_ExecutionContext) {
         
          console.log("debug from handleMessage- operation: ", ctx.update_operation);
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
               case updOperation.MEDIA_NEW:
                  await ctx.bot.handleNewMedia(ctx);
                  break;
               case updOperation.DOCUMENT_NEW:
                    await ctx.bot.handleNewDocument(ctx);
                    break;
              case updOperation.POST_NEW:
                  await ctx.bot.handleNewPost(ctx);
                  break;
               
          }
          console.log('debug from handleMessage- returned from handleCreteTrhread and will execute db insert')
          await DB_API.dbInsertMessage(ctx, ctx.update_message);
          return new Response('ok');
     }

     public static async handleEditDocument (ctx: TG_ExecutionContext ) {
               let message:ContextMessage = ctx.update_message;
               let response_ids:any[] = [];
               console.log('debug from handleEditDocument')
               response_ids.push(await  TIOZAO_CMDS.checkHaveCaption(ctx.bot, message, true));
               return await ctx.bot.handleBotResponses(response_ids);
     }

     public static async handleEditedMessage(ctx:TG_ExecutionContext) {
          const messageJson:any = ctx.update.edited_message
          const message:ContextMessage = new ContextMessage(messageJson);
          //console.log("debug from handleEditedMessage- context: ", JSON.stringify(ctx));
          console.log("debug from handleEditedMessage- operation: ", ctx.update_operation);
          switch (ctx.update_operation) {
              case updOperation.MEDIA_EDIT:
                  await ctx.bot.handleEditMedia(ctx);
                  break;
              case updOperation.POST_EDIT:
                  await ctx.bot.handleEditPost(ctx);
                  break;
              case updOperation.DOC_EDIT:
                if(ctx.checkUserOperation('isATA')){
                    message.media_type = mediaType.DOCUMENT_ATA
                }
                await TG_HANDLER.handleEditDocument(ctx);
                
                break;
          }
          return await DB_API.dbEditMessage( ctx, message);
          
     }

     public static async handleCallbackQuery(ctx:TG_ExecutionContext) {
          const callbackQuery:any = ctx.update.callback_query
          const { from: user, data: command } = callbackQuery;
          let response_ids:any[] = [];
          
          const commandKey = Object.keys(ctx.bot.commands).find(prefix => command.startsWith(prefix));
      
          if (commandKey) {
              await ctx.bot.tgAnswerCallbackQuery(callbackQuery.id, commandKey);
              const commandFunction:commandFunc = ctx.bot.commands[commandKey];
              response_ids = await commandFunction.func(ctx, callbackQuery, command.slice(commandKey.length).trim());
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
     public static async handleEditThread(ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          const threadName =  message.message.forum_topic_edited?.name;
          await TIOZAO_CMDS.checkDuplicatedThread(ctx.bot, threadName, message.id_thread);
          await ctx.bot.handleBotResponses(response_ids);
          await DB_API.dbInsertMessage(ctx, ctx.update_message);
          return new Response('ok');
     }
      
     public static async handleCreateThread (ctx: TG_ExecutionContext ) {
          let message:ContextMessage = ctx.update_message;
          let response_ids:any[] = [];
          const threadName =  message.message.forum_topic_created?.name;
          console.log('debug from handleCreateThread- threadName: ',threadName);
          await TIOZAO_CMDS.checkDuplicatedThread(ctx.bot, threadName, message.id_thread);
          await ctx.bot.handleBotResponses(response_ids);
          console.log('debug from handleCreateThread- returned from checkDuplicatedThread and will execute db insert')
          await DB_API.dbInsertMessage(ctx, ctx.update_message);
          return new Response('ok');
     }

     

     public static async handleMemberOperation(ctx:TG_ExecutionContext) {
          const operation:any = ctx.update_operation;
          console.log("debug from handleMemberOperation - operation: ", operation);
          if (operation === updOperation.MEMBER_JOIN) {
               if(ctx.update_message.Users)
               await DB_API.dbUpdateUsers(ctx.bot.DB, ctx.update_message.Users);
          } else if (operation === updOperation.MEMBER_LEFT) {
               await DB_API.dbDeactivateUser(ctx.bot.DB, ctx.update_message);
          } 
          return new Response('ok');
     }

     public static async handlePollAnswer(ctx:TG_ExecutionContext){
          const operation:any = ctx.update_operation;
          //console.log("debug from handlePollAnswer - operation: ", operation);
          const answer:tgTypes.PollAnswer|undefined = ctx.update.poll_answer;
          console.log("debug from handlePollAnswer - Answer: ",JSON.stringify(answer))
          if(answer) DB_API.dbUpdatePoolAnswer(ctx.bot.DB,answer);
          return new Response('ok');

     }

     public static async handlePollUpdate(ctx:TG_ExecutionContext){
          //const operation:any = ctx.update_operation;
          const media_group_id = ctx.update_message.media_group_id;
          console.log("debug from handlePollUpdate - media-group-id: ",media_group_id )
          //console.log("debug from handlePollUpdate - operation: ", operation);
          const pollData:tgTypes.Poll | undefined= ctx.update.poll;
          if(pollData) {
               console.log("debug from handlePollUpdate - Poll: ",JSON.stringify(pollData))
               DB_API.dbUpdatePool(ctx.bot.DB,pollData);
               // const has_protected_content = pollResponse.poll.has_protected_content === true? 1:0; 
                // const is_topic_message = pollResponse.poll.is_topic_message === true? 1:0;
                if (pollData) await DB_API.dbInsertPoll(ctx.bot.DB,pollData,Number(ctx.bot.botINFO.THREADBOT), media_group_id)
               
               return new Response('ok');
     
          }else {
               return new Response('error');
          }
          
     }

 }