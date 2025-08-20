import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const availabilityEnum = pgEnum("availability", [
  "in_stock",
  "out_of_stock",
  "limited",
  "unknown",
]);
export const sourceCategoryEnum = pgEnum("source_category", [
  "popular",
  "alternative",
]);

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  normalizedName: text("normalized_name").notNull(),
  category: text("category"),
  specifications: jsonb("specifications"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sources table
export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: sourceCategoryEnum("category").notNull().default("alternative"),
  isActive: boolean("is_active").notNull().default(true),
  lastSuccessfulScrape: timestamp("last_successful_scrape"),
  errorCount: integer("error_count").notNull().default(0),
  averageResponseTime: integer("average_response_time"),
  configuration: jsonb("configuration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product Listings table
export const productListings = pgTable("product_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  price: integer("price").notNull(), // Store in cents to avoid floating point issues
  currency: text("currency").notNull().default("USD"),
  availability: availabilityEnum("availability").notNull().default("unknown"),
  imageUrl: text("image_url"),
  rating: integer("rating"),
  reviewCount: integer("review_count"),
  lastScraped: timestamp("last_scraped").notNull().defaultNow(),
  isValid: boolean("is_valid").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Anonymous Price Alerts table
export const anonymousPriceAlerts = pgTable(
  "anonymous_price_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    targetPrice: integer("target_price").notNull(), // Store in cents
    currency: text("currency").notNull().default("USD"),
    alertType: text("alert_type").notNull().default("below"), // below, above, percentage
    threshold: integer("threshold"), // For percentage-based alerts
    verificationToken: text("verification_token").notNull().unique(),
    managementToken: text("management_token").notNull().unique(),
    isVerified: boolean("is_verified").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      uqEmailProductActive: uniqueIndex(
        "uq_anonymous_alert_email_product_active"
      ).on(table.email, table.productId, table.isActive),
      idxByProductActive: index("idx_anonymous_alert_product_active").on(
        table.productId,
        table.isActive
      ),
      idxByEmail: index("idx_anonymous_alert_email").on(table.email),
    };
  }
);

// Searches table
export const searches = pgTable("searches", {
  id: uuid("id").primaryKey().defaultRandom(),
  query: text("query").notNull(),
  metadata: jsonb("metadata").notNull(), // Store search metadata as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Search Results junction table
export const searchResults = pgTable("search_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  searchId: uuid("search_id")
    .notNull()
    .references(() => searches.id, { onDelete: "cascade" }),
  productListingId: uuid("product_listing_id")
    .notNull()
    .references(() => productListings.id, { onDelete: "cascade" }),
  rank: integer("rank").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Advertisements table
export const advertisements = pgTable("advertisements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  targetUrl: text("target_url").notNull(),
  category: text("category").notNull(),
  keywords: text("keywords").array().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  listings: many(productListings),
  anonymousAlerts: many(anonymousPriceAlerts),
}));

export const sourcesRelations = relations(sources, ({ many }) => ({
  listings: many(productListings),
}));

export const productListingsRelations = relations(
  productListings,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productListings.productId],
      references: [products.id],
    }),
    source: one(sources, {
      fields: [productListings.sourceId],
      references: [sources.id],
    }),
    searchResults: many(searchResults),
  })
);

export const searchesRelations = relations(searches, ({ many }) => ({
  searchResults: many(searchResults),
}));

export const searchResultsRelations = relations(searchResults, ({ one }) => ({
  search: one(searches, {
    fields: [searchResults.searchId],
    references: [searches.id],
  }),
  productListing: one(productListings, {
    fields: [searchResults.productListingId],
    references: [productListings.id],
  }),
}));

export const anonymousPriceAlertsRelations = relations(
  anonymousPriceAlerts,
  ({ one }) => ({
    product: one(products, {
      fields: [anonymousPriceAlerts.productId],
      references: [products.id],
    }),
  })
);

// ===== Authentication & Notifications (minimal schemas to satisfy services) =====

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  verificationExpires: timestamp("verification_expires"),
  resetToken: text("reset_token"),
  resetExpires: timestamp("reset_expires"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User sessions
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OAuth accounts
export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    scope: text("scope"),
    expiresAt: timestamp("expires_at"),
  },
  (t) => ({
    uqProviderUser: uniqueIndex("uq_oauth_provider_user").on(
      t.provider,
      t.providerUserId
    ),
  })
);

// User preferences
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  notificationEmail: boolean("notification_email").notNull().default(true),
  notificationPush: boolean("notification_push").notNull().default(true),
  quietHoursStart: text("quiet_hours_start"),
  quietHoursEnd: text("quiet_hours_end"),
  timezone: text("timezone").notNull().default("UTC"),
  language: text("language").notNull().default("en"),
  currency: text("currency").notNull().default("USD"),
  // Search preferences
  defaultSources: text("default_sources").array(),
  defaultSort: text("default_sort"),
  defaultSortDirection: text("default_sort_direction"),
  defaultFilters: jsonb("default_filters"),
  savedSearches: jsonb("saved_searches"),
  searchHistory: jsonb("search_history"),
  // Alert preferences
  alertFrequency: text("alert_frequency"),
  priceChangeThreshold: integer("price_change_threshold"),
  maxAlertsPerDay: integer("max_alerts_per_day"),
  alertCategories: jsonb("alert_categories"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Price alerts (for authenticated users)
export const priceAlerts = pgTable("price_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  targetPrice: integer("target_price").notNull(),
  currency: text("currency").notNull().default("USD"),
  alertType: text("alert_type").notNull().default("below"),
  threshold: integer("threshold"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
