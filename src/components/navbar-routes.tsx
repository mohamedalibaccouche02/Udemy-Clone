'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";

import { LogOut } from "lucide-react";
import { Button } from "src/components/ui/button";
import { SearchInput } from "./search-input";

import { getUserRoleAction } from "actions/get-user-role";

const NavbarRoutes = () => {
  const { userId } = useAuth();
  const pathname = usePathname();

  const [role, setRole] = useState<"admin" | "teacher" | "student" | null>(null);

  const isAdminPage = pathname?.startsWith("/admin");
  const isTeacherPage = pathname?.startsWith("/teacher");
  const isCoursePage = pathname?.includes("/courses");
  const isSearchPage = pathname === "/search";
  const isUsersPage = pathname?.includes("/users");

  useEffect(() => {
    const fetchRole = async () => {
      const userRole = await getUserRoleAction();
      if (userRole === "admin" || userRole === "teacher" || userRole === "student" || userRole === null) {
        setRole(userRole);
      } else {
        setRole(null);
      }
    };
    fetchRole();
  }, []);

  return (
    <>
      {isSearchPage && (
        <div className="hidden md:block">
          <SearchInput />
        </div>
      )}
      <div className="flex gap-x-2 ml-auto">
        {isTeacherPage || isCoursePage || isAdminPage || isUsersPage ? (
          <Link href="/">
            <Button size="sm" variant="ghost">
              <LogOut className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </Link>
        ) : role === "admin" ? (
          <Link href="/admin/users">
            <Button size="sm" variant="ghost">Admin mode</Button>
          </Link>
        ) : role === "teacher" ? (
          <Link href="/teacher/courses">
            <Button size="sm" variant="ghost">Teacher mode</Button>
          </Link>
        ) : null}
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              userButtonPopoverFooter: {
                display: 'none', 
              },
            },
          }}
        />
      </div>
    </>
  );
};

export default NavbarRoutes;