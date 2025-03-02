import { checkRP, checkTD } from '../library.js';
import TelegramChat from './TelegramChat.js';
import { TelegramDocument } from './TelegramDocument.js';
import TG_ForumTopicCreated from './TelegramForumTopicCreated.js';
import TG_ForumTopicEdited from './TelegramForumtopicEdited.js';
import TelegramFrom from './TelegramFrom.js';
import TelegramMessageEntity from './TelegramMessageEntity.js';
import TelegramPhotoSize from './TelegramPhotoSize.js';
import TelegramUser from './TelegramUser.js';
import TG_Video from './TelegramVideo.js';

export interface TG_Message {
	message_id: number;
	from: TelegramFrom;
	sender_chat?: TelegramChat;
	date: number;
	chat: TelegramChat;
	forward_from?: TelegramUser;
	forward_from_chat?: TelegramChat;
	forward_from_message_id?: number;
	forward_signature?: string;
	forward_sender_name?: string;
	forward_date?: number;
	is_automatic_forward?: boolean;
	reply_to_message?: TG_Message;
	via_bot?: TelegramUser;
	edit_date?: number;
	has_protected_content?: boolean;
	media_group_id?: string;  //The unique identifier of a media message group this message belongs to
	author_signature?: string;
	text?: string;
	entities?: TelegramMessageEntity[];
	// animation?: TelegramAnimation;
	// audio?: TelegramAudio;
	document?: TelegramDocument;
	photo?: TelegramPhotoSize[];
	// sticker?: TelegramSticker;
	 video?:TG_Video;
	// video_note?: TelegramVideoNote;
	voice?: any;//TelegramVoice;
	caption?: string;
	caption_entities?: TelegramMessageEntity[];
	// contact?: TelegramContact;
	// dice?: TelegramDice;
	 poll?: any;//TelegramPoll;
	// venue?: TelegramVenue;
	location?: any;//TelegramLocation;
	new_chat_members?: TelegramUser[];
	new_chat_member?: TelegramUser;
	left_chat_member?: TelegramUser;
	new_chat_title?: string;
	// new_chat_photo?: TelegramPhotoSize[];
	delete_chat_photo?: boolean;
	group_chat_created?: boolean;
	supergroup_chat_created?: boolean;
	channel_chat_created?: boolean;
	// message_auto_delete_timer_changed?: TelegramAutoDeleteTimerChanged;
	migrate_to_chat_id?: number;
	migrate_from_chat_id?: number;
	pinned_message?: TG_Message;
	// invoice?: TelegramInvoice;
	// successful_payment?: TelegramSuccessfulPayment;
	connected_website?: string;
	reply_markup?: any; // 	InlineKeyboardMarkup 	Optional. Inline keyboard attached to the message. login_url buttons are represented as ordinary url buttons.
	forum_topic_created?:TG_ForumTopicCreated;
	forum_topic_edited?:TG_ForumTopicEdited;
	message_thread_id?:number; //Optional. Unique identifier of a message thread to which the message belongs; for supergroups only
	
}


export class ContextMessage {

     message:TG_Message;
	message_id: number =-1;
	
	//  renato names
	chat_id:any;
	id_thread:any;  //identify the topic the message is from
	id_user:any;
	username:any;
	caption:any;
	first_name:any;
	msg_date:any;
	//operation:updOperation_t = updOperation.UNKNOWN;
	msg_txt:string | undefined='';// initialized message
	is_td: 0 | 1 = 0; //is TD?
	is_td_rp: 0 | 1 = 0; //is repeteco?
	file_id:any;
	file_unique_id:any;
	type:any;
	deleted?:any;
	threadname?:any; //forum topic created name
	media_group_id?:any;
	chat?:any;

	constructor(msgJson?:TG_Message) {
		this.message = {} as TG_Message;
		
		if(msgJson) {
			this.message=msgJson;
			//this.from = msgJson.from;	
			//this.date = msgJson.date;
			//this.chat = msgJson.chat;
			this.chat_id = msgJson.chat.id;
			this.message_id = msgJson.message_id;
			this.id_thread = ('is_topic_message' in msgJson) ? msgJson.message_thread_id : "10227";
			//this.id_thread = msgJson.message_thread_id; //edit message;
			this.id_user = msgJson.from.id;
			this.username = ('username' in msgJson.from) ? msgJson.from.username : "Sem usuário";
			let name = (msgJson.from.first_name || '') + (msgJson.from.last_name ? ' ' + msgJson.from.last_name : '');
			this.first_name = name.trim();
			this.msg_date = msgJson.date;
			//this.operation = updOperation.NO_OP;
			this.chat = msgJson.chat;
			
			this.deleted = 0;

			if ('text' in msgJson || 'video' in msgJson || 'photo' in msgJson || 'document' in msgJson || 'voice' in msgJson || 'poll' in msgJson || 'location' in msgJson) {    
			this.msg_txt = 'new_post'
			if ('text' in msgJson) {
				//this.operation = updOperation.NEW_POST;
				this.msg_txt = msgJson.text;
				this.is_td = checkTD(msgJson.text);
				this.is_td_rp = checkRP(msgJson.text);
			}
	
			if ('photo' in msgJson || 'video' in msgJson) {
				//this.operation = updOperation.NEW_MEDIA;
				if ('photo' in msgJson) {
					const lastPhoto: TelegramPhotoSize = msgJson.photo? msgJson.photo[msgJson.photo.length - 1]:{
						file_id: 'unknown',
						file_unique_id: 'unknown',
						width: -1,
						height: -1,
						file_size: -1
					};
					this.file_id = lastPhoto.file_id;
					this.file_unique_id = lastPhoto.file_unique_id;
					this.type = 1;
				}
				if ('video' in msgJson) {
					this.file_id = msgJson.video?.file_id;
					this.file_unique_id = msgJson.video?.file_unique_id;
					this.type = 2;
				}
				if ('caption' in msgJson) {
					this.caption = msgJson.caption;
				}
				if ('media_group_id' in msgJson)
					this.media_group_id = msgJson.media_group_id;
				else
					this.media_group_id = String(msgJson.message_id);
			}
			this.deleted = 0;
			} 

		}
	}
 }
 
 
 