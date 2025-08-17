ALTER TABLE "users" ADD COLUMN "verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_expires" timestamp;