"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SidebarItem } from "./sidebar-item";
import { BarChart, Compass, Layout, List, UsersRound } from "lucide-react";
import { getUserRoleAction } from "actions/get-user-role";

const guestRoutes = [
  { icon: Layout, label: "Dashboard", href: "/" },
  { icon: Compass, label: "Browse", href: "/search" },
];

const teacherRoutes = [
  { icon: List, label: "Courses", href: "/teacher/courses" },
  { icon: BarChart, label: "Analytics", href: "/teacher/analytics" },
];

const adminRoutes = [
  { icon: UsersRound, label: "Users", href: "/admin/users" },
  { icon: List, label: "Courses", href: "/admin/courses" },
  { icon: BarChart, label: "Analytics", href: "/admin/analytics" },
];

export const SidebarRoutes = () => {
  const pathname = usePathname();
  const { userId } = useAuth();

  const [role, setRole] = useState<"admin" | "teacher" | "student" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    getUserRoleAction()
      .then((fetchedRole) => {
        if (fetchedRole && ["admin", "teacher", "student"].includes(fetchedRole)) {
          setRole(fetchedRole as "admin" | "teacher" | "student");
        } else {
          setRole(null);
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return null;

  let routes = guestRoutes;

  // ✅ Only switch to admin sidebar if already on an admin route
  if (pathname?.includes("/admin")) {
    routes = adminRoutes;
  } else if (pathname?.includes("/teacher")) {
    routes = teacherRoutes;
  }

  return (
    <div className="flex flex-col w-full">
      {routes.map((route) => (
        <SidebarItem key={route.href} icon={route.icon} label={route.label} href={route.href} />
      ))}
    </div>
  );
};
