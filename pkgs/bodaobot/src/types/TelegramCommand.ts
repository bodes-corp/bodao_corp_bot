import TG_BOT from '../telegram_bot.js';


type TelegramCommand = (bot: TG_BOT, update: tgTypes.Update, args: string[]) => Promise<Response>;
export default TelegramCommand;
