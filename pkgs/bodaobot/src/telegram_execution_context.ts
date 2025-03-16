
import TG_API from './telegram/telegram_api.js';
import TG_BOT from './telegram_bot.js';
import TelegramInlineQueryResultArticle from './types/TelegramInlineQueryResultArticle.js';
import TelegramInlineQueryResultPhoto from './types/TelegramInlineQueryResultPhoto.js';
import TelegramInlineQueryResultVideo from './types/TelegramInlineQueryResultVideo.js';
import { ContextMessage } from './types/TelegramMessage.js';

import { updOperation, updOperation_t, updType, updType_t } from './types/Types.js';

/** Class representing the context of execution */
export default class TG_ExecutionContext {
	/** an instance of the telegram bot */
	bot:  TG_BOT;
	/** an instance of the telegram update */
	update: tgTypes.Update;
	/** string representing the type of update that was sent */
	update_type:updType_t = updType.UNKNOWN;
	/** the Telegram Message represented in this Context */
	update_message: ContextMessage;
	/** operation is message type dependant */
	update_operation: updOperation_t = updOperation.UNKNOWN;

	/** boolean representing this is a bot command */
	commandFlag:boolean=false;
	
	/** list of operations specific to the bot ownwer
	 User operations checked to be true */
	user_operations:string[] = [];
	/**
	 * mode of execution:
	 * user_update: execute both, first user defined and second the update_operation ones
	 * update_user: execue both, first the update nd second the user defined handlers
	 * user: only execute user defined handlers
	 * update: only execute the update defined handlers
	 */
	operationHanlerMode: 'user_update' | 'update_user' | 'user' |  'update' = 'user_update'; 

	

	/**
	 * Create a telegram execution context
	 * @param bot - the telegram bot
	 * @param update - the telegram update
	 */
	constructor(bot:  TG_BOT, update: tgTypes.Update) {
		this.bot = bot;
		this.update = update;
		this.update_operation = updOperation.NO_OP;
		

		if (this.update.message?.message_id) {
			this.update_type = updType.MESSAGE;
			this.update_operation= updOperation.NO_OP;

			if (this.update.message?.text?.startsWith('/')) {
				this.commandFlag = true;;
			}

			if (this.update.message?.text || this.update.message?.video || this.update.message?.photo 
				|| this.update.message?.document || this.update.message?.voice || this.update.message?.poll 
				|| this.update.message?.location) {    
				//this.msg_txt = 'new_post'
				if (this.update.message?.text) {
				    this.update_operation = updOperation.POST_NEW;
				    //this.msg_txt = msgJson.text;
				    //this.is_td = checkTD(msgJson.text);
				    //this.is_td_rp = checkRP(msgJson.text);
				}
	   
				if (this.update.message?.video || this.update.message?.photo) {
				    this.update_operation = updOperation.MEDIA_NEW;
				}
				
			}


		}else if (this.update.edited_message?.message_id) {
			this.update_type = updType.MESSAGE_EDIT;
			//console.log('debug from TelegramUpdate constructor/edit message detected - edited_message:', this.update.edited_message)
			this.update_operation= updOperation.NO_OP;
			if (this.update.edited_message?.text) {
				   this.update_operation = updOperation.POST_EDIT;
				   //this.msg_txt = msgJson.text;
				   //this.is_td = checkTD(msgJson.text);
				   //this.is_td_rp = checkRP(msgJson.text);
			}
			if (this.update.edited_message?.video || this.update.edited_message?.photo) {
				   this.update_operation = updOperation.MEDIA_EDIT;
				   
			}
			if (this.update.edited_message?.document) {
				this.update_operation = updOperation.DOC_EDIT;
			}
		
		}else if (this.update.channel_post?.message_id) {
			this.update_type = updType.MESSAGE_CHANEL_POST;
			this.update_operation= updOperation.NO_OP;
			
		}else if (this.update.edited_channel_post?.message_id) {
			this.update_type = updType.MESSAGE_CHANEL_POST_EDIT;
			this.update_operation= updOperation.NO_OP;
			
		}else if (this.update.business_message?.message_id) {
			this.update_type = updType.MESSAGE_BUSINESS;
			this.update_operation= updOperation.NO_OP;
			
		}else if (this.update.edited_business_message?.message_id) {
			this.update_type = updType.MESSAGE_BUSINESS_EDIT;
			this.update_operation= updOperation.NO_OP;
			
		}else if (this.update.inline_query?.query) {
			this.update_type = updType.INLINE_QUERY;
			this.update_operation= updOperation.NO_OP;
			
		}else if (this.update.callback_query?.id) {
			this.update_type = updType.CALLBACK;
			this.update_operation= updOperation.NO_OP;
			
		}else if (this.update.poll?.id) {
			this.update_type = updType.POLL;
			this.update_operation= updOperation.NO_OP;
			
		}else if (this.update.poll_answer?.poll_id) {
			this.update_type = updType.POLL_ANSWER;
			this.update_operation= updOperation.NO_OP;
			
		}
		//messages types
		if (this.update.message?.new_chat_members)	{
			this.update_operation = updOperation.MEMBER_JOIN;
		}
		if (this.update.message?.left_chat_member) {
			this.update_operation = updOperation.MEMBER_LEFT;
		}
		
		if (this.update.message?.photo) { //check duplicated operation
			this.update_operation = updOperation.MEDIA_NEW;
		} else if (this.update.message?.document) {
			this.update_operation = updOperation.DOCUMENT_NEW;
		}
		 //for supergroups with topics
		if (this.update.message?.message_thread_id) {
					  		 
			if (this.update.message?.forum_topic_created) {
				//this.threadname = msgJson.forum_topic_created?.name;
				this.update_operation = updOperation.THREAD_CREATE;
			} else if (this.update.message?.forum_topic_edited) {
				//this.threadname = msgJson.forum_topic_edited?.name;
				this.update_operation = updOperation.THREAD_EDIT;
			}
		}

		//edited media types
		//messages types
		//messages types
		
		
		

		if (this.update_type===updType.CALLBACK){
			this.update.message = this.update.callback_query?.message;
			const messageJson:tgTypes.Message|undefined = this.update.callback_query?.message;
			this.update_message = new ContextMessage(messageJson);
		}else if (this.update_type === updType.MESSAGE_EDIT){
			this.update.message = this.update.edited_message;
			const messageJson:tgTypes.Message|undefined = this.update.edited_message;
			this.update_message = new ContextMessage(messageJson);
		}else if (this.update_type === updType.MESSAGE_CHANEL_POST){
			this.update.message = this.update.channel_post;
			const messageJson:tgTypes.Message|undefined = this.update.channel_post;
			this.update_message = new ContextMessage(messageJson);
		}else if (this.update_type === updType.MESSAGE_CHANEL_POST_EDIT){
			this.update.message = this.update.edited_channel_post;
			const messageJson:tgTypes.Message|undefined = this.update.edited_channel_post;
			this.update_message = new ContextMessage(messageJson);
		}else if (this.update_type === updType.MESSAGE_BUSINESS){
			this.update.message = this.update.business_message;
			const messageJson:tgTypes.Message|undefined = this.update.business_message;
			this.update_message = new ContextMessage(messageJson);
		}else if (this.update_type === updType.MESSAGE_BUSINESS_EDIT){
			this.update.message = this.update.edited_business_message;
			const messageJson:tgTypes.Message|undefined = this.update.edited_business_message;
			this.update_message = new ContextMessage(messageJson);
		}else{
			const messageJson:tgTypes.Message|undefined = this.update.message;
			this.update_message = new ContextMessage(messageJson);
		}
		

		
	}


