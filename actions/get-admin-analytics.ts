import { db } from "src/server/db";
import { purchases, courses } from "src/server/db/schema";
import { eq } from "drizzle-orm";

const groupByCourse = (
  purchases: {
    course: {
      title: string;
      price: number | null;
    };
  }[]
) => {
  const grouped: { [courseTitle: string]: number } = {};

  purchases.forEach((purchase) => {
    const title = purchase.course.title;
    const price = purchase.course.price || 0;

    if (!grouped[title]) {
      grouped[title] = 0;
    }

    grouped[title] += price;
  });

  return grouped;
};

export const getAdminAnalytics = async () => {
  try {
    const results = await db
      .select({
        course: {
          title: courses.title,
          price: courses.price,
        },
      })
      .from(purchases)
      .leftJoin(courses, eq(purchases.courseId, courses.id));

    const groupedEarnings = groupByCourse(
      results.filter((r): r is { course: { title: string; price: number | null } } => r.course !== null)
    );

    const data = Object.entries(groupedEarnings).map(
      ([courseTitle, total]) => ({
        name: courseTitle,
        total,
      })
    );

    const totalRevenue = data.reduce((sum, item) => sum + item.total, 0);
    const totalSales = results.length;

    return {
      data,
      totalRevenue,
      totalSales,
    };
  } catch (error) {
    console.error("[GET_ADMIN_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    };
  }
};
