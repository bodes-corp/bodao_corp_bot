interface TelegramFrom {
	first_name: string;
	id: number;
	is_bot: boolean;
	language_code: string;
	username: string;
	last_name?:string;
}
export default TelegramFrom;
