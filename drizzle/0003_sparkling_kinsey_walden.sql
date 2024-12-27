ALTER TABLE "notes-topics-app_notes" DROP CONSTRAINT "notes-topics-app_notes_topic_id_notes-topics-app_topics_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes-topics-app_notes" ADD CONSTRAINT "notes-topics-app_notes_topic_id_notes-topics-app_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."notes-topics-app_topics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes-topics-app_topics" ADD CONSTRAINT "notes-topics-app_topics_parent_id_notes-topics-app_topics_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes-topics-app_topics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
