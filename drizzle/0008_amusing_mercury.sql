CREATE TABLE "service_status_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "service_status_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"service_id" integer NOT NULL,
	"from_status" "service_status",
	"to_status" "service_status" NOT NULL,
	"changed_by_app_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_status_history" ADD CONSTRAINT "service_status_history_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_status_history" ADD CONSTRAINT "service_status_history_changed_by_app_user_id_app_users_id_fk" FOREIGN KEY ("changed_by_app_user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "service_status_history_service_created_idx" ON "service_status_history" USING btree ("service_id","created_at");--> statement-breakpoint
CREATE INDEX "service_status_history_changed_by_idx" ON "service_status_history" USING btree ("changed_by_app_user_id");
--> statement-breakpoint
INSERT INTO "service_status_history" (
	"service_id",
	"from_status",
	"to_status",
	"changed_by_app_user_id",
	"created_at"
)
SELECT
	"id",
	NULL,
	'created'::"service_status",
	"created_by_app_user_id",
	"created_at"
FROM "services";
--> statement-breakpoint
INSERT INTO "service_status_history" (
	"service_id",
	"from_status",
	"to_status",
	"changed_by_app_user_id",
	"created_at"
)
SELECT
	"id",
	'created'::"service_status",
	"status",
	"created_by_app_user_id",
	CASE
		WHEN "status" = 'completed' THEN COALESCE("completed_at", "updated_at")
		ELSE "updated_at"
	END
FROM "services"
WHERE "status" IN ('working', 'tested', 'completed');
--> statement-breakpoint
INSERT INTO "service_status_history" (
	"service_id",
	"from_status",
	"to_status",
	"changed_by_app_user_id",
	"created_at"
)
SELECT
	"id",
	'created'::"service_status",
	'completed'::"service_status",
	"created_by_app_user_id",
	COALESCE("completed_at", "updated_at")
FROM "services"
WHERE "status" = 'delivered';
--> statement-breakpoint
INSERT INTO "service_status_history" (
	"service_id",
	"from_status",
	"to_status",
	"changed_by_app_user_id",
	"created_at"
)
SELECT
	"id",
	'completed'::"service_status",
	'delivered'::"service_status",
	"created_by_app_user_id",
	COALESCE("delivered_at", "updated_at")
FROM "services"
WHERE "status" = 'delivered';
