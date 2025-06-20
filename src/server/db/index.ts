import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { env } from "~/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development to avoid creating a new connection on every HMR update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

// Base types
export type Course = InferSelectModel<typeof schema.courses>;
export type NewCourse = InferInsertModel<typeof schema.courses>;
export type Category = InferSelectModel<typeof schema.categories>;
export type NewCategory = InferInsertModel<typeof schema.categories>;
export type Attachment = InferSelectModel<typeof schema.attachments>;
export type NewAttachment = InferInsertModel<typeof schema.attachments>;
export type Chapter = InferSelectModel<typeof schema.chapters>;
export type NewChapter = InferInsertModel<typeof schema.chapters>;
export type MuxData = InferSelectModel<typeof schema.muxData>;
export type NewMuxData = InferInsertModel<typeof schema.muxData>;
export type UserProgress = InferSelectModel<typeof schema.userProgress>;
export type NewUserProgress = InferInsertModel<typeof schema.userProgress>;
export type Purchase = InferSelectModel<typeof schema.purchases>;
export type NewPurchase = InferInsertModel<typeof schema.purchases>;
export type StripeCustomer = InferSelectModel<typeof schema.stripeCustomers>;
export type NewStripeCustomer = InferInsertModel<typeof schema.stripeCustomers>;

// Relational types
export type CourseWithRelations = Course & {
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
  chapter: Chapter;
};
export type PurchaseWithRelations = Purchase & {
  course: Course;
};
export type StripeCustomerWithRelations = StripeCustomer;