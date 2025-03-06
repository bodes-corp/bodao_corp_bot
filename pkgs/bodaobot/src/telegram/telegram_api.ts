import TelegramInlineQueryResultArticle from '../types/TelegramInlineQueryResultArticle.js';
import TelegramInlineQueryResultPhoto from '../types/TelegramInlineQueryResultPhoto.js';
import TelegramInlineQueryResultVideo from '../types/TelegramInlineQueryResultVideo.js';
import { botResponse, tgRequestMethod } from '../types/Types.js';
import TG_REQ from './RequestManager.js';




/** Class representing the Telegram API and all it's methods */
export default class TG_API {


	public static async sendButtonToBotThread(token:string, chatID:string, threadID:string, buttons:any, text:any) : Promise<botResponse>{

          const params = {
               chat_id: chatID,
               message_thread_id: threadID,
               reply_markup: JSON.stringify({ inline_keyboard: buttons }),
               text,
               disable_notification: 'true'
          }

          return await TG_REQ.tgSendRequest(token,tgRequestMethod.SEND_MESSAGE, params);
     }


	/**
	 * Send an inline response to a given botApi
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 */
	public static async answerInline(
		token: string,
		data: {
			inline_query_id: number | string;
			results: TelegramInlineQueryResultArticle[] | TelegramInlineQueryResultPhoto[] | TelegramInlineQueryResultVideo[];
		},
	) {
		return await  TG_REQ.tgSendRequest(token, tgRequestMethod.ANSWER_INLINE, {
			inline_query_id: data.inline_query_id,
			results: JSON.stringify(data.results),
		});
		
	}

	/**
	 * Send an callback response to a given botApi
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 */
	public static async answerCallback(
		token: string,
		data: {
			callback_query_id: number | string;
			text?: string;
			show_alert?: boolean;
			url?: string;
			cache_time?: number;
		},
	) {
		return await  TG_REQ.tgSendRequest(token,  tgRequestMethod.ANSWER_CALLBACK, data);
		
	}

	public static async tgAnswerCallbackQuery(token:string, callbackQueryId:any, text:string|null = null) {
          const params:any = { callback_query_id: callbackQueryId };
          if (text) params.text = text;
          return await TG_REQ.tgSendRequest(token,tgRequestMethod.ANSWER_CALLBACK, params);
     }


	async tgDeleteMessage(token:string, chat_id:number, message_id:any) {
          const params:Record<string, string > = {
               chat_id: String( chat_id),
               message_id
          }
          return await TG_REQ.tgSendRequest(token,tgRequestMethod.MESSAGE_DELETE, params);
     }

	/**
	* Delete messages from the bot
	* @param token the bot token unique identifier
	* @param chat_id the id of the chat to delete the messages
	* @param chunk A JSON-serialized list of 1-100 identifiers of messages to delete.
	*/

	public static async tgDeleteMessagesFromChat(token:string, chat_id:number|string, chunk:number[]) {
	    try {

			if(Array.isArray(chunk) && chunk.length >=0) {
				
				const deleteParams = { chat_id, message_ids: chunk };
				console.log("delete old messages - params:",  JSON.stringify(deleteParams))
				const response = await fetch(TG_REQ.tgApiUrl(token, tgRequestMethod.MESSAGES_DELETE, {
				    method: 'POST',
				    headers: { 'Content-Type': 'application/json' },
				    body: JSON.stringify(deleteParams)
				}));
		  
				const result:any = await response.json();
				if (!result.ok) {
				    throw new Error(`Failed to delete messages: ${result.description}`);
				}
			}
		  
	    } catch (error) {
		   console.error('Error deleting messages:', error);
	    }
    }


    
    /**
     * A simple method for testing your bot's authentication token. Requires no parameters.
     *
     * [getMe - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getme)
     *
     * @returns >- basic information about the bot in form of a [User](https://core.telegram.org/bots/api#user) object.
     */
    public static async getMe(token:string): Promise<tgTypes.User> {
        return await TG_REQ.callApi(token, 'getMe');
    }

    
    /**
     * Use this method to log out from the cloud Bot API server before launching the bot locally.
     * You **must** log out the bot before running it locally, otherwise there is no guarantee that the bot will receive updates.
     * After a successful call, you can immediately log in on a local server, but will not be able to log in back to the cloud Bot API server
     * for 10 minutes. Requires no parameters.
     *
     * [logOut - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#logout)
     *
     * @returns >- true on success
     */
    public static async logOut(token:string): Promise<boolean> {
        return await TG_REQ.callApi(token, 'logOut');
    }

    /**
     * Use this method to close the bot instance before moving it from one local server to another.
     * You need to delete the webhook before calling this method to ensure that the bot isn't launched again after server restart.
     * The method will return error 429 in the first 10 minutes after the bot is launched. Requires no parameters.
     *
     * [close - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#close)
     *
     * @returns >- true on success
     */
    public static async close(token:string): Promise<boolean> {
        return await TG_REQ.callApi(token, 'close');
    }

    /**
     * Use this method to send text messages.
     *
     * [sendMessage - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendmessage)
     *
     * @param chat_id - `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param text - `Required`
     * >- Text of the message to be sent, 1-4096 characters after entities parsing
     * @param [business_connection_id] - `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [parse_mode] `Optional`
     * >- Mode for parsing entities in the message text.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in message text, which can be specified instead of parse_mode
     * @param [link_preview_options] `Optional`
     * >- Link preview generation options for the message
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup]
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendMessage(
        token:string,
        {
            chat_id,
            text,
            business_connection_id,
            message_thread_id,
            parse_mode,
            entities,
            link_preview_options,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendMessage): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendMessage', {
            chat_id,
            text,
            business_connection_id,
            message_thread_id,
            parse_mode,
            entities: JSON.stringify(entities),
            link_preview_options: JSON.stringify(link_preview_options),
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }
    /**
	 * Send a message to a given botApi
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 */
	public static async sendMessageEssential(
		token: string,
		data: {
			reply_to_message_id?: number | string;
			chat_id: number | string;
			text: string;
			parse_mode: string;
			business_connection_id?: number | string;
		},
	) {
		
		return await TG_REQ.tgSendRequest(token,'sendMessage',data)
		
	}

