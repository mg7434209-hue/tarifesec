import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const packageTypeEnum = pgEnum("package_type", [
  "fiber",
  "kablosuz",
  "adsl",
  "mobil",
]);

export const operatorSlugEnum = pgEnum("operator_slug", [
  "superonline",
  "turkcell",
  "vodafone",
  "turk-telekom",
  "turknet",
  "d-smart",
]);

// ─── İnternet paketleri (ev + kablosuz) ──────────────────────────────────────

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  operator: varchar("operator", { length: 50 }).notNull(),
  operatorSlug: varchar("operator_slug", { length: 50 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("fiber"), // fiber | kablosuz | adsl
  name: varchar("name", { length: 150 }).notNull(),
  downloadSpeed: integer("download_speed").notNull(), // Mbps
  uploadSpeed: integer("upload_speed"),
  priceMonthly: integer("price_monthly").notNull(), // TL/ay (taahhütlü)
  priceNoCommitment: integer("price_no_commitment"), // TL/ay (taahhütsüz)
  commitmentMonths: integer("commitment_months").default(24),
  dataLimit: varchar("data_limit", { length: 50 }).default("Limitsiz"),
  modemIncluded: boolean("modem_included").default(true),
  installationFee: integer("installation_fee").default(0),
  features: text("features"), // JSON array: ["WiFi 6", "Limitsiz"]
  isFeatured: boolean("is_featured").default(false), // Superonline için öne çıkar
  affiliateUrl: varchar("affiliate_url", { length: 500 }),
  officialUrl: varchar("official_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Mobil tarifeler ──────────────────────────────────────────────────────────

export const mobileTariffs = pgTable("mobile_tariffs", {
  id: serial("id").primaryKey(),
  operator: varchar("operator", { length: 50 }).notNull(), // Turkcell, Vodafone, Türk Telekom
  operatorSlug: varchar("operator_slug", { length: 50 }).notNull(),
  name: varchar("name", { length: 150 }).notNull(), // "Rahat 10 GB", "Red M"
  gbLimit: integer("gb_limit"), // null = sınırsız
  minuteLimit: integer("minute_limit"), // null = sınırsız
  smsLimit: integer("sms_limit"), // null = sınırsız
  priceMonthly: integer("price_monthly").notNull(), // TL/ay (faturalı)
  pricePrePaid: integer("price_pre_paid"), // TL (faturasız/HazırKart)
  isContract: boolean("is_contract").default(true), // faturalı mı?
  hasFiber: boolean("has_fiber").default(false), // fiber kampanyası var mı?
  features: text("features"), // JSON: ["Bedava sosyal medya", "5G"]
  isFeatured: boolean("is_featured").default(false),
  affiliateUrl: varchar("affiliate_url", { length: 500 }),
  officialUrl: varchar("official_url", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Blog yazıları ────────────────────────────────────────────────────────────

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  tags: text("tags"), // JSON array
  coverImage: varchar("cover_image", { length: 500 }),
  author: varchar("author", { length: 100 }).default("Editör"),
  isPublished: boolean("is_published").default(false).notNull(),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Hız testi sonuçları ──────────────────────────────────────────────────────

export const speedTests = pgTable("speed_tests", {
  id: serial("id").primaryKey(),
  downloadSpeed: integer("download_speed").notNull(),
  uploadSpeed: integer("upload_speed").notNull(),
  ping: integer("ping").notNull(),
  isp: varchar("isp", { length: 100 }),
  city: varchar("city", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Lead formları (Superonline bayi B9613) ───────────────────────────────────

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  city: varchar("city", { length: 50 }),
  packageInterest: varchar("package_interest", { length: 150 }),
  source: varchar("source", { length: 100 }).default("tarifesec"), // UTM source
  isContacted: boolean("is_contacted").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;
export type MobileTariff = typeof mobileTariffs.$inferSelect;
export type InsertMobileTariff = typeof mobileTariffs.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;
export type SpeedTest = typeof speedTests.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
