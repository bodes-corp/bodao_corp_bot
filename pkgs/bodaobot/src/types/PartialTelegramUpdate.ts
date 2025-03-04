


interface PartialTelegramUpdate {
	update_id?: number;
	message?: tgTypes.Message;
	edited_message?: tgTypes.Message;
	channel_post?: tgTypes.Message;
	edited_channel_post?: tgTypes.Message;
	inline_query?: tgTypes.InlineQuery;
	business_message?: tgTypes.BusinessMessage;
}
export default PartialTelegramUpdate;
