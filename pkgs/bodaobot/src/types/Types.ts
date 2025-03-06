import TG_BOT from "../telegram_bot";
import TG_ExecutionContext from "../telegram_execution_context";

export const tgRequestMethod = {
     UNKNOWN: 'unknonw',
     SEND_MESSAGE: 'sendMessage',
     MESSAGE_DELETE: 'deleteMessage',
     MESSAGES_DELETE: 'deleteMessages',
     MESSAGE_FORWARD:'forwardMessage',
     MESSAGES_FORWARD:'forwardMessages',
     MESSAGE_COPY: 'copyMessage',
     MESSAGES_COPY: 'copyMessages',
     SEND_MEDIA_GROUP: 'sendMediaGroup',
     SEND_VIDEO: 'sendVideo',
     SEND_PHOTO: 'sendPhoto',
     SEND_AUDIO: 'sendAudio',
     SEND_DOCUMENT: 'sendDocument',
     SEND_ANIMATION: 'sendAnimation',
     SEND_VOICE: 'sendVoice',
     SEND_VIDEO_NOTE: 'sendVideoNote', 
     SEND_PAYD_MEDIA: 'sendPaidMedia',
     SEND_POLL: 'sendPoll',
     SEND_LOCATION: 'sendLocation',
     SEND_CHAT_ACTION: 'sendChatAction',
     SEND_VENUE: 'sendVenue',
     SEND_CONTACT: 'sendContact',
     SEND_DICE: 'sendDice',
     SEND_MESSAGE_REACTION: 'setMessageReaction',
     ANSWER_CALLBACK: 'answerCallbackQuery',
     ANSWER_INLINE: 'answerInlineQuery',
     FILE_GET: 'getFile',
     GET_ME:'getMe',
     USER_PROFILE_PHOTO_GET: 'getUserProfilePhotos',
     LOGOUT:'logOut',
     CLOSE:'close',
     ADM_RIGHTS_GET:'getMyDefaultAdministratorRights',
     ADM_RIGHTS_SET:'setMyDefaultAdministratorRights',
     CHAT_MENUBUTTON_GET: 'getChatMenuButton',
     CHAT_MENUBUTTON_SET: 'setChatMenuButton',
     CHAT_MEMBER_BAN: 'banChatMember',
     CHAT_MEMBER_UNBAN: 'unbanChatMember',
     CHAT_MEMBER_RESTRICT: 'restrictChatMember',
     CHAT_MEMBER_PROMOTE: 'promoteChatMember',
     CHAT_ADM_CUSTOM_TITLE: 'setChatAdministratorCustomTitle',
     CHAT_SENDERCHAT_BAN: 'banChatSenderChat',
     CHAT_SENDERCHAT_UNBAN: 'unbanChatSenderChat',
     CHAT_PERMISSION_SET: 'setChatPermissions',
     CHAT_INVITELINK_EXPORT: 'exportChatInviteLink',
     CHAT_INVITELINK_CREATE: 'createChatInviteLink',
     CHAT_INVITELINK_EDIT: 'editChatInviteLink',
     CHAT_JOIN_APPROVE: 'approveChatJoinRequest',
     CHAT_JOIN_DECLINE: 'declineChatJoinRequest',
     CHAT_INVITELINK_SUBS_CREATE: 'createChatSubscriptionInviteLink',
     CHAT_INVITELINK_SUBS_EDIT: 'editChatSubscriptionInviteLink',
     CHAT_INVITELINK_REVOKE: 'revokeChatInviteLink',
     CHAT_PHOTO_SET: 'setChatPhoto',
     CHAT_PHOTO_DEL: 'deleteChatPhoto',
     CHAT_TITLE_SET: 'setChatTitle',
     CHAT_DESC_SET: 'setChatDescription',
     CHAT_MESSAGE_PIN: 'pinChatMessage',
     CHAT_MESSAGE_UNPIN: 'unpinChatMessage',
     CHAT_MESSAGE_ALL_UNPIN:'unpinAllChatMessages', 
     CHAT_LEAVE: 'leaveChat',
     CHAT_GET:  'getChat',
     CHAT_ADMS_GET: 'getChatAdministrators',
     CHAT_MEMBER_COUNT_GET: 'getChatMemberCount',
     CHAT_MEMBER_GET: 'getChatMember',
     CHAT_STICKER_SET: 'setChatStickerSet',
     CHAT_STICKER_SET_DELE: 'deleteChatStickerSet',
     FORUM_TOPIC_STICKER_ICONS_GET: 'getForumTopicIconStickers', 
     FORUM_TOPIC_CREATE: 'createForumTopic', 
     FORUM_TOPIC_EDIT: 'editForumTopic',
     FORUM_TOPIC_CLOSE: 'closeForumTopic', 
     FORUM_TOPIC_REOPEN: 'reopenForumTopic',
     FORUM_TOPIC_DELETE: 'deleteForumTopic',
     FORUM_TOPIC_UNPIN_ALL: 'unpinAllForumTopicMessages', 
     FORUN_TOPIC_GENERAL_EDIT: 'editGeneralForumTopic',  
     FORUM_TOPIC_GENERAL_CLOSE:  'closeGeneralForumTopic', 
     FORUM_TOPIC_GENERAL_REOPEN: 'reopenGeneralForumTopic',
     FORUM_TOPIC_GENERAL_HIDDEN: 'hideGeneralForumTopic',
     FORUM_TOPIC_GENERAL_UNHIDE: 'unhideGeneralForumTopic',
     FORUM_TOPIC_GENEAL_MESSAGES_UNPIN_ALL: 'unhideGeneralForumTopic',
     SHORT_DESCRIPTION_GET: 'getMyShortDescription',
     SHORT_DESCRIPTION_SET: 'setMyShortDescription',
     DESCRIPTION_GET: 'getMyDescription',
     DESCRIPTION_SET: 'setMyDescription',
     NAME_GET: 'getMyName',
     NAME_SET: 'setMyName',
     COMMANDS_GET: 'getMyCommands',
     COMMANDS_DELETE: 'deleteMyCommands',
     COMMANDS_SET: 'setMyCommands',
     BUSINESS_CONN_GET: 'getBusinessConnection',
     USER_CHAT_BOOTS_GET: 'getUserChatBoosts',


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

export interface botResponse {
     ok: boolean,
     result: any,
     description?: string
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