     /**
      * check if a key is in the array of user operations
      * @param keyToCheck the key to check
      * @returns true if key is on array of user operations, false if not
      */
     checkUserOperation(keyToCheck:string){
          if (this.user_operations.includes(keyToCheck)) {
               console.log(`[debug from checkUserOperation] ${keyToCheck} exists in the array.`);
               return true;
          } else {
               console.log(`[debug from checkUserOperation] ${keyToCheck} does not exist in the array.`);
               return false;
          }
     }

	/**
	 * add a user operation to the array, if it is not there already
	 * @param keyToAdd key to add
	 * @returns 
	 */
	addUserOperation(keyToAdd:string){
		if(this.checkUserOperation(keyToAdd)) return;
		else {
			this.user_operations.push(keyToAdd);
			return;
		}

	}

	/**
	 * Reply to the last message with a video
	 * @param video - string to a video on the internet or a file_id on telegram
	 * @param options - any additional options to pass to sendVideo
	 */
	async replyVideo(video: string, options: Record<string, number | string | boolean> = {}) {
		switch (this.update_type) {
			case updType.MESSAGE:
				return await TG_API.sendVideoEssential(this.bot.token, {
					...options,
					chat_id: this.update.message?.chat.id.toString() ?? '',
					reply_to_message_id: this.update.message?.message_id.toString() ?? '',
					video,
				});
			case updType.INLINE_QUERY:
				return await TG_API.answerInline(this.bot.token, {
					...options,
					inline_query_id: this.update.inline_query?.id.toString() ?? '',
					results: [new TelegramInlineQueryResultVideo(video)],
				});

			default:
				break;
		}
	}

