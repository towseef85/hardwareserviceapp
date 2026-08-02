CREATE TYPE "public"."service_status" AS ENUM('created', 'working', 'tested', 'completed', 'delivered');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"store_id" integer NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"mobile" varchar(30) NOT NULL,
	"email" varchar(255),
	"address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "service_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"store_id" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "services_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(80) NOT NULL,
	"store_id" integer NOT NULL,
	"service_type_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"description" text,
	"status" "service_status" DEFAULT 'created' NOT NULL,
	"assigned_technician_id" integer,
	"created_by_app_user_id" integer NOT NULL,
	"completed_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_types" ADD CONSTRAINT "service_types_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_service_type_id_service_types_id_fk" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_assigned_technician_id_app_users_id_fk" FOREIGN KEY ("assigned_technician_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_created_by_app_user_id_app_users_id_fk" FOREIGN KEY ("created_by_app_user_id") REFERENCES "public"."app_users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "customers_store_mobile_unique_idx" ON "customers" USING btree ("store_id","mobile");--> statement-breakpoint
CREATE INDEX "customers_store_id_idx" ON "customers" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_types_store_name_unique_idx" ON "service_types" USING btree ("store_id","name");--> statement-breakpoint
CREATE INDEX "service_types_store_id_idx" ON "service_types" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "services_code_unique_idx" ON "services" USING btree ("code");--> statement-breakpoint
CREATE INDEX "services_store_id_idx" ON "services" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "services_service_type_id_idx" ON "services" USING btree ("service_type_id");--> statement-breakpoint
CREATE INDEX "services_customer_id_idx" ON "services" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "services_assigned_technician_id_idx" ON "services" USING btree ("assigned_technician_id");--> statement-breakpoint
CREATE INDEX "services_status_idx" ON "services" USING btree ("status");