"use client";

import { cn } from "src/lib/utils";

interface PreviewProps {
  value: string;
}

export const Preview = ({ value }: PreviewProps) => {
  return (
    <div
      className={cn("prose max-w-none text-sm")}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
};