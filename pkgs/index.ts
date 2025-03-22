import { TG_HANDLER } from "./bodaobot/src/handlers/handlers";
import BODAO_CMDS from "./bodaobot/src/rafaelBot/bodaoBotCmd";
import TG_BOT from "./bodaobot/src/telegram_bot";
import TIOZAO_CMDS from "./bodaobot/src/tiozao/tiozao_api";
import { BOT_INFO } from "./bodaobot/src/types/BotInfo";
import Environment from "./bodaobot/src/types/Envirownment";
import Webhook from "./bodaobot/src/webhook";



function isAuthorized(request:any, secret:string) {
	return request.headers.get('X-Telegram-Bot-Api-Secret-Token') === secret;
}

export default {
	async fetch(request: Request, env:Environment, context: ExecutionContext): Promise<Response> {
		console.log(`[LOGGING FROM fetch]: Request came from ${request.url}`);
		
		//const { waitUntil } = context;

		if (!isAuthorized(request, env.TG_SECRET)) {
		return new Response('Unauthorized test', { status: 403 });
		}
		const botINFO = new BOT_INFO(
			env.SECRET_TELEGRAM_API_TOKEN,
			env.TG_CHATID,
			env.TG_THREADBOT
		)
		const rafaelBot = new  TG_BOT(botINFO,env.TG_SECRET,env.DB);
		
		rafaelBot.on(':message', TG_HANDLER.handleMessage)
           .on(':edited_message',TG_HANDLER.handleEditedMessage)
           .on(':callback',TG_HANDLER.handleCallbackQuery)
           .on(':edit_thread',TG_HANDLER.handleEditThread)
           .on(':create_thread',TG_HANDLER.handleCreateThread)
           .on(':handle_member',TG_HANDLER.handleMemberOperation)
		 .on(':poll_answer',TG_HANDLER.handlePollAnswer)
		 .on(':poll',TG_HANDLER.handlePollUpdate)
		 .onCommand('/active_gp', { name: 'active_gp', desc:'GPs Ativas', func: TIOZAO_CMDS.listActiveGp, requiresArg: false })
		.onCommand( '/chat', { name: 'chat', desc:'Bate Papo',func: TIOZAO_CMDS.listChat, requiresArg: false })
		.onCommand('/gp_td', { name: 'gp_td', desc:'Lista GPs',func: TIOZAO_CMDS.listTdGp, requiresArg: false })
		.onCommand('/spa', { name: 'spa', desc:'Clínicas',func: TIOZAO_CMDS.listSpa, requiresArg: false })
		.onCommand('/top_gp', { name: 'top_gp', desc:'Top GPs',func: TIOZAO_CMDS.listTopGp, requiresArg: false })
		.onCommand('/atas', { name: 'atas', desc:'Lista Atas',func: BODAO_CMDS.listAtas, requiresArg: false })
		.onCommand('/top_rp', { name: 'top_rp', desc:'Top Repetecos',func: TIOZAO_CMDS.listTopRp, requiresArg: false })
		.onCommand('/trend_gp', { name: 'trend_gp', desc:'GPs Tendência',func: TIOZAO_CMDS.listTrendGp, requiresArg: false })
		.onCommand('/user', { name: 'user', desc:'Membros',func: TIOZAO_CMDS.listMembers, requiresArg: false })
		.onCommand('/s', {name: 's', desc:'Search',func: TIOZAO_CMDS.searchTerm, requiresArg: true})
		.onCommand('/info', { name: 'info', desc:'Perfil',func: TIOZAO_CMDS.listInfo, requiresArg: false })
		.onCommand('/end', { name: 'end', desc:'teste end',func: TIOZAO_CMDS.testeEnd, requiresArg: false })
		//.onCheck('isTD',checkTD)
		//.onCheck("isRP",checkRP)
		.onCheck('isATA',BODAO_CMDS.checkATA, { name: 'isATA', desc:'handle ata',func: BODAO_CMDS.handleATA, requiresArg: false });

		try {

		// when a POS request arrives at the webhooendPoint, thebot reads te JSON
		//body of this request, interpreting this as an Update from Telegram
		
		//console.log('dbg update',update)
		//ctx.waitUntil() extends the lifetime of your Worker, allowing you to perform work without blocking 
		// returning a response, and that may continue after a response is returned. It accepts a Promise,
		//  which the Workers runtime will continue executing, even after a response has been returned by 
		// the Worker's handler.
		


		//console.log(`[LOGGING FROM /fetch]: Request came from ${request.url}`);
		const webhook = new Webhook(env.SECRET_TELEGRAM_API_TOKEN, request);
		const url = new URL(request.url);
		//console.log(`[LOGGING FROM /fetch]: this token: ${env.SECRET_TELEGRAM_API_TOKEN}`);
		
		
			switch (request.method) {
				case 'POST': {
							
					const update: tgTypes.Update = await request.json();
					//const clone:Request = await request.clone();
					//console.log(this.update);
					
					
					context.waitUntil(rafaelBot.BotExecute(update));
				}
				case 'GET': {
					switch (url.searchParams.get('command')) {
						case 'set':
							return webhook.set();
						default:
							break;
					}
					break;
				}
		
				default:
				break;
			}	



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


 

 


 

 
 



 