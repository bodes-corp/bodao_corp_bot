interface Environment {
	SECRET_TELEGRAM_API_TOKEN: string;
	TG_THREADBOT:string;
	TG_SECRET:string;
	TG_CHATID:string;

}

function tgApiUrl(methodName:any, tgToken:any, params = {}) {
	const query = params ? `?${new URLSearchParams(params).toString()}` : '';
	return `https://api.telegram.org/bot${tgToken}/${methodName}${query}`;
 }

async function tgSendRequest(method:string, env:any, params:any) {
	try {
	    const response = await fetch(tgApiUrl(method, env.SECRET_TELEGRAM_API_TOKEN, params), {
		   method: 'POST',
		   headers: { 'Content-Type': 'application/json' }
	    });
 
	    const data:any = await response.json();
	    if (!data.ok) {
		   throw new Error(`Telegram API Error: ${data.description}`);
	    }
 
	    return data;
	} catch (error) {
	    console.error(`Error in ${method} request:`, error);
	    throw error;
	}
 }

async function tgSendMessage(env:any, text:string) {
	return await tgSendRequest('sendMessage', env, {
	    chat_id: env.TG_CHATID,
	    message_thread_id: env.TG_THREADBOT,
	    text,
	    parse_mode: 'html',
	    disable_notification: 'true'
	});
 }

 function isAuthorized(request:any, env:any) {
	return request.headers.get('X-Telegram-Bot-Api-Secret-Token') === env.TG_SECRET;
 }

export default {
	async fetch(request: Request, env:  Environment, ctx: ExecutionContext): Promise<Response> {

		const secret = env.TG_SECRET;
		console.log('debug secret', env.TG_SECRET)
		//if (!isAuthorized(request, env)) {
		//	console.log('debug no Secret')
		//	return new Response('Unauthorized test', { status: 403 });
//}

		const url = new URL(request.url);
		console.log ('debug url.pathname', url.pathname);
		if (url.pathname === '/' && request.method === 'POST') {

			console.log('debug nside');
			console.log('debug request', request);
			console.log('debug request2', JSON.stringify(request));

			try{
				const body:any = await request.json();
				console.log('debug body', body);
				if(body.message){
					await tgSendMessage(env,'Hello World');
					


				}
				return new Response('ok');

			}catch(error){
				console.log('debug error', error);
				return new Response('Error', { status: 500 })
			}

			return new Response('ok');





		}
/*
		const bot = new TelegramBot(env.SECRET_TELEGRAM_API_TOKEN);
		await bot
			.on('start', async function(context: TelegramExecutionContext) {
				switch (context.update_type) {
					case 'message':
						await context.reply('Hello World');
						break;

					default:
						break;
				}
				return new Response('ok');
			})
			.handle(request.clone());
		return new Response('Hello World!'); */
	},
};
