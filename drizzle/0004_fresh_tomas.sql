CREATE INDEX "email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_id_index" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_id_timestamp_index" ON "transactions" USING btree ("user_id","timestamp");--> statement-breakpoint
CREATE INDEX "user_id_status_index" ON "images" USING btree ("user_id","status");