import {
  pgTable, serial, varchar, text, integer,
  boolean, timestamp,
} from "drizzle-orm/pg-core";

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  operator: varchar("operator", { length: 50 }).notNull(),
  operatorSlug: varchar("operator_slug", { length: 50 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("fiber"),
  name: varchar("name", { length: 150 }).notNull(),
  downloadSpeed: integer("download_speed").notNull(),
  uploadSpeed: integer("upload_speed"),
  priceMonthly: integer("price_monthly").notNull(),
  previousPrice: integer("previous_price"),
  priceNoCommitment: integer("price_no_commitment"),
  commitmentMonths: integer("commitment_months").default(24),
  dataLimit: varchar("data_limit", { length: 50 }).default("Limitsiz"),
  modemIncluded: boolean("modem_included").default(true),
  installationFee: integer("installation_fee").default(0),
  features: text("features"),
  isFeatured: boolean("is_featured").default(false),
  priceChanged: boolean("price_changed").default(false),
  priceChangeDirection: varchar("price_change_direction", { length: 4 }).default("none"), // up | down | none
  lastScrapedAt: timestamp("last_scraped_at"),
  affiliateUrl: varchar("affiliate_url", { length: 500 }),
  officialUrl: varchar("official_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mobileTariffs = pgTable("mobile_tariffs", {
  id: serial("id").primaryKey(),
  operator: varchar("operator", { length: 50 }).notNull(),
  operatorSlug: varchar("operator_slug", { length: 50 }).notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  gbLimit: integer("gb_limit"),
  minuteLimit: integer("minute_limit"),
  smsLimit: integer("sms_limit"),
  priceMonthly: integer("price_monthly").notNull(),
  previousPrice: integer("previous_price"),
  pricePrePaid: integer("price_pre_paid"),
  isContract: boolean("is_contract").default(true),
  hasFiber: boolean("has_fiber").default(false),
  features: text("features"),
  isFeatured: boolean("is_featured").default(false),
  priceChanged: boolean("price_changed").default(false),
  priceChangeDirection: varchar("price_change_direction", { length: 4 }).default("none"),
  lastScrapedAt: timestamp("last_scraped_at"),
  affiliateUrl: varchar("affiliate_url", { length: 500 }),
  officialUrl: varchar("official_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  tags: text("tags"),
  coverImage: varchar("cover_image", { length: 500 }),
  author: varchar("author", { length: 100 }).default("Editör"),
  isPublished: boolean("is_published").default(false).notNull(),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const speedTests = pgTable("speed_tests", {
  id: serial("id").primaryKey(),
  downloadSpeed: integer("download_speed").notNull(),
  uploadSpeed: integer("upload_speed").notNull(),
  ping: integer("ping").notNull(),
  isp: varchar("isp", { length: 100 }),
  city: varchar("city", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  city: varchar("city", { length: 50 }),
  packageInterest: varchar("package_interest", { length: 150 }),
  source: varchar("source", { length: 100 }).default("tarifesec"),
  isContacted: boolean("is_contacted").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scrapeLog = pgTable("scrape_log", {
  id: serial("id").primaryKey(),
  operator: varchar("operator", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // success | error | partial
  packagesFound: integer("packages_found").default(0),
  priceChanges: integer("price_changes").default(0),
  errorMessage: text("error_message"),
  durationMs: integer("duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;
export type MobileTariff = typeof mobileTariffs.$inferSelect;
export type InsertMobileTariff = typeof mobileTariffs.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type ScrapeLog = typeof scrapeLog.$inferSelect;
