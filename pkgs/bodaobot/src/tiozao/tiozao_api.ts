import { DB_API } from "../database_api";
import { formatDate, isValidSearchTerm } from "../library";
import { Requests } from "../requests/";
import { callback } from "../requests/button";
import { inlineKeyboard } from "../telegram/markup";
import TG_API from "../telegram/telegram_api";
import { InlineKeyboardButton, KeyboardButton } from "../telegram/types/markup";
import TG_BOT from "../telegram_bot";
import TG_ExecutionContext from "../telegram_execution_context";
import { ContextMessage } from "../types/TelegramMessage";
import { TIOZAO_BOT_CMDs } from "./tiozao_bot_comands";

type Hideable<B> = B & { hide?: boolean }
   type HideableKBtn = Hideable<KeyboardButton>
   type HideableIKBtn = Hideable<InlineKeyboardButton>

export default class TIOZAO_CMDS {

///////////////////////////////////////////////////////////////////////////////
 // Main functions
 
 public static async listChat (bot:  TG_BOT) {
	//const env = bot.env;
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Bate Papo</b>\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListChat(bot.DB);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	}
	return response_ids;
 }
 public static async testeEnd(bot: TG_BOT){

	let response_ids:any[] = [];
	const markup = {
		inline_keyboard: [[{ text: 'I Accept', callback_data: 'accept_rules' }]]
	}
	const but: any = callback('I Accept', 'accept_rules');
	const markup2 =   inlineKeyboard(but) 
	console.log('debug from  testeEnd - markup:', JSON.stringify(markup2))
	const params = Requests.MessageToBotTopicWithMarkupRequest(bot,'Welcome to my bot! Press the button to accept my rules!', markup2)
	await TG_API.sendMessage(bot.botINFO.TOKEN,params);
	return response_ids;
 }
 
 public static async listActiveGp(bot:  TG_BOT) {
	//const env = bot.env
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>GPs ativas</b>\nGPs com TDs nos últimos 4 meses\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListActiveGp(bot.DB);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  const day = formatDate(row[3]);
			  text += `${day} - <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listTopGp(bot:  TG_BOT) {
	//const env = bot.env;
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Top GPs</b>\nGPs com TDs de usuários únicos\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListTopGp(bot.DB);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a> -> ${row[3]}\n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listTopRp(bot:  TG_BOT) {
	//const env = bot.env;
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Top Repetecos</b>\nGPs com repetecos de usuários únicos\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListTopRp(bot.DB);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a> -> ${row[3]}\n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listTdGp(bot:  TG_BOT) {
	//const env = bot.env;
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Lista GPs</b>\nGPs com TDs + repetecos\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListTdGp(bot.DB);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[2]}/${row[3]}">${row[0]}</a> -> ${row[1]}\n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	}
	return response_ids;
 }
 
 public static async listTrendGp(bot:  TG_BOT) {
	//const env = bot.env;
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>GPs Tendência</b>\nGPs com TDs nos últimos 4 meses de 2 ou mais usuários diferentes\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListTrendGp(bot.DB);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot,text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot,text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listMembers(bot:  TG_BOT) {
	//const env = bot.env;
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Membros</b>\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListMembers(bot.DB);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   text += 'Nome -> Posts / TDs / Desbravamentos\n';
		   for (const row of result) {
			  text += `• ${row[0]} -> ${row[1]} / ${row[2]} / ${row[3]} \n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot,text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listSpa (bot:  TG_BOT) {
	//const env = bot.env;
	let response_ids:any[] = [];
	let text = '';
 
	try {
	    const result = await DB_API.dbListSpa(bot.DB);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
		   await TIOZAO_CMDS.sendResponse(bot,text, response_ids);
	    } else {
		   const spasButtons:any[] = result.map((row: any[]) =>
			  row.map(buttonText => ({ text: buttonText, callback_data: '/spa ' + buttonText }))
		   );
		   response_ids = await  bot.tgSendButtons( spasButtons, 'Lista de casas:');
	    }        
	} catch (error) {
	    console.error('Error during search operation:', error);
	    const errorText = `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, errorText, response_ids);
	}
 
	return response_ids;
 }

 public static async handleSpaCommand(bot:  TG_BOT,callbackQuery:any, spa:string) {
		 if (spa === '') {
			return await TIOZAO_CMDS.listSpa(bot);
		 } else {
			await bot.tgAnswerCallbackQuery(callbackQuery.id, spa);
			return await TIOZAO_CMDS.searchSpa(bot,spa);
		 }
	  }
 
 public static async searchSpa(bot:  TG_BOT, spa:string) {
	let response_ids: any[] = [];
	let text = `═════════════════════\n<b>GPs ${spa}</b>\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbSearchSpa(bot.DB, spa);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[1]}/${row[2]}">${row[0]}</a> -> ${row[3]}\n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot,text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listInfo(bot:  TG_BOT) {
	//const env = bot.env;
	const ctx:TG_ExecutionContext = bot.currentContext
	const id_user = ctx.update_message.id_user;
	console.log("debug listInfo - user:", id_user)
	let response_ids: any[] = [];
	let text = `═════════════════════\n<b>Perfil</b>\n═════════════════════\n`;
	let first_name = '';
	let username = '';
	let posts_count = 0;
	let td_count = 0;
	let user_rp = 0;
	let td_explorer_count = 0;
	let td_unique_count = 0;
 
	try {
	    const result:any[] = await DB_API.dbSearchUserData(bot.DB, id_user);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  first_name = row[0];
			  username = row[1];
			  td_explorer_count = row[2];
			  td_unique_count = Number(row[3]);
			  posts_count = row[4];
			  td_count = Number(row[5]);
			  user_rp = ((td_count - td_unique_count)/td_count)*100;
			  
		   }
		   text += `<b>Nome</b>: ${first_name}\n`;
		   text += `<b>Usuário</b>: ${username}\n`;
		   text += `<b>Posts</b>: ${posts_count}\n`;
		   text += `<b>TDs</b>: ${td_count}\n`;
		   text += `<b>Repetecos</b>: ${user_rp}%\n`;
		   text += `<b>Desbravamentos</b>: ${td_explorer_count}\n\n`;
	    }
	    text += "<b>Lista de TDs:</b>\n";
	    const result2 = await DB_API.dbSearchUserTd(bot.DB, id_user);
	    if (result2.length === 0) {
		   text += "Nenhum resultado encontrado";
	    } else {
		   for (const row of result2) {
			  const day = formatDate(row[3]);
			  text += `${day} - <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async searchTerm(bot:  TG_BOT, name:string) {
	 
	let response_ids: any[] = [];
	let text = `═════════════════════\n<b>Busca ${name}</b>\n═════════════════════\n`;
	
	// Validate search term
	if (!isValidSearchTerm(name)) {
	    const text = `O termo de busca precisa ter ao menos 3 caracteres`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	    return response_ids;
	}
	try {
	    const result = await DB_API.dbSearchTerm(bot.DB, name);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a> \n`;
		   }
	    }
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await TIOZAO_CMDS.sendResponse(bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // 

 public static async showMenu(bot:  TG_BOT, response_ids:any[]) {
	response_ids.push(await  TIOZAO_BOT_CMDs.botShowMenu(bot));
 }
 
 public static async sendResponse(bot:  TG_BOT, text:string, response_ids: any[], media = null) {
	response_ids.push(await bot.tgSendMessage(text));
	if (media) {
	    response_ids.push(await TIOZAO_BOT_CMDs.botResponseMedia(bot, media));
	}
 }
 
 public static async checkDuplicatedThread (bot:  TG_BOT, threadname:string|undefined, id_thread:any) {
	let text = '';
     if (!threadname) return;
	try {
		const result = await DB_API.dbSearchThreadname(bot.DB, threadname);
		//console.log("log from  checkDuplicatedThread - result: ", result)
		if (result.length == 0) {
		text = 'Seguir o padrão em https://gpsp.xyz/td';
		}
		else {
		text = 'Existe(m) outro(s) tópico(s) com título parecido, verifique antes de postar aqui: \n';
		for (const row of result) {
			text += `• <a href="t.me/c/${bot.botINFO.CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		}
		}
		return await TIOZAO_BOT_CMDs.botAlert(bot,text, id_thread);
	}catch (e:any) {
		console.error('Error in checkDuplicatedThread:', e.message);
	 }
 }
 //.onCheck('isTD',checkTD)
//		.onCheck("isRP",checkRP)
//		.onCheck('isATA'
 
 public static async confirmTD(bot:  TG_BOT, message: ContextMessage, edit:any) {
 
	const result = await DB_API.dbSearchTDUserThread(bot.DB, message.id_user, message.id_thread);
	const number_rp = result.length;
	let text = '';
     let is_td = 0; 
	const is_td_rp = bot.currentContext.checkUserOperation('isRP');
	// Determine if the user has a TD in the thread
	if (number_rp > 0) {
		//bot.currentContext.addUserOperation('isTD');
		is_td = 1;
	} else if (is_td_rp) {
	    text = 'Falta o seu primeiro TD nesse tópico.\nSeguir o padrão: https://gpsp.xyz/td\n';
	    is_td = 0;
	    return await TIOZAO_BOT_CMDs.botAlert(bot, text, message.id_thread, message.message_id);
	}
 
	// Determine the response text based on the TD status and whether it's an edit
	if (edit) {
	    text = `TD Editado ✅`;
	} else {
	    text = is_td && number_rp > 0 
		   ? `Repeteco ${number_rp} ✅ ` 
		   : (is_td ? "TD ✅" : "");
	}
 
	// Send the response if the message has a TD
	if (is_td) {
	    return await TIOZAO_BOT_CMDs.botAlert(bot, text, message.id_thread, message.message_id);
	}
 }
 
 public static async checkHaveCaption(bot:TG_BOT, message:ContextMessage, edit = false) {
	const { message_id, media_group_id, caption } = message;
 	console.log('debug from checkHaveCaption - caption: ', caption)
	try {
	    if (caption) {
		   await  DB_API.dbInsertCaption(bot.DB, media_group_id, caption);
	    } else if (edit) {
		   await DB_API.dbDeleteCaption(bot.DB, media_group_id);
	    }
	} catch (error) {
	    console.error(`Error processing caption for media_group_id: ${media_group_id}`, error);
	    throw error; 
	}
 
	return [];
 }     


}