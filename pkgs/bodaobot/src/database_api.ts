///////////////////////////////////////////////////////////////////////////////
 // DB inserts/deletes/updates

import { removeAccents, stringToWordsArray } from "./library";
import TG_Message from "./types/TelegramMessage";

 

export class DB_API {


public static async executeQuery(db:any, query:string, params:any[] = [], returnResults = true) {
     if (!db) return Promise.resolve(null);     
     const preparedStatement = db.prepare(query).bind(...params);
      
          if (returnResults) {
              return await preparedStatement.raw(); // For SELECT queries, return the results
          } else {
              return await preparedStatement.run(); // For non-SELECT queries, just execute the query
          }
}

public static async dbInsertBotNotify(env:any, response:any, message_id:any) {
     if (!env.DB) return Promise.resolve(null);      
     const query = `
         INSERT INTO tg_bot (message_id, id_msg_ref) 
         VALUES (?1,?2)
     `;
     await this.executeQuery(env.DB, query, [response, message_id], false);
     return response;
}
 
public static async dbDeleteBotNotify(env:any, array:any[]) {
     if (!env.DB) return Promise.resolve(null);
     const query = `
         DELETE FROM tg_bot
         WHERE message_id =?1;
     `;
 
     try {
         const rows = array.map(message_id => env.DB.prepare(query).bind(message_id));
         await env.DB.batch(rows);
     } catch (e:any) {
         console.error('Error in batch delete bot messages:', e.message);
     }
 }
 
public static async dbBatchInsertBot(env:any, array:any[]) {
     if (!env.DB) return Promise.resolve(null);
     const msg_date = Math.floor(Date.now() / 1000);
     const query = 'INSERT INTO tg_bot (message_id, msg_date) VALUES (?1, ?2)';
     
     try {
         const rows = array.map(message_id => env.DB.prepare(query).bind(message_id, msg_date));
         await env.DB.batch(rows);
     } catch (e:any) {
         console.error('Error in batch inserting bot messages:', e.message);
     }
}
 
public static async dbInsertMessage(env:any, message:TG_Message) {
     if (!env.DB) return Promise.resolve(null);
     if (['update_thread', 'create_thread'].includes(message.operation)) {
         const normalized_threadname = removeAccents(message.threadname);
         const threadQuery = `
             INSERT INTO tg_thread (id_thread, threadname, normalized_threadname) 
             VALUES (?1, ?2, ?3) 
             ON CONFLICT (id_thread) 
             DO UPDATE SET threadname = excluded.threadname, normalized_threadname = excluded.normalized_threadname
         `;
         await this.executeQuery(env.DB, threadQuery, [message.id_thread, message.threadname, normalized_threadname], false);
     }
     
     if (message.operation === 'new_media') {
         const mediaQuery = `
             INSERT INTO tg_media 
             (message_id, file_id, file_unique_id, msg_date, id_user, id_thread, type, deleted, media_group_id)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
         `;
         await this.executeQuery(env.DB, mediaQuery, [
             message.message_id, 
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
             INSERT INTO tg_msg (message_id, msg_txt, msg_date, td, id_user, id_thread, deleted) 
             VALUES (?1,?2,?3,?4,?5,?6,0)
         `;
         await this.executeQuery(env.DB, messageQuery, [
             message.message_id, 
             message.msg_txt,
             message.msg_date,
             message.is_td,
             message.id_user,
             message.id_thread
         ], false);
         
         const userQuery = `
             INSERT INTO tg_user (id_user, username, first_name)
             VALUES (?1, ?2, ?3)
             ON CONFLICT (id_user)
             DO UPDATE SET username = excluded.username, first_name = excluded.first_name
         `;
         await this.executeQuery(env.DB, userQuery, [message.id_user, message.username, message.first_name], false);
     }
 
     return new Response("DB-Insert-ok");
}
 
public static async dbEditMessage(env:any, message:TG_Message) {
     if (!env.DB) return Promise.resolve(null);
     if (message.operation === 'edit_media') {
         const fileQuery = `
             UPDATE tg_media
             SET file_id = ?1,
                 file_unique_id = ?2,
                 type = ?3
             WHERE message_id = ?4
         `;
         await this.executeQuery(env.DB, fileQuery, [
             message.file_id,
             message.file_unique_id,
             message.type,
             message.message_id
         ], false);
 
         const groupQuery = `
             UPDATE tg_media
             SET deleted = ?1
             WHERE media_group_id = ?2
         `;
         await this.executeQuery(env.DB, groupQuery, [
             message.deleted,
             message.media_group_id
         ], false);
     }
 
     if (message.operation === 'edit_post') {
         const messageQuery = `
             UPDATE tg_msg
             SET msg_txt =?1
             WHERE message_id =?2
         `;
         await this.executeQuery(env.DB, messageQuery, [
             message.msg_txt, 
             message.message_id
         ], false);
     }
 
     return new Response("DB-EDIT-ok");
}
 
public static async dbInsertCaption(env:any, media_group_id:any, caption:string) {
 
     const normalized_caption:string = removeAccents(caption);
 
     const query = `
         INSERT INTO tg_caption (media_group_id, caption, normalized_caption)
         VALUES (?1, ?2, ?3)
         ON CONFLICT (media_group_id)
         DO UPDATE SET caption = excluded.caption, normalized_caption = excluded.normalized_caption
     `;
     let params:any[] = [media_group_id, caption, normalized_caption]
     await this.executeQuery(env.DB, query,params , false);
     return caption;
 }
 
public static async dbDeleteCaption(env:any, media_group_id:any) {
     if (!env.DB) return Promise.resolve(null);
     const query = `
         DELETE FROM tg_caption
         WHERE media_group_id =?1
     `;
     await this.executeQuery(env.DB, query, [media_group_id], false);
     return media_group_id;
}


 ///////////////////////////////////////////////////////////////////////////////
 // DB selects
 
 public static async dbSearchThreadname(env:any, threadname:string) {
     if (!env.DB) return Promise.resolve(null);
	const normalized_threadname = removeAccents(threadname);
 
	const threadnameArray = stringToWordsArray(normalized_threadname);
	const likeClauses = threadnameArray
	    .map((_, index) => `normalized_threadname LIKE '%' || ?${index + 1} || '%'`)
	    .join(' AND ');
 
	await env.DB.prepare('PRAGMA case_sensitive_like = true;').run();
 
	const query = `
	    SELECT t.id_thread, MIN(m.message_id), t.threadname 
	    FROM tg_thread t
	    JOIN tg_msg m ON t.id_thread = m.id_thread 
	    WHERE ${likeClauses}
	    GROUP BY t.id_thread 
	    ORDER BY t.threadname COLLATE NOCASE ASC
	`;
 
	return await this.executeQuery(env.DB, query, threadnameArray);
 }
 
 public static async dbSearchTerm(env:any, name:string) {
     if (!env.DB) return Promise.resolve(null);
	const normalized_name = removeAccents(name);
 
	const query = `
	    SELECT
		   id_thread,
		   MIN(message_id),
		   threadname,
		   normalized_threadname
	    FROM (
		   SELECT
			  m.id_thread,
			  m.message_id,
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
 
	return await this.executeQuery(env.DB, query, [normalized_name]);
 }
 
 public static async dbSearchCaption(env:any, mediaGroupId:string) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    SELECT caption
	    FROM tg_caption
	    WHERE media_group_id = ?1;
	`;
	
	return await this.executeQuery(env.DB, query, [mediaGroupId]);
 }
 
 public static async dbSearchNotify(env:any, id_msg_ref:string) {
     if (!env.DB) return Promise.resolve(null);
 
	const query = `
	    WITH MediaGroup AS (
		   SELECT media_group_id
		   FROM tg_media
		   WHERE message_id = ?1
	    ),
	    RelatedMessages AS (
		   SELECT message_id
		   FROM tg_media
		   WHERE media_group_id = (SELECT media_group_id FROM MediaGroup)
	    )
	    SELECT message_id
	    FROM tg_bot
	    WHERE id_msg_ref IN (SELECT message_id FROM RelatedMessages)
	`;
	return await this.executeQuery(env.DB, query, [id_msg_ref]);
 }
 
 public static async dbSearchTDUserThread(env:any, id_user:string, id_thread:string) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    SELECT message_id
	    FROM tg_msg
	    WHERE td = 1
	    AND id_user = ?1
	    AND id_thread = ?2;
	`;
	return await this.executeQuery(env.DB, query, [id_user, id_thread]);
 }
 
 public static async dbListChat(env:any) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    SELECT t.id_thread, MAX(m.message_id), t.threadname
	    FROM tg_thread t
	    JOIN tg_msg m ON t.id_thread = m.id_thread
	    WHERE m.deleted = 0
	    GROUP BY t.id_thread, t.threadname
	    HAVING NOT MAX(m.td = 1)
	    ORDER BY t.normalized_threadname;
	`;
	return await this.executeQuery(env.DB, query, []);
 }
 
 public static async dbListMembers(env:any) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    WITH thread_counts AS (
		   SELECT id_user, COUNT(*) AS thread_count
		   FROM (
			  SELECT m.id_user, m.id_thread, MIN(m.message_id) AS message_id
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
	return await this.executeQuery(env.DB, query, []);
 }
 
 public static async dbListTdGp(env:any) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    SELECT t.threadname, COUNT(*) AS count, t.id_thread, MIN(m.message_id) AS message_id
	    FROM tg_msg m, tg_thread t
	    WHERE m.id_thread = t.id_thread 
	    AND m.td = 1
	    AND m.deleted = 0
	    GROUP BY t.id_thread
	    ORDER BY t.normalized_threadname ASC
	`;
	return await this.executeQuery(env.DB, query, []);
 }
 
 public static async dbListTopGp(env:any) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    SELECT t.id_thread, MIN(m.message_id) AS message_id, t.threadname, COUNT(DISTINCT m.id_user) AS num_distinct_users 
	    FROM tg_msg m, tg_thread t 
	    WHERE m.id_thread = t.id_thread 
	    AND m.td = 1 
	    AND m.deleted = 0
	    GROUP BY t.id_thread 
	    HAVING num_distinct_users > 3 
	    ORDER BY num_distinct_users DESC, t.normalized_threadname ASC
	`;
	return await this.executeQuery(env.DB, query, []);
 }
 
 public static async dbListTopRp(env:any) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    SELECT
	    id_thread,
	    MIN(message_id) AS message_id,
	    threadname,
	    COUNT(*) AS count
	    FROM
		   (
			  SELECT
				 m.id_thread,
				 t.threadname,
				 m.id_user,
				 MIN(m.message_id) AS message_id
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
	return await this.executeQuery(env.DB, query, []);
 }
 
 public static async dbListActiveGp(env:any) {
     if (!env.DB) return Promise.resolve(null);
	const now = Date.now() / 1000;
	const dateOld = now - 10368000;
 
	const query = `
	    SELECT 
		   m.id_thread, 
		   MAX(m.message_id), 
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
	return await this.executeQuery(env.DB, query, [dateOld]);
 }
 
 public static async dbListTrendGp(env:any) {
     if (!env.DB) return Promise.resolve(null);
	const now = Date.now() / 1000;
	const dateOld = now - 10368000;
 
	const query = `
	    SELECT 
		   sub.id_thread,
		   MAX(sub.message_id) AS message_id,
		   sub.threadname 
	    FROM 
		   (
			  SELECT 
				 MAX(m.message_id) AS message_id, 
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
	return await this.executeQuery(env.DB, query, [dateOld]);
 }
 
 public static async dbListSpa(env:any) {
     if (!env.DB) return Promise.resolve(null);
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
	return await this.executeQuery(env.DB, query, []);
 }
 
 public static async dbSearchSpa(env:any, spa:string) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    SELECT
		   t.threadname,
		   t.id_thread,
		   MIN(m.message_id),
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
	return await this.executeQuery(env.DB, query, [spa]);
 }
 
 public static async dbSearchUserData(env:any, id_user:any) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    WITH first_msg AS (
		   SELECT id_thread, 
			  min(message_id) AS message_id, 
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
		   AND m.message_id = fm.message_id
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
 
	return await this.executeQuery(env.DB, query, [id_user]);
 }
 
 public static async dbSearchUserTd (env:any, id_user:any) {
     if (!env.DB) return Promise.resolve(null);
	const query = `
	    SELECT m.id_thread, m.message_id, t.threadname, m.msg_date
	    FROM tg_msg m, tg_thread t
	    WHERE m.id_thread = t.id_thread 
	    AND m.td = 1 
	    AND m.deleted = 0
	    AND m.id_user = ?1
	    ORDER BY m.msg_date DESC
	`;
	return await this.executeQuery(env.DB, query, [id_user]);
 }
 
}
 