CREATE TABLE "app_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "app_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"full_name" varchar(150) NOT NULL,
	"contact" varchar(30),
	"email" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"store_id" integer NOT NULL,
	"auth_user_id" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "app_users_email_unique_idx" ON "app_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "app_users_username_unique_idx" ON "app_users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "app_users_auth_user_id_unique_idx" ON "app_users" USING btree ("auth_user_id");--> statement-breakpoint
CREATE INDEX "app_users_store_id_idx" ON "app_users" USING btree ("store_id");