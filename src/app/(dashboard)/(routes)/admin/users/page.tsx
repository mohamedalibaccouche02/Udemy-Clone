import { db } from "src/server/db";
import { users } from "src/server/db/schema";
import { desc } from "drizzle-orm";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";

const AdminUsersPage = async () => {
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));

  const safeUsers = allUsers.map((user) => ({
    ...user,
    role: user.role as "admin" | "teacher" | "student", // ✅ cast here
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    updatedAt: user.updatedAt instanceof Date && user.updatedAt !== null ? user.updatedAt.toISOString() : user.updatedAt,
  }));

  return (
    <div className="p-6">
      <DataTable columns={columns} data={safeUsers} />
    </div>
  );
};

export default AdminUsersPage;
