import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "src/lib/roles"; // assuming you defined it here

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();
  const authorized = await isAdmin();

  if (!authorized) {
    redirect("/");
  }

  return <>{children}</>;
};

export default AdminLayout;
