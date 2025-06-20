"use client";
import toast from "react-hot-toast";
import { UploadDropzone } from "@uploadthing/react";
import { ourFileRouter } from "src/app/api/uploadthing/core";
import { Loader2, UploadCloud } from "lucide-react";

interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  return (
    <UploadDropzone<typeof ourFileRouter, typeof endpoint>
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res && res[0] ? res[0].url : undefined);
        toast.success("Video uploaded successfully!");
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`);
      }}
      className="border-2 border-dashed border-border bg-background p-6 rounded-lg shadow-sm hover:bg-muted/50 transition-colors ut-allowed-content:text-muted-foreground ut-label:text-foreground ut-upload-icon:text-primary"
      appearance={{
        container: ({ isDragActive }) => ({
          backgroundColor: isDragActive ? "var(--muted)" : "var(--background)",
          transition: "background-color 0.2s ease",
        }),
        uploadIcon: ({ isUploading }) => ({
          color: isUploading ? "var(--muted-foreground)" : "var(--primary)",
          width: "2rem",
          height: "2rem",
        }),
        label: ({ ready, isUploading }) => ({
          fontSize: "1.125rem",
          fontWeight: "medium",
          color: !ready || isUploading ? "var(--muted-foreground)" : "var(--foreground)",
        }),
        button: ({ ready, isUploading }) => ({
          backgroundColor: ready && !isUploading ? "var(--primary)" : "var(--muted)",
          color: ready && !isUploading ? "var(--primary-foreground)" : "var(--muted-foreground)",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius)",
          cursor: ready && !isUploading ? "pointer" : "not-allowed",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          transition: "background-color 0.2s ease, color 0.2s ease",
        }),
        allowedContent: {
          fontSize: "0.875rem",
          color: "var(--muted-foreground)",
        },
      }}
      content={{
        uploadIcon: ({ isUploading }) =>
          isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <UploadCloud className="h-8 w-8" />
          ),
        label: ({ ready, isUploading }) => {
          if (!ready) return "Preparing uploader...";
          if (isUploading) return "Uploading video...";
          return "Choose a video or drag and drop here";
        },
        allowedContent: ({ ready, isUploading, fileTypes }) => {
          if (!ready) return "Checking allowed types...";
          if (isUploading) return `Uploading: ${fileTypes.join(", ")}`;
          return `Accepted formats: ${fileTypes.join(", ")} (max 16MB)`;
        },
        button: ({ ready, isUploading }) => {
          if (!ready) return "Not ready";
          if (isUploading) return (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          );
          return "Select Video";
        },
      }}
      config={{ cn: (...classes) => classes.filter(Boolean).join(" ") }} // Optional: Custom class merger
    />
  );
};