import { db } from "src/server/db";
import { categories } from "src/server/db/schema";
import { asc } from "drizzle-orm";
import { Categories } from "./_components/categories";
import { SearchInput } from "~/components/search-input";
import { getCourses } from "actions/get-courses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursesList } from "~/components/courses-list";

interface SearchPageProps {
  searchParams:{
    title: string;
    categoryId: string;
  }
}
const SearchPage = async ({searchParams}: SearchPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const categoryList = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.name));

    const courses = await getCourses({
       userId,
      ...searchParams, });

  return (<>
  <div className="px-6 pt-6 md:hidden md:mb-0 block">
    <SearchInput />
  </div>
    <div className="p-6 space-y-4">
      <Categories 
      items={categoryList}
      />
      <CoursesList items={courses} />
    </div>
    </>
  );
};

export default SearchPage;
