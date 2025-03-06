




/**
 * Use this method to send a native poll. On success, the sent Message is returned.
 */
export interface sendPollOptions {
     business_connection_id?: string;// 	Optional 	Unique identifier of the business connection on behalf of which the message will be sent
     chat_id: number | string;// 	Yes 	Unique identifier for the target chat or username of the target channel (in the format @channelusername)
          message_thread_id?: number;// 	Integer 	Optional 	Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
     question: string; // 	Yes 	Poll question, 1-300 characters
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
     reply_parameters?: 	tgTypes.ReplyParameters;// 	Optional 	Description of the message to reply to
     reply_markup?:tgTypes.InlineKeyboardMarkup | tgTypes.ReplyKeyboardMarkup | tgTypes.ReplyKeyboardRemove | tgTypes.ForceReply;;// 	InlineKeyboardMarkup or ReplyKeyboardMarkup or ReplyKeyboardRemove or ForceReply 	Optional 	Additional interface options. A JSON-serialized object for an inline keyboard, custom reply keyboard, instructions to remove a reply keyboard or to force a reply from the user
     
}
export interface sendDiceOptions {
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

