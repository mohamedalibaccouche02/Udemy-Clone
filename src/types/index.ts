// src/types/index.ts
import type { CourseWithRelations } from "src/server/db";

export type CourseWithProgressWithCategory = CourseWithRelations & {
  progress: number | null;
};