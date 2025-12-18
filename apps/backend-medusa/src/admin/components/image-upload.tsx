/**
 * Image Upload Component
 *
 * A drag-and-drop image upload component with preview.
 * Uses Medusa's built-in /admin/uploads endpoint.
 */

import { useState, useRef, useCallback } from "react";
import { Button, Text } from "@medusajs/ui";
import { Upload, Trash2, RefreshCw, Image as ImageIcon } from "lucide-react";

// Type workaround for React 18/19 compatibility
type AnyComponent = any;
const MButton: AnyComponent = Button;
const MText: AnyComponent = Text;

interface ImageUploadProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  disabled?: boolean;
  aspectRatio?: "square" | "video" | "banner";
  maxSizeMB?: number;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  aspectRatio = "video",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    banner: "aspect-[3/1]",
  }[aspectRatio];

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner une image valide (PNG, JPG, WebP)");
        return;
      }

      // Validate file size
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`L'image ne doit pas dépasser ${maxSizeMB} Mo`);
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("files", file);

        const response = await fetch("/admin/uploads", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Échec de l'upload");
        }

        const data = await response.json();
        const uploadedFile = data.files?.[0];

        if (uploadedFile?.url) {
          onChange(uploadedFile.url);
        } else {
          throw new Error("URL de l'image non trouvée dans la réponse");
        }
      } catch (err) {
        console.error("Upload error:", err);
        setError(err instanceof Error ? err.message : "Erreur lors de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [onChange, maxSizeMB]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      if (disabled || uploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload, disabled, uploading]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange(undefined);
    setError(null);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      inputRef.current?.click();
    }
  };

  // Render preview if we have a value
  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative group">
          <div
            className={`${aspectRatioClass} w-full rounded-lg overflow-hidden border border-ui-border-base bg-ui-bg-subtle`}
          >
            <img
              src={value}
              alt="Category image"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Show placeholder on error
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage non disponible%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <MButton
              variant="secondary"
              size="small"
              onClick={handleClick}
              disabled={disabled || uploading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${uploading ? "animate-spin" : ""}`} />
              Changer
            </MButton>
            <MButton
              variant="secondary"
              size="small"
              onClick={handleRemove}
              disabled={disabled}
              className="text-ui-tag-red-text hover:text-ui-tag-red-text"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Supprimer
            </MButton>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {error && (
          <MText className="text-ui-tag-red-text text-sm">{error}</MText>
        )}
      </div>
    );
  }

  // Render upload zone
  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          ${aspectRatioClass} w-full
          border-2 border-dashed rounded-lg
          flex flex-col items-center justify-center
          transition-colors cursor-pointer
          ${
            dragOver
              ? "border-ui-border-interactive bg-ui-bg-interactive/10"
              : "border-ui-border-base hover:border-ui-border-strong hover:bg-ui-bg-subtle"
          }
          ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2 p-4">
            <RefreshCw className="w-8 h-8 text-ui-fg-muted animate-spin" />
            <MText className="text-ui-fg-subtle text-sm">Upload en cours...</MText>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4">
            {dragOver ? (
              <>
                <Upload className="w-8 h-8 text-ui-fg-interactive" />
                <MText className="text-ui-fg-interactive text-sm font-medium">
                  Déposez l'image ici
                </MText>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-ui-fg-muted" />
                <MText className="text-ui-fg-subtle text-sm text-center">
                  Glissez une image ici
                  <br />
                  ou cliquez pour parcourir
                </MText>
                <MText className="text-ui-fg-muted text-xs">
                  PNG, JPG ou WebP (max {maxSizeMB} Mo)
                </MText>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <MText className="text-ui-tag-red-text text-sm">{error}</MText>
      )}
    </div>
  );
}

export default ImageUpload;
