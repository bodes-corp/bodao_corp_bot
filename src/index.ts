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
	async fetch(request: Request, env:Environment, context: ExecutionContext): Promise<Response> {
		//console.log(`[LOGGING FROM /hello]: Request came from ${context.request.url}`);
		
		const { waitUntil } = context;

		if (!isAuthorized(request, env)) {
		return new Response('Unauthorized test', { status: 403 });
		}

		try {

		// when a POS request arrives at the webhooendPoint, thebot reads te JSON
		//body of this request, interpreting this as an Update from Telegram
		const update = await request.json();
		//ctx.waitUntil() extends the lifetime of your Worker, allowing you to perform work without blocking 
		// returning a response, and that may continue after a response is returned. It accepts a Promise,
		//  which the Workers runtime will continue executing, even after a response has been returned by 
		// the Worker's handler.
		waitUntil(handleUpdate(env, update));
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



/**
 * This method handles the updates from Telegram.
 * when a POST request arrives at the webhooendPoint, thebot reads te JSON
 * body of this request, interpreting this as an Update from Telegram.
 * If the update contains a message, call haldler methods.
 * @param {*} env the worker env variables
 * @param {*} update the request object json formated
 */
async function handleUpdate(env:any, update:any) {

	if (update.message) {   
	
 
	    await handleMessage(env, update.message);
	} else if (update.edited_message) {
	    await handleEditedMessage(env, update.edited_message);
	} else if (update.callback_query) {
	    await handleCallbackQuery(env, update.callback_query);
	}
 }
 
 async function handleMessage(env:any, messageJson:any) {
	const message:Message = new Message(messageJson);
	//console.log("operation: ", message.operation);
	//console.log("env: ", env.json());
	//return new Response("Hello, world!");
	if (true /*!isValidChat(message, env)*/) {
	    
	    //console.log("invalid chat: ");
	    //console.log("env: ", env.json());
	    //return new Response("Hello, world!");
	    return new Response('Unauthorized', { status: 403 });
	}
 
	if (message.msg_txt.startsWith('/')) {
	    return await handleBotCommand(env, message);
	}
	
	switch (message.operation) {
	    case 'create_thread':
		   await handleCreateThread(env, message);
		   break;
	    case 'new_media':
		   await handleNewMedia(env, message);
		   break;
	    case 'new_post':
		   await handleNewPost(env, message);
		   break;
	}
	return await dbInsertMessage(env, message);
 }
 
 async function handleOldMessages (env:any) {
	await removeOldMessages(env);
 }
 
 async function handleBotResponses(env:any, response_ids:any[]) {
	const array = response_ids.flat();
	if (array.length > 0) {
	    await dbBatchInsertBot(env, array);
	}
 }
 
 async function handleCreateThread (env:any, message:Message) {
	let response_ids:any[] = [];
 
	await checkDuplicatedThread(env, message.threadname, message.id_thread);
	return await handleBotResponses(env, response_ids);
 }
 
 async function handleNewMedia(env:any, message:Message) {
	let response_ids:any[] = [];
 
	response_ids.push(await checkHaveCaption(env, message));
	return await handleBotResponses(env, response_ids);
 }
 
 async function handleNewPost (env:any, message:Message) {
	let response_ids:any[] = [];
	//console.log("handleNewPost: ", message.operation);
	if (message.td_rp || message.td) {
	    response_ids.push(await confirmTD(env, message, 0));
	}
	return await handleBotResponses(env, response_ids);
 }
 
 async function handleEditedMessage(env:any, messageJson:any) {
	const message:EditedMessage = new EditedMessage(messageJson);
 
	switch (message.operation) {
	    case 'edit_media':
		   await handleEditMedia(env, message);
		   break;
	    case 'edit_post':
		   await handleEditPost(env, message);
		   break;
	}
	return await dbEditMessage(env, message);
 }
 
 async function handleEditMedia (env:any, message:any) {
	let response_ids:any[] = [];
 
	response_ids.push(await checkHaveCaption(env, message, true));
	return await handleBotResponses(env, response_ids);
 }
 
 async function handleEditPost (env:any, message:EditedMessage) {
	let response_ids:any[] = [];
 
	if (message.td_rp || message.td) {
	    response_ids.push(await confirmTD(env, message, 1));
	}
	return await handleBotResponses(env, response_ids);
 
 }
 
 async function handleBotCommand(env:any, message:Message) {
	const id_msg = message.id_msg;
	const id_thread = message.id_thread;
	const id_user = message.id_user;
	const msg_txt = message.msg_txt.trim();
	const command = msg_txt.split(' ')[0];
	let response_ids:any[] = [];
	
	const commands = {
	    '/active_gp': { func: listActiveGp, requiresArg: false },
	    '/chat': { func: listChat, requiresArg: false },
	    '/gp_td': { func: listTdGp, requiresArg: false },
	    '/info': { func: (env:any, _:any) => listInfo(env, id_user), requiresArg: false },
	    '/spa': { func: listSpa, requiresArg: false },
	    '/s': {func: searchTerm, requiresArg: true},
	    '/top_gp': { func: listTopGp, requiresArg: false },
	    '/top_rp': { func: listTopRp, requiresArg: false },
	    '/trend_gp': { func: listTrendGp, requiresArg: false },
	    '/user': { func: listMembers, requiresArg: false }
	};
 
	const commandEntry:any = Object.entries(commands).find(([prefix]) =>
	    msg_txt.startsWith(prefix)
	);
 
	if (commandEntry) {
	    const [selectedCommand, { func: commandFunction, requiresArg }] = commandEntry;
	    const argument = msg_txt.slice(selectedCommand.length).trim();
 
	    if (requiresArg && argument === '') {
		   response_ids.push(await botAlert(env, `O comando ${selectedCommand} precisa de um parâmetro.`, id_thread, id_msg));
	    } else if (requiresArg && !msg_txt.startsWith(selectedCommand + ' ')) {
		   response_ids.push(await botAlert(env, `Adicione espaço entre o ${selectedCommand} e o parâmetro.`, id_thread, id_msg));
	    } else {
		   response_ids = await commandFunction(env, argument);
	    }
	} else {
	    response_ids.push(await botAlert(env, 'Comando desconhecido: ' + command, id_thread, id_msg));
	}
 
	if (commandEntry != '/spa') {
	    await showMenu(env, response_ids);
	}
	response_ids.push(id_msg);
	await handleBotResponses(env, response_ids);
	return await handleOldMessages(env);
 }
 
 async function handleCallbackQuery(env:any, callbackQuery:any) {
	const { from: user, data: command } = callbackQuery;
	let response_ids:any[] = [];
 
	const commandHandlers:any = {
	    '/active_gp': listActiveGp,
	    '/chat': listChat,
	    '/gp_td': listTdGp,
	    '/info': () => listInfo(env, user.id),
	    '/spa': handleSpaCommand,
	    '/top_gp': listTopGp,
	    '/top_rp': listTopRp,
	    '/trend_gp': listTrendGp,
	    '/user': listMembers
	};
 
	const commandKey = Object.keys(commandHandlers).find(prefix => command.startsWith(prefix));
 
	if (commandKey) {
	    await tgAnswerCallbackQuery(env, callbackQuery.id, commandKey);
	    const commandFunction:any = commandHandlers[commandKey];
	    response_ids = await commandFunction(env, callbackQuery, command.slice(commandKey.length).trim());
	} else {
	    return new Response(`Unknown command: ${command}`, { status: 400 });
	}
	if (command !== '/spa') {
	    await showMenu(env, response_ids);
	}
	await handleBotResponses(env, response_ids);
	return await handleOldMessages(env);
 }
 
 async function handleSpaCommand(env:any, callbackQuery:any, spa:string) {
	if (spa === '') {
	    return await listSpa(env);
	} else {
	    await tgAnswerCallbackQuery(env, callbackQuery.id, spa);
	    return await searchSpa(env, spa);
	}
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // DB
 
 async function executeQuery(db:any, query:string, params:any[] = [], returnResults = true) {
	const preparedStatement = db.prepare(query).bind(...params);
 
	if (returnResults) {
	    return await preparedStatement.raw(); // For SELECT queries, return the results
	} else {
	    return await preparedStatement.run(); // For non-SELECT queries, just execute the query
	}
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // DB selects
 
 async function dbSearchThreadname(env:any, threadname:string) {
	const normalized_threadname = removeAccents(threadname);
 
	const threadnameArray = stringToWordsArray(normalized_threadname);
	const likeClauses = threadnameArray
	    .map((_, index) => `normalized_threadname LIKE '%' || ?${index + 1} || '%'`)
	    .join(' AND ');
 
	await env.DB.prepare('PRAGMA case_sensitive_like = true;').run();
 
	const query = `
	    SELECT t.id_thread, MIN(m.id_msg), t.threadname 
	    FROM tg_thread t
	    JOIN tg_msg m ON t.id_thread = m.id_thread 
	    WHERE ${likeClauses}
	    GROUP BY t.id_thread 
	    ORDER BY t.threadname COLLATE NOCASE ASC
	`;
 
	return await executeQuery(env.DB, query, threadnameArray);
 }
 
 async function dbSearchTerm(env:any, name:string) {
	const normalized_name = removeAccents(name);
 
	const query = `
	    SELECT
		   id_thread,
		   MIN(id_msg),
		   threadname,
		   normalized_threadname
	    FROM (
		   SELECT
			  m.id_thread,
			  m.id_msg,
			  t.threadname,
			  t.normalized_threadname,
			  m.msg_date
		   FROM tg_msg m
		   JOIN tg_thread t ON m.id_thread = t.id_thread
		   WHERE t.normalized_threadname LIKE '%' || ?1 || '%' AND m.deleted = 0 AND m.td = 1
	    ) AS subquery
	    GROUP BY id_thread
	    ORDER BY normalized_threadname;
	`;
 
	return await executeQuery(env.DB, query, [normalized_name]);
 }
 
 async function dbSearchCaption(env:any, mediaGroupId:string) {
	const query = `
	    SELECT caption
	    FROM tg_caption
	    WHERE media_group_id = ?1;
	`;
	
	return await executeQuery(env.DB, query, [mediaGroupId]);
 }
 
 async function dbSearchNotify(env:any, id_msg_ref:string) {
 
	const query = `
	    WITH MediaGroup AS (
		   SELECT media_group_id
		   FROM tg_media
		   WHERE id_msg = ?1
	    ),
	    RelatedMessages AS (
		   SELECT id_msg
		   FROM tg_media
		   WHERE media_group_id = (SELECT media_group_id FROM MediaGroup)
	    )
	    SELECT id_msg
	    FROM tg_bot
	    WHERE id_msg_ref IN (SELECT id_msg FROM RelatedMessages)
	`;
	return await executeQuery(env.DB, query, [id_msg_ref]);
 }
 
 async function dbSearchTDUserThread(env:any, id_user:string, id_thread:string) {
 
	const query = `
	    SELECT id_msg
	    FROM tg_msg
	    WHERE td = 1
	    AND id_user = ?1
	    AND id_thread = ?2;
	`;
	return await executeQuery(env.DB, query, [id_user, id_thread]);
 }
 
 async function dbListChat(env:any) {
	const query = `
	    SELECT t.id_thread, MAX(m.id_msg), t.threadname
	    FROM tg_thread t
	    JOIN tg_msg m ON t.id_thread = m.id_thread
	    WHERE m.deleted = 0
	    GROUP BY t.id_thread, t.threadname
	    HAVING NOT MAX(m.td = 1)
	    ORDER BY t.normalized_threadname;
	`;
	return await executeQuery(env.DB, query, []);
 }
 
 async function dbListMembers(env:any) {
	const query = `
	    WITH thread_counts AS (
		   SELECT id_user, COUNT(*) AS thread_count
		   FROM (
			  SELECT m.id_user, m.id_thread, MIN(m.id_msg) AS id_msg
			  FROM tg_msg m
			  JOIN tg_thread t ON m.id_thread = t.id_thread
			  WHERE m.td = 1 AND m.deleted = 0
			  GROUP BY m.id_thread
		   ) AS subquery
		   GROUP BY id_user
	    )
	    SELECT 
		   u.first_name, 
		   SUM(CASE WHEN m.td = 0 THEN 1 ELSE 0 END) AS posts, 
		   SUM(CASE WHEN m.td = 1 THEN 1 ELSE 0 END) AS tds, 
		   COALESCE(tc.thread_count, 0) AS desbravamentos
	    FROM tg_msg m
	    JOIN tg_user u ON u.id_user = m.id_user
	    LEFT JOIN thread_counts tc ON u.id_user = tc.id_user
	    WHERE u.active = 1 AND m.deleted = 0
	    GROUP BY u.first_name, tc.thread_count
	    ORDER BY desbravamentos DESC, u.first_name COLLATE NOCASE ASC;
	`;
	return await executeQuery(env.DB, query, []);
 }
 
 async function dbListTdGp(env:any) {
	const query = `
	    SELECT t.threadname, COUNT(*) AS count, t.id_thread, MIN(m.id_msg) AS id_msg
	    FROM tg_msg m, tg_thread t
	    WHERE m.id_thread = t.id_thread 
	    AND m.td = 1
	    AND m.deleted = 0
	    GROUP BY t.id_thread
	    ORDER BY t.normalized_threadname ASC
	`;
	return await executeQuery(env.DB, query, []);
 }
 
 async function dbListTopGp(env:any) {
	const query = `
	    SELECT t.id_thread, MIN(m.id_msg) AS id_msg, t.threadname, COUNT(DISTINCT m.id_user) AS num_distinct_users 
	    FROM tg_msg m, tg_thread t 
	    WHERE m.id_thread = t.id_thread 
	    AND m.td = 1 
	    AND m.deleted = 0
	    GROUP BY t.id_thread 
	    HAVING num_distinct_users > 3 
	    ORDER BY num_distinct_users DESC, t.normalized_threadname ASC
	`;
	return await executeQuery(env.DB, query, []);
 }
 
 async function dbListTopRp(env:any) {
	const query = `
	    SELECT
	    id_thread,
	    MIN(id_msg) AS id_msg,
	    threadname,
	    COUNT(*) AS count
	    FROM
		   (
			  SELECT
				 m.id_thread,
				 t.threadname,
				 m.id_user,
				 MIN(m.id_msg) AS id_msg
			  FROM
				 tg_thread t
				 JOIN tg_msg m ON m.id_thread = t.id_thread
			  WHERE
				 m.td = 1
				 AND m.deleted = 0
			  GROUP BY
				 m.id_thread,
				 t.threadname,
				 m.id_user
			  HAVING
				 COUNT(*) > 1
		   ) AS subquery
	    GROUP BY
		   id_thread,
		   threadname
	    HAVING
		   COUNT > 1
	    ORDER BY
		   count DESC,
		   normalized_threadname
	`;
	return await executeQuery(env.DB, query, []);
 }
 
 async function dbListActiveGp(env:any) {
 
	const now = Date.now() / 1000;
	const dateOld = now - 10368000;
 
	const query = `
	    SELECT 
		   m.id_thread, 
		   MAX(m.id_msg), 
		   t.threadname,
		   MAX(m.msg_date)
	    FROM 
		   tg_msg m
	    JOIN 
		   tg_thread t 
	    ON 
		   m.id_thread = t.id_thread 
	    WHERE 
		   m.td = 1 
		   AND m.msg_date >= ?1
	    GROUP BY 
		   m.id_thread, t.threadname
	    ORDER BY 
		   t.normalized_threadname ASC
	`;
	return await executeQuery(env.DB, query, [dateOld]);
 }
 
 async function dbListTrendGp(env:any) {
 
	const now = Date.now() / 1000;
	const dateOld = now - 10368000;
 
	const query = `
	    SELECT 
		   sub.id_thread,
		   MAX(sub.id_msg) AS id_msg,
		   sub.threadname 
	    FROM 
		   (
			  SELECT 
				 MAX(m.id_msg) AS id_msg, 
				 m.id_thread, 
				 t.threadname, 
				 COUNT(m.id_user) AS count 
			  FROM 
				 tg_msg m 
			  JOIN 
				 tg_thread t 
			  ON 
				 m.id_thread = t.id_thread 
			  WHERE 
				 m.td = 1 
				 AND m.msg_date > ?1
			  GROUP BY 
				 t.id_thread, 
				 t.threadname, 
				 m.id_user
		   ) sub 
	    GROUP BY 
		   sub.id_thread, 
		   sub.threadname 
	    HAVING 
		   COUNT(*) > 1 
	    ORDER BY 
		   sub.threadname
	`;
	return await executeQuery(env.DB, query, [dateOld]);
 }
 
 async function dbListSpa(env:any) {
	const query = `
	    SELECT spa
	    FROM (
		   SELECT DISTINCT
			  TRIM(
				 SUBSTR(
					t.threadname,
					INSTR(t.threadname, '-') + 1,
					CASE
					    WHEN INSTR(t.threadname, '(') > 0 AND INSTR(t.threadname, '(') < INSTR(t.threadname, '/') THEN INSTR(t.threadname, '(') - INSTR(t.threadname, '-') - 1
					    WHEN INSTR(t.threadname, '/') > 0 THEN INSTR(t.threadname, '/') - INSTR(t.threadname, '-') - 1
					    WHEN INSTR(t.threadname, '(') > 0 THEN INSTR(t.threadname, '(') - INSTR(t.threadname, '-') - 1
					    ELSE LENGTH(t.threadname) - INSTR(t.threadname, '-') + 1
					END
				 )
			  ) AS spa
		   FROM tg_thread t
		   JOIN tg_msg m ON t.id_thread = m.id_thread
		   WHERE m.td = 1
		   AND m.deleted = 0
	    ) AS subquery
	    WHERE spa IS NOT NULL AND spa <> ''
	    ORDER BY spa COLLATE NOCASE ASC
	`;
	return await executeQuery(env.DB, query, []);
 }
 
 async function dbSearchSpa(env:any, spa:string) {
	const query = `
	    SELECT
		   t.threadname,
		   t.id_thread,
		   MIN(m.id_msg),
		   COUNT(*)
	    FROM
		   tg_thread t,
		   tg_msg m
	    WHERE
		   m.id_thread = t.id_thread
		   AND t.threadname LIKE '%' || ?1 || '%'
		   AND m.td = 1
		   AND m.deleted = 0
	    GROUP BY
		   t.id_thread
	    ORDER BY
		   t.normalized_threadname COLLATE NOCASE ASC
	`;
	return await executeQuery(env.DB, query, [spa]);
 }
 
 async function dbSearchUserData(env:any, id_user:any) {
	const query = `
	    WITH first_msg AS (
		   SELECT id_thread, 
			  min(id_msg) AS id_msg, 
			  id_user 
		   FROM tg_msg 
		   WHERE td = 1 
		   AND deleted = 0 
		   GROUP BY id_thread
	    ),
	    user_info AS (
		   SELECT first_name, username 
		   FROM tg_user 
		   WHERE id_user = ?1
	    ),
	    msg_count AS (
		   SELECT COUNT(*) AS count_td_1  
		   FROM (
			  SELECT COUNT(*) AS count, t.id_thread  
			  FROM tg_thread t 
			  JOIN tg_msg m ON m.id_thread = t.id_thread 
			  WHERE m.td = 1 
			  AND m.deleted = 0 
			  AND m.id_user = ?1
			  GROUP BY t.id_thread, m.id_user
		   ) subquery_alias
	    ),
	    td_counts AS (
		   SELECT SUM(td = 0) AS count_td_0, SUM(td = 1) AS count_td_1
		   FROM tg_msg
		   WHERE id_user = ?1
		   AND deleted = 0
	    ),
	    first_msg_count AS (
		   SELECT COUNT(*) AS first_msg_count
		   FROM tg_msg m
		   JOIN tg_thread t ON m.id_thread = t.id_thread
		   JOIN first_msg fm ON m.id_thread = fm.id_thread
					    AND m.id_user = fm.id_user
		   WHERE m.id_user = ?1 
		   AND m.id_msg = fm.id_msg
	    )
	    SELECT u.first_name, u.username, 
		   fm.first_msg_count,
		   mc.count_td_1,
		   tc.count_td_0, tc.count_td_1
	    FROM user_info u
	    CROSS JOIN first_msg_count fm
	    CROSS JOIN msg_count mc
	    CROSS JOIN td_counts tc;
	`;
 
	return await executeQuery(env.DB, query, [id_user]);
 }
 
 async function dbSearchUserTd (env:any, id_user:any) {
	const query = `
	    SELECT m.id_thread, m.id_msg, t.threadname, m.msg_date
	    FROM tg_msg m, tg_thread t
	    WHERE m.id_thread = t.id_thread 
	    AND m.td = 1 
	    AND m.deleted = 0
	    AND m.id_user = ?1
	    ORDER BY m.msg_date DESC
	`;
	return await executeQuery(env.DB, query, [id_user]);
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // DB inserts/deletes/updates
 
 async function dbInsertBotNotify(env:any, response:any, id_msg:any) {
	const query = `
	    INSERT INTO tg_bot (id_msg, id_msg_ref) 
	    VALUES (?1,?2)
	`;
	await executeQuery(env.DB, query, [response, id_msg], false);
	return response;
 }
 
 async function dbDeleteBotNotify(env:any, array:any[]) {
	const query = `
	    DELETE FROM tg_bot
	    WHERE id_msg =?1;
	`;
 
	try {
	    const rows = array.map(id_msg => env.DB.prepare(query).bind(id_msg));
	    await env.DB.batch(rows);
	} catch (e:any) {
	    console.error('Error in batch delete bot messages:', e.message);
	}
 }
 
 async function dbBatchInsertBot(env:any, array:any[]) {
	const msg_date = Math.floor(Date.now() / 1000);
	const query = 'INSERT INTO tg_bot (id_msg, msg_date) VALUES (?1, ?2)';
	
	try {
	    const rows = array.map(id_msg => env.DB.prepare(query).bind(id_msg, msg_date));
	    await env.DB.batch(rows);
	} catch (e:any) {
	    console.error('Error in batch inserting bot messages:', e.message);
	}
 }
 
 async function dbInsertMessage(env:any, message:Message) {
    
	if (['update_thread', 'create_thread'].includes(message.operation)) {
	    const normalized_threadname = removeAccents(message.threadname);
	    const threadQuery = `
		   INSERT INTO tg_thread (id_thread, threadname, normalized_threadname) 
		   VALUES (?1, ?2, ?3) 
		   ON CONFLICT (id_thread) 
		   DO UPDATE SET threadname = excluded.threadname, normalized_threadname = excluded.normalized_threadname
	    `;
	    await executeQuery(env.DB, threadQuery, [message.id_thread, message.threadname, normalized_threadname], false);
	}
	
	if (message.operation === 'new_media') {
	    const mediaQuery = `
		   INSERT INTO tg_media 
		   (id_msg, file_id, file_unique_id, msg_date, id_user, id_thread, type, deleted, media_group_id)
		   VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
	    `;
	    await executeQuery(env.DB, mediaQuery, [
		   message.id_msg, 
		   message.file_id, 
		   message.file_unique_id, 
		   message.msg_date, 
		   message.id_user, 
		   message.id_thread, 
		   message.type, 
		   message.deleted, 
		   message.media_group_id
	    ], false);     
	}
 
	if (message.operation === 'new_post') {
	    const messageQuery = `
		   INSERT INTO tg_msg (id_msg, msg_txt, msg_date, td, id_user, id_thread, deleted) 
		   VALUES (?1,?2,?3,?4,?5,?6,0)
	    `;
	    await executeQuery(env.DB, messageQuery, [
		   message.id_msg, 
		   message.msg_txt,
		   message.msg_date,
		   message.td,
		   message.id_user,
		   message.id_thread
	    ], false);
	    
	    const userQuery = `
		   INSERT INTO tg_user (id_user, username, first_name)
		   VALUES (?1, ?2, ?3)
		   ON CONFLICT (id_user)
		   DO UPDATE SET username = excluded.username, first_name = excluded.first_name
	    `;
	    await executeQuery(env.DB, userQuery, [message.id_user, message.username, message.first_name], false);
	}
 
	return new Response("DB-Insert-ok");
 }
 
 async function dbEditMessage(env:any, message:EditedMessage) {
	if (message.operation === 'edit_media') {
	    const fileQuery = `
		   UPDATE tg_media
		   SET file_id = ?1,
			  file_unique_id = ?2,
			  type = ?3
		   WHERE id_msg = ?4
	    `;
	    await executeQuery(env.DB, fileQuery, [
		   message.file_id,
		   message.file_unique_id,
		   message.type,
		   message.id_msg
	    ], false);
 
	    const groupQuery = `
		   UPDATE tg_media
		   SET deleted = ?1
		   WHERE media_group_id = ?2
	    `;
	    await executeQuery(env.DB, groupQuery, [
		   message.deleted,
		   message.media_group_id
	    ], false);
	}
 
	if (message.operation === 'edit_post') {
	    const messageQuery = `
		   UPDATE tg_msg
		   SET msg_txt =?1
		   WHERE id_msg =?2
	    `;
	    await executeQuery(env.DB, messageQuery, [
		   message.msg_txt, 
		   message.id_msg
	    ], false);
	}
 
	return new Response("DB-EDIT-ok");
 }
 
 async function dbInsertCaption(env:any, media_group_id:any, caption:string) {
 
	const normalized_caption:string = removeAccents(caption);
 
	const query = `
	    INSERT INTO tg_caption (media_group_id, caption, normalized_caption)
	    VALUES (?1, ?2, ?3)
	    ON CONFLICT (media_group_id)
	    DO UPDATE SET caption = excluded.caption, normalized_caption = excluded.normalized_caption
	`;
	let params:any[] = [media_group_id, caption, normalized_caption]
	await executeQuery(env.DB, query,params , false);
	return caption;
 }
 
 async function dbDeleteCaption(env:any, media_group_id:any) {
 
	const query = `
	    DELETE FROM tg_caption
	    WHERE media_group_id =?1
	`;
	await executeQuery(env.DB, query, [media_group_id], false);
	return media_group_id;
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // Bot commands
 
 async function botShowMenu(env:any) {
	const menu = [
	    [{ text: 'Lista GPs', callback_data: '/gp_td'}, { text: 'Top GPs', callback_data: '/top_gp'}],
	    [{ text: 'Top Repetecos', callback_data: '/top_rp'},{ text: 'GPs Ativas', callback_data: '/active_gp'}],
	    [{ text: 'GPs Tendência', callback_data: '/trend_gp'}, { text: 'Clínicas', callback_data: '/spa'}],
	    [{ text: 'Membros', callback_data: '/user' },{ text: 'Bate Papo', callback_data: '/chat' }],
	    [{ text: 'Perfil', callback_data: '/info' }]
	];
	return await botResponseButton(env, menu, 'Menu:');
 }
 
 async function botResponseButton(env:any, buttons:any[], text:string) {
	return await tgButton(env, buttons, text);
 }
 
 async function botResponseTxt(env:any, text:string) {
	return await tgMessage(env, text);
 }
 
 async function botResponseMedia(env:any, json:any) {
	const response = await tgSendMedia(env, json);
	return response.result.map((media: { message_id: any; }) => Number(media.message_id));
 }
 
 async function botAlert(env:any, text:string, id_thread:any, id_msg:any|null = null) {
	const response = await tgSendMessageThread(env, text, id_thread, id_msg);
	return Number(response.result.message_id);
 }
 
 async function botSendNotify(env:any, notify:string, id_thread:any, id_msg:any) {
	const response = await tgSendMessageThread(env, notify, id_thread, id_msg);
	return await dbInsertBotNotify(env, Number(response.result.message_id), id_msg);  
 }
 
 async function botRemoveNotify(env:any, id_msg_ref:any) {
	const result = await dbSearchNotify(env, id_msg_ref);
	const id_msg_array = [];
 
	if (result.length != 0) {
	    for (const row of result) {
		   const id_msg = row[0];
		   id_msg_array.push(id_msg);
	    }
	    await tgDeleteMessages(env, id_msg_array);
	    await dbDeleteBotNotify(env, id_msg_array);
	}
	return [];
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // Main functions
 
 async function listChat (env:any) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Bate Papo</b>\n═════════════════════\n`;
 
	try {
	    const result = await dbListChat(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
	return response_ids;
 }
 
 async function listActiveGp(env:any) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>GPs ativas</b>\nGPs com TDs nos últimos 4 meses\n═════════════════════\n`;
 
	try {
	    const result = await dbListActiveGp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  const day = formatDate(row[3]);
			  text += `${day} - <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
 
	return response_ids;
 }
 
 async function listTopGp(env:any) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Top GPs</b>\nGPs com TDs de usuários únicos\n═════════════════════\n`;
 
	try {
	    const result = await dbListTopGp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a> -> ${row[3]}\n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
 
	return response_ids;
 }
 
 async function listTopRp(env:any) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Top Repetecos</b>\nGPs com repetecos de usuários únicos\n═════════════════════\n`;
 
	try {
	    const result = await dbListTopRp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a> -> ${row[3]}\n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
 
	return response_ids;
 }
 
 async function listTdGp(env:any) { 
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Lista GPs</b>\nGPs com TDs + repetecos\n═════════════════════\n`;
 
	try {
	    const result = await dbListTdGp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[2]}/${row[3]}">${row[0]}</a> -> ${row[1]}\n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
	return response_ids;
 }
 
 async function listTrendGp(env:any) {
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>GPs Tendência</b>\nGPs com TDs nos últimos 4 meses de 2 ou mais usuários diferentes\n═════════════════════\n`;
 
	try {
	    const result = await dbListTrendGp(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
 
	return response_ids;
 }
 
 async function listMembers(env:any){
	let response_ids:any[] = [];
	let text = `═════════════════════\n<b>Membros</b>\n═════════════════════\n`;
 
	try {
	    const result = await dbListMembers(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   text += 'Nome -> Posts / TDs / Desbravamentos\n';
		   for (const row of result) {
			  text += `• ${row[0]} -> ${row[1]} / ${row[2]} / ${row[3]} \n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
 
	return response_ids;
 }
 
 async function listSpa (env:any) {
	let response_ids:any[] = [];
	let text = '';
 
	try {
	    const result = await dbListSpa(env);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
		   await sendResponse(env, text, response_ids);
	    } else {
		   const spas:any[] = result.map((row: any[]) =>
			  row.map(buttonText => ({ text: buttonText, callback_data: '/spa ' + buttonText }))
		   );
		   response_ids = await botResponseButton(env, spas, 'Lista de casas:');
	    }        
	} catch (error) {
	    console.error('Error during search operation:', error);
	    const errorText = `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, errorText, response_ids);
	}
 
	return response_ids;
 }
 
 async function searchSpa(env:any, spa:string) {
	let response_ids: any[] = [];
	let text = `═════════════════════\n<b>GPs ${spa}</b>\n═════════════════════\n`;
 
	try {
	    const result = await dbSearchSpa(env, spa);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[1]}/${row[2]}">${row[0]}</a> -> ${row[3]}\n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
 
	return response_ids;
 }
 
 async function listInfo(env:any, id_user: any) {
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
	    const result:any[] = await dbSearchUserData(env, id_user);
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
	    const result2 = await dbSearchUserTd(env, id_user);
	    if (result2.length === 0) {
		   text += "Nenhum resultado encontrado";
	    } else {
		   for (const row of result2) {
			  const day = formatDate(row[3]);
			  text += `${day} - <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
 
	return response_ids;
 }
 
 async function searchTerm(env:any, name:string) {
 
	let response_ids: any[] = [];
	let text = `═════════════════════\n<b>Busca ${name}</b>\n═════════════════════\n`;
	
	// Validate search term
	if (!isValidSearchTerm(name)) {
	    const text = `O termo de busca precisa ter ao menos 3 caracteres`;
	    await sendResponse(env, text, response_ids);
	    return response_ids;
	}
	try {
	    const result = await dbSearchTerm(env, name);
	    if (result.length === 0) {
		   text += `Nenhum resultado encontrado`;
	    } else {
		   for (const row of result) {
			  text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a> \n`;
		   }
	    }
	    await sendResponse(env, text, response_ids);
	} catch (error) {
	    console.error('Error during search operation:', error);
	    text += `Ocorreu um erro durante a busca. Tente novamente mais tarde.`;
	    await sendResponse(env, text, response_ids);
	}
 
	return response_ids;
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // 
 ''
 async function showMenu(env:any, response_ids:any[]) {
	response_ids.push(await botShowMenu(env));
 }
 
 async function sendResponse(env:any, text:string, response_ids: any[], media = null) {
	response_ids.push(await botResponseTxt(env, text));
	if (media) {
	    response_ids.push(await botResponseMedia(env, media));
	}
 }
 
 async function checkDuplicatedThread (env:any, threadname:string, id_thread:any) {
	let text = '';
 
	const result = await dbSearchThreadname(env, threadname);
	
	if (result.length == 0) {
	    text = 'Seguir o padrão em https://gpsp.xyz/td';
	}
	else {
	    text = 'Existe(m) outro(s) tópico(s) com título parecido, verifique antes de postar aqui: \n';
	    for (const row of result) {
		   text += `• <a href="t.me/c/${env.TG_CHATID.substring(3)}/${row[0]}/${row[1]}">${row[2]}</a>\n`;
	    }
	}
	return await botAlert(env, text, id_thread);
 }
 
 async function confirmTD(env:any, message:Message|EditedMessage, edit:any) {
 
	const result = await dbSearchTDUserThread(env, message.id_user, message.id_thread);
	const number_rp = result.length;
	let text = '';
 
	// Determine if the user has a TD in the thread
	if (number_rp > 0) {
	    message.td = 1;
	} else if (message.td_rp) {
	    text = 'Falta o seu primeiro TD nesse tópico.\nSeguir o padrão: https://gpsp.xyz/td\n';
	    message.td = 0;
	    return await botAlert(env, text, message.id_thread, message.id_msg);
	}
 
	// Determine the response text based on the TD status and whether it's an edit
	if (edit) {
	    text = `TD Editado ✅`;
	} else {
	    text = message.td && number_rp > 0 
		   ? `Repeteco ${number_rp} ✅ ` 
		   : (message.td ? "TD ✅" : "");
	}
 
	// Send the response if the message has a TD
	if (message.td) {
	    return await botAlert(env, text, message.id_thread, message.id_msg);
	}
 }
 
 async function checkHaveCaption(env:any, message:Message, edit = false) {
	const { id_msg, media_group_id, caption } = message;
 
	try {
	    if (caption) {
		   await dbInsertCaption(env, media_group_id, caption);
	    } else if (edit) {
		   await dbDeleteCaption(env, media_group_id);
	    }
	} catch (error) {
	    console.error(`Error processing caption for media_group_id: ${media_group_id}`, error);
	    throw error; 
	}
 
	return [];
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // misc functions
 
 function checkTD(msg_txt:string) {
	const keywords = ["Rosto", "Peitos", "Bunda", "Corpo", "Beij", "Massagem", "Oral", "Transa", "Anal", "Presença", "Valor", "Data"];
	return keywords.every(keyword => JSON.stringify(msg_txt).includes(keyword)) ? 1 : 0;
 }
 
 function checkRP(msg_txt:string) {
	const keywords = ["01) Mudou aparência", "02) Mudou atend", "03) Livre", "04) Valor", "05) Clínica"];
	return keywords.every(keyword => JSON.stringify(msg_txt).includes(keyword)) ? 1 : 0;
 }
 
 function isValidChat(message:any , env:any ) {
	 return message.chat_id === parseInt(env.TG_CHATID);
 }
 
 function isValidSearchTerm(name:any ) {
	return name.length >= 3;
 }
 

 function formatDate(unixTimestamp:number ) {
	const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
   
	const options:any = {
	    day: '2-digit',
	    month: '2-digit',
	    year: '2-digit',
	    timeZone: 'America/Sao_Paulo', // Brazil time zone
	};
	  
	const formatter = new Intl.DateTimeFormat('en-US', options);
	const parts = formatter.formatToParts(date);
	  
	const formattedDate = `${parts[2].value}/${parts[0].value}/${parts[4].value}`;
	return formattedDate;
 }
 
 function stringToWordsArray(inputString:string) {
	// Remove symbols ( ) /
	const sanitizedString = inputString.replace(/[()\/-]/g, ' ');
	// Replace accented characters with _
	const stringWithoutAccents = sanitizedString.replace(/[ãÃáÁéÉíÍóÓúÚ]/g, '_');
	// Split the sanitized string into an array of words
	const resultArray = stringWithoutAccents.split(/\s+/);
 
	return resultArray;
 }
 
 function sleep(ms:any) {
	return new Promise(resolve => setTimeout(resolve, ms));
 }
 
 function removeAccents(str:string) {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
 }
 
 function chunkArray(array:any, size:number) {
	return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
	    array.slice(i * size, i * size + size)
	);
 }
 
 function splitMessage(text:string, maxLength:number, maxNewlines:number) {
	const parts = [];
	while (text.length > 0) {
	    let part = text.substring(0, maxLength);
 
	    if (!part.endsWith("\n")) {
		   const lastNewlineIndex = part.lastIndexOf("\n");
		   if (lastNewlineIndex !== -1) {
			  part = part.substring(0, lastNewlineIndex + 1);
		   }
	    }
 
	    const newlineCount = (part.match(/\n/g) || []).length;
	    if (newlineCount >= maxNewlines) {
		   const splitIndex = part.lastIndexOf("\n") + 1;
		   parts.push(part.substring(0, splitIndex));
		   text = text.substring(splitIndex);
	    } else {
		   parts.push(part);
		   text = text.substring(part.length);
	    }
	}
	return parts;
 }
 
 async function removeOldMessages(env:any) {
	const now = Math.floor(Date.now() / 1000);
	const old = now - 60;
 
	try {
	    const query = 'SELECT id_msg FROM tg_bot WHERE msg_date < ?';
	    const data = await env.DB.prepare(query).bind(old).all();
	    const messageIds = data.results.map((row: any ) => row.id_msg);
 
	    if (messageIds.length === 0) return;
 
	    const chunks = chunkArray(messageIds, 100);
 
	    for (const chunk of chunks) {
		   await tgDeleteMessages(env, chunk);
	    }
 
	    const deleteQuery = 'DELETE FROM tg_bot WHERE id_msg IN (SELECT id_msg FROM tg_bot WHERE msg_date < ?)';
	    await env.DB.prepare(deleteQuery).bind(old).run();
	} catch (error) {
	    console.error('Error during removeOldMessages operation:', error);
	}
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // telegram functions
 
 class tg{
	env
	token
	constructor(env:any,token:any){
	    this.env = env;
	    this.token=token;
	}
 
 }
 
 

 
 async function tgMessage(env:any, text:string) {
	const parts = splitMessage(text, 4096, 100);
	const responses = [];
 
	for (const part of parts) {
	    const response = await tgSendMessage(env, part);
	    responses.push(Number(response.result.message_id));
	}
 
	return responses;
 }
 
 async function tgSendMedia(env:any, media:any) {
	return await tgSendRequest('sendMediaGroup', env, {
	    chat_id: env.TG_CHATID,
	    message_thread_id: env.TG_THREADBOT,
	    media,
	    disable_notification: 'true'
	});
 }
 

 async function tgSendMessageThread(env:any, text:string, id_thread:any, id_msg:any) {
	return await tgSendRequest('sendMessage', env, {
	    chat_id: env.TG_CHATID,
	    message_thread_id: id_thread,
	    text,
	    parse_mode: 'html',
	    disable_notification: 'true',
	    reply_to_message_id: id_msg
	});
 }
 
 async function tgDeleteMessage(env:any, message_id:any) {
	return await tgSendRequest('deleteMessage', env, {
	    chat_id: env.TG_CHATID,
	    message_id
	});
 }
 
 async function tgDeleteMessages(env:any, chunk:any) {
	try {
	    const deleteParams = { chat_id: env.TG_CHATID, message_ids: chunk };
	    const response = await fetch(tgApiUrl('deleteMessages', env.TG_TOKEN), {
		   method: 'POST',
		   headers: { 'Content-Type': 'application/json' },
		   body: JSON.stringify(deleteParams)
	    });
 
	    const result:any = await response.json();
	    if (!result.ok) {
		   throw new Error(`Failed to delete messages: ${result.description}`);
	    }
	} catch (error) {
	    console.error('Error deleting messages:', error);
	}
 }
 
 async function tgButton(env:any, buttons:string[], text:string) {
	const batchSize = 90;
	const responses = [];
 
	for (let i = 0; i < buttons.length; i += batchSize) {
	    const batch = buttons.slice(i, i + batchSize);
	    const response = await tgSendButton(env, batch, text);
	    responses.push(Number(response.result.message_id));
	}
 
	return responses;
 }
 
 async function tgSendButton(env:any, buttons:any, text:any) {
	return await tgSendRequest('sendMessage', env, {
	    chat_id: env.TG_CHATID,
	    message_thread_id: env.TG_THREADBOT,
	    reply_markup: JSON.stringify({ inline_keyboard: buttons }),
	    text,
	    disable_notification: 'true'
	});
 }
 
 async function tgAnswerCallbackQuery(env:any, callbackQueryId:any, text:string|null = null) {
	const params:any = { callback_query_id: callbackQueryId };
	if (text) params.text = text;
 
	return await tgSendRequest('answerCallbackQuery', env, params);
 }
 
  
 ///////////////////////////////////////////////////////////////////////////////
 // Classes
 /**
  * Telegram message
  */
 class Message {

	chat_id:any;
	id_msg:any;
	id_thread:any;
	id_user:any;
	username:any;
	first_name:any;
	msg_date:any;
	operation:any;
	msg_txt:string='';
	td: 0 | 1 = 0;
	td_rp: 0 | 1 = 0;
	file_id:any;
	file_unique_id:any;
	type:any;
	caption:any;
	media_group_id:any;
	deleted:any;
	threadname:any;

	constructor(msgJson:any) {
	    this.chat_id = msgJson.chat.id;
	    this.id_msg = msgJson.message_id;
	    this.id_thread = ('is_topic_message' in msgJson) ? msgJson.message_thread_id : "10227";
	    this.id_user = msgJson.from.id;
	    this.username = ('username' in msgJson.from) ? msgJson.from.username : "Sem usuário";
	    let name = (msgJson.from.first_name || '') + (msgJson.from.last_name ? ' ' + msgJson.from.last_name : '');
	    this.first_name = name.trim();
	    this.msg_date = msgJson.date;
	    this.operation = 'no_operation';
 
	    if ('text' in msgJson || 'video' in msgJson || 'photo' in msgJson || 'document' in msgJson || 'voice' in msgJson || 'poll' in msgJson || 'location' in msgJson) {    
		   this.msg_txt = 'new_post'
		   if ('text' in msgJson) {
			  this.operation = 'new_post';
			  this.msg_txt = msgJson.text;
			  this.td = checkTD(msgJson.text);
			  this.td_rp = checkRP(msgJson.text);
		   }
 
		   if ('photo' in msgJson || 'video' in msgJson) {
			  this.operation = 'new_media';
			  if ('photo' in msgJson) {
				 const lastPhoto = msgJson.photo[msgJson.photo.length - 1];
				 this.file_id = lastPhoto.file_id;
				 this.file_unique_id = lastPhoto.file_unique_id;
				 this.type = 1;
			  }
			  if ('video' in msgJson) {
				 this.file_id = msgJson.video.file_id;
				 this.file_unique_id = msgJson.video.file_unique_id;
				 this.type = 2;
			  }
			  if ('caption' in msgJson)
				 this.caption = msgJson.caption;
			  else
				 this.caption = 0;
			  if ('media_group_id' in msgJson)
				 this.media_group_id = msgJson.media_group_id;
			  else
				 this.media_group_id = msgJson.message_id;
		   }
		   this.deleted = 0;
	    } else {
		   if ('message_thread_id' in msgJson) {
			  this.msg_txt = "update_thread";
			  this.id_thread = msgJson.message_thread_id;
 
			  if ('forum_topic_created' in msgJson) {
				 this.threadname = msgJson.forum_topic_created.name;
				 this.operation = "create_thread";
			  } else if ('forum_topic_edited' in msgJson) {
				 this.threadname = msgJson.forum_topic_edited.name;
				 this.operation = "update_thread";
			  }
		   }
	    }
	}
 }
 
 class EditedMessage {
	id_msg:any;
	id_user:any;
	id_thread:any;
	deleted:any;
	operation:any;
	msg_txt:string='';
	td: 0 | 1 = 0;
	td_rp: 0 | 1 = 0;
	file_id:any;
	file_unique_id:any;
	type:any;
	caption:any;
	media_group_id:any;

	constructor(msgJson:any) {
	    this.id_msg = msgJson.message_id;
	    this.id_user = msgJson.from.id;
	    this.id_thread = msgJson.message_thread_id;
	    this.deleted = 0;
	    this.operation = 'no_operation';
 
	    if ('text' in msgJson) {
		   this.operation = 'edit_post';
		   this.msg_txt = msgJson.text;
		   this.td = checkTD(msgJson.text);
		   this.td_rp = checkRP(msgJson.text);
	    }
	    if ('photo' in msgJson || 'video' in msgJson) {
		   this.operation = 'edit_media';
		   if ('photo' in msgJson) {
			  const lastPhoto = msgJson.photo[msgJson.photo.length - 1];
			  this.file_id = lastPhoto.file_id;
			  this.file_unique_id = lastPhoto.file_unique_id;
			  this.type = 1;
		   }
		   if ('video' in msgJson) {
			  this.file_id = msgJson.video.file_id;
			  this.file_unique_id = msgJson.video.file_unique_id;
			  this.type = 2;
		   }
		   if ('caption' in msgJson)
			  this.caption = msgJson.caption;
		   else
			  this.caption = 0;
		   if ('media_group_id' in msgJson)
			  this.media_group_id = msgJson.media_group_id;
		   else
			  this.media_group_id = msgJson.message_id;
	    }
	}
 }  
 
 ///////////////////////////////////////////////////////////////////////////////
 