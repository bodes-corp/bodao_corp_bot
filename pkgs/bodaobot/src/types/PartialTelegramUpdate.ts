import TelegramBusinessMessage from './TelegramBusinessMessage.js';
import TelegramInlineQuery from './TelegramInlineQuery.js';
import TG_Message from './TG_Message.js';

interface PartialTelegramUpdate {
	update_id?: number;
	message?: TG_Message;
	edited_message?: TG_Message;
	channel_post?: TG_Message;
	edited_channel_post?: TG_Message;
	inline_query?: TelegramInlineQuery;
	business_message?: TelegramBusinessMessage;
}
export default PartialTelegramUpdate;
