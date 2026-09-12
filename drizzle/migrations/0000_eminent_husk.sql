CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(300) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"tags" text,
	"cover_image" varchar(500),
	"author" varchar(100) DEFAULT 'Editör',
	"is_published" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"phone" varchar(20) NOT NULL,
	"city" varchar(50),
	"package_interest" varchar(150),
	"source" varchar(100) DEFAULT 'tarifesec',
	"is_contacted" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mobile_tariffs" (
	"id" serial PRIMARY KEY NOT NULL,
	"operator" varchar(50) NOT NULL,
	"operator_slug" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"gb_limit" integer,
	"minute_limit" integer,
	"sms_limit" integer,
	"price_monthly" integer NOT NULL,
	"previous_price" integer,
	"price_pre_paid" integer,
	"is_contract" boolean DEFAULT true,
	"has_fiber" boolean DEFAULT false,
	"features" text,
	"is_featured" boolean DEFAULT false,
	"price_changed" boolean DEFAULT false,
	"price_change_direction" varchar(4) DEFAULT 'none',
	"last_scraped_at" timestamp,
	"affiliate_url" varchar(500),
	"official_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"operator" varchar(50) NOT NULL,
	"operator_slug" varchar(50) NOT NULL,
	"type" varchar(20) DEFAULT 'fiber' NOT NULL,
	"name" varchar(150) NOT NULL,
	"download_speed" integer NOT NULL,
	"upload_speed" integer,
	"price_monthly" integer NOT NULL,
	"previous_price" integer,
	"price_no_commitment" integer,
	"commitment_months" integer DEFAULT 24,
	"data_limit" varchar(50) DEFAULT 'Limitsiz',
	"modem_included" boolean DEFAULT true,
	"installation_fee" integer DEFAULT 0,
	"features" text,
	"is_featured" boolean DEFAULT false,
	"price_changed" boolean DEFAULT false,
	"price_change_direction" varchar(4) DEFAULT 'none',
	"last_scraped_at" timestamp,
	"affiliate_url" varchar(500),
	"official_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scrape_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"operator" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"packages_found" integer DEFAULT 0,
	"price_changes" integer DEFAULT 0,
	"error_message" text,
	"duration_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_counters" (
	"key" varchar(50) PRIMARY KEY NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speed_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"download_speed" integer NOT NULL,
	"upload_speed" integer NOT NULL,
	"ping" integer NOT NULL,
	"isp" varchar(100),
	"city" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visit_days" (
	"day" varchar(10) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
