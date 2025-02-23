import { checkRP, checkTD } from '../library.js';
import TelegramChat from './TelegramChat.js';
import { TelegramDocument } from './TelegramDocument.js';
import TelegramFrom from './TelegramFrom.js';
import TelegramMessageEntity from './TelegramMessageEntity.js';
import TelegramPhotoSize from './TelegramPhotoSize.js';
import TelegramUser from './TelegramUser.js';

interface TG_Message {
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
	media_group_id?: string;
	author_signature?: string;
	text?: string;
	entities?: TelegramMessageEntity[];
	// animation?: TelegramAnimation;
	// audio?: TelegramAudio;
	document?: TelegramDocument;
	photo?: TelegramPhotoSize[];
	// sticker?: TelegramSticker;
	// video?: TelegramVideo;
	// video_note?: TelegramVideoNote;
	// voice?: TelegramVoice;
	caption?: string;
	caption_entities?: TelegramMessageEntity[];
	// contact?: TelegramContact;
	// dice?: TelegramDice;
	// poll?: TelegramPoll;
	// venue?: TelegramVenue;
	// location?: TelegramLocation;
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
	//renato names
	msg_txt:string;// initialized message
	id_thread:string; //
	id_user:string; //from.id
	is_td:number; //is TD?
	is_td_rp:number; //is repeteco?
	threadname?:any; //forum topic created name

	chat_id?:any;
	username?:any;
	first_name?:any;
	msg_date?:any;
	operation:any;
	file_id:any;
	file_unique_id:any;
	type:any;
	deleted:any;

}
export default TG_Message;

export class Message implements TG_Message {


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
	media_group_id?: string;
	author_signature?: string;
	text?: string;
	entities?: TelegramMessageEntity[];
	// animation?: TelegramAnimation;
	// audio?: TelegramAudio;
	document?: TelegramDocument;
	photo?: TelegramPhotoSize[];
	// sticker?: TelegramSticker;
	// video?: TelegramVideo;
	// video_note?: TelegramVideoNote;
	// voice?: TelegramVoice;
	caption?: string;
	caption_entities?: TelegramMessageEntity[];
	// contact?: TelegramContact;
	// dice?: TelegramDice;
	// poll?: TelegramPoll;
	// venue?: TelegramVenue;
	// location?: TelegramLocation;
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



	//  renato names
	chat_id:any;
	id_thread:any;
	id_user:any;
	username:any;
	first_name:any;
	msg_date:any;
	operation:any;
	msg_txt:string='';// initialized message
	is_td: 0 | 1 = 0; //is TD?
	is_td_rp: 0 | 1 = 0; //is repeteco?
	file_id:any;
	file_unique_id:any;
	type:any;
	deleted:any;
	threadname?:any; //forum topic created name

