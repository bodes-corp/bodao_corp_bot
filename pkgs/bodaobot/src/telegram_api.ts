import TelegramInlineQueryResultArticle from './types/TelegramInlineQueryResultArticle.js';
import TelegramInlineQueryResultPhoto from './types/TelegramInlineQueryResultPhoto.js';
import TelegramInlineQueryResultVideo from './types/TelegramInlineQueryResultVideo.js';
import { tgRequestMethod, tgRequestMethod_t } from './types/Types.js';

/** Class representing the Telegram API and all it's methods */
export default class TG_API {
	/**
	 * Get the API URL for a given bot API and slug
	 * @param botApiURL - full URL to the telegram API without slug ('https://api.telegram.org/bot' + token)
	 * @param slug - slug to append to the API URL
	 * @param data - data to append to the request
	 */
	getApiUrl(botApiURL: string, slug:tgRequestMethod_t, data: Record<string, number | string | boolean>) {
		const request = new URL(botApiURL + (slug.startsWith('/') || botApiURL.endsWith('/') ? '' : '/') + slug);
		const params = new URLSearchParams();
		for (const i in data) {
			params.append(i, data[i].toString());
		}
		return new Request(`${request.toString()}?${params.toString()}`);
	}

	public static tgApiUrl(methodName: tgRequestMethod_t, token:string, params: Record<string, string > = {}) {
		const api = new URL('https://api.telegram.org/bot' + token);
          const query = params ? `?${new URLSearchParams(params).toString()}` : '';
          return api+`/${methodName}${query}`;
     }

	/**
	 * Send quest to Telegram Bot API
	 * @param method the request method ('sendMediaGroup','sendMessage','deleteMessage','answerCallbackQuery',)
	 * @param params the params to append to the request
	 * @returns the params appended to the request JSON formated
	 */
	public static async tgSendRequest(method: tgRequestMethod_t, token:string, params:Record<string, string >) {
			try {
			    const response = await fetch(TG_API.tgApiUrl(method, token, params), {
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

	async sendChatAction(botApiURL: string, data: { business_connection_id?: string; chat_id: number | string; action: string }) {
		const url = this.getApiUrl(botApiURL, tgRequestMethod.SEND_CHAT_ACTION, data);
		const response = await fetch(url);
		return response;
	}

	/**
	 * Get a file with a given file_id
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 * @param token - bot token
	 */
	async getFile(botApiURL: string, data: Record<string, number | string | boolean>, token: string) {
		if (data.file_id === '') {
			return new Response();
		}
		const url = this.getApiUrl(botApiURL, tgRequestMethod.GET_FILE, data);
		const response = await fetch(url);
		const json: { result: { file_path: string } } = await response.json();
		let file_path: string;
		try {
			file_path = json.result.file_path;
		} catch (e) {
			console.log(`Error: ${e as string}`);
			return new Response('cant read file_path. is the file too large?');
		}
		return await fetch(`https://api.telegram.org/file/bot${token}/${file_path}`);
	}

	/**
	 * Send a message to a given botApi
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 */
	async sendMessage(
		botApiURL: string,
		data: {
			reply_to_message_id?: number | string;
			chat_id: number | string;
			text: string;
			parse_mode: string;
			business_connection_id?: number | string;
		},
	) {
		const url = this.getApiUrl(botApiURL, tgRequestMethod.SEND_MESSAGE, data);
		console.log(url.url);
		try {
			const response = await fetch(url.url, {
			    method: 'POST',
			    headers: { 'Content-Type': 'application/json' }
			});
	  
			const data:any = await response.json();
			if (!data.ok) {
			    throw new Error(`Telegram API Error: ${data.description}`);
			}
	  
			return data;
		 } catch (error) {
			console.error(`Error in sendMessage request:`, error);
			throw error;
		 }
		
	}

	/**
	 * Send a video message to a given botApi
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 */
	async sendVideo(
		botApiURL: string,
		data: {
			reply_to_message_id: number | string;
			chat_id: number | string;
			video: string;
		},
	) {
		const url = this.getApiUrl(botApiURL, tgRequestMethod.SEND_VIDEO, data);
		return await fetch(url);
	}

	/**
	 * Send a photo message to a given botApi
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 */
	async sendPhoto(
		botApiURL: string,
		data: {
			reply_to_message_id: number | string;
			chat_id: number | string;
			photo: string;
			caption: string;
		},
	) {
		const url = this.getApiUrl(botApiURL, tgRequestMethod.SEND_PHOTO, data);
		return await fetch(url);
	}

	/**
	 * Send an inline response to a given botApi
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 */
	async answerInline(
		botApiURL: string,
		data: {
			inline_query_id: number | string;
			results: TelegramInlineQueryResultArticle[] | TelegramInlineQueryResultPhoto[] | TelegramInlineQueryResultVideo[];
		},
	) {
		const url = this.getApiUrl(botApiURL, tgRequestMethod.ANSWER_INLINE, {
			inline_query_id: data.inline_query_id,
			results: JSON.stringify(data.results),
		});
		return await fetch(url);
	}

	/**
	 * Send an callback response to a given botApi
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 */
	async answerCallback(
		botApiURL: string,
		data: {
			callback_query_id: number | string;
			text?: string;
			show_alert?: boolean;
			url?: string;
			cache_time?: number;
		},
	) {
		const url = this.getApiUrl(botApiURL, tgRequestMethod.ANSWER_CALLBACK, data);
		return await fetch(url);
	}
}
