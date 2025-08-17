import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  uuid,
  pgEnum,
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
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "moderator"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: userRoleEnum("role").notNull().default("user"),
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

// User Sessions table
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Price Alerts table
export const priceAlerts = pgTable("price_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  targetPrice: integer("target_price").notNull(), // Store in cents
  currency: text("currency").notNull().default("USD"),
  isActive: boolean("is_active").notNull().default(true),
  alertType: text("alert_type").notNull().default("below"), // below, above, percentage
  threshold: integer("threshold"), // For percentage-based alerts
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Preferences table
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  notificationEmail: boolean("notification_email").notNull().default(true),
  notificationPush: boolean("notification_push").notNull().default(true),
  quietHoursStart: text("quiet_hours_start"), // HH:MM format
  quietHoursEnd: text("quiet_hours_end"), // HH:MM format
  timezone: text("timezone").notNull().default("UTC"),
  language: text("language").notNull().default("en"),
  currency: text("currency").notNull().default("USD"),
  // Search preferences
  defaultSources: text("default_sources").array(), // Array of source IDs
  defaultSort: text("default_sort").default("price"), // price, rating, reviewCount, lastScraped
  defaultSortDirection: text("default_sort_direction").default("asc"), // asc, desc
  defaultFilters: jsonb("default_filters"), // JSON object for default filters
  savedSearches: jsonb("saved_searches"), // Array of saved search objects
  searchHistory: jsonb("search_history"), // Array of search history objects
  // Alert preferences
  alertFrequency: text("alert_frequency").default("immediate"), // immediate, hourly, daily, weekly
  priceChangeThreshold: integer("price_change_threshold").default(5), // Percentage change to trigger alert
  maxAlertsPerDay: integer("max_alerts_per_day").default(10), // Maximum alerts per day
  alertCategories: text("alert_categories").array(), // Array of alert categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
  priceAlerts: many(priceAlerts),
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

// User Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  sessions: many(userSessions),
  priceAlerts: many(priceAlerts),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(users, {
    fields: [priceAlerts.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [priceAlerts.productId],
    references: [products.id],
  }),
}));

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userPreferences.userId],
      references: [users.id],
    }),
  })
);

// OAuth Accounts table
export const oauthAccounts = pgTable("oauth_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'google' | 'apple'
  providerUserId: text("provider_user_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  scope: text("scope"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [oauthAccounts.userId],
    references: [users.id],
  }),
}));
