CREATE TABLE IF NOT EXISTS [tg_forward] ("td" integer,"id_msg" integer);
CREATE TABLE IF NOT EXISTS tg_bot (id_msg integer PRIMARY KEY,msg_date integer, id_msg_ref integer);
CREATE TABLE IF NOT EXISTS tg_thread (id_thread integer PRIMARY KEY,threadname text, normalized_threadname text);
CREATE TABLE IF NOT EXISTS tg_user (id_user integer PRIMARY KEY,username text, first_name text, cim integer, active integer);
CREATE TABLE IF NOT EXISTS tg_msg (id_msg integer PRIMARY KEY,msg_txt text,msg_date integer,td integer,id_user integer,id_thread integer, deleted int);
CREATE TABLE IF NOT EXISTS [tg_media] ("id_msg" integer PRIMARY KEY,"file_id" text,"file_unique_id" text,"msg_date" integer,"id_user" integer,"id_thread" integer, type integer, deleted integer, media_group_id numeric);
CREATE TABLE IF NOT EXISTS [tg_caption] ("media_group_id" integer PRIMARY KEY,"caption" text, normalized_caption TEXT);
CREATE TABLE IF NOT EXISTS d1_kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);


CREATE INDEX idx_threadname_normalized ON tg_thread (normalized_threadname);
CREATE INDEX idx_thread_msg ON tg_msg (id_thread, id_msg);
CREATE INDEX idx_td_deleted_thread ON tg_msg (id_thread, td, deleted);
CREATE INDEX idx_msg_date_td_thread ON tg_msg (msg_date, td, id_thread);
CREATE INDEX idx_media_group ON tg_media (media_group_id, id_msg);
CREATE INDEX idx_user_thread ON tg_msg (id_user, id_thread);
CREATE INDEX idx_msg_ref ON tg_bot (id_msg_ref);
CREATE INDEX idx_user_td_deleted ON tg_msg (id_user, td, deleted);