	/**
	 * Get File from telegram file_id
	 * @param file_id - telegram file_id
	 */
	async getFile(file_id: string) {
		return await TG_API.getTheFile(this.bot.token, { file_id } );
	}

	/**
	 * Reply to the last message with a photo
	 * @param photo - url or file_id to photo
	 * @param caption - photo caption
	 * @param options - any additional options to pass to sendPhoto
	 */
	async replyPhoto(photo: string, caption = '', options: Record<string, number | string | boolean> = {}) {
		switch (this.update_type) {
							
			case updType.MESSAGE:
				switch (this.update_operation){
					case updOperation.MEDIA_NEW:
					case updOperation.MEDIA_EDIT:
						return await TG_API.sendPhotoEssential(this.bot.token, {
							...options,
							chat_id: this.update.message?.chat.id.toString() ?? '',
							reply_to_message_id: this.update.message?.message_id.toString() ?? '',
							photo,
							caption,
						});
					case updOperation.POST_NEW:
						return await TG_API.sendPhotoEssential(this.bot.token, {
							...options,
							chat_id: this.update.message?.chat.id.toString() ?? '',
							reply_to_message_id: this.update.message?.message_id.toString() ?? '',
							photo,
							caption,
						});
				}
				
			case updType.INLINE_QUERY:
				return await TG_API.answerInline(this.bot.token, {
					inline_query_id: this.update.inline_query?.id.toString() ?? '',
					results: [new TelegramInlineQueryResultPhoto(photo)],
				});

			default:
				break;
		}
	}

	/**
	 * Send typing in a chat
	 */
	async sendTyping() {
		switch (this.update_type) {
			case 'message':
				return await TG_API.sendChatAction(this.bot.token, {
					chat_id: this.update.message?.chat.id.toString() ?? '',
					action: 'typing',
				});
			case 'business_message':
				return await TG_API.sendChatAction(this.bot.token, {
					business_connection_id: this.update.business_message?.business_connection_id?.toString(),
					chat_id: this.update.business_message?.chat.id.toString() ?? '',
					action: 'typing',
				});
			default:
				break;
		}
	}

	/**
	 * Reply to an inline message with a title and content
	 * @param title - title to reply with
	 * @param message - message contents to reply with
	 * @param parse_mode - parse mode to use
	 */
	async replyInline(title: string, message: string, parse_mode = '') {
		switch (this.update_type) {
			case updType.INLINE_QUERY:
				return await TG_API.answerInline(this.bot.token, {
					inline_query_id: this.update.inline_query?.id.toString() ?? '',
					results: [new TelegramInlineQueryResultArticle({ content: message, title, parse_mode })],
				});
			default:
				break;
		}
	}

	/**
	 * Reply to the last message with text
	 * @param message - text to reply with
	 * @param parse_mode - one of HTML, MarkdownV2, Markdown, or an empty string for ascii
	 * @param options - any additional options to pass to sendMessage
	 */
	async reply(message: string, parse_mode = '', options: Record<string, number | string | boolean> = {}) {
		switch (this.update_type) {
			case updType.MESSAGE:
				{
					switch (this.update_operation){
						case updOperation.POST_NEW:
							return await TG_API.sendMessageEssential(this.bot.token, {
								...options,
								chat_id: this.update.message?.chat.id.toString() ?? '',
								reply_to_message_id: this.update.message?.message_id.toString() ?? '',
								text: message,
								parse_mode,
							});

						case updOperation.MEDIA_NEW:
						case updOperation.MEDIA_EDIT:
							return await TG_API.sendMessageEssential(this.bot.token, {
								...options,
								chat_id: this.update.message?.chat.id.toString() ?? '',
								reply_to_message_id: this.update.message?.message_id.toString() ?? '',
								text: message,
								parse_mode,
							});
						case updOperation.DOCUMENT_NEW:
						case updOperation.DOC_EDIT:
							return await TG_API.sendMessageEssential(this.bot.token, {
								...options,
								chat_id: this.update.message?.chat.id.toString() ?? '',
								reply_to_message_id: this.update.message?.message_id.toString() ?? '',
								text: message,
								parse_mode,
							});
					}
				}
				
			case updType.MESSAGE_BUSINESS:
				return await TG_API.sendMessageEssential(this.bot.token, {
					chat_id: this.update.business_message?.chat.id.toString() ?? '',
					text: message,
					business_connection_id: this.update.business_message?.business_connection_id?.toString(),
					parse_mode,
				});
				
			case updType.INLINE_QUERY:
				return await TG_API.answerInline(this.bot.token, {
					inline_query_id: this.update.inline_query?.id.toString() ?? '',
					results: [new TelegramInlineQueryResultArticle({ title: message, content: message, parse_mode })],
				});
				
			default:
				break;
		}
	}
}
