import TG_BOT from "../telegram_bot";
import TG_ExecutionContext from "../telegram_execution_context";
import { TG_Message } from "./TelegramMessage";

export const tgRequestMethod = {
     UNKNOWN: 'unknonw',
     SEND_MESSAGE: 'sendMessage',
     DELETE_MESSAGE: 'deleteMessage',
     DELETE_MESSAGES: 'deleteMessages',
     SEND_MEDIA_GROUP: 'sendMediaGroup',
     SEND_VIDEO: 'sendVideo',
     SEND_PHOTO: 'sendPhoto',
     ANSWER_CALLBACK: 'answerCallbackQuery',
     ANSWER_INLINE: 'answerInlineQuery',
     SEND_CHAT_ACTION: 'sendChatAction',
     GET_FILE: 'getFile'

   } as const;
   
export type tgRequestMethod_t = typeof tgRequestMethod[keyof typeof  tgRequestMethod];

export const updOperation = {
     UNKNOWN: 'unknonw',
     NO_OP: 'no_operation',
     POST_NEW: 'new_post', //message with text
     MEDIA_NEW: 'new_media', //photo or video
     DOCUMENT_NEW: 'doc_new',

     POST_EDIT: 'edit_post',
     MEDIA_EDIT: 'edit_media', //photo or video
     DOC_EDIT: 'doc_edit',
     //topic messages for supergroups
     THREAD_CREATE: 'create_thread',
     THREAD_EDIT: 'update_thread',
     THREAD_DELETE: 'delete_thread', //not supported yet
     MEMBER_JOIN: 'member_join',
     MEMBER_LEFT:'member_left',
     
   } as const;
/*
     new_chat_title 	String 	Optional. A chat title was changed to this value
     new_chat_photo 	Array of PhotoSize 	Optional. A chat photo was change to this value
     delete_chat_photo 	True 	Optional. Service message: the chat photo was deleted
     forum_topic_closed 	ForumTopicClosed 	Optional. Service message: forum topic closed
     forum_topic_reopened 	ForumTopicReopened 	Optional. Service message: forum topic reopened
     general_forum_topic_hidden 	GeneralForumTopicHidden 	Optional. Service message: the 'General' forum topic hidden
     general_forum_topic_unhidden 	GeneralForumTopicUnhidden 	Optional. Service message: the 'General' forum topic unhidden
   
   post: message with text
   without txt: media (photo/video), document
   */

/**   types od message
 * new message
 * edited message
 * new chanel
 * edited chanel
 * new businness
 * edited bussines
 * deleted businnes
 * reaction
 * new inline
 * result inline
 * 
 * new callback
 * new shipping
 * new poll
 * new checkout
 * forum_topic_created 	ForumTopicCreated 	Optional. Service message: forum topic created
forum_topic_edited 	ForumTopicEdited 	Optional. Service message: forum topic edited
forum_topic_closed 	ForumTopicClosed 	Optional. Service message: forum topic closed
forum_topic_reopened 	ForumTopicReopened 	Optional. Service message: forum topic reopened
general_forum_topic_hidden 	GeneralForumTopicHidden 	Optional. Service message: the 'General' forum topic hidden
general_forum_topic_unhidden
 */
   
export type updOperation_t = typeof updOperation[keyof typeof  updOperation];

/**
 * message update types
 * message 	Message 	Optional. New incoming message of any kind - text, photo, sticker, etc.
edited_message 	Message 	Optional. New version of a message that is known to the bot and was edited. This update may at times be triggered by changes to message fields that are either unavailable or not actively used by your bot.
channel_post 	Message 	Optional. New incoming channel post of any kind - text, photo, sticker, etc.
edited_channel_post 	Message
business_message 	Message 	Optional. New message from a connected business account
edited_business_message 	Message 	Optional. New version of a message from a connected business account
 */
export const updType = {
     UNKNOWN: 'unknonw',
     MESSAGE : 'message',
	MESSAGE_EDIT: 'edited_message',
	MESSAGE_CHANEL_POST: 'channel_post',
	MESSAGE_CHANEL_POST_EDIT: 'edited_channel_post',
	BUSINESS_CONNECTION: 'business_connection',
	MESSAGE_BUSINESS: 'business_message',
	MESSAGE_BUSINESS_EDIT: 'edited_business_message',
	BUSINESS_MESSAGE_DEL: 'deleted_business_messages',
	REACTION: 'message_reaction',
	REACTION_COUNT: 'message_reaction_count',
	INLINE_QUERY: 'inline_query',
	INLINE_RESULT: 'chosen_inline_result',
	CALLBACK: 'callback_query',
	SHIPPING: 'shipping_query',
	PRE_CHECKOUT: 'pre_checkout_query',
	PURCHASED_MEDIA: 'purchased_payd_media',
	POLL: 'poll',
	POLL_ANSWER: 'poll_answer',
	CHAT_MEMBER: 'my_chat_member',
	CHAT_MEMBER_MY: 'chat_member',
	CHAT_JOIN_REQ: 'chat_join_request',
	CHAT_BOOST: 'chat_boost',
	CHAT_BOOST_REM: 'removed_chat_boost',
} as const
export type updType_t = typeof updType[keyof typeof  updType];

export type handlerFunc = (ctx:TG_ExecutionContext) => Promise<Response>
export type Handler = Record<string, handlerFunc>
export type botResponse = {
     "ok": boolean,
     "result": TG_Message
} 
   
export type commandFunc = {
     name: string;
     desc:string;
     func:(bot:TG_BOT , ...args:any) => Promise<any[]>;
     requiresArg: boolean;
}

export type CommandHandler = Record<string, commandFunc>

export type button_t = { 
     text: string;
     callback_data: string
}
export type two_buttons_t =  button_t[]

export type buttons_t = two_buttons_t[]|button_t[]

export const mediaType = {
     UNKNOWN:-1,
     PHOTO: 1,
     VIDEO: 2,
     DOCUMENT:3
}

export type mediaType_t = typeof mediaType[keyof typeof  mediaType];