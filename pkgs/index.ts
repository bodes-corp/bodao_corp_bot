import TG_BOT from "./bodaobot/src/telegram_bot";
import TelegramUpdate from "./bodaobot/src/types/TelegramUpdate";

interface Environment {
	SECRET_TELEGRAM_API_TOKEN: string;
	TG_THREADBOT:string;
	TG_SECRET:string;
	TG_CHATID:string;

}

function isAuthorized(request:any, env:any) {
	return request.headers.get('X-Telegram-Bot-Api-Secret-Token') === env.TG_SECRET;
}

export default {
	async fetch(request: Request, env:Environment, context: ExecutionContext): Promise<Response> {
		//console.log(`[LOGGING FROM /hello]: Request came from ${request.url}`);
		
		//const { waitUntil } = context;

		if (!isAuthorized(request, env)) {
		return new Response('Unauthorized test', { status: 403 });
		}

		const rafaelBot = new  TG_BOT(env.SECRET_TELEGRAM_API_TOKEN);

		try {

		// when a POS request arrives at the webhooendPoint, thebot reads te JSON
		//body of this request, interpreting this as an Update from Telegram
		
		//console.log('dbg update',update)
		//ctx.waitUntil() extends the lifetime of your Worker, allowing you to perform work without blocking 
		// returning a response, and that may continue after a response is returned. It accepts a Promise,
		//  which the Workers runtime will continue executing, even after a response has been returned by 
		// the Worker's handler.
		const update: TelegramUpdate = await request.json();
		context.waitUntil(rafaelBot.handleUpdate(env, update));
		return new Response('Ok');
		} catch (error) {
		console.error('Error processing update:', error);
		return new Response('Internal Server Error', { status: 500 });
		}

		/*
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





		}*/
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


 

 


 

 
 



 