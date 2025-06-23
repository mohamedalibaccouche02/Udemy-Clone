import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { isTeacher } from "src/lib/teacher";

/*
	This layout will not replace the app/(dashboard)/layout.tsx. We only want
	a teacher to be the the one that will be allowed to access the /teacher
	route
*/
const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
	const { userId } = await auth();

	if (!isTeacher(userId)) {
		redirect("/"); // no need to return here
	}

	return <>{children}</>;
};

export default TeacherLayout;
