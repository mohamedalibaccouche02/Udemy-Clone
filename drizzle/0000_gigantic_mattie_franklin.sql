CREATE TABLE "udemyclone_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "udemyclone_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "udemyclone_category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "udemyclone_chapter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"video_url" text,
	"position" integer NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "udemyclone_course" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"price" real,
	"is_published" boolean DEFAULT false NOT NULL,
	"category_id" uuid,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "udemyclone_mux_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" varchar(255) NOT NULL,
	"playback_id" varchar(255),
	"chapter_id" uuid NOT NULL,
	CONSTRAINT "udemyclone_mux_data_chapter_id_unique" UNIQUE("chapter_id")
);
--> statement-breakpoint
CREATE TABLE "udemyclone_purchase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "purchase_user_id_course_id" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "udemyclone_stripe_customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "udemyclone_stripe_customer_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "udemyclone_stripe_customer_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "udemyclone_user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"chapter_id" uuid NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "user_progress_user_id_chapter_id" UNIQUE("user_id","chapter_id")
);
--> statement-breakpoint
ALTER TABLE "udemyclone_attachment" ADD CONSTRAINT "udemyclone_attachment_course_id_udemyclone_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."udemyclone_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "udemyclone_chapter" ADD CONSTRAINT "udemyclone_chapter_course_id_udemyclone_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."udemyclone_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "udemyclone_course" ADD CONSTRAINT "udemyclone_course_category_id_udemyclone_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."udemyclone_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "udemyclone_mux_data" ADD CONSTRAINT "udemyclone_mux_data_chapter_id_udemyclone_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."udemyclone_chapter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "udemyclone_purchase" ADD CONSTRAINT "udemyclone_purchase_course_id_udemyclone_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."udemyclone_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "udemyclone_user_progress" ADD CONSTRAINT "udemyclone_user_progress_chapter_id_udemyclone_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."udemyclone_chapter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachment_course_id_idx" ON "udemyclone_attachment" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "chapter_course_id_idx" ON "udemyclone_chapter" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_category_id_idx" ON "udemyclone_course" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "course_title_idx" ON "udemyclone_course" USING gin (to_tsvector('english', "title"));--> statement-breakpoint
CREATE INDEX "purchase_course_id_idx" ON "udemyclone_purchase" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "user_progress_chapter_id_idx" ON "udemyclone_user_progress" USING btree ("chapter_id");