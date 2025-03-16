///////////////////////////////////////////////////////////////////////////////
 // DB inserts/deletes/updates

import { removeAccents, stringToWordsArray } from "./library";
import TG_BOT from "./telegram_bot";
import { ContextMessage } from "./types/TelegramMessage";
import { mediaType_t, updOperation } from "./types/Types";

 

export class DB_API {


public static async executeQuery(db:any, query:string, params:any[] = [], returnResults = true) {
     if (!db) return Promise.resolve(null);     

	try {
		//console.log('debug from executeQuery -query: ', query)
		const preparedStatement = db.prepare(query).bind(...params);
      
          if (returnResults) {
              return await preparedStatement.raw(); // For SELECT queries, return the results
          } else {
              return await preparedStatement.run(); // For non-SELECT queries, just execute the query
          }
	 } catch (e:any) {
		console.error('Error in DB_API executeQuery:', e.message);
	 }
	
	
}

public static async dbInsertBotNotify(db:any, response:any, id_msg:any) {
     if (!db) return Promise.resolve(null);      
     const query = `
         INSERT INTO tg_bot (id_msg, id_msg_ref) 
         VALUES (?1,?2)
     `;
     await this.executeQuery(db, query, [response, id_msg], false);
     return response;
}
 
public static async dbDeleteBotNotify(db:any, array:any[]) {
     if (!db) return Promise.resolve(null);
     const query = `
         DELETE FROM tg_bot
         WHERE id_msg =?1;
     `;
 
     try {
         const rows = array.map(id_msg => db.prepare(query).bind(id_msg));
         await db.batch(rows);
     } catch (e:any) {
         console.error('Error in batch delete bot messages:', e.message);
     }
 }
 
public static async dbBatchInsertBot(db:any, array:any[]) {
     if (!db) return Promise.resolve(null);
     const msg_date = Math.floor(Date.now() / 1000);
     const query = 'INSERT INTO tg_bot (id_msg, msg_date) VALUES (?1, ?2)';
     
     try {
         const rows = array.map(id_msg => db.prepare(query).bind(id_msg, msg_date));
         await db.batch(rows);
     } catch (e:any) {
         console.error('Error in batch inserting bot messages:', e.message);
     }
}
 
public static async dbInsertMessage(bot:TG_BOT, message:ContextMessage) {
	console.log("log from dbInsertMessage")
	if (!bot.DB) return Promise.resolve(null);
	const operation:any = bot.currentContext.update_operation;
	console.log("operation: ", operation);
     if (operation === updOperation.THREAD_CREATE || operation === updOperation.THREAD_EDIT) {    
		//insert new or edit thread in threads database
		if ([updOperation.THREAD_CREATE, updOperation.THREAD_EDIT].includes(operation)) {
			
			//let message:ContextMessage = bot.currentContext.update_message;
			let threadName = '';
			if (operation === updOperation.THREAD_CREATE){
				threadName =  message.message.forum_topic_created?.name ? message.message.forum_topic_created.name : '';
				console.log("insert topic - threadname: ", threadName) ;
			}else if (operation === updOperation.THREAD_EDIT){
				threadName =  message.message.forum_topic_edited?.name ? message.message.forum_topic_edited.name : '';
				console.log("edit topic - threadname: ", threadName) ;
			}
			
			
			const normalized_threadname =  threadName? removeAccents(threadName):'';
			const threadQuery = `
			INSERT INTO tg_thread (id_thread, threadname, normalized_threadname) 
			VALUES (?1, ?2, ?3) 
			ON CONFLICT (id_thread) 
			DO UPDATE SET threadname = excluded.threadname, normalized_threadname = excluded.normalized_threadname
		`;
		await this.executeQuery(bot.DB, threadQuery, [message.id_thread, threadName, normalized_threadname], false);
		}
	}
	if (operation === updOperation.THREAD_DELETE) { //not supported yet

	}
	
	if (operation === updOperation.MEDIA_NEW || operation === updOperation.DOCUMENT_NEW) {
	    const mediaQuery = `
		   INSERT INTO tg_media 
		   (id_msg, file_id, file_unique_id, msg_date, id_user, id_thread, type, deleted, media_group_id)
		   VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
	    `;
	    await this.executeQuery(bot.DB, mediaQuery, [
		   message.message_id, 
		   message.file_id, 
		   message.file_unique_id, 
		   message.msg_date, 
		   message.id_user, 
		   message.id_thread, 
		   message.media_type, 
		   message.deleted, 
		   message.media_group_id
	    ], false);     
	}
 
	if (operation === updOperation.POST_NEW) {
	    const messageQuery = `
		   INSERT INTO tg_msg (id_msg, msg_txt, msg_date, td, id_user, id_thread, deleted) 
		   VALUES (?1,?2,?3,?4,?5,?6,0)
	    `;
	    	const isTD = bot.currentContext.checkUserOperation('isTD');
          
	    	await this.executeQuery(bot.DB, messageQuery, [
		   message.message_id, 
		   message.msg_txt,
		   message.msg_date,
		   isTD,
		   message.id_user,
		   message.id_thread
	    ], false);
	    
	    await DB_API.dbUpdateUserInfo(bot.DB, message);
	}
 
	return new Response("DB-Insert-ok");
}


public static async dbUpdateUserInfo(db:any, message:ContextMessage){
	const userQuery = `
	INSERT INTO tg_user (id_user, username, first_name, active)
	VALUES (?1, ?2, ?3,1)
	ON CONFLICT (id_user)
	DO UPDATE SET username = excluded.username, first_name = excluded.first_name, active=1
 `;
 await DB_API.executeQuery(db, userQuery, [message.id_user, message.username, message.first_name], false);

}
public static async dbDeactivateUser(db:any, message:ContextMessage){
	const userQuery = `
	 UPDATE tg_user
             SET active = 0
             WHERE id_user = ?1
 `;
 await DB_API.executeQuery(db, userQuery, [message.id_user], false);

}


public static async dbUpdateUsers(db:any, users:tgTypes.User[]){
	if(!Array.isArray(users))  return Promise.resolve()
	else{
	users.forEach(async (user)=> {
		const userQuery = `
			INSERT INTO tg_user (id_user, username, first_name, active)
			VALUES (?1, ?2, ?3,1)
			ON CONFLICT (id_user)
			DO UPDATE SET username = excluded.username, first_name = excluded.first_name, active=1
		`;
		const username = user.username ? user.username : user.first_name;
 		await DB_API.executeQuery(db, userQuery, [user.id, username,username], false);

	})
	}

};

public static async dbUpdateMediaType(bot: TG_BOT,media_type:mediaType_t, message_id:number){
	console.log('debug from dbUpdateMediaType: DocType: ', media_type)
	const fileQuery = `
             UPDATE tg_media
             SET type = ?1
             WHERE id_msg = ?2
         `;
         await this.executeQuery(bot.DB, fileQuery, [
             media_type,
             message_id
         ], false)
}
 
public static async dbEditMessage(bot:TG_BOT, message:ContextMessage) {
     if (!bot.DB) return Promise.resolve(null);
	const operation = bot.currentContext.update_operation;
     if (operation === updOperation.DOC_EDIT){
		const fileQuery = `
		UPDATE tg_media
		SET file_id = ?1,
		    file_unique_id = ?2,
		    type = ?3
		WHERE id_msg = ?4
	 `;
	 await this.executeQuery(bot.DB, fileQuery, [
		message.file_id,
		message.file_unique_id,
		message.media_type,
		message.message_id
	 ], false);

	 const groupQuery = `
		UPDATE tg_media
		SET deleted = ?1
		WHERE media_group_id = ?2
	 `;
	 await this.executeQuery(bot.DB, groupQuery, [
		message.deleted,
		message.media_group_id
	 ], false);
	}
	if (operation === updOperation.MEDIA_EDIT ) {
         const fileQuery = `
             UPDATE tg_media
             SET file_id = ?1,
                 file_unique_id = ?2,
                 type = ?3
             WHERE id_msg = ?4
         `;
         await this.executeQuery(bot.DB, fileQuery, [
             message.file_id,
             message.file_unique_id,
             message.media_type,
             message.message_id
         ], false);
 
         const groupQuery = `
             UPDATE tg_media
             SET deleted = ?1
             WHERE media_group_id = ?2
         `;
         await this.executeQuery(bot.DB, groupQuery, [
             message.deleted,
             message.media_group_id
         ], false);
     }
 
     if (operation === updOperation.POST_EDIT) {
         const messageQuery = `
             UPDATE tg_msg
             SET msg_txt =?1
             WHERE id_msg =?2
         `;
         await this.executeQuery(bot.DB, messageQuery, [
             message.msg_txt, 
             message.message_id
         ], false);
     }
 
     return new Response("DB-EDIT-ok");
}

public static async checkHasPoll(db:any, mediaGroupId:number): Promise<boolean> {
	if(!db || !mediaGroupId) return Promise.resolve(false);
	let apiresponse = false;
	const query = `
	    SELECT *
	    FROM tg_poll_media
	    WHERE media_group_id = ?1;
	`;
	const result = await this.executeQuery(db, query, [mediaGroupId]);
	if (result.length === 0) {
		apiresponse = false;
	} else {
		apiresponse = true;
	}

	return Promise.resolve(apiresponse);
}
public static async dbInsertPoll(db:any,data:tgTypes.Poll , message_thread_id:number,media_group_id:number|null =null){
	const query = `
         INSERT INTO tg_poll (id_poll,  message_thread_id ,question, total_voter_count , is_closed, is_anonymous, type, allows_multiple_answers)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT (id_poll)
         DO UPDATE SET message_thread_id = excluded.message_thread_id ,
          question = excluded.question, 
          total_voter_count = excluded.total_voter_count , 
          is_closed = excluded.is_closed, 
          is_anonymous = excluded.is_anonymous, 
          type = excluded.type, 
          allows_multiple_answers = excluded.allows_multiple_answers
     `;
	let params:any[] = [data.id,  message_thread_id, data.question, data.total_voter_count,(data.is_closed === true? 1:0), (data.is_anonymous  === true? 1:0),data.type, (data.allows_multiple_answers  === true? 1:0)]
     await this.executeQuery(db, query,params , false);

	if(media_group_id){
		const query = `
			INSERT INTO tg_poll_media (id_poll,  media_group_id)
			VALUES (?1, ?2)
			ON CONFLICT DO NOTHING
	    `;
		let params:any[] = [data.id, media_group_id ]
		await this.executeQuery(db, query,params , false);

	}
	return data.id;

}

public static async dbUpdatePoolAnswer(db:any,answers:tgTypes.PollAnswer){
	if(Array.isArray(answers.option_ids)){
		answers.option_ids.forEach(async (id)=>{
			const userQuery = `INSERT INTO tg_poll_answers (id_poll,id_user, id_chat,is_bot,option_index)
         		VALUES (?1, ?2, ?3, ?4,?5)
 			`;
			 const userid = answers.user?.id? answers.user.id:'anonymous';
			 const chatid = answers.voter_chat?.id? answers.voter_chat?.id: "undefined";
			 let params:any[] = [answers.poll_id,userid,chatid,(answers.is_bot?1:0),id ]
			 await this.executeQuery(db, userQuery,params , false);

		})
	}else{
		const userQuery = `INSERT INTO tg_poll_answers (id_poll,id_user, id_chat,is_bot,option_index)
			VALUES (?1, ?2, ?3, ?4,?5)
		`;
		const userid = answers.user?.id? answers.user.id:'anonymous';
		const chatid = answers.voter_chat?.id? answers.voter_chat?.id: "undefined";
		let params:any[] = [answers.poll_id,userid,chatid,(answers.is_bot?1:0),answers.option_ids ]
		await this.executeQuery(db, userQuery,params , false);
	}
	

}

public static async dbUpdatePool(db:any,data:tgTypes.Poll){

}

public static async dbInsertPollOptions(db:any,pollID:number,data:tgTypes.PollOption[]){
	if(!Array.isArray(data)) return Promise.resolve();

	data.forEach(async (option:tgTypes.PollOption,index)=> {
		const query = `
			INSERT INTO tg_poll_options (id_poll,option_index,text,voter_count)
			VALUES (?1, ?2, ?3,?4)
	    `;
		let params:any[] = [pollID,index,option.text, option.voter_count ]
		await this.executeQuery(db, query,params , false);

	})
	

}


 
/**
 * Insert Caption/text to the media
 * @param db the bot db
 * @param media_group_id the media group id to add the caption to
 * @param caption the caption
 * @returns 
 */
public static async dbInsertCaption(db:any, media_group_id:any, caption:string) {
 
     const normalized_caption:string = removeAccents(caption);
 
     const query = `
         INSERT INTO tg_caption (media_group_id, caption, normalized_caption)
         VALUES (?1, ?2, ?3)
         ON CONFLICT (media_group_id)
         DO UPDATE SET caption = excluded.caption, normalized_caption = excluded.normalized_caption
     `;
     let params:any[] = [media_group_id, caption, normalized_caption]
     await this.executeQuery(db, query,params , false);
     return caption;
 }
 
public static async dbDeleteCaption(db:any, media_group_id:any) {
     if (!db) return Promise.resolve(null);
     const query = `
         DELETE FROM tg_caption
         WHERE media_group_id =?1
     `;
     await this.executeQuery(db, query, [media_group_id], false);
     return media_group_id;
}


