import { sql } from "drizzle-orm";
import { index, pgTableCreator, uuid, varchar, text, real, boolean, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Multi-project schema prefix
export const createTable = pgTableCreator((name) => `udemyclone_${name}`);

// Users table
export const users = createTable(
  "user",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(), // Clerk user ID
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: varchar("role", { length: 50 }).notNull().default("student"), // student, teacher, admin
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [index("user_email_idx").on(table.email)],
);

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses, { relationName: "user_courses" }),
  userProgress: many(userProgress, { relationName: "user_progress" }),
  purchases: many(purchases, { relationName: "user_purchases" }),
  stripeCustomers: many(stripeCustomers, { relationName: "user_stripe_customers" }),
}));

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
  user: one(users, {
    fields: [courses.userId],
    references: [users.id],
    relationName: "user_courses",
  }),
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
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
    relationName: "user_progress",
  }),
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
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
    relationName: "user_purchases",
  }),
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

export const stripeCustomersRelations = relations(stripeCustomers, ({ one }) => ({
  user: one(users, {
    fields: [stripeCustomers.userId],
    references: [users.id],
    relationName: "user_stripe_customers",
  }),
}));

// Base types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Course = InferSelectModel<typeof courses>;
export type NewCourse = InferInsertModel<typeof courses>;
export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;
export type Attachment = InferSelectModel<typeof attachments>;
export type NewAttachment = InferInsertModel<typeof attachments>;
export type Chapter = InferSelectModel<typeof chapters>;
export type NewChapter = InferInsertModel<typeof chapters>;
export type MuxData = InferSelectModel<typeof muxData>;
export type NewMuxData = InferInsertModel<typeof muxData>;
export type UserProgress = InferSelectModel<typeof userProgress>;
export type NewUserProgress = InferInsertModel<typeof userProgress>;
export type Purchase = InferSelectModel<typeof purchases>;
export type NewPurchase = InferInsertModel<typeof purchases>;
export type StripeCustomer = InferSelectModel<typeof stripeCustomers>;
export type NewStripeCustomer = InferInsertModel<typeof stripeCustomers>;

// Relational types
export type CourseWithRelations = Course & {
  user: User;
  category: Category | null;
  chapters: Chapter[];
  attachments: Attachment[];
  purchases: Purchase[];
};
export type CategoryWithRelations = Category & {
  courses: Course[];
};
export type AttachmentWithRelations = Attachment & {
  course: Course;
};
export type ChapterWithRelations = Chapter & {
  course: Course;
  muxData: MuxData | null;
  userProgress: UserProgress[];
};
export type MuxDataWithRelations = MuxData & {
  chapter: Chapter;
};
export type UserProgressWithRelations = UserProgress & {
  user: User;
  chapter: Chapter;
};
export type PurchaseWithRelations = Purchase & {
  user: User;
  course: Course;
};
export type StripeCustomerWithRelations = StripeCustomer & {
  user: User;
};