    /**
     * Use this method to forward messages of any kind. Service messages and messages with protected content can't be forwarded.
     *
     * [forwardMessage - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#forwardmessage)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param from_chat_id `Required`
     * >- Unique identifier for the chat where the original message was sent
     * (or channel username in the format `@channelusername`)
     * @param message_id `Required`
     * >- Message identifier in the chat specified in from_chat_id
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the forwarded message from forwarding and saving
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned
     */
    public static async forwardMessage(
        token:string,
        {
            chat_id,
            from_chat_id,
            message_id,
            message_thread_id,
            disable_notification,
            protect_content,
        }: tgOptions.forwardMessage): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'forwardMessage', {
            chat_id,
            from_chat_id,
            message_id,
            message_thread_id,
            disable_notification,
            protect_content,
        });
    }

    /**
     * Use this method to forward multiple messages of any kind. If some of the specified messages can't be found or forwarded, they are skipped.
     * Service messages and messages with protected content can't be forwarded. Album grouping is kept for forwarded messages.
     *
     * [forwardMessages - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#forwardmessages)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param from_chat_id `Required`
     * >- Unique identifier for the chat where the original messages were sent
     * (or channel username in the format `@channelusername`)
     * @param message_ids `Required`
     * >- A JSON-serialized list of 1-100 identifiers of messages in the chat from_chat_id to forward.
     * The identifiers must be specified in a strictly increasing order.
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [disable_notification] `Optional`
     * >- Sends the messages [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the forwarded messages from forwarding and saving
     * @returns >- On success, an array of [MessageId](https://core.telegram.org/bots/api#messageid) of the sent messages is returned.
     */
    public static async forwardMessages(
        token:string,
        {
            chat_id,
            from_chat_id,
            message_ids,
            message_thread_id,
            disable_notification,
            protect_content,
        }: tgOptions.forwardMessages): Promise<tgTypes.MessageId[]> {
        return await TG_REQ.callApi(token, 'forwardMessages', {
            chat_id,
            from_chat_id,
            message_ids: JSON.stringify(message_ids),
            message_thread_id,
            disable_notification,
            protect_content,
        });
    }

    /**
     * Use this method to copy messages of any kind. Service messages, paid media messages, giveaway messages,
     * giveaway winners messages, and invoice messages can't be copied.
     * A quiz [poll](https://core.telegram.org/bots/api#poll) can be copied only if the value of the field correct_option_id is known to the bot.
     * The method is analogous to the method [forwardMessage](https://core.telegram.org/bots/api#forwardmessage),
     * but the copied message doesn't have a link to the original message.
     *
     * [copyMessage - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#copymessage)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param from_chat_id `Required`
     * >- Unique identifier for the chat where the original message was sent
     * (or channel username in the format `@channelusername`)
     * @param message_id `Required`
     * >- Message identifier in the chat specified in from_chat_id
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [caption] `Optional`
     * >- New caption for media, 0-1024 characters after entities parsing. If not specified, the original caption is kept
     * @param [parse_mode] `Optional`
     * >- Mode for parsing entities in the new caption.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [caption_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the new caption,
     * which can be specified instead of parse_mode
     * @param [show_caption_above_media] `Optional`
     * >- Pass true, if the caption must be shown above the message media.
     * Ignored if a new caption isn't specified.
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- the [MessageId](https://core.telegram.org/bots/api#messageid) of the sent message on success.
     */
    public static async copyMessage(
        token:string,
        {
            chat_id,
            from_chat_id,
            message_id,
            message_thread_id,
            caption,
            parse_mode,
            caption_entities,
            show_caption_above_media,
            disable_notification,
            protect_content,
            reply_parameters,
            reply_markup,
        }: tgOptions.copyMessage,
    ): Promise<tgTypes.MessageId> {
        return await TG_REQ.callApi(token, 'copyMessage', {
            chat_id,
            from_chat_id,
            message_id,
            message_thread_id,
            caption,
            parse_mode,
            caption_entities: JSON.stringify(caption_entities),
            show_caption_above_media,
            disable_notification,
            protect_content,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to copy messages of any kind. If some of the specified messages can't be found or copied, they are skipped.
     * Service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages can't be copied.
     * A quiz [poll](https://core.telegram.org/bots/api#poll) can be copied only if the value of the field correct_option_id is known to the bot.
     * The method is analogous to the method [forwardMessages](https://core.telegram.org/bots/api#forwardmessages),
     * but the copied messages don't have a link to the original message. Album grouping is kept for copied messages.
     *
     * [copyMessages - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#copymessages)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param from_chat_id `Required`
     * >- Unique identifier for the chat where the original messages were sent
     * (or channel username in the format `@channelusername`)
     * @param message_ids `Required`
     * >- A JSON-serialized list of 1-100 identifiers of messages in the chat from_chat_id to copy.
     * The identifiers must be specified in a strictly increasing order.
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [disable_notification] `Optional`
     * >- Sends the messages [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent messages from forwarding and saving
     * @param [remove_caption] `Optional`
     * >- Pass true to copy the messages without their captions
     * @returns >- On success, an array of [MessageId](https://core.telegram.org/bots/api#messageid) of the sent messages is returned.
     */
    public static async copyMessages(
        token:string,
        {
            chat_id,
            from_chat_id,
            message_ids,
            message_thread_id,
            disable_notification,
            protect_content,
            remove_caption,
        }: tgOptions.copyMessages): Promise<tgTypes.MessageId[]> {
        return await TG_REQ.callApi(token, 'copyMessages', {
            chat_id,
            from_chat_id,
            message_ids: JSON.stringify(message_ids),
            message_thread_id,
            disable_notification,
            protect_content,
            remove_caption,
        });
    }

    /**
     * Use this method to send photos.
     *
     * [sendPhoto - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendphoto)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param photo `Required`
     * >- Photo to send. Pass a file_id as string to send a photo that exists on the Telegram servers (recommended),
     * pass an HTTP URL as a string for Telegram to get a photo from the Internet, or upload a new photo using multipart/form-data.
     * The photo must be at most 10 MB in size. The photo's width and height must not exceed 10000 in total.
     * Width and height ratio must be at most 20. [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [caption] `Optional`
     * >- Photo caption (may also be used when resending photos by file_id), 0-1024 characters after entities parsing
     * @param [parse_mode] `Optional`
     * >- Mode for parsing entities in the photo caption.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [caption_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the caption,
     * which can be specified instead of parse_mode
     * @param [show_caption_above_media] `Optional`
     * >- Pass true, if the caption must be shown above the message media
     * @param [has_spoiler] `Optional`
     * >- Pass true if the photo needs to be covered with a spoiler animation
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendPhoto(
        token:string,
        {
            chat_id,
            photo,
            business_connection_id,
            message_thread_id,
            caption,
            parse_mode,
            caption_entities,
            show_caption_above_media,
            has_spoiler,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendPhoto): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendPhoto', {
            chat_id,
            photo,
            business_connection_id,
            message_thread_id,
            caption,
            parse_mode,
            caption_entities: JSON.stringify(caption_entities),
            show_caption_above_media,
            has_spoiler,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }
    /**
	 * Send a photo message to a given botApi
	 * @param token - Bot unique token
	 * @param data - essential data to append to the request
	 */
	public static async sendPhotoEssential(
		token: string,
		data: {
			reply_to_message_id: number | string;
			chat_id: number | string;
			photo: string;
			caption: string;
		},
	) {
		return await  TG_REQ.tgSendRequest(token, tgRequestMethod.SEND_PHOTO, data);
		
	}

    /**
     * Use this method to send audio files, if you want Telegram clients to display them in the music player.
     * Your audio must be in the .MP3 or .M4A format.
     * Bots can currently send audio files of up to 50 MB in size, this limit may be changed in the future.
     *
     * [sendAudio - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendaudio)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param audio `Required`
     * >- Audio file to send. Pass a file_id as string to send an audio file that exists on the Telegram servers (recommended),
     * pass an HTTP URL as a string for Telegram to get an audio file from the Internet, or upload a new one using multipart/form-data.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [caption] `Optional`
     * >- Audio caption, 0-1024 characters after entities parsing
     * @param [parse_mode] `Optional`
     * >- Mode for parsing entities in the audio caption.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [caption_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the caption,
     * which can be specified instead of parse_mode
     * @param [duration] `Optional`
     * >- Duration of the audio in seconds
     * @param [performer] `Optional`
     * >- Performer
     * @param [title] `Optional`
     * >- Track name
     * @param [thumbnail] `Optional`
     * >- Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side.
     * The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file,
     * so you can pass “attach://<file_attach_name>” if the thumbnail was uploaded using multipart/form-data under <file_attach_name>.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendAudio(
        token:string,
        {
            chat_id,
            audio,
            business_connection_id,
            message_thread_id,
            caption,
            parse_mode,
            caption_entities,
            duration,
            performer,
            title,
            thumbnail,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendAudio): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendAudio', {
            chat_id,
            audio,
            business_connection_id,
            message_thread_id,
            caption,
            parse_mode,
            caption_entities: JSON.stringify(caption_entities),
            duration,
            performer,
            title,
            thumbnail,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to send general files.
     * Bots can currently send files of any type of up to 50 MB in size, this limit may be changed in the future.
     *
     * [sendDocument - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#senddocument)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param document `Required`
     * >- File to send. Pass a file_id as string to send a file that exists on the Telegram servers (recommended),
     * pass an HTTP URL as a string for Telegram to get a file from the Internet, or upload a new one using multipart/form-data.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [thumbnail] `Optional`
     * >- Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side.
     * The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file,
     * so you can pass “attach://<file_attach_name>” if the thumbnail was uploaded using multipart/form-data under <file_attach_name>.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [caption] `Optional`
     * >- Document caption (may also be used when resending documents by file_id), 0-1024 characters after entities parsing
     * @param [parse_mode] `Optional`
     * >- Mode for parsing entities in the document caption.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [caption_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the caption,
     * which can be specified instead of parse_mode
     * @param [disable_content_type_detection] `Optional`
     * >- Disables automatic server-side content type detection for files uploaded using multipart/form-data
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters]
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendDocument(
        token:string,
        {
            chat_id,
            document,
            business_connection_id,
            message_thread_id,
            thumbnail,
            caption,
            parse_mode,
            caption_entities,
            disable_content_type_detection,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendDocument): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendDocument', {
            chat_id,
            document,
            business_connection_id,
            message_thread_id,
            thumbnail,
            caption,
            parse_mode,
            caption_entities: JSON.stringify(caption_entities),
            disable_content_type_detection,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to send video files, Telegram clients support MPEG4 videos
     * (other formats may be sent as [Document](https://core.telegram.org/bots/api#document)).
     * Bots can currently send video files of up to 50 MB in size, this limit may be changed in the future.
     *
     * [sendVideo - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendvideo)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param video `Required`
     * >- Video to send. Pass a file_id as string to send a video that exists on the Telegram servers (recommended),
     * pass an HTTP URL as a string for Telegram to get a video from the Internet, or upload a new video using multipart/form-data.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [duration] `Optional`
     * >- Duration of sent video in seconds
     * @param [width] `Optional`
     * >- Video width
     * @param [height] `Optional`
     * >- Video height
     * @param [thumbnail] `Optional`
     * >- Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side.
     * The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file,
     * so you can pass “attach://<file_attach_name>” if the thumbnail was uploaded using multipart/form-data under <file_attach_name>.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [caption] `Optional`
     * >- Video caption (may also be used when resending videos by file_id), 0-1024 characters after entities parsing
     * @param [parse_mode] `Optional`
     * >- Mode for parsing entities in the video caption.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [caption_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the caption,
     * which can be specified instead of parse_mode
     * @param [show_caption_above_media] `Optional`
     * >- Pass true, if the caption must be shown above the message media
     * @param [has_spoiler] `Optional`
     * >- Pass true if the video needs to be covered with a spoiler animation
     * @param [supports_streaming] `Optional`
     * >- Pass true if the uploaded video is suitable for streaming
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendVideo(
        token:string,
        {
            chat_id,
            video,
            business_connection_id,
            message_thread_id,
            duration,
            width,
            height,
            thumbnail,
            caption,
            parse_mode,
            caption_entities,
            show_caption_above_media,
            has_spoiler,
            supports_streaming,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendVideo): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendVideo', {
            chat_id,
            video,
            business_connection_id,
            message_thread_id,
            duration,
            width,
            height,
            thumbnail,
            caption,
            parse_mode,
            caption_entities: JSON.stringify(caption_entities),
            show_caption_above_media,
            has_spoiler,
            supports_streaming,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }
    /**
	 * Send a video message to a given botApi
	 * @param data - essential data to append to the request
	 */
	public static async sendVideoEssential(
		token: string,
		data: {
			reply_to_message_id: number | string;
			chat_id: number | string;
			video: string;
		},
	) {
		return await  TG_REQ.tgSendRequest(token, tgRequestMethod.SEND_VIDEO, data);
	}

    /**
     * Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound).
     * Bots can currently send animation files of up to 50 MB in size, this limit may be changed in the future.
     *
     * [sendAnimation - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendanimation)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param animation `Required`
     * >- Animation to send. Pass a file_id as string to send an animation that exists on the Telegram servers (recommended),
     * pass an HTTP URL as a string for Telegram to get an animation from the Internet, or upload a new animation using multipart/form-data.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [duration] `Optional`
     * >- Duration of sent animation in seconds
     * @param [width] `Optional`
     * >- Animation width
     * @param [height] `Optional`
     * >- Animation height
     * @param [thumbnail] `Optional`
     * >- Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side.
     * The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file,
     * so you can pass “attach://<file_attach_name>” if the thumbnail was uploaded using multipart/form-data under <file_attach_name>.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [caption] `Optional`
     * >- Animation caption (may also be used when resending animation by file_id), 0-1024 characters after entities parsing
     * @param [parse_mode] `Optional`
     * >- Mode for parsing entities in the animation caption.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [caption_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the caption,
     * which can be specified instead of parse_mode
     * @param [show_caption_above_media] `Optional`
     * >- Pass true, if the caption must be shown above the message media
     * @param [has_spoiler] `Optional`
     * >- Pass true if the animation needs to be covered with a spoiler animation
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendAnimation(
        token:string,
        {
            chat_id,
            animation,
            business_connection_id,
            message_thread_id,
            duration,
            width,
            height,
            thumbnail,
            caption,
            parse_mode,
            caption_entities,
            show_caption_above_media,
            has_spoiler,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendAnimation): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendAnimation', {
            chat_id,
            animation,
            business_connection_id,
            message_thread_id,
            duration,
            width,
            height,
            thumbnail,
            caption,
            parse_mode,
            caption_entities: JSON.stringify(caption_entities),
            show_caption_above_media,
            has_spoiler,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message.
     * For this to work, your audio must be in an .OGG file encoded with OPUS, or in .MP3 format, or in .M4A format
     * (other formats may be sent as [Audio](https://core.telegram.org/bots/api#audio)
     * or [Document](https://core.telegram.org/bots/api#document)).
     * Bots can currently send voice messages of up to 50 MB in size, this limit may be changed in the future.
     *
     * [sendVoice - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendvoice)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param voice `Required`
     * >- Audio file to send. Pass a file_id as string to send a file that exists on the Telegram servers (recommended),
     * pass an HTTP URL as a string for Telegram to get a file from the Internet, or upload a new one using multipart/form-data.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [caption] `Optional`
     * >- Voice message caption, 0-1024 characters after entities parsing
     * @param [parse_mode] `Optional`
     * >- Mode for parsing entities in the voice message caption.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [caption_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the caption,
     * which can be specified instead of parse_mode
     * @param [duration] `Optional`
     * >- Duration of the voice message in seconds
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendVoice(
        token:string,
        {
            chat_id,
            voice,
            business_connection_id,
            message_thread_id,
            caption,
            parse_mode,
            caption_entities,
            duration,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendVoice): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendVoice', {
            chat_id,
            voice,
            business_connection_id,
            message_thread_id,
            caption,
            parse_mode,
            caption_entities: JSON.stringify(caption_entities),
            duration,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * As of [v.4.0](https://telegram.org/blog/video-messages-and-telescope),
     * Telegram clients support rounded square MPEG4 videos of up to 1 minute long.
     * Use this method to send video messages.
     *
     * [sendVideoNote - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendvideonote)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param video_note `Required`
     * >- Video note to send. Pass a file_id as string to send a video note that exists on the Telegram servers
     * (recommended) or upload a new video using multipart/form-data.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files).
     * Sending video notes by a URL is currently unsupported
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [duration] `Optional`
     * >- Duration of sent video in seconds
     * @param [length] `Optional`
     * >- Video width and height, i.e. diameter of the video message
     * @param [thumbnail] `Optional`
     * >- Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side.
     * The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320.
     * Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file,
     * so you can pass “attach://<file_attach_name>” if the thumbnail was uploaded using multipart/form-data under <file_attach_name>.
     * [More information on Sending Files »](https://core.telegram.org/bots/api#sending-files)
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendVideoNote(
        token:string,
        {
            chat_id,
            video_note,
            business_connection_id,
            message_thread_id,
            duration,
            length,
            thumbnail,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendVideoNote): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendVideoNote', {
            chat_id,
            video_note,
            business_connection_id,
            message_thread_id,
            duration,
            length,
            thumbnail,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to send paid media.
     *
     * [sendPaidMedia - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendpaidmedia)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`).
     * If the chat is a channel, all Telegram Star proceeds from this media will be credited to the chat's balance.
     * Otherwise, they will be credited to the bot's balance.
     * @param star_count `Required`
     * >- The number of Telegram Stars that must be paid to buy access to the media
     * @param media `Required`
     * >- A JSON-serialized array describing the media to be sent; up to 10 items
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [caption] `Optional`
     * >- Media caption, 0-1024 characters after entities parsing
     * @param [parse_mode] `Optional`
     * >- Mode for parsing entities in the media caption.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [caption_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the caption,
     * which can be specified instead of parse_mode
     * @param [show_caption_above_media] `Optional`
     * >- Pass true, if the caption must be shown above the message media
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendPaidMedia(
        token:string,
        {
            chat_id,
            star_count,
            media,
            business_connection_id,
            caption,
            parse_mode,
            caption_entities,
            show_caption_above_media,
            disable_notification,
            protect_content,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendPaidMedia): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendPaidMedia', {
            chat_id,
            star_count,
            media: JSON.stringify(media),
            business_connection_id,
            caption,
            parse_mode,
            caption_entities: JSON.stringify(caption_entities),
            show_caption_above_media,
            disable_notification,
            protect_content,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to send a group of photos, videos, documents or audios as an album.
     * Documents and audio files can be only grouped in an album with messages of the same type.
     *
     * [sendMediaGroup - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendmediagroup)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format @channelusername)
     * @param media `Required`
     * >- A JSON-serialized array describing messages to be sent, must include 2-10 items
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [disable_notification] `Optional`
     * >- Sends messages [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent messages from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @returns >- On success, an array of [Messages](https://core.telegram.org/bots/api#message) that were sent is returned.
     */
    public static async sendMediaGroup(
        token:string,
        {
            chat_id,
            media,
            business_connection_id,
            message_thread_id,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
        }: tgOptions.sendMediaGroup): Promise<tgTypes.Message[]> {
        return await TG_REQ.callApi(token, 'sendMediaGroup', {
            chat_id,
            media: JSON.stringify(media),
            business_connection_id,
            message_thread_id,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
        });
    }

    /**
     * Use this method to send point on the map.
     *
     * [sendLocation - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendlocation)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param latitude `Required`
     * >- Latitude of the location
     * @param longitude `Required`
     * >- Longitude of the location
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [horizontal_accuracy] `Optional`
     * >- The radius of uncertainty for the location, measured in meters; 0-1500
     * @param [live_period] `Optional`
     * >- Period in seconds during which the location will be updated
     * (see [Live Locations](https://telegram.org/blog/live-locations),
     * should be between 60 and 86400, or 0x7FFFFFFF for live locations that can be edited indefinitely.
     * @param [heading] `Optional`
     * >- For live locations, a direction in which the user is moving, in degrees. Must be between 1 and 360 if specified.
     * @param [proximity_alert_radius] `Optional`
     * >- For live locations, a maximum distance for proximity alerts about approaching another chat member,
     * in meters. Must be between 1 and 100000 if specified.
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendLocation(
        token:string,
        {
            chat_id,
            latitude,
            longitude,
            business_connection_id,
            message_thread_id,
            horizontal_accuracy,
            live_period,
            heading,
            proximity_alert_radius,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendLocation): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendLocation', {
            chat_id,
            latitude,
            longitude,
            business_connection_id,
            message_thread_id,
            horizontal_accuracy,
            live_period,
            heading,
            proximity_alert_radius,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to send information about a venue.
     *
     * [sendVenue - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendvenue)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param latitude `Required`
     * >- Latitude of the venue
     * @param longitude `Required`
     * >- Longitude of the venue
     * @param title `Required`
     * >- Name of the venue
     * @param address `Required`
     * >- Address of the venue
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [foursquare_id] `Optional`
     * >- Foursquare identifier of the venue
     * @param [foursquare_type] `Optional`
     * >- Foursquare type of the venue, if known.
     * (For example, “arts_entertainment/default”, “arts_entertainment/aquarium” or “food/icecream”.)
     * @param [google_place_id] `Optional`
     * >- Google Places identifier of the venue
     * @param [google_place_type] `Optional`
     * >- Google Places type of the venue.
     * (See [supported types](https://developers.google.com/places/web-service/supported_types).)
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendVenue(
        token:string,
        {
            chat_id,
            latitude,
            longitude,
            title,
            address,
            business_connection_id,
            message_thread_id,
            foursquare_id,
            foursquare_type,
            google_place_id,
            google_place_type,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendVenue): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendVenue', {
            chat_id,
            latitude,
            longitude,
            title,
            address,
            business_connection_id,
            message_thread_id,
            foursquare_id,
            foursquare_type,
            google_place_id,
            google_place_type,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to send phone contacts.
     *
     * [sendContact - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendcontact)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param phone_number `Required`
     * >- Contact's phone number
     * @param first_name `Required`
     * >- Contact's first name
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [last_name] `Optional`
     * >- Contact's last name
     * @param [vcard] `Optional`
     * >- Additional data about the contact in the form of a [vCard](https://en.wikipedia.org/wiki/VCard), 0-2048 bytes
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendContact(
        token:string,
        {
            chat_id,
            phone_number,
            first_name,
            business_connection_id,
            message_thread_id,
            last_name,
            vcard,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendContact): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendContact', {
            chat_id,
            phone_number,
            first_name,
            business_connection_id,
            message_thread_id,
            last_name,
            vcard,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to send a native poll.
     *
     * [sendPoll - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendpoll)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param question `Required`
     * >- Poll question, 1-300 characters
     * @param options `Required`
     * >- A JSON-serialized list of 2-10 answer options
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [question_parse_mode] `Optional`
     * >- Mode for parsing entities in the question.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * Currently, only custom emoji entities are allowed
     * @param [question_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the poll question.
     * It can be specified instead of question_parse_mode
     * @param [is_anonymous] `Optional`
     * >- true, if the poll needs to be anonymous, defaults to true
     * @param [type] `Optional`
     * >- Poll type, “quiz” or “regular”, defaults to “regular”
     * @param [allows_multiple_answers] `Optional`
     * >- true, if the poll allows multiple answers, ignored for polls in quiz mode, defaults to false
     * @param [correct_option_id] `Optional`
     * >- 0-based identifier of the correct answer option, required for polls in quiz mode
     * @param [explanation] `Optional`
     * >- Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll,
     * 0-200 characters with at most 2 line feeds after entities parsing
     * @param [explanation_parse_mode] `Optional`
     * >- Mode for parsing entities in the explanation.
     * See [formatting options](https://core.telegram.org/bots/api#formatting-options) for more details.
     * @param [explanation_entities] `Optional`
     * >- A JSON-serialized list of special entities that appear in the poll explanation.
     * It can be specified instead of explanation_parse_mode
     * @param [open_period] `Optional`
     * >- Amount of time in seconds the poll will be active after creation, 5-600. Can't be used together with close_date.
     * @param [close_date] `Optional`
     * >- Point in time (Unix timestamp) when the poll will be automatically closed.
     * Must be at least 5 and no more than 600 seconds in the future. Can't be used together with open_period.
     * @param [is_closed] `Optional`
     * >- Pass true if the poll needs to be immediately closed. This can be useful for poll preview.
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding and saving
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >-  On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendPoll(
        token:string,
        {
            chat_id,
            question,
            options,
            business_connection_id,
            message_thread_id,
            question_parse_mode,
            question_entities,
            is_anonymous,
            type,
            allows_multiple_answers,
            correct_option_id,
            explanation,
            explanation_parse_mode,
            explanation_entities,
            open_period,
            close_date,
            is_closed,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }:tgOptions.sendPoll ): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendPoll', {
            chat_id,
            question,
            options: JSON.stringify(options),
            business_connection_id,
            message_thread_id,
            question_parse_mode,
            question_entities: JSON.stringify(question_entities),
            is_anonymous,
            type,
            allows_multiple_answers,
            correct_option_id,
            explanation,
            explanation_parse_mode,
            explanation_entities: JSON.stringify(explanation_entities),
            open_period,
            close_date,
            is_closed,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method to send an animated emoji that will display a random value.
     *
     * [sendDice - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#senddice)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     * @param [emoji] `Optional`
     * >- Emoji on which the dice throw animation is based.
     * Currently, must be one of “🎲”, “🎯”, “🏀”, “⚽”, “🎳”, or “🎰”.
     * Dice can have values 1-6 for “🎲”, “🎯” and “🎳”, values 1-5 for “🏀” and “⚽”, and values 1-64 for “🎰”. Defaults to “🎲”
     * @param [disable_notification] `Optional`
     * >- Sends the message [silently](https://telegram.org/blog/channels-2-0#silent-messages).
     * Users will receive a notification with no sound.
     * @param [protect_content] `Optional`
     * >- Protects the contents of the sent message from forwarding
     * @param [message_effect_id] `Optional`
     * >- Unique identifier of the message effect to be added to the message; for private chats only
     * @param [reply_parameters] `Optional`
     * >- Description of the message to reply to
     * @param [reply_markup] `Optional`
     * >- Additional interface options. A JSON-serialized object for an
     * >  - [inline keyboard](https://core.telegram.org/bots/features#inline-keyboards),
     * >  - [custom reply keyboard](https://core.telegram.org/bots/features#keyboards),
     * >  - instructions to remove a reply keyboard or to force a reply from the user
     * @returns >- On success, the sent [Message](https://core.telegram.org/bots/api#message) is returned.
     */
    public static async sendDice(
        token:string,
        {
            chat_id,
            business_connection_id,
            message_thread_id,
            emoji,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters,
            reply_markup,
        }: tgOptions.sendDice): Promise<tgTypes.Message> {
        return await TG_REQ.callApi(token, 'sendDice', {
            chat_id,
            business_connection_id,
            message_thread_id,
            emoji,
            disable_notification,
            protect_content,
            message_effect_id,
            reply_parameters: JSON.stringify(reply_parameters),
            reply_markup: JSON.stringify(reply_markup),
        });
    }

    /**
     * Use this method when you need to tell the user that something is happening on the bot's side.
     * The status is set for 5 seconds or less (when a message arrives from your bot, Telegram clients clear its typing status).
     *
     * > Example: The ImageBot needs some time to process a request and upload the image.
     * > Instead of sending a text message along the lines of “Retrieving image, please wait…”,
     * > the bot may use sendChatAction with action = upload_photo. The user will see a “sending photo” status for the bot.
     *
     * We only recommend using this method when a response from the bot will take a **noticeable** amount of time to arrive.
     *
     * [sendChatAction - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#sendchataction)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param action `Required`
     * >- Type of action to broadcast. Choose one, depending on what the user is about to receive:
     * >  - typing for [text messages](https://core.telegram.org/bots/api#sendmessage),
     * >  - upload_photo for [photos](https://core.telegram.org/bots/api#sendphoto),
     * >  - record_video or upload_video for [videos](https://core.telegram.org/bots/api#sendvideo),
     * >  - record_voice or upload_voice for [voice notes](https://core.telegram.org/bots/api#sendvoice),
     * >  - upload_document for [general files](https://core.telegram.org/bots/api#senddocument),
     * >  - choose_sticker for [stickers](https://core.telegram.org/bots/api#sendsticker),
     * >  - find_location for [location data](https://core.telegram.org/bots/api#sendlocation),
     * >  - record_video_note or upload_video_note for [video notes](https://core.telegram.org/bots/api#sendvideonote).
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the action will be sent
     * @param [message_thread_id] `Optional`
     * >- Unique identifier for the target message thread; for supergroups only
     * @returns >- true on success.
     */
    public static async sendChatAction(
        token:string,
        {
            chat_id,
            action,
            business_connection_id,
            message_thread_id,
        }: tgOptions.sendChatAction): Promise<boolean> {
        return await TG_REQ.callApi(token, 'sendChatAction', {
            chat_id,
            action,
            business_connection_id,
            message_thread_id,
        });
        //const response =TG_REQ.tgSendRequest(token,tgRequestMethod.SEND_CHAT_ACTION, data)
		//return response;
    }
    
   
    /**
     * Use this method to change the chosen reactions on a message. Service messages can't be reacted to.
     * Automatically forwarded messages from a channel to its discussion group have the same available reactions as messages in the channel.
     * Bots can't use paid reactions.
     *
     * [setMessageReaction - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setmessagereaction)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param message_id `Required`
     * >- Identifier of the target message. If the message belongs to a media group,
     * the reaction is set to the first non-deleted message in the group instead.
     * @param [reaction] `Optional`
     * >- A JSON-serialized list of reaction types to set on the message.
     * Currently, as non-premium users, bots can set up to one reaction per message.
     * A custom emoji reaction can be used if it is either already present on the message or explicitly allowed by chat administrators.
     * Paid reactions can't be used by bots.
     * @param [is_big] `Optional`
     * >- Pass true to set the reaction with a big animation
     * @returns >- true on success.
     */
    public static async setMessageReaction(
        token:string,
        {
            chat_id,
            message_id,
            reaction,
            is_big,
        }: tgOptions.setMessageReaction): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setMessageReaction', {
            chat_id,
            message_id,
            reaction: JSON.stringify(reaction),
            is_big,
        });
    }

    /**
     * Use this method to get a list of profile pictures for a user.
     *
     * [getUserProfilePhotos - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getuserprofilephotos)
     *
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @param [offset] `Optional`
     * >- Sequential number of the first photo to be returned. By default, all photos are returned.
     * @param [limit] `Optional`
     * >- Limits the number of photos to be retrieved. Values between 1-100 are accepted. Defaults to 100.
     * @returns >- a [UserProfilePhotos](https://core.telegram.org/bots/api#userprofilephotos) object.
     */
    public static async getUserProfilePhotos(
        token:string,
        {
            user_id,
            offset,
            limit,
        }: tgOptions.getUserProfilePhotos): Promise<tgTypes.UserProfilePhotos> {
        return await TG_REQ.callApi(token, 'getUserProfilePhotos', {
            user_id,
            offset,
            limit,
        });
    }

    /**
     * Use this method to get basic information about a file and prepare it for downloading.
     * For the moment, bots can download files of up to 20MB in size.
     * The file can then be downloaded via the link `https://api.telegram.org/file/bot<token>/<file_path>`,
     * where `<file_path>` is taken from the response. It is guaranteed that the link will be valid for at least 1 hour.
     * When the link expires, a new one can be requested by calling [getFile](https://core.telegram.org/bots/api#getfile) again.
     *
     * [getFile - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getfile)
     *
     * @param file_id `Required`
     * >- File identifier to get information about
     * @returns >- On success, a [File](https://core.telegram.org/bots/api#file) object is returned.
     */
    public static async getFile(
        token:string,
        {
            file_id,
        }: tgOptions.getFile): Promise<tgTypes.File> {
        return await TG_REQ.callApi(token, 'getFile', {
            file_id,
        });
    }

    /**
	 * Get a file with a given file_id
	 * @param botApiURL - full URL to the telegram API without slug
	 * @param data - data to append to the request
	 * @param token - bot token
	 */
	public static async getTheFile(token: string, data:{file_id:string}) {
		if (data.file_id === '') {
			return new Response();
		}
        //tg.getFile()
		const response = await  TG_REQ.tgSendRequest(token, tgRequestMethod.FILE_GET, data);
		const json: { result: { file_path: string } } = await response.result.json();
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
     * Use this method to ban a user in a group, a supergroup or a channel. In the case of supergroups and channels,
     * the user will not be able to return to the chat on their own using invite links, etc.,
     * unless [unbanned](https://core.telegram.org/bots/api#unbanchatmember) first.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     *
     * [banChatMember - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#banchatmember)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target group or username of the target supergroup or channel (in the format `@channelusername`)
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @param [until_date] `Optional`
     * >- Date when the user will be unbanned; Unix time.
     * If user is banned for more than 366 days or less than 30 seconds from the current time they are considered to be banned forever.
     * Applied for supergroups and channels only.
     * @param [revoke_messages] `Optional`
     * >- Pass true to delete all messages from the chat for the user that is being removed.
     * If false, the user will be able to see messages in the group that were sent before the user was removed.
     * Always true for supergroups and channels.
     * @returns >- true on success.
     */
    public static async banChatMember(
        token:string,
        {
            chat_id,
            user_id,
            until_date,
            revoke_messages,
        }: tgOptions.banChatMember): Promise<boolean> {
        return await TG_REQ.callApi(token, 'banChatMember', {
            chat_id,
            user_id,
            until_date,
            revoke_messages,
        });
    }

    /**
     * Use this method to unban a previously banned user in a supergroup or channel.
     * The user will not return to the group or channel automatically, but will be able to join via link, etc.
     * The bot must be an administrator for this to work.
     * By default, this method guarantees that after the call the user is not a member of the chat, but will be able to join it.
     * So if the user is a member of the chat they will also be removed from the chat.
     * If you don't want this, use the parameter only_if_banned.
     *
     * [unbanChatMember - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#unbanchatmember)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target group or username of the target supergroup or channel (in the format `@channelusername`)
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @param [only_if_banned] `Optional`
     * >- Do nothing if the user is not banned
     * @returns >- true on success.
     */
    public static async unbanChatMember(
        token:string,
        {
            chat_id,
            user_id,
            only_if_banned,
        }: tgOptions.unbanChatMember): Promise<boolean> {
        return await TG_REQ.callApi(token, 'unbanChatMember', {
            chat_id,
            user_id,
            only_if_banned,
        });
    }

    /**
     * Use this method to restrict a user in a supergroup.
     * The bot must be an administrator in the supergroup for this to work and must have the appropriate administrator rights.
     * Pass true for all permissions to lift restrictions from a user.
     *
     * [restrictChatMember - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#restrictchatmember)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @param permissions `Required`
     * >- A JSON-serialized object for new user permissions
     * @param [use_independent_chat_permissions] `Optional`
     * >- Pass true if chat permissions are set independently. Otherwise,
     * the can_send_other_messages and can_add_web_page_previews permissions will imply the can_send_messages, can_send_audios,
     * can_send_documents, can_send_photos, can_send_videos, can_send_video_notes, and can_send_voice_notes permissions;
     * the can_send_polls permission will imply the can_send_messages permission.
     * @param [until_date] `Optional`
     * >- Date when restrictions will be lifted for the user; Unix time.
     * If user is restricted for more than 366 days or less than 30 seconds from the current time, they are considered to be restricted forever
     * @returns >- true on success.
     */
    public static async restrictChatMember(
        token:string,
        params: tgOptions.restrictChatMember): Promise<boolean> {
        return await TG_REQ.callApi(token, 'restrictChatMember',params);
    }

    /**
     * Use this method to promote or demote a user in a supergroup or a channel.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     * Pass false for all boolean parameters to demote a user.
     *
     * [promoteChatMember - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#promotechatmember)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format @channelusername)
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @param [is_anonymous] `Optional`
     * >- Pass true if the administrator's presence in the chat is hidden
     * @param [can_manage_chat] `Optional`
     * >- Pass true if the administrator can access the chat event log, get boost list, see hidden supergroup and channel members,
     * report spam messages and ignore slow mode. Implied by any other administrator privilege.
     * @param [can_delete_messages] `Optional`
     * >- Pass true if the administrator can delete messages of other users
     * @param [can_manage_video_chats] `Optional`
     * >- Pass true if the administrator can manage video chats
     * @param [can_restrict_members] `Optional`
     * >- Pass true if the administrator can restrict, ban or unban chat members, or access supergroup statistics
     * @param [can_promote_members] `Optional`
     * >- Pass true if the administrator can add new administrators with a subset of their own privileges
     * or demote administrators that they have promoted, directly or indirectly (promoted by administrators that were appointed by him)
     * @param [can_change_info] `Optional`
     * >- Pass true if the administrator can change chat title, photo and other settings
     * @param [can_invite_users] `Optional`
     * >- Pass true if the administrator can invite new users to the chat
     * @param [can_post_stories] `Optional`
     * >- Pass true if the administrator can post stories to the chat
     * @param [can_edit_stories] `Optional`
     * >- Pass true if the administrator can edit stories posted by other users, post stories to the chat page,
     * pin chat stories, and access the chat's story archive
     * @param [can_delete_stories] `Optional`
     * >- Pass true if the administrator can delete stories posted by other users
     * @param [can_post_messages] `Optional`
     * >- Pass true if the administrator can post messages in the channel, or access channel statistics; for channels only
     * @param [can_edit_messages] `Optional`
     * >- Pass true if the administrator can edit messages of other users and can pin messages; for channels only
     * @param [can_pin_messages] `Optional`
     * >- Pass true if the administrator can pin messages; for supergroups only
     * @param [can_manage_topics] `Optional`
     * >- Pass true if the user is allowed to create, rename, close, and reopen forum topics; for supergroups only
     * @returns >- true on success.
     */
    public static async promoteChatMember(
        token:string,
        {
            chat_id,
            user_id,
            is_anonymous,
            can_manage_chat,
            can_delete_messages,
            can_manage_video_chats,
            can_restrict_members,
            can_promote_members,
            can_change_info,
            can_invite_users,
            can_post_stories,
            can_edit_stories,
            can_delete_stories,
            can_post_messages,
            can_edit_messages,
            can_pin_messages,
            can_manage_topics,
        }: tgOptions.promoteChatMember): Promise<boolean> {
        return await TG_REQ.callApi(token, 'promoteChatMember', {
            chat_id,
            user_id,
            is_anonymous,
            can_manage_chat,
            can_delete_messages,
            can_manage_video_chats,
            can_restrict_members,
            can_promote_members,
            can_change_info,
            can_invite_users,
            can_post_stories,
            can_edit_stories,
            can_delete_stories,
            can_post_messages,
            can_edit_messages,
            can_pin_messages,
            can_manage_topics,
        });
    }

    /**
     * Use this method to set a custom title for an administrator in a supergroup promoted by the bot.
     *
     * [setChatAdministratorCustomTitle - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setchatadministratorcustomtitle)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @param custom_title `Required`
     * >- New custom title for the administrator; 0-16 characters, emoji are not allowed
     * @returns >- true on success.
     */
    public static async setChatAdministratorCustomTitle(
        token:string,
        {
            chat_id,
            user_id,
            custom_title,
        }:tgOptions.setChatAdministratorCustomTitle ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setChatAdministratorCustomTitle', {
            chat_id,
            user_id,
            custom_title,
        });
    }

    /**
     * Use this method to ban a channel chat in a supergroup or a channel.
     * Until the chat is [unbanned](https://core.telegram.org/bots/api#unbanchatsenderchat),
     * the owner of the banned chat won't be able to send messages on behalf of any of their channels.
     * The bot must be an administrator in the supergroup or channel for this to work and must have the appropriate administrator rights.
     *
     * [banChatSenderChat - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#banchatsenderchat)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format @channelusername)
     * @param sender_chat_id `Required`
     * >- Unique identifier of the target sender chat
     * @returns >- true on success.
     */
    public static async banChatSenderChat(
        token:string,
        {
            chat_id,
            sender_chat_id,
        }:tgOptions.banChatSenderChat ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'banChatSenderChat', {
            chat_id,
            sender_chat_id,
        });
    }

    /**
     * Use this method to unban a previously banned channel chat in a supergroup or channel.
     * The bot must be an administrator for this to work and must have the appropriate administrator rights.
     *
     * [unbanChatSenderChat - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#unbanchatsenderchat)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param sender_chat_id `Required`
     * >- Unique identifier of the target sender chat
     * @returns >- true on success.
     */
    public static async unbanChatSenderChat(
        token:string,
        {
            chat_id,
            sender_chat_id,
        }:tgOptions.unbanChatSenderChat ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'unbanChatSenderChat', {
            chat_id,
            sender_chat_id,
        });
    }

    /**
     * Use this method to set default chat permissions for all members.
     * The bot must be an administrator in the group or a supergroup for this to work and must have the can_restrict_members administrator rights.
     *
     * [setChatPermissions - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setchatpermissions)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)
     * @param permissions `Required`
     * >- A JSON-serialized object for new default chat permissions
     * @param [use_independent_chat_permissions] `Optional`
     * >- Pass true if chat permissions are set independently.
     * Otherwise, the can_send_other_messages and can_add_web_page_previews permissions will imply the can_send_messages,
     * can_send_audios, can_send_documents, can_send_photos, can_send_videos, can_send_video_notes, and can_send_voice_notes permissions;
     * the can_send_polls permission will imply the can_send_messages permission.
     * @returns >- true on success.
     */
    public static async setChatPermissions(
        token:string,
        {
            chat_id,
            permissions,
            use_independent_chat_permissions,
        }: tgOptions.setChatPermissions): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setChatPermissions', {
            chat_id,
            permissions: JSON.stringify(permissions),
            use_independent_chat_permissions,
        });
    }

    /**
     * Use this method to generate a new primary invite link for a chat; any previously generated primary link is revoked.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     *
     * [exportChatInviteLink - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#exportchatinvitelink)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @returns >- the new invite link as string on success.
     */
    public static async exportChatInviteLink(
        token:string,
        {
            chat_id,
        }: tgOptions.exportChatInviteLink): Promise<string> {
        return await TG_REQ.callApi(token, 'exportChatInviteLink', {
            chat_id,
        });
    }

    /**
     * Use this method to create an additional invite link for a chat.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     * The link can be revoked using the method [revokeChatInviteLink](https://core.telegram.org/bots/api#revokechatinvitelink).
     *
     * [createChatInviteLink - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#createchatinvitelink)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param [name] `Optional`
     * >- Invite link name; 0-32 characters
     * @param [expire_date] `Optional`
     * >- Point in time (Unix timestamp) when the link will expire
     * @param [member_limit] `Optional`
     * >- The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999
     * @param [creates_join_request] `Optional`
     * >- true, if users joining the chat via the link need to be approved by chat administrators. If true, member_limit can't be specified
     * @returns >- the new invite link as [ChatInviteLink](https://core.telegram.org/bots/api#chatinvitelink) object.
     */
    public static async createChatInviteLink(
        token:string,
        {
            chat_id,
            name,
            expire_date,
            member_limit,
            creates_join_request,
        }: tgOptions.createChatInviteLink): Promise<tgTypes.ChatInviteLink> {
        return await TG_REQ.callApi(token, 'createChatInviteLink', {
            chat_id,
            name,
            expire_date,
            member_limit,
            creates_join_request,
        });
    }

    /**
     * Use this method to edit a non-primary invite link created by the bot.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     *
     * [editChatInviteLink - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#editchatinvitelink)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param invite_link `Required`
     * >- The invite link to edit
     * @param [name] `Optional`
     * >- Invite link name; 0-32 characters
     * @param [expire_date] `Optional`
     * >- Point in time (Unix timestamp) when the link will expire
     * @param [member_limit] `Optional`
     * >- The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999
     * @param [creates_join_request] `Optional`
     * >- true, if users joining the chat via the link need to be approved by chat administrators. If true, member_limit can't be specified
     * @returns >- the edited invite link as a [ChatInviteLink](https://core.telegram.org/bots/api#chatinvitelink) object.
     */
    public static async editChatInviteLink(
        token:string,
        {
            chat_id,
            invite_link,
            name,
            expire_date,
            member_limit,
            creates_join_request,
        }:tgOptions.editChatInviteLink ): Promise<tgTypes.ChatInviteLink> {
        return await TG_REQ.callApi(token, 'editChatInviteLink', {
            chat_id,
            invite_link,
            name,
            expire_date,
            member_limit,
            creates_join_request,
        });
    }

    /**
     * Use this method to create a
     * [subscription invite link](https://telegram.org/blog/superchannels-star-reactions-subscriptions#star-subscriptions) for a channel chat.
     * The bot must have the can_invite_users administrator rights. The link can be edited using the method
     * [editChatSubscriptionInviteLink](https://core.telegram.org/bots/api#editchatsubscriptioninvitelink) or revoked using the method
     * [revokeChatInviteLink](https://core.telegram.org/bots/api#revokechatinvitelink).
     *
     * [createChatSubscriptionInviteLink - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#createchatsubscriptioninvitelink)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target channel chat or username of the target channel (in the format `@channelusername`)
     * @param subscription_period `Required`
     * >- The number of seconds the subscription will be active for before the next payment. Currently, it must always be 2592000 (30 days).
     * @param subscription_price `Required`
     * >- The amount of Telegram Stars a user must pay initially and after each subsequent subscription period to be a member of the chat; 1-2500
     * @param [name] `Optional`
     * >- Invite link name; 0-32 characters
     * @returns >- the new invite link as a [ChatInviteLink](https://core.telegram.org/bots/api#chatinvitelink) object.
     */
    public static async createChatSubscriptionInviteLink(
        token:string,
        {
            chat_id,
            subscription_period,
            subscription_price,
            name,
        }: tgOptions.createChatSubscriptionInviteLink): Promise<tgTypes.ChatInviteLink> {
        return await TG_REQ.callApi(token, 'createChatSubscriptionInviteLink', {
            chat_id,
            subscription_period,
            subscription_price,
            name,
        });
    }

    /**
     * Use this method to edit a subscription invite link created by the bot.
     * The bot must have the can_invite_users administrator rights.
     *
     * [editChatSubscriptionInviteLink - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#editchatsubscriptioninvitelink)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param invite_link `Required`
     * >- The invite link to edit
     * @param [name] `Optional`
     * >- Invite link name; 0-32 characters
     * @returns >- the edited invite link as a [ChatInviteLink](https://core.telegram.org/bots/api#chatinvitelink) object.
     */
    public static async editChatSubscriptionInviteLink(
        token:string,
        {
            chat_id,
            invite_link,
            name,
        }: tgOptions.editChatSubscriptionInviteLink): Promise<tgTypes.ChatInviteLink> {
        return await TG_REQ.callApi(token, 'editChatSubscriptionInviteLink', {
            chat_id,
            invite_link,
            name,
        });
    }

    /**
     * Use this method to revoke an invite link created by the bot. If the primary link is revoked, a new link is automatically generated.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     *
     * [revokeChatInviteLink - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#revokechatinvitelink)
     *
     * @param chat_id `Required`
     * >- Unique identifier of the target chat or username of the target channel (in the format `@channelusername`)
     * @param invite_link `Required`
     * >- The invite link to revoke
     * @returns >- the revoked invite link as [ChatInviteLink](https://core.telegram.org/bots/api#chatinvitelink) object.
     */
    public static async revokeChatInviteLink(
        token:string,
        {
            chat_id,
            invite_link,
        }: tgOptions.revokeChatInviteLink): Promise<tgTypes.ChatInviteLink> {
        return await TG_REQ.callApi(token, 'revokeChatInviteLink', {
            chat_id,
            invite_link,
        });
    }

    /**
     * Use this method to approve a chat join request.
     * The bot must be an administrator in the chat for this to work and must have the can_invite_users administrator right.
     *
     * [approveChatJoinRequest - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#approvechatjoinrequest)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @returns >- true on success.
     */
    public static async approveChatJoinRequest(
        token:string,
        {
            chat_id,
            user_id,
        }: tgOptions.approveChatJoinRequest): Promise<boolean> {
        return await TG_REQ.callApi(token, 'approveChatJoinRequest', {
            chat_id,
            user_id,
        });
    }

    /**
     * Use this method to decline a chat join request.
     * The bot must be an administrator in the chat for this to work and must have the can_invite_users administrator right.
     *
     * [declineChatJoinRequest - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#declinechatjoinrequest)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @returns >- true on success.
     */
    public static async declineChatJoinRequest(
        token:string,
        {
            chat_id,
            user_id,
        }: tgOptions.declineChatJoinRequest): Promise<boolean> {
        return await TG_REQ.callApi(token, 'declineChatJoinRequest', {
            chat_id,
            user_id,
        });
    }

    /**
     * Use this method to set a new profile photo for the chat. Photos can't be changed for private chats.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     *
     * [setChatPhoto - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setchatphoto)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param photo `Required`
     * >- New chat photo, uploaded using multipart/form-data
     * @returns >- true on success.
     */
    public static async setChatPhoto(
        token:string,
        {
            chat_id,
            photo,
        }: tgOptions.setChatPhoto): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setChatPhoto', {
            chat_id,
            photo: JSON.stringify(photo),
        });
    }

    /**
     * Use this method to delete a chat photo. Photos can't be changed for private chats.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     *
     * [deleteChatPhoto - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#deletechatphoto)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @returns >- true on success.
     */
    public static async deleteChatPhoto(
        token:string,
        {
            chat_id,
        }:tgOptions.deleteChatPhoto ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'deleteChatPhoto', {
            chat_id,
        });
    }

    /**
     * Use this method to change the title of a chat. Titles can't be changed for private chats.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     *
     * [setChatTitle - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setchattitle)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param title `Required`
     * >- New chat title, 1-128 characters
     * @returns >- true on success.
     */
    public static async setChatTitle(
        token:string,
        {
            chat_id,
            title,
        }: tgOptions.setChatTitle): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setChatTitle', {
            chat_id,
            title,
        });
    }

    /**
     * Use this method to change the description of a group, a supergroup or a channel.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     *
     * [setChatDescription - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setchatdescription)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param [description] `Optional`
     * >- New chat description, 0-255 characters
     * @returns >- true on success.
     */
    public static async setChatDescription(
        token:string,
        {
            chat_id,
            description,
        }: tgOptions.setChatDescription): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setChatDescription', {
            chat_id,
            description,
        });
    }

    /**
     * Use this method to add a message to the list of pinned messages in a chat.
     * If the chat is not a private chat, the bot must be an administrator in the chat for this to work
     * and must have the 'can_pin_messages' administrator right in a supergroup or 'can_edit_messages' administrator right in a channel.
     *
     * [pinChatMessage - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#pinchatmessage)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param message_id `Required`
     * >- Identifier of a message to pin
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be pinned
     * @param [disable_notification] `Optional`
     * >- Pass true if it is not necessary to send a notification to all chat members about the new pinned message.
     * Notifications are always disabled in channels and private chats.
     * @returns >- true on success.
     */
    public static async pinChatMessage(
        token:string,
        {
            chat_id,
            message_id,
            business_connection_id,
            disable_notification,
        }:tgOptions.pinChatMessage ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'pinChatMessage', {
            chat_id,
            message_id,
            business_connection_id,
            disable_notification,
        });
    }

    /**
     * Use this method to remove a message from the list of pinned messages in a chat.
     * If the chat is not a private chat, the bot must be an administrator in the chat for this to work
     * and must have the 'can_pin_messages' administrator right in a supergroup or 'can_edit_messages' administrator right in a channel.
     *
     * [unpinChatMessage - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#unpinchatmessage)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param [business_connection_id] `Optional`
     * >- Unique identifier of the business connection on behalf of which the message will be unpinned
     * @param [message_id] `Optional`
     * >- Identifier of the message to unpin. Required if business_connection_id is specified.
     * If not specified, the most recent pinned message (by sending date) will be unpinned.
     * @returns >- true on success.
     */
    public static async unpinChatMessage(
        token:string,
        {
            chat_id,
            business_connection_id,
            message_id,
        }: tgOptions.unpinChatMessage): Promise<boolean> {
        return await TG_REQ.callApi(token, 'unpinChatMessage', {
            chat_id,
            business_connection_id,
            message_id,
        });
    }

    /**
     * Use this method to clear the list of pinned messages in a chat.
     * If the chat is not a private chat, the bot must be an administrator in the chat for this to work
     * and must have the 'can_pin_messages' administrator right in a supergroup or 'can_edit_messages' administrator right in a channel.
     *
     * [unpinAllChatMessages - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#unpinallchatmessages)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @returns >- true on success.
     */
    public static async unpinAllChatMessages(
        token:string,
        {
            chat_id,
        }: tgOptions.unpinAllChatMessages): Promise<boolean> {
        return await TG_REQ.callApi(token, 'unpinAllChatMessages', {
            chat_id,
        });
    }

    /**
     * Use this method for your bot to leave a group, supergroup or channel.
     *
     * [leaveChat - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#leavechat)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     * @returns >- true on success.
     */
    public static async leaveChat(
        token:string,
        {
            chat_id,
        }: tgOptions.leaveChat): Promise<boolean> {
        return await TG_REQ.callApi(token, 'leaveChat', {
            chat_id,
        });
    }

    /**
     * Use this method to get up-to-date information about the chat.
     *
     * [getChat - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getchat)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     * @returns >- a [ChatFullInfo](https://core.telegram.org/bots/api#chatfullinfo) object on success.
     */
    public static async getChat(
        token:string,
        {
            chat_id,
        }: tgOptions. getChat): Promise<tgTypes.ChatFullInfo> {
        return await TG_REQ.callApi(token, 'getChat', {
            chat_id,
        });
    }

    /**
     * Use this method to get a list of administrators in a chat, which aren't bots.
     *
     * [getChatAdministrators - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getchatadministrators)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     * @returns >- an Array of [ChatMember](https://core.telegram.org/bots/api#chatmember) objects.
     */
    public static async getChatAdministrators(
        token:string,
        {
            chat_id,
        }: tgOptions.getChatAdministrators): Promise<tgTypes.ChatMember> {
        return await TG_REQ.callApi(token, 'getChatAdministrators', {
            chat_id,
        });
    }

    /**
     * Use this method to get the number of members in a chat.
     *
     * [getChatMemberCount - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getchatmembercount)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     * @returns >- the number of members in the chat on success.
     */
    public static async getChatMemberCount(
        token:string,
        {
            chat_id,
        }:tgOptions.getChatMemberCount ): Promise<number> {
        return await TG_REQ.callApi(token, 'getChatMemberCount', {
            chat_id,
        });
    }

    /**
     * Use this method to get information about a member of a chat.
     * The method is only guaranteed to work for other users if the bot is an administrator in the chat.
     *
     * [getChatMember - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getchatmember)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup or channel (in the format `@channelusername`)
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @returns >- a [ChatMember](https://core.telegram.org/bots/api#chatmember) object on success.
     */
    public static async getChatMember(
        token:string,
        {
            chat_id,
            user_id,
        }:tgOptions.getChatMember ): Promise<tgTypes.ChatMember> {
        return await TG_REQ.callApi(token, 'getChatMember', {
            chat_id,
            user_id,
        });
    }

    /**
     * Use this method to set a new group sticker set for a supergroup.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     * Use the field can_set_sticker_set optionally returned in [getChat](https://core.telegram.org/bots/api#getchat)
     * requests to check if the bot can use this method.
     *
     * [setChatStickerSet - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setchatstickerset)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @param sticker_set_name `Required`
     * >- Name of the sticker set to be set as the group sticker set
     * @returns >- true on success.
     */
    public static async setChatStickerSet(
        token:string,
        {
            chat_id,
            sticker_set_name,
        }:tgOptions.setChatStickerSet ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setChatStickerSet', {
            chat_id,
            sticker_set_name,
        });
    }

    /**
     * Use this method to delete a group sticker set from a supergroup.
     * The bot must be an administrator in the chat for this to work and must have the appropriate administrator rights.
     * Use the field can_set_sticker_set optionally returned in [getChat](https://core.telegram.org/bots/api#getchat)
     * requests to check if the bot can use this method.
     *
     * [deleteChatStickerSet - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#deletechatstickerset)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @returns >- true on success.
     */
    public static async deleteChatStickerSet(
        token:string,
        {
            chat_id,
        }:tgOptions.deleteChatStickerSet ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'deleteChatStickerSet', {
            chat_id,
        });
    }

    /**
     * Use this method to get custom emoji stickers, which can be used as a forum topic icon by any user.
     * Requires no parameters.
     *
     * [getForumTopicIconStickers - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getforumtopiciconstickers)
     *
     * @returns >- an Array of [Sticker](https://core.telegram.org/bots/api#sticker) objects.
     */
    public static async getForumTopicIconStickers(token:string): Promise<tgTypes.Sticker[]> {
        return await TG_REQ.callApi(token, 'getForumTopicIconStickers');
    }

    /**
     * Use this method to create a topic in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights.
     *
     * [createForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#createforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @param name `Required`
     * >- Topic name, 1-128 characters
     * @param [icon_color] `Optional`
     * >- Color of the topic icon in RGB format. Currently, must be one of
     * >  - 7322096 (0x6FB9F0),
     * >  - 16766590 (0xFFD67E),
     * >  - 13338331 (0xCB86DB),
     * >  - 9367192 (0x8EEE98),
     * >  - 16749490 (0xFF93B2),
     * >  - 16478047 (0xFB6F5F)
     * @param [icon_custom_emoji_id] `Optional`
     * >- Unique identifier of the custom emoji shown as the topic icon.
     * Use [getForumTopicIconStickers](https://core.telegram.org/bots/api#getforumtopiciconstickers) to get all allowed custom emoji identifiers.
     * @returns >- information about the created topic as a [ForumTopic](https://core.telegram.org/bots/api#forumtopic) object.
     */
    public static async createForumTopic(
        token:string,
        {
            chat_id,
            name,
            icon_color,
            icon_custom_emoji_id,
        }: tgOptions.createForumTopic): Promise<tgTypes.ForumTopic> {
        return await TG_REQ.callApi(token, 'createForumTopic', {
            chat_id,
            name,
            icon_color,
            icon_custom_emoji_id,
        });
    }

    /**
     * Use this method to edit name and icon of a topic in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights,
     * unless it is the creator of the topic.
     *
     * [editForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#editforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @param message_thread_id `Required`
     * >- Unique identifier for the target message thread of the forum topic
     * @param [name] `Optional`
     * >- New topic name, 0-128 characters. If not specified or empty, the current name of the topic will be kept
     * @param [icon_custom_emoji_id] `Optional`
     * >- New unique identifier of the custom emoji shown as the topic icon.
     * Use [getForumTopicIconStickers](https://core.telegram.org/bots/api#getforumtopiciconstickers)
     * to get all allowed custom emoji identifiers. Pass an empty string to remove the icon. If not specified, the current icon will be kept
     * @returns >- true on success.
     */
    public static async editForumTopic(
        token:string,
        {
            chat_id,
            message_thread_id,
            name,
            icon_custom_emoji_id,
        }: tgOptions.editForumTopic): Promise<boolean> {
        return await TG_REQ.callApi(token, 'editForumTopic', {
            chat_id,
            message_thread_id,
            name,
            icon_custom_emoji_id,
        });
    }

    /**
     * Use this method to close an open topic in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights,
     * unless it is the creator of the topic.
     *
     * [closeForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#closeforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @param message_thread_id `Required`
     * >- Unique identifier for the target message thread of the forum topic
     * @returns >- true on success.
     */
    public static async closeForumTopic(
        token:string,
        {
            chat_id,
            message_thread_id,
        }: tgOptions.closeForumTopic): Promise<boolean> {
        return await TG_REQ.callApi(token, 'closeForumTopic', {
            chat_id,
            message_thread_id,
        });
    }

    /**
     * Use this method to reopen a closed topic in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights,
     * unless it is the creator of the topic.
     *
     * [reopenForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#reopenforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @param message_thread_id `Required`
     * >- Unique identifier for the target message thread of the forum topic
     * @returns >- true on success.
     */
    public static async reopenForumTopic(
        token:string,
        {
            chat_id,
            message_thread_id,
        }:tgOptions.reopenForumTopic ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'reopenForumTopic', {
            chat_id,
            message_thread_id,
        });
    }

    /**
     * Use this method to delete a forum topic along with all its messages in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_delete_messages administrator rights.
     *
     * [deleteForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#deleteforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @param message_thread_id `Required`
     * >- Unique identifier for the target message thread of the forum topic
     * @returns >- true on success.
     */
    public static async deleteForumTopic(
        token:string,
        {
            chat_id,
            message_thread_id,
        }:tgOptions.deleteForumTopic ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'deleteForumTopic', {
            chat_id,
            message_thread_id,
        });
    }

    /**
     * Use this method to clear the list of pinned messages in a forum topic.
     * The bot must be an administrator in the chat for this to work and must have the can_pin_messages administrator right in the supergroup.
     *
     * [unpinAllForumTopicMessages - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#unpinallforumtopicmessages)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @param message_thread_id `Required`
     * >- Unique identifier for the target message thread of the forum topic
     * @returns >- true on success.
     */
    public static async unpinAllForumTopicMessages(
        token:string,
        {
            chat_id,
            message_thread_id,
        }:tgOptions.unpinAllForumTopicMessages ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'unpinAllForumTopicMessages', {
            chat_id,
            message_thread_id,
        });
    }

    /**
     * Use this method to edit the name of the 'General' topic in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights.
     *
     * [editGeneralForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#editgeneralforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @param name `Required`
     * >- New topic name, 1-128 characters
     * @returns >- true on success.
     */
    public static async editGeneralForumTopic(
        token:string,
        {
            chat_id,
            name,
        }:tgOptions.editGeneralForumTopic ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'editGeneralForumTopic', {
            chat_id,
            name,
        });
    }

    /**
     * Use this method to close an open 'General' topic in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights.
     *
     * [closeGeneralForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#closegeneralforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @returns >- true on success.
     */
    public static async closeGeneralForumTopic(
        token:string,
        {
            chat_id,
        }:tgOptions.closeGeneralForumTopic ): Promise<boolean> {
        return await TG_REQ.callApi(token, 'closeGeneralForumTopic', {
            chat_id,
        });
    }

    /**
     * Use this method to reopen a closed 'General' topic in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights.
     * The topic will be automatically unhidden if it was hidden.
     *
     * [reopenGeneralForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#reopengeneralforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @returns >- true on success.
     */
    public static async reopenGeneralForumTopic(
        token:string,
        {
            chat_id,
        }: tgOptions.reopenGeneralForumTopic): Promise<boolean> {
        return await TG_REQ.callApi(token, 'reopenGeneralForumTopic', {
            chat_id,
        });
    }

    /**
     * Use this method to hide the 'General' topic in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights.
     * The topic will be automatically closed if it was open.
     *
     * [hideGeneralForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#hidegeneralforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @returns >- true on success.
     */
    public static async hideGeneralForumTopic(
        token:string,
        {
            chat_id,
        }: tgOptions.hideGeneralForumTopic): Promise<boolean> {
        return await TG_REQ.callApi(token, 'hideGeneralForumTopic', {
            chat_id,
        });
    }

    /**
     * Use this method to unhide the 'General' topic in a forum supergroup chat.
     * The bot must be an administrator in the chat for this to work and must have the can_manage_topics administrator rights.
     *
     * [unhideGeneralForumTopic - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#unhidegeneralforumtopic)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @returns >- true on success.
     */
    public static async unhideGeneralForumTopic(
        token:string,
        {
            chat_id,
        }: tgOptions.unhideGeneralForumTopic): Promise<boolean> {
        return await TG_REQ.callApi(token, 'unhideGeneralForumTopic', {
            chat_id,
        });
    }

    /**
     * Use this method to clear the list of pinned messages in a General forum topic.
     * The bot must be an administrator in the chat for this to work and must have the can_pin_messages administrator right in the supergroup.
     *
     * [unpinAllGeneralForumTopicMessages - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#unpinallgeneralforumtopicmessages)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the target chat or username of the target supergroup (in the format `@supergroupusername`)
     * @returns >- true on success.
     */
    public static async unpinAllGeneralForumTopicMessages(
        token:string,
        {
            chat_id,
        }: tgOptions.unpinAllGeneralForumTopicMessages): Promise<boolean> {
        return await TG_REQ.callApi(token, 'unhideGeneralForumTopic', {
            chat_id,
        });
    }

    /**
     * Use this method to send answers to callback queries sent from [inline keyboards](https://core.telegram.org/bots/features#inline-keyboards).
     * The answer will be displayed to the user as a notification at the top of the chat screen or as an alert.
     *
     * [answerCallbackQuery - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#answercallbackquery)
     *
     * @param callback_query_id `Required`
     * >- Unique identifier for the query to be answered
     * @param [text] `Optional`
     * >- Text of the notification. If not specified, nothing will be shown to the user, 0-200 characters
     * @param [show_alert] `Optional`
     * >- If true, an alert will be shown by the client instead of a notification at the top of the chat screen. Defaults to false.
     * @param [url] `Optional`
     * >- URL that will be opened by the user's client. If you have created a [Game](https://core.telegram.org/bots/api#game)
     * and accepted the conditions via [@BotFather](https://t.me/botfather),
     * specify the URL that opens your game - note that this will only work if the query comes from a
     * [callback_game](https://core.telegram.org/bots/api#inlinekeyboardbutton) button.
     * Otherwise, you may use links like `t.me/your_bot?start=XXXX` that open your bot with a parameter.
     * @param [cache_time] `Optional`
     * >- The maximum amount of time in seconds that the result of the callback query may be cached client-side.
     * Telegram apps will support caching starting in version 3.14. Defaults to 0.
     * @returns >- On success, true is returned.
     */
    public static async answerCallbackQuery(
        token:string,
        {
            callback_query_id,
            text,
            show_alert,
            url,
            cache_time,
        }: tgOptions.answerCallbackQuery): Promise<boolean> {
        return await TG_REQ.callApi(token, 'answerCallbackQuery', {
            callback_query_id,
            text,
            show_alert,
            url,
            cache_time,
        });
    }

    /**
     * Use this method to get the list of boosts added to a chat by a user. Requires administrator rights in the chat.
     *
     * [getUserChatBoosts - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getuserchatboosts)
     *
     * @param chat_id `Required`
     * >- Unique identifier for the chat or username of the channel (in the format `@channelusername`)
     * @param user_id `Required`
     * >- Unique identifier of the target user
     * @returns >- a [UserChatBoosts](https://core.telegram.org/bots/api#userchatboosts) object.
     */
    public static async getUserChatBoosts(
        token:string,
        {
            chat_id,
            user_id,
        }: tgOptions.getUserChatBoosts): Promise<tgTypes.UserChatBoosts> {
        return await TG_REQ.callApi(token, 'getUserChatBoosts', {
            chat_id,
            user_id,
        });
    }

    /**
     * Use this method to get information about the connection of the bot with a business account.
     *
     * [getBusinessConnection - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getbusinessconnection)
     *
     * @param business_connection_id `Required`
     * >- Unique identifier of the business connection
     * @returns >- a [BusinessConnection](https://core.telegram.org/bots/api#businessconnection) object on success.
     */
    public static async getBusinessConnection(
        token:string,
        {
            business_connection_id,
        }: tgOptions.getBusinessConnection): Promise<tgTypes.BusinessConnection> {
        return await TG_REQ.callApi(token, 'getBusinessConnection', {
            business_connection_id,
        });
    }

    /**
     * Use this method to change the list of the bot's commands. See [this manual](https://core.telegram.org/bots/features#commands)
     * for more details about bot commands.
     *
     * [setMyCommands - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setmycommands)
     *
     * @param commands `Required`
     * >- A JSON-serialized list of bot commands to be set as the list of the bot's commands. At most 100 commands can be specified.
     * @param [scope] `Optional`
     * >- A JSON-serialized object, describing scope of users for which the commands are relevant.
     * Defaults to [BotCommandScopeDefault](https://core.telegram.org/bots/api#botcommandscopedefault).
     * @param [language_code] `Optional`
     * >- A two-letter ISO 639-1 language code. If empty, commands will be applied to all users from the given scope,
     * for whose language there are no dedicated commands
     * @returns >- true on success.
     */
    public static async setMyCommands(
        token:string,
        {
            commands,
            scope,
            language_code,
        }: tgOptions.setMyCommands): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setMyCommands', {
            commands: JSON.stringify(commands),
            scope: JSON.stringify(scope),
            language_code,
        });
    }

    /**
     * Use this method to delete the list of the bot's commands for the given scope and user language. After deletion,
     * [higher level commands](https://core.telegram.org/bots/api#determining-list-of-commands) will be shown to affected users.
     *
     * [deleteMyCommands - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#deletemycommands)
     *
     * @param [scope] `Optional`
     * >- A JSON-serialized object, describing scope of users for which the commands are relevant.
     * Defaults to [BotCommandScopeDefault](https://core.telegram.org/bots/api#botcommandscopedefault).
     * @param [language_code] `Optional`
     * >- A two-letter ISO 639-1 language code. If empty, commands will be applied to all users from the given scope,
     * for whose language there are no dedicated commands
     * @returns >- true on success.
     */
    public static async deleteMyCommands(
        token:string,
        {
            scope,
            language_code,
        }: tgOptions.deleteMyCommands): Promise<boolean> {
        return await TG_REQ.callApi(token, 'deleteMyCommands', {
            scope: JSON.stringify(scope),
            language_code,
        });
    }

    /**
     * Use this method to get the current list of the bot's commands for the given scope and user language.
     *
     * [getMyCommands - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getmycommands)
     *
     * @param [scope] `Optional`
     * >- A JSON-serialized object, describing scope of users.
     * Defaults to [BotCommandScopeDefault](https://core.telegram.org/bots/api#botcommandscopedefault).
     * @param [language_code] `Optional`
     * >- A two-letter ISO 639-1 language code or an empty string
     * @returns >- an Array of [BotCommand](https://core.telegram.org/bots/api#botcommand) objects. If commands aren't set, an empty list is returned.
     */
    public static async getMyCommands(
        token:string,
        {
            scope,
            language_code,
        }: tgOptions.getMyCommands): Promise<tgTypes.BotCommand[]> {
        return await TG_REQ.callApi(token, 'getMyCommands', {
            scope: JSON.stringify(scope),
            language_code,
        });
    }

    /**
     * Use this method to change the bot's name.
     *
     * [setMyName - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setmyname)
     *
     * @param [name] `Optional`
     * >- New bot name; 0-64 characters. Pass an empty string to remove the dedicated name for the given language.
     * @param [language_code] `Optional`
     * >- A two-letter ISO 639-1 language code. If empty, the name will be shown to all users for whose language there is no dedicated name.
     * @returns >- true on success.
     */
    public static async setMyName(
        token:string,
        {
            name,
            language_code,
        }: tgOptions.setMyName): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setMyName', {
            name,
            language_code,
        });
    }

    /**
     * Use this method to get the current bot name for the given user language.
     *
     * [getMyName - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getmyname)
     *
     * @param [language_code] `Optional`
     * >- A two-letter ISO 639-1 language code or an empty string
     * @returns >- [BotName](https://core.telegram.org/bots/api#botname) on success.
     */
    public static async getMyName(
        token:string,
        {
            language_code,
        }: tgOptions.getMyName): Promise<tgTypes.BotName> {
        return await TG_REQ.callApi(token, 'getMyName', {
            language_code,
        });
    }

    /**
     * Use this method to change the bot's description, which is shown in the chat with the bot if the chat is empty.
     *
     * [setMyDescription - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setmydescription)
     *
     * @param [description] `Optional`
     * >- New bot description; 0-512 characters. Pass an empty string to remove the dedicated description for the given language.
     * @param [language_code] `Optional`
     * >- A two-letter ISO 639-1 language code.
     * If empty, the description will be applied to all users for whose language there is no dedicated description.
     * @returns >- true on success.
     */
    public static async setMyDescription(
        token:string,
        {
            description,
            language_code,
        }: tgOptions.setMyDescription): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setMyDescription', {
            description,
            language_code,
        });
    }

    /**
     * Use this method to get the current bot description for the given user language.
     *
     * [getMyDescription - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getmydescription)
     *
     * @param [language_code] `Optional`
     * >- A two-letter ISO 639-1 language code or an empty string
     * @returns >- [BotDescription](https://core.telegram.org/bots/api#botdescription) on success.
     */
    public static async getMyDescription(
        token:string,
        {
            language_code,
        }: tgOptions.getMyDescription): Promise<tgTypes.BotDescription> {
        return await TG_REQ.callApi(token, 'getMyDescription', {
            language_code,
        });
    }

    /**
     * Use this method to change the bot's short description, which is shown on the bot's profile page and is sent together
     * with the link when users share the bot.
     *
     * [setMyShortDescription - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setmyshortdescription)
     *
     * @param [short_description] `Optional`
     * >- New short description for the bot; 0-120 characters. Pass an empty string to remove the dedicated short description for the given language.
     * @param [language_code] `Optional`
     * >- A two-letter ISO 639-1 language code.
     * If empty, the short description will be applied to all users for whose language there is no dedicated short description.
     * @returns >- true on success.
     */
    public static async setMyShortDescription(
        token:string,
        {
            short_description,
            language_code,
        }: tgOptions.setMyShortDescription): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setMyShortDescription', {
            short_description,
            language_code,
        });
    }

    /**
     * Use this method to get the current bot short description for the given user language.
     *
     * [getMyShortDescription - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getmyshortdescription)
     *
     * @param [language_code] `Optional`
     * >- A two-letter ISO 639-1 language code or an empty string
     * @returns >- [BotShortDescription](https://core.telegram.org/bots/api#botshortdescription) on success.
     */
    public static async getMyShortDescription(
        token:string,
        {
            language_code,
        }: tgOptions.getMyShortDescription): Promise<tgTypes.BotShortDescription> {
        return await TG_REQ.callApi(token, 'getMyShortDescription', {
            language_code,
        });
    }

    /**
     * Use this method to change the bot's menu button in a private chat, or the default menu button.
     *
     * [setChatMenuButton - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setchatmenubutton)
     *
     * @param [chat_id] `Optional`
     * >- Unique identifier for the target private chat. If not specified, default bot's menu button will be changed
     * @param [menu_button] `Optional`
     * >- A JSON-serialized object for the bot's new menu button.
     * Defaults to [MenuButtonDefault](https://core.telegram.org/bots/api#menubuttondefault)
     * @returns >- true on success.
     */
    public static async setChatMenuButton(
        token:string,
        {
            chat_id,
            menu_button,
        }: tgOptions.setChatMenuButton): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setChatMenuButton', {
            chat_id,
            menu_button: JSON.stringify(menu_button),
        });
    }

    /**
     * Use this method to get the current value of the bot's menu button in a private chat, or the default menu button.
     *
     * [getChatMenuButton - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getchatmenubutton)
     *
     * @param [chat_id] `Optional`
     * >- Unique identifier for the target private chat. If not specified, default bot's menu button will be returned
     * @returns >- [MenuButton](https://core.telegram.org/bots/api#menubutton) on success.
     */
    public static async getChatMenuButton(
        token:string,
        {
            chat_id,
        }: tgOptions.getChatMenuButton): Promise<tgTypes.MenuButton> {
        return await TG_REQ.callApi(token, 'getChatMenuButton', {
            chat_id,
        });
    }

    /**
     * Use this method to change the default administrator rights requested by the bot when it's added as an administrator to groups or channels.
     * These rights will be suggested to users, but they are free to modify the list before adding the bot.
     *
     * [setMyDefaultAdministratorRights - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#setmydefaultadministratorrights)
     *
     * @param [rights] `Optional`
     * >- A JSON-serialized object describing new default administrator rights.
     * If not specified, the default administrator rights will be cleared.
     * @param [for_channels] `Optional`
     * >- Pass true to change the default administrator rights of the bot in channels.
     * Otherwise, the default administrator rights of the bot for groups and supergroups will be changed.
     * @returns >- true on success.
     */
    public static async setMyDefaultAdministratorRights(
        token:string,
        {
            rights,
            for_channels,
        }: tgOptions.setMyDefaultAdministratorRights): Promise<boolean> {
        return await TG_REQ.callApi(token, 'setMyDefaultAdministratorRights', {
            rights: JSON.stringify(rights),
            for_channels,
        });
    }

    /**
     * Use this method to get the current default administrator rights of the bot.
     *
     * [getMyDefaultAdministratorRights - On Telegram Bot API Documentation](https://core.telegram.org/bots/api#getmydefaultadministratorrights)
     *
     * @param [for_channels] `Optional`
     * >- Pass True to get default administrator rights of the bot in channels.
     * Otherwise, default administrator rights of the bot for groups and supergroups will be returned.
     * @returns >- [ChatAdministratorRights](https://core.telegram.org/bots/api#chatadministratorrights) on success.
     */
    public static async getMyDefaultAdministratorRights(
        token:string,
        {
            for_channels,
        }: tgOptions.getMyDefaultAdministratorRights): Promise<tgTypes.ChatAdministratorRights> {
        return await TG_REQ.callApi(token, 'getMyDefaultAdministratorRights', {
            for_channels,
        });
    }


}
