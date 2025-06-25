CREATE TABLE "udemyclone_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'student' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "udemyclone_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "udemyclone_user" USING btree ("email");