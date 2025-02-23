import { DB_API } from "../database_api";
import { formatDate, isValidSearchTerm } from "../library";
import TG_BOT from "../telegram_bot";
import TG_Message from "../types/TelegramMessage";
import { TIOZAO_BOT_CMDs } from "./tiozao_bot_comands";

export default class TIOZAO_API {

///////////////////////////////////////////////////////////////////////////////
 // Main functions
 
 public static async listChat (env:any, bot:  TG_BOT) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Bate Papo</b>\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListChat(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await this.sendResponse(env, bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, text, response_ids);
	}
	return response_ids;
 }
 
 public static async listActiveGp(env:any, bot:  TG_BOT) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>GPs ativas</b>\nGPs com TDs nos últimos 4 meses\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListActiveGp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  const day = formatDate(row[3]);
			  text += `${day} - <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await this.sendResponse(env, bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listTopGp(env:any, bot:  TG_BOT) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Top GPs</b>\nGPs com TDs de usuários únicos\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListTopGp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a> -> ${row[3]}\n`;
		   }
	    }
	    await this.sendResponse(env, bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listTopRp(env:any, bot:  TG_BOT) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Top Repetecos</b>\nGPs com repetecos de usuários únicos\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListTopRp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a> -> ${row[3]}\n`;
		   }
	    }
	    await this.sendResponse(env, bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listTdGp(env:any, bot:  TG_BOT) { 
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Lista GPs</b>\nGPs com TDs + repetecos\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListTdGp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[2]}/${row[3]}">${row[0]}</a> -> ${row[1]}\n`;
		   }
	    }
	    await this.sendResponse(env, bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, text, response_ids);
	}
	return response_ids;
 }
 
 public static async listTrendGp(env:any, bot:  TG_BOT) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>GPs Tendência</b>\nGPs com TDs nos últimos 4 meses de 2 ou mais usuários diferentes\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListTrendGp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await this.sendResponse(env, bot,text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot,text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listMembers(env:any, bot:  TG_BOT){
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Membros</b>\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbListMembers(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   text += 'Nome -> Posts / TDs / Desbravamentos\n';
		   for (const row of result) {
			  text += `• ${row[0]} -> ${row[1]} / ${row[2]} / ${row[3]} \n`;
		   }
	    }
	    await this.sendResponse(env, bot,text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listSpa (env:any, bot:  TG_BOT) {
	let response_ids:any[] = [];
	let text = '';
 
	try {
	    const result = await DB_API.dbListSpa(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
		   await this.sendResponse(env, bot,text, response_ids);
	    } else {
		   const spas:any[] = result.map((row: any[]) =>
			  row.map(buttonText => ({ text: buttonText, callback_data: '/spa ' + buttonText }))
		   );
		   response_ids = await  TIOZAO_BOT_CMDs.ResponseButton(env, bot, spas, 'Lista de casas:');
	    }        
	} catch (error) {
	    console.error('Error during search operation:', error);
	    const errorText = `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, errorText, response_ids);
	}
 
	return response_ids;
 }
 
 public static async searchSpa(env:any,  bot:  TG_BOT, spa:string) {
	let response_ids: any[] = [];
	let text = `═════════════════════\n<b>GPs ${spa}</b>\n═════════════════════\n`;
 
	try {
	    const result = await DB_API.dbSearchSpa(env, spa);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[1]}/${row[2]}">${row[0]}</a> -> ${row[3]}\n`;
		   }
	    }
	    await this.sendResponse(env, bot,text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async listInfo(env:any, bot:  TG_BOT, id_user: any) {
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
	    const result:any[] = await DB_API.dbSearchUserData(env, id_user);
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
	    const result2 = await DB_API.dbSearchUserTd(env, id_user);
	    if (result2.length === 0) {
		   text += "Nenhum resultado encontrado";
	    } else {
		   for (const row of result2) {
			  const day = formatDate(row[3]);
			  text += `${day} - <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await this.sendResponse(env,bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 public static async searchTerm(env:any,  bot:  TG_BOT,name:string) {
 
	let response_ids: any[] = [];
	let text = `═════════════════════\n<b>Busca ${name}</b>\n═════════════════════\n`;
	
	// Validate search term
	if (!isValidSearchTerm(name)) {
	    const text = `O termo de busca precisa ter ao menos 3 caracteres`;
	    await this.sendResponse(env, bot, text, response_ids);
	    return response_ids;
	}
	try {
	    const result = await DB_API.dbSearchTerm(env, name);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a> \n`;
		   }
	    }
	    await this.sendResponse(env, bot, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await this.sendResponse(env, bot, text, response_ids);
	}
 
	return response_ids;
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // 

 public static async showMenu(env:any, bot:  TG_BOT, response_ids:any[]) {
	response_ids.push(await  TIOZAO_BOT_CMDs.botShowMenu(env,bot));
 }
 
 public static async sendResponse(env:any, bot:  TG_BOT, text:string, response_ids: any[], media = null) {
	response_ids.push(await TIOZAO_BOT_CMDs.botResponseTxt(env,bot, text));
	if (media) {
	    response_ids.push(await TIOZAO_BOT_CMDs.botResponseMedia(env, bot, media));
	}
 }
 
 public static async checkDuplicatedThread (env:any, bot:  TG_BOT, threadname:string, id_thread:any) {
	let text = '';
 
	const result = await DB_API.dbSearchThreadname(env, threadname);
	
	if (result.length == 0) {
	    text = 'Seguir o padrão em https://gpsp.xyz/td';
	}
	else {
	    text = 'Existe(m) outro(s) tópico(s) com título parecido, verifique antes de postar aqui: \n';
	    for (const row of result) {
		   text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
	    }
	}
	return await TIOZAO_BOT_CMDs.botAlert(env, bot,text, id_thread);
 }
 
 public static async confirmTD(env:any,  bot:  TG_BOT,message: TG_Message, edit:any) {
 
	const result = await DB_API.dbSearchTDUserThread(env, message.id_user, message.id_thread);
	const number_rp = result.length;
	let text = '';
 
	// Determine if the user has a TD in the thread
	if (number_rp > 0) {
	    message.is_td = 1;
	} else if (message.is_td_rp) {
	    text = 'Falta o seu primeiro TD nesse tópico.\nSeguir o padrão: https://gpsp.xyz/td\n';
	    message.is_td = 0;
	    return await TIOZAO_BOT_CMDs.botAlert(env, bot, text, message.id_thread, message.message_id);
	}
 
	// Determine the response text based on the TD status and whether it's an edit
	if (edit) {
	    text = `TD Editado ✅`;
	} else {
	    text = message.is_td && number_rp > 0 
		   ? `Repeteco ${number_rp} ✅ ` 
		   : (message.is_td ? "TD ✅" : "");
	}
 
	// Send the response if the message has a TD
	if (message.is_td) {
	    return await TIOZAO_BOT_CMDs.botAlert(env,bot, text, message.id_thread, message.message_id);
	}
 }
 
 public static async checkHaveCaption(env:any, message:TG_Message, edit = false) {
	const { message_id, media_group_id, caption } = message;
 
	try {
	    if (caption) {
		   await  DB_API.dbInsertCaption(env, media_group_id, caption);
	    } else if (edit) {
		   await DB_API.dbDeleteCaption(env, media_group_id);
	    }
	} catch (error) {
	    console.error(`Error processing caption for media_group_id: ${media_group_id}`, error);
	    throw error; 
	}
 
	return [];
 }     


}