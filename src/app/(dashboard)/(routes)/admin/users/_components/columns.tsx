"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash2, Save, Pencil, X } from "lucide-react";

import { Button } from "src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select";
import { deleteUser, updateUserRole } from "./actions";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  role: "admin" | "teacher" | "student";
  createdAt: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Email <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      const [isEditing, setIsEditing] = useState(false);
      const [role, setRole] = useState(user.role);

      const handleSave = async () => {
        try {
          await updateUserRole(user.id, role);
          toast.success("Role updated");
          setIsEditing(false);
        } catch {
          toast.error("Failed to update role");
        }
      };

      return isEditing ? (
        <div className="flex items-center gap-2">
          <Select defaultValue={role} onValueChange={value => setRole(value as "admin" | "teacher" | "student")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={handleSave}><Save className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}><X className="w-4 h-4" /></Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="capitalize">{user.role}</span>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}><Pencil className="w-4 h-4" /></Button>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const created = new Date(row.original.createdAt);
      return <span>{formatDistanceToNow(created, { addSuffix: true })}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      const handleDelete = async () => {
        try {
          await deleteUser(user.id);
          toast.success("User deleted");
        } catch {
          toast.error("Failed to delete user");
        }
      };

      return (
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </Button>
      );
    },
  },
];