 ///////////////////////////////////////////////////////////////////////////////
 // DB selects
 
 public static async dbSearchThreadname(db:any, threadname:string) {
     if (!db) return Promise.resolve(null);
	//console.log('log from dbSearchThreadname');
	const normalized_threadname = removeAccents(threadname);
 
	const threadnameArray = stringToWordsArray(normalized_threadname);
	const likeClauses = threadnameArray
	    .map((_, index) => `normalized_threadname LIKE '%' || ?${index + 1} || '%'`)
	    .join(' AND ');
 
	await db.prepare('PRAGMA case_sensitive_like = true;').run();
 
	const query = `
	    SELECT t.id_thread, MIN(m.id_msg), t.threadname 
	    FROM tg_thread t
	    JOIN tg_msg m ON t.id_thread = m.id_thread 
	    WHERE ${likeClauses}
	    GROUP BY t.id_thread 
	    ORDER BY t.threadname COLLATE NOCASE ASC
	`;
 
	return await this.executeQuery(db, query, threadnameArray);
 }
 
 public static async dbSearchTerm(db:any, name:string) {
     if (!db) return Promise.resolve(null);
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
 
	return await this.executeQuery(db, query, [normalized_name]);
 }
 
 public static async dbSearchCaption(db:any, mediaGroupId:string) {
     if (!db) return Promise.resolve(null);
	const query = `
	    SELECT caption
	    FROM tg_caption
	    WHERE media_group_id = ?1;
	`;
	
	return await this.executeQuery(db, query, [mediaGroupId]);
 }
 
