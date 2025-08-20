ALTER TABLE "user_preferences" ADD COLUMN "default_sources" text[];--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "default_sort" text DEFAULT 'price';--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "default_sort_direction" text DEFAULT 'asc';--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "default_filters" jsonb;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "saved_searches" jsonb;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "search_history" jsonb;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "alert_frequency" text DEFAULT 'immediate';--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "price_change_threshold" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "max_alerts_per_day" integer DEFAULT 10;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD COLUMN "alert_categories" text[];