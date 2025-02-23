import TelegramFrom from './TelegramFrom.js';
import TG_Message from './TG_Message.js';

interface TelegramCallbackQuery {
    chat_type: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
    from: TelegramFrom;
    id: number;
    offset: string;
    query: string;
    message: TG_Message,
    inline_message_id: string;
    chat_instance: string;
    data: string;
    game_short_name: string;
}
export default TelegramCallbackQuery;
