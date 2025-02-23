import TG_API from './telegram_api.js';
import TG_BOT from './telegram_bot.js';
import TelegramInlineQueryResultArticle from './types/TelegramInlineQueryResultArticle.js';
import TelegramInlineQueryResultPhoto from './types/TelegramInlineQueryResultPhoto.js';
import TelegramInlineQueryResultVideo from './types/TelegramInlineQueryResultVideo.js';
import TelegramUpdate from './types/TelegramUpdate.js';

/** Class representing the context of execution */
export default class TG_ExecutionContext {
	/** an instance of the telegram bot */
	bot:  TG_BOT;
	/** an instance of the telegram update */
	update: TelegramUpdate;
	/** string representing the type of update that was sent */
	update_type = '';
	/** reference to TG_API class */
	api = new TG_API();

	/**
	 * Create a telegram execution context
	 * @param bot - the telegram bot
	 * @param update - the telegram update
	 */
	constructor(bot:  TG_BOT, update: TelegramUpdate) {
		this.bot = bot;
		this.update = update;

		if (this.update.message?.photo) {
			this.update_type = 'photo';
		} else if (this.update.edited_message) {
			this.update_type = 'edited_message';
		} else if (this.update.message?.text) {
			this.update_type = 'message';
		}  else if (this.update.inline_query?.query) {
			this.update_type = 'inline';
		} else if (this.update.message?.document) {
			this.update_type = 'document';
		} else if (this.update.callback_query?.id) {
			this.update_type = 'callback';
		} else if (this.update.business_message) {
			this.update_type = 'business_message';
		}
	}

	/**
	 * Reply to the last message with a video
	 * @param video - string to a video on the internet or a file_id on telegram
	 * @param options - any additional options to pass to sendVideo
	 */
	async replyVideo(video: string, options: Record<string, number | string | boolean> = {}) {
		switch (this.update_type) {
			case 'message':
				return await this.api.sendVideo(this.bot.api.toString(), {
					...options,
					chat_id: this.update.message?.chat.id.toString() ?? '',
					reply_to_message_id: this.update.message?.message_id.toString() ?? '',
					video,
				});
			case 'inline':
				return await this.api.answerInline(this.bot.api.toString(), {
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
		return await this.api.getFile(this.bot.api.toString(), { file_id }, this.bot.token);
	}

	/**
	 * Reply to the last message with a photo
	 * @param photo - url or file_id to photo
	 * @param caption - photo caption
	 * @param options - any additional options to pass to sendPhoto
	 */
	async replyPhoto(photo: string, caption = '', options: Record<string, number | string | boolean> = {}) {
		switch (this.update_type) {
			case 'photo':
				return await this.api.sendPhoto(this.bot.api.toString(), {
					...options,
					chat_id: this.update.message?.chat.id.toString() ?? '',
					reply_to_message_id: this.update.message?.message_id.toString() ?? '',
					photo,
					caption,
				});
			case 'message':
				return await this.api.sendPhoto(this.bot.api.toString(), {
					...options,
					chat_id: this.update.message?.chat.id.toString() ?? '',
					reply_to_message_id: this.update.message?.message_id.toString() ?? '',
					photo,
					caption,
				});
			case 'inline':
				return await this.api.answerInline(this.bot.api.toString(), {
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
				return await this.api.sendChatAction(this.bot.api.toString(), {
					chat_id: this.update.message?.chat.id.toString() ?? '',
					action: 'typing',
				});
			case 'business_message':
				return await this.api.sendChatAction(this.bot.api.toString(), {
					business_connection_id: this.update.business_message?.business_connection_id.toString(),
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
			case 'inline':
				return await this.api.answerInline(this.bot.api.toString(), {
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
			case 'message':
				return await this.api.sendMessage(this.bot.api.toString(), {
					...options,
					chat_id: this.update.message?.chat.id.toString() ?? '',
					reply_to_message_id: this.update.message?.message_id.toString() ?? '',
					text: message,
					parse_mode,
				});
			case 'business_message':
				return await this.api.sendMessage(this.bot.api.toString(), {
					chat_id: this.update.business_message?.chat.id.toString() ?? '',
					text: message,
					business_connection_id: this.update.business_message?.business_connection_id.toString(),
					parse_mode,
				});
			case 'photo':
				return await this.api.sendMessage(this.bot.api.toString(), {
					...options,
					chat_id: this.update.message?.chat.id.toString() ?? '',
					reply_to_message_id: this.update.message?.message_id.toString() ?? '',
					text: message,
					parse_mode,
				});
			case 'inline':
				return await this.api.answerInline(this.bot.api.toString(), {
					inline_query_id: this.update.inline_query?.id.toString() ?? '',
					results: [new TelegramInlineQueryResultArticle({ title: message, content: message, parse_mode })],
				});
			case 'document':
				return await this.api.sendMessage(this.bot.api.toString(), {
					...options,
					chat_id: this.update.message?.chat.id.toString() ?? '',
					reply_to_message_id: this.update.message?.message_id.toString() ?? '',
					text: message,
					parse_mode,
				});
			default:
				break;
		}
	}
}
