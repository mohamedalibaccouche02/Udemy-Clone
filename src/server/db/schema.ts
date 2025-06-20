import { sql } from "drizzle-orm";
import { index, pgTableCreator, uuid, varchar, text, real, boolean, integer, timestamp, unique} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// Multi-project schema prefix
export const createTable = pgTableCreator((name) => `udemyclone_${name}`);

export const courses = createTable(
  "course",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 255 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    price: real("price"),
    isPublished: boolean("is_published").notNull().default(false),
    categoryId: uuid("category_id").references(() => categories.id),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [
    index("course_category_id_idx").on(table.categoryId),
    index("course_title_idx").using("gin", sql`to_tsvector('english', ${table.title})`),
  ],
);

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  chapters: many(chapters),
  attachments: many(attachments),
  purchases: many(purchases),
}));

export const categories = createTable(
  "category",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull().unique(),
  },
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}));

export const attachments = createTable(
  "attachment",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    url: text("url").notNull(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [index("attachment_course_id_idx").on(table.courseId)],
);

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  course: one(courses, {
    fields: [attachments.courseId],
    references: [courses.id],
  }),
}));

export const chapters = createTable(
  "chapter",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    videoUrl: text("video_url"),
    position: integer("position").notNull(),
    isPublished: boolean("is_published").notNull().default(false),
    isFree: boolean("is_free").notNull().default(false),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [index("chapter_course_id_idx").on(table.courseId)],
);

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  course: one(courses, {
    fields: [chapters.courseId],
    references: [courses.id],
  }),
  muxData: one(muxData),
  userProgress: many(userProgress),
}));

export const muxData = createTable(
  "mux_data",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    assetId: varchar("asset_id", { length: 255 }).notNull(),
    playbackId: varchar("playback_id", { length: 255 }),
    chapterId: uuid("chapter_id").notNull().unique().references(() => chapters.id, { onDelete: "cascade" }),
  },
);

export const muxDataRelations = relations(muxData, ({ one }) => ({
  chapter: one(chapters, {
    fields: [muxData.chapterId],
    references: [chapters.id],
  }),
}));

export const userProgress = createTable(
  "user_progress",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 255 }).notNull(),
    chapterId: uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
    isCompleted: boolean("is_completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [
    unique("user_progress_user_id_chapter_id").on(table.userId, table.chapterId),
    index("user_progress_chapter_id_idx").on(table.chapterId),
  ],
);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  chapter: one(chapters, {
    fields: [userProgress.chapterId],
    references: [chapters.id],
  }),
}));

export const purchases = createTable(
  "purchase",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 255 }).notNull(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [
    unique("purchase_user_id_course_id").on(table.userId, table.courseId),
    index("purchase_course_id_idx").on(table.courseId),
  ],
);

export const purchasesRelations = relations(purchases, ({ one }) => ({
  course: one(courses, {
    fields: [purchases.courseId],
    references: [courses.id],
  }),
}));

export const stripeCustomers = createTable(
  "stripe_customer",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id", { length: 255 }).notNull().unique(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
);

export const stripeCustomersRelations = relations(stripeCustomers, () => ({}));