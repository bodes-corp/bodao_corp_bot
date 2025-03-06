declare namespace tgOptions {

     /**
     * Use this method to send a native poll. On success, the sent Message is returned.
     */
     interface sendPoll {
          /**
           * Optional 	Unique identifier of the business connection on behalf of which the message will be sent
           */
          business_connection_id?: string;
          /**
           * Yes 	Unique identifier for the target chat or username of the target channel (in the format @channelusername)
           */
          chat_id: number | string;
          /**
           * Integer 	Optional 	Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
           */
          message_thread_id?: number;
          /**
           * Yes 	Poll question, 1-300 characters
           */
          question: string; 
          question_parse_mode?: string;// 	Optional 	Mode for parsing entities in the question. See formatting options for more details. Currently, only custom emoji entities are allowed
          question_entities?: tgTypes.MessageEntity[];// 	Array of MessageEntity 	Optional 	A JSON-serialized list of special entities that appear in the poll question. It can be specified instead of question_parse_mode
          options: tgTypes.InputPollOption[];// 	Array of InputPollOption 	Yes 	A JSON-serialized list of 2-10 answer options
          is_anonymous?:	boolean;// 	Optional 	True, if the poll needs to be anonymous, defaults to True
          type?: string;// 	Optional 	Poll type, “quiz” or “regular”, defaults to “regular”
          allows_multiple_answers?: boolean;// 	Optional 	True, if the poll allows multiple answers, ignored for polls in quiz mode, defaults to False
          correct_option_id?: number;// 	Integer 	Optional 	0-based identifier of the correct answer option, required for polls in quiz mode
          explanation?: string;// 	Optional 	Text that is shown when a user chooses an incorrect answer or taps on the lamp icon in a quiz-style poll, 0-200 characters with at most 2 line feeds after entities parsing
          explanation_parse_mode?: string;// 	Optional 	Mode for parsing entities in the explanation. See formatting options for more details.
          explanation_entities?: tgTypes.MessageEntity[];// 	Array of MessageEntity 	Optional 	A JSON-serialized list of special entities that appear in the poll explanation. It can be specified instead of explanation_parse_mode
          open_period?: number;// 	Integer 	Optional 	Amount of time in seconds the poll will be active after creation, 5-600. Can't be used together with close_date.
          close_date?: number;// 	Integer 	Optional 	Point in time (Unix timestamp) when the poll will be automatically closed. Must be at least 5 and no more than 600 seconds in the future. Can't be used together with open_period.
          is_closed?: boolean;// 	Optional 	Pass True if the poll needs to be immediately closed. This can be useful for poll preview.
          disable_notification?: boolean;// 	Optional 	Sends the message silently. Users will receive a notification with no sound.
          protect_content?: boolean;// 	Optional 	Protects the contents of the sent message from forwarding and saving
          allow_paid_broadcast?: boolean;// 	Optional 	Pass True to allow up to 1000 messages per second, ignoring broadcasting limits for a fee of 0.1 Telegram Stars per message. The relevant Stars will be withdrawn from the bot's balance
          message_effect_id?: string;// 	Optional 	Unique identifier of the message effect to be added to the message; for private chats only
          /**
           * Optional 	Description of the message to reply to
           */
          reply_parameters?: 	tgTypes.ReplyParameters;
          /**
           * InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply 	Optional 	Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user
           */
          reply_markup?:tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
          
     };

     interface sendDice {
               chat_id: number | string;
               business_connection_id?: string;
               message_thread_id?: number;
               emoji?: string;
               disable_notification?: boolean;
               protect_content?: boolean;
               message_effect_id?: string;
               reply_parameters?: tgTypes.ReplyParameters;
               reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     };

     interface sendChatAction{
               chat_id: number | string;
               action: string;
               business_connection_id?: string;
               message_thread_id?: number;
     }
     interface setMessageReaction {
               chat_id: number | string;
               message_id: number;
               reaction?: tgTypes.ReactionType[];
               is_big?: boolean;
     }
     interface getUserProfilePhotos {
                 user_id: number;
                 offset?: number;
                 limit?: number;
     }

     interface getFile {
          file_id: string;
     }

     interface banChatMember{
                 chat_id: number | string;
                 user_id: number;
                 until_date?: number;
                 revoke_messages?: boolean;
     }
     interface unbanChatMember{
                 chat_id: number | string;
                 user_id: number;
                 only_if_banned?: boolean;
     }
     interface restrictChatMember{
                 chat_id: number | string;
                 user_id: number;
                 permissions: tgTypes.ChatPermissions;
                 use_independent_chat_permissions?: boolean;
                 until_date?: number;
     
     }
     interface promoteChatMember{
          chat_id: number | string;
          user_id: number;
          is_anonymous?: boolean;
          can_manage_chat?: boolean;
          can_delete_messages?: boolean;
          can_manage_video_chats?: boolean;
          can_restrict_members?: boolean;
          can_promote_members?: boolean;
          can_change_info?: boolean;
          can_invite_users?: boolean;
          can_post_stories?: boolean;
          can_edit_stories?: boolean;
          can_delete_stories?: boolean;
          can_post_messages?: boolean;
          can_edit_messages?: boolean;
          can_pin_messages?: boolean;
          can_manage_topics?: boolean;
     }
     interface setChatAdministratorCustomTitle {
                 chat_id: number | string;
                 user_id: number;
                 custom_title: string;
     }
     interface banChatSenderChat {
                 chat_id: number | string;
                 sender_chat_id: number;
     }
     interface unbanChatSenderChat {
                 chat_id: number | string;
                 sender_chat_id: number;
     }
     interface setChatPermissions {
                 chat_id: number | string;
                 permissions: tgTypes.ChatPermissions;
                 use_independent_chat_permissions?: boolean;
     }
     interface exportChatInviteLink {
                 chat_id: number | string;
     }
     interface createChatInviteLink {
                 chat_id: number | string;
                 name?: string;
                 expire_date?: number;
                 member_limit?: number;
                 creates_join_request?: boolean;
     }
     interface editChatInviteLink {
                 chat_id: number | string;
                 invite_link: string;
                 name?: string;
                 expire_date?: number;
                 member_limit?: number;
                 creates_join_request?: boolean;
     }
     interface createChatSubscriptionInviteLink {
          chat_id: number | string;
          subscription_period: number;
          subscription_price: number;
          name?: string;
     }
     interface editChatSubscriptionInviteLink {
                 chat_id: number | string;
                 invite_link: string;
                 name?: string;
     }
     interface revokeChatInviteLink {
                 chat_id: number | string;
                 invite_link: string;
     }
     interface approveChatJoinRequest {
                 chat_id: number | string;
                 user_id: number;
     }
     interface declineChatJoinRequest {
                 chat_id: number | string;
                 user_id: number;
     }
     interface setChatPhoto {
                 chat_id: number | string;
                 photo: tgTypes.InputFile;
     }
     interface deleteChatPhoto {
                 chat_id: number | string;
     }
     interface setChatTitle {
                 chat_id: number | string;
                 title: string;
     }
     interface setChatDescription {
                 chat_id: number | string;
                 description?: string;
     }
     interface pinChatMessage {
                 chat_id: number | string;
                 message_id: number;
                 business_connection_id?: string;
                 disable_notification?: boolean;
     }
     interface unpinChatMessage {
                 chat_id: number | string;
                 business_connection_id?: string;
                 message_id?: number;
     }
     interface unpinAllChatMessages {
                 chat_id: number | string;
     }
     interface leaveChat {
                 chat_id: number | string;
     }
     interface getChat {
                 chat_id: number | string;
     }
     interface getChatAdministrators {
                 chat_id: number | string;
     }
     interface getChatMemberCount {
                 chat_id: number | string;
     }
     interface getChatMember {
                 chat_id: number | string;
                 user_id: number;
     }
     interface setChatStickerSet {
                 chat_id: number | string;
                 sticker_set_name: string;
     }
     interface deleteChatStickerSet {
                 chat_id: number | string;
     }
     interface createForumTopic {
                 chat_id: number | string;
                 name: string;
                 icon_color?: number;
                 icon_custom_emoji_id?: string;
     }
     interface editForumTopic {
                 chat_id: number | string;
                 message_thread_id: number;
                 name?: string;
                 icon_custom_emoji_id?: string;
     }
     interface closeForumTopic {
                 chat_id: number | string;
                 message_thread_id: number;
     }
     interface reopenForumTopic {
                 chat_id: number | string;
                 message_thread_id: number;
     }
     interface deleteForumTopic {
                 chat_id: number | string;
                 message_thread_id: number;
     }
     interface unpinAllForumTopicMessages {
                 chat_id: number | string;
                 message_thread_id: number;
     }
     interface editGeneralForumTopic {
                 chat_id: number | string;
                 name: string;
     }
     interface closeGeneralForumTopic {
                 chat_id: number | string;
     }
     interface reopenGeneralForumTopic {
                 chat_id: number | string;
     }
     interface hideGeneralForumTopic {
                 chat_id: number | string;
     }
     interface unhideGeneralForumTopic {
                 chat_id: number | string;
     }
     interface unpinAllGeneralForumTopicMessages {
                 chat_id: number | string;
     }
     interface answerCallbackQuery  {
                 callback_query_id: string;
                 text?: string;
                 show_alert?: boolean;
                 url?: string;
                 cache_time?: number;
     }
     interface getUserChatBoosts {
                 chat_id: number | string;
                 user_id: number;
     }
     interface getBusinessConnection {
                 business_connection_id: string;
     }
     interface setMyCommands {
                 commands: tgTypes.BotCommand[];
                 scope?: tgTypes.BotCommandScope;
                 language_code?: string;
     }
     interface deleteMyCommands {
                 scope?: tgTypes.BotCommandScope;
                 language_code?: string;
     }
     interface getMyCommands {
                 scope?: tgTypes.BotCommandScope;
                 language_code?: string;
     }
     interface setMyName {
                 name?: string;
                 language_code?: string;
     }
     interface getMyName {
                 language_code?: string;
     }
     interface setMyDescription {
                 description?: string;
                 language_code?: string;
     }
     interface getMyDescription {
                 language_code?: string;
     }
     interface setMyShortDescription {
                 short_description?: string;
                 language_code?: string;
     }
     interface getMyShortDescription {
                 language_code?: string;
     }
     interface setChatMenuButton {
                 chat_id?: number;
                 menu_button?: tgTypes.MenuButton;
     }
     interface getChatMenuButton {
                 chat_id?: number;
     }
     interface setMyDefaultAdministratorRights {
                 rights?: tgTypes.ChatAdministratorRights;
                 for_channels?: boolean;
     }
     interface getMyDefaultAdministratorRights {
                 for_channels?: boolean;
     }
     interface sendMessage {
                 chat_id: number | string;
                 text: string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 parse_mode?: string;
                 entities?: tgTypes.MessageEntity[];
                 link_preview_options?: tgTypes.LinkPreviewOptions;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface forwardMessage {
                 chat_id: number | string;
                 from_chat_id: number | string;
                 message_id: number;
                 message_thread_id?: number;
                 disable_notification?: boolean;
                 protect_content?: boolean;
     }
     interface forwardMessages {
                 chat_id: number | string;
                 from_chat_id: number | string;
                 message_ids: number[];
                 message_thread_id?: number;
                 disable_notification?: boolean;
                 protect_content?: boolean;
     }
     interface copyMessage {
                 chat_id: number | string;
                 from_chat_id: number | string;
                 message_id: number;
                 message_thread_id?: number;
                 caption?: string;
                 parse_mode?: string;
                 caption_entities?: tgTypes.MessageEntity[];
                 show_caption_above_media?: boolean;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface copyMessages {
                 chat_id: number | string;
                 from_chat_id: number | string;
                 message_ids: number[];
                 message_thread_id?: number;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 remove_caption?: boolean;
     }
     interface sendPhoto {
                 chat_id: number | string;
                 photo: tgTypes.InputFile | string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 caption?: string;
                 parse_mode?: string;
                 caption_entities?: tgTypes.MessageEntity[];
                 show_caption_above_media?: boolean;
                 has_spoiler?: boolean;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendAudio {
                 chat_id: number | string;
                 audio: tgTypes.InputFile | string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 caption?: string;
                 parse_mode?: string;
                 caption_entities?: tgTypes.MessageEntity[];
                 duration?: number;
                 performer?: string;
                 title?: string;
                 thumbnail?: tgTypes.InputFile | string;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendDocument {
                 chat_id: number | string;
                 document: tgTypes.InputFile | string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 thumbnail?: tgTypes.InputFile | string;
                 caption?: string;
                 parse_mode?: string;
                 caption_entities?: tgTypes.MessageEntity[];
                 disable_content_type_detection?: boolean;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendVideo {
                 chat_id: number | string;
                 video: tgTypes.InputFile | string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 duration?: number;
                 width?: number;
                 height?: number;
                 thumbnail?: tgTypes.InputFile | string;
                 caption?: string;
                 parse_mode?: string;
                 caption_entities?: tgTypes.MessageEntity[];
                 show_caption_above_media?: boolean;
                 has_spoiler?: boolean;
                 supports_streaming?: boolean;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendAnimation {
                 chat_id: number | string;
                 animation: tgTypes.InputFile | string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 duration?: number;
                 width?: number;
                 height?: number;
                 thumbnail?: tgTypes.InputFile | string;
                 caption?: string;
                 parse_mode?: string;
                 caption_entities?: tgTypes.MessageEntity[];
                 show_caption_above_media?: boolean;
                 has_spoiler?: boolean;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendVoice {
                 chat_id: number | string;
                 voice: tgTypes.InputFile | string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 caption?: string;
                 parse_mode?: string;
                 caption_entities?: tgTypes.MessageEntity[];
                 duration?: number;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendVideoNote {
                 chat_id: number | string;
                 video_note: tgTypes.InputFile | string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 duration?: number;
                 length?: number;
                 thumbnail?: tgTypes.InputFile | string;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendPaidMedia {
                 chat_id: number | string;
                 star_count: number;
                 media: tgTypes.InputPaidMedia[];
                 business_connection_id?: string;
                 caption?: string;
                 parse_mode?: string;
                 caption_entities?: tgTypes.MessageEntity[];
                 show_caption_above_media?: boolean;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendMediaGroup {
                 chat_id: number | string;
                 media: (tgTypes.InputMediaAudio | tgTypes.InputMediaDocument | tgTypes.InputMediaPhoto | tgTypes.InputMediaVideo)[];
                 business_connection_id?: string;
                 message_thread_id?: number;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
     }
     interface sendLocation {
                 chat_id: number | string;
                 latitude: number;
                 longitude: number;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 horizontal_accuracy?: number;
                 live_period?: number;
                 heading?: number;
                 proximity_alert_radius?: number;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendVenue {
                 chat_id: number | string;
                 latitude: number;
                 longitude: number;
                 title: string;
                 address: string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 foursquare_id?: string;
                 foursquare_type?: string;
                 google_place_id?: string;
                 google_place_type?: string;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }
     interface sendContact {
                 chat_id: number | string;
                 phone_number: string;
                 first_name: string;
                 business_connection_id?: string;
                 message_thread_id?: number;
                 last_name?: string;
                 vcard?: string;
                 disable_notification?: boolean;
                 protect_content?: boolean;
                 message_effect_id?: string;
                 reply_parameters?: tgTypes.ReplyParameters;
                 reply_markup?: tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;
     }









}