 public static async dbSearchNotify(db:any, id_msg_ref:string) {
     if (!db) return Promise.resolve(null);
 
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
	return await this.executeQuery(db, query, [id_msg_ref]);
 }
 
 /**
  * 
  * @param db 
  * @param id_user 
  * @param id_thread 
  * @returns 
  */
 public static async dbSearchTDUserThread(db:any, id_user:string, id_thread:string) {
     if (!db) return Promise.resolve(null);
	const query = `
	    SELECT id_msg
	    FROM tg_msg
	    WHERE td = 1
	    AND id_user = ?1
	    AND id_thread = ?2;
	`;
	return await this.executeQuery(db, query, [id_user, id_thread]);
 }
 
 public static async dbListChat(db:any) {
     if (!db) return Promise.resolve(null);
	const query = `
	    SELECT t.id_thread, MAX(m.id_msg), t.threadname
	    FROM tg_thread t
	    JOIN tg_msg m ON t.id_thread = m.id_thread
	    WHERE m.deleted = 0
	    GROUP BY t.id_thread, t.threadname
	    HAVING NOT MAX(m.td = 1)
	    ORDER BY t.normalized_threadname;
	`;
	return await this.executeQuery(db, query, []);
 }
 
 public static async dbListMembers(db:any) {
     if (!db) return Promise.resolve(null);
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
	return await this.executeQuery(db, query, []);
 }
 
 public static async dbListTdGp(db:any) {
     if (!db) return Promise.resolve(null);
	const query = `
	    SELECT t.threadname, COUNT(*) AS count, t.id_thread, MIN(m.id_msg) AS id_msg
	    FROM tg_msg m, tg_thread t
	    WHERE m.id_thread = t.id_thread 
	    AND m.td = 1
	    AND m.deleted = 0
	    GROUP BY t.id_thread
	    ORDER BY t.normalized_threadname ASC
	`;
	return await this.executeQuery(db, query, []);
 }
 
 public static async dbListTopGp(db:any) {
     if (!db) return Promise.resolve(null);
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
	return await this.executeQuery(db, query, []);
 }
 
 public static async dbListTopRp(db:any) {
     if (!db) return Promise.resolve(null);
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
	return await this.executeQuery(db, query, []);
 }
 
 public static async dbListActiveGp(db:any) {
     if (!db) return Promise.resolve(null);
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
	return await this.executeQuery(db, query, [dateOld]);
 }
 
 public static async dbListTrendGp(db:any) {
     if (!db) return Promise.resolve(null);
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
	return await this.executeQuery(db, query, [dateOld]);
 }
 
 public static async dbListSpa(db:any) {
     if (!db) return Promise.resolve(null);
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
	return await this.executeQuery(db, query, []);
 }
 
 public static async dbSearchSpa(db:any, spa:string) {
     if (!db) return Promise.resolve(null);
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
	return await this.executeQuery(db, query, [spa]);
 }
 
 public static async dbSearchUserData(DB:any, id_user:any) {
     if (!DB) return Promise.resolve(null);
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
 
	return await this.executeQuery(DB, query, [id_user]);
 }
 
 public static async dbSearchUserTd (db:any, id_user:any) {
     if (!db) return Promise.resolve(null);
	const query = `
	    SELECT m.id_thread, m.id_msg, t.threadname, m.msg_date
	    FROM tg_msg m, tg_thread t
	    WHERE m.id_thread = t.id_thread 
	    AND m.td = 1 
	    AND m.deleted = 0
	    AND m.id_user = ?1
	    ORDER BY m.msg_date DESC
	`;
	return await this.executeQuery(db, query, [id_user]);
 }

 /**
 * 
 * @param bot The TG_BOT object
 * @param old cut date
 * @returns 
 */
 public static async deleteMessagesFromDB(db:any, old:number){
	const deleteQuery = 'DELETE FROM tg_bot WHERE id_msg IN (SELECT id_msg FROM tg_bot WHERE msg_date < ?)';
	return await db.prepare(deleteQuery).bind(old).run();
}
 
}
 