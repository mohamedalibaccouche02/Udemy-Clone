"use server";

import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, role: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

  if (!res.ok) throw new Error("Failed to update role");

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/users/${userId}/role`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete user");

  revalidatePath("/admin/users");
}
