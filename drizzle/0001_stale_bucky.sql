CREATE TABLE IF NOT EXISTS "notes-topics-app_notes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notes-topics-app_notes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"body" json,
	"topic_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes-topics-app_topics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notes-topics-app_topics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"parent_id" integer,
	"user_id" varchar(255) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes-topics-app_notes" ADD CONSTRAINT "notes-topics-app_notes_topic_id_notes-topics-app_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."notes-topics-app_topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes-topics-app_topics" ADD CONSTRAINT "notes-topics-app_topics_user_id_notes-topics-app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."notes-topics-app_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
