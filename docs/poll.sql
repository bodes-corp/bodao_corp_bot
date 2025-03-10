


CREATE TABLE IF NOT EXISTS [tg_poll] ("id_poll" integer PRIMARY KEY,"media_group_id" integer, "message_thread_id" integer, "question" text, "total_voter_count" integer, is_closed int, is_anonymous int, type int, allows_multiple_answers int);
CREATE TABLE IF NOT EXISTS [tg_poll_options] ("id_option" integer PRIMARY KEY,"id_poll" integer,"text" text, "voter_count" integer);
CREATE TABLE IF NOT EXISTS [tg_poll_media] ("id_poll" integer NOT NULL,"media_group_id" integer NOT NULL,PRIMARY KEY (id_poll, media_group_id));

CREATE INDEX idx_poll_mediagroup ON tg_poll (media_group_id);
CREATE INDEX idx_pool_thread ON tg_poll (message_thread_id);
CREATE INDEX idx_pool_media ON tg_poll_media (id_poll,media_group_id);