	constructor(msgJson:any) {
		this.from = msgJson.from;	
	    	this.date = msgJson.date;
	    	this.chat = msgJson.chat;
	    	this.chat_id = msgJson.chat.id;
	    	this.message_id = msgJson.message_id;
	    	this.id_thread = ('is_topic_message' in msgJson) ? msgJson.message_thread_id : "10227";
	    	this.id_user = msgJson.from.id;
	    	this.username = ('username' in msgJson.from) ? msgJson.from.username : "Sem usuário";
	    	let name = (msgJson.from.first_name || '') + (msgJson.from.last_name ? ' ' + msgJson.from.last_name : '');
	    	this.first_name = name.trim();
	    	this.msg_date = msgJson.date;
	    	this.operation = 'no_operation';
 
	    	if ('text' in msgJson || 'video' in msgJson || 'photo' in msgJson || 'document' in msgJson || 'voice' in msgJson || 'poll' in msgJson || 'location' in msgJson) {    
		   this.msg_txt = 'new_post'
		   if ('text' in msgJson) {
			  this.operation = 'new_post';
			  this.msg_txt = msgJson.text;
			  this.is_td = checkTD(msgJson.text);
			  this.is_td_rp = checkRP(msgJson.text);
		   }
 
		   if ('photo' in msgJson || 'video' in msgJson) {
			  this.operation = 'new_media';
			  if ('photo' in msgJson) {
				 const lastPhoto = msgJson.photo[msgJson.photo.length - 1];
				 this.file_id = lastPhoto.file_id;
				 this.file_unique_id = lastPhoto.file_unique_id;
				 this.type = 1;
			  }
			  if ('video' in msgJson) {
				 this.file_id = msgJson.video.file_id;
				 this.file_unique_id = msgJson.video.file_unique_id;
				 this.type = 2;
			  }
			  if ('caption' in msgJson) {
				this.caption = msgJson.caption;
			  }
			  if ('media_group_id' in msgJson)
				 this.media_group_id = msgJson.media_group_id;
			  else
				 this.media_group_id = msgJson.message_id;
		   }
		   this.deleted = 0;
	    	} else {
		   if ('message_thread_id' in msgJson) {
			  this.msg_txt = "update_thread";
			  this.id_thread = msgJson.message_thread_id;
 
			  if ('forum_topic_created' in msgJson) {
				 this.threadname = msgJson.forum_topic_created.name;
				 this.operation = "create_thread";
			  } else if ('forum_topic_edited' in msgJson) {
				 this.threadname = msgJson.forum_topic_edited.name;
				 this.operation = "update_thread";
			  }
		   }
	    	}
	}
 }
 
 export class EditedMessage implements TG_Message {
	
	
	from: TelegramFrom;
	sender_chat?: TelegramChat;
	date: number;
	chat: TelegramChat;
	edit_date?: number;
	has_protected_content?: boolean;
	media_group_id?: string;
	author_signature?: string;
	text?: string;
	entities?: TelegramMessageEntity[];
	// animation?: TelegramAnimation;
	// audio?: TelegramAudio;
	document?: TelegramDocument;
	photo?: TelegramPhotoSize[];
	// sticker?: TelegramSticker;
	// video?: TelegramVideo;
	// video_note?: TelegramVideoNote;
	// voice?: TelegramVoice;
	caption?: string;
	caption_entities?: TelegramMessageEntity[];
	// contact?: TelegramContact;
	// dice?: TelegramDice;
	// poll?: TelegramPoll;
	// venue?: TelegramVenue;
	// location?: TelegramLocation;
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
	//renato names
	message_id:any;
	id_user:any;
	id_thread:any;
	deleted:any;
	operation:any;
	msg_txt:string='';
	is_td: 0 | 1 = 0;
	is_td_rp: 0 | 1 = 0;
	file_id:any;
	file_unique_id:any;
	type:any;
	

	constructor(msgJson:any) {
	
	    this.from = msgJson.from;	
	    this.date = msgJson.date;
	    this.chat = msgJson.chat;
	    this.message_id = msgJson.message_id;
	    this.id_user = msgJson.from.id;
	    this.id_thread = msgJson.message_thread_id;
	    this.deleted = 0;
	    this.operation = 'no_operation';
 
	    if ('text' in msgJson) {
		   this.operation = 'edit_post';
		   this.msg_txt = msgJson.text;
		   this.is_td = checkTD(msgJson.text);
		   this.is_td_rp = checkRP(msgJson.text);
	    }
	    if ('photo' in msgJson || 'video' in msgJson) {
		   this.operation = 'edit_media';
		   if ('photo' in msgJson) {
			  const lastPhoto = msgJson.photo[msgJson.photo.length - 1];
			  this.file_id = lastPhoto.file_id;
			  this.file_unique_id = lastPhoto.file_unique_id;
			  this.type = 1;
		   }
		   if ('video' in msgJson) {
			  this.file_id = msgJson.video.file_id;
			  this.file_unique_id = msgJson.video.file_unique_id;
			  this.type = 2;
		   }
		   if ('caption' in msgJson) {
			this.caption = msgJson.caption;
		   }
			 
		   if ('media_group_id' in msgJson)
			  this.media_group_id = msgJson.media_group_id;
		   else
			  this.media_group_id = msgJson.message_id;
	    }
	}
 }  
 