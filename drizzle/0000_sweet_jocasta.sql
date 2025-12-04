CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"amount" real NOT NULL,
	"description" text,
	"currency" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"image" text,
	"category" text DEFAULT 'other' NOT NULL,
	"merchant" text,
	"card_number" text,
	"card_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"size" integer NOT NULL,
	"type" text NOT NULL,
	"path" text NOT NULL,
	"status" text DEFAULT 'pending',
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_id_index" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_id_timestamp_index" ON "transactions" USING btree ("user_id","timestamp");--> statement-breakpoint
CREATE INDEX "user_id_status_index" ON "images" USING btree ("user_id","status");