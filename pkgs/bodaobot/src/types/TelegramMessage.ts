import { checkRP, checkTD } from '../library.js';
import { mediaType, mediaType_t } from './Types.js';


export class ContextMessage {

     message:tgTypes.Message;
	message_id: number =-1;
	
	//  renato names
	chat_id:any;
	id_thread:any;  //identify the topic the message is from
	id_user:any;
	username:any;
	caption?:string; //Optional. Caption for the animation, audio, document, paid media, photo, video or voice
	first_name:any;
	msg_date:any;
	//operation:updOperation_t = updOperation.UNKNOWN;
	msg_txt:string | undefined='';// initialized message
	is_td: 0 | 1 = 0; //is TD?
	is_td_rp: 0 | 1 = 0; //is repeteco?
	file_id:any;
	file_unique_id:any;
	media_type:mediaType_t = mediaType.UNKNOWN;
	deleted?:any;
	threadname?:any; //forum topic created name
	media_group_id?:any;
	chat?:any;
	Users?:tgTypes.User[]; //optional used oonly in operations with user. adding or lefting user in message
	file_name?:string; //opcional campo usado em documentos

	constructor(msgJson?:tgTypes.Message) {
		this.message = {} as tgTypes.Message;
		
		if(msgJson) {
			this.message=msgJson;
			//this.from = msgJson.from;	
			//this.date = msgJson.date;
			//this.chat = msgJson.chat;
			this.chat_id = msgJson.chat.id;
			this.message_id = msgJson.message_id;
			this.id_thread = ('is_topic_message' in msgJson) ? msgJson.message_thread_id : "10227";
			//this.id_thread = msgJson.message_thread_id; //edit message;
			if('new_chat_members' in msgJson) {
				this.Users = msgJson.new_chat_members;

			}
			if(msgJson.left_chat_member) {
				this.Users?.push(msgJson.left_chat_member);
			}
			this.id_user = msgJson.from?.id;
			this.username = (msgJson.from?.username) ? msgJson.from.username : "Sem usuário";
			let name = (msgJson.from?.first_name || '') + (msgJson.from?.last_name ? ' ' + msgJson.from.last_name : '');
			this.first_name = name.trim();
			this.msg_date = msgJson.date;
			this.chat = msgJson.chat;
			
			this.deleted = 0;

			if ('text' in msgJson || 'video' in msgJson || 'photo' in msgJson || 'document' in msgJson || 'voice' in msgJson || 'poll' in msgJson || 'location' in msgJson) {    
			this.msg_txt = 'new_post'
			if ('text' in msgJson) {
				this.msg_txt = msgJson.text;
				this.is_td = checkTD(msgJson.text);
				this.is_td_rp = checkRP(msgJson.text);
			}
	
			if ('photo' in msgJson || 'video' in msgJson || 'document'in msgJson) {
				if ('photo' in msgJson) {
					const lastPhoto: tgTypes.PhotoSize = msgJson.photo? msgJson.photo[msgJson.photo.length - 1]:{
						file_id: 'unknown',
						file_unique_id: 'unknown',
						width: -1,
						height: -1,
						file_size: -1
					};
					this.file_id = lastPhoto.file_id;
					this.file_unique_id = lastPhoto.file_unique_id;
					this.media_type = mediaType.PHOTO;
				}
				if ('video' in msgJson) {
					this.file_id = msgJson.video?.file_id;
					this.file_unique_id = msgJson.video?.file_unique_id;
					this.media_type = mediaType.VIDEO;
				}
				if ('document' in msgJson) {
					this.file_id = msgJson.document?.file_id;
					this.file_unique_id = msgJson.document?.file_unique_id;
					this.media_type = mediaType.DOCUMENT;
					this.file_name =  msgJson.document?.file_name;
					
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
 
 
 