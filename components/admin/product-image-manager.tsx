"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import Image from "next/image";
import {
  getUploadSignatureAction,
  saveProductImageAction,
  deleteProductImageAction,
  updateProductImageAltAction,
  reorderProductImagesAction,
} from "@/lib/actions/admin/images";
import type { ProductImage } from "@/types/product";

// ─── Constants ────────────────────────────────────────────────────────────

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_EXTENSIONS = ".jpg,.jpeg,.png,.webp,.avif";

// ─── Types ────────────────────────────────────────────────────────────────

interface UploadingFile {
  id: string;
  name: string;
  progress: number; // 0–100
  error?: string;
}

interface ProductImageManagerProps {
  productId: string;
  initialImages: ProductImage[];
  isNewProduct?: boolean;
  onImagesChange?: (images: ProductImage[]) => void;
}

// ─── Upload helper ────────────────────────────────────────────────────────

/**
 * Uploads a file directly to Cloudinary using a signed request.
 * Returns the Cloudinary response including secure_url and public_id.
 */
async function uploadToCloudinary(
  file: File,
  params: {
    timestamp: number;
    signature: string;
    cloudName: string;
    apiKey: string;
    folder: string;
    allowedFormats: string;
  },
  onProgress: (progress: number) => void
): Promise<{ secureUrl: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", params.apiKey);
    formData.append("timestamp", String(params.timestamp));
    formData.append("signature", params.signature);
    formData.append("folder", params.folder);
    formData.append("allowed_formats", params.allowedFormats);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 95)); // cap at 95% until response
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as {
            secure_url: string;
            public_id: string;
          };
          onProgress(100);
          resolve({ secureUrl: data.secure_url, publicId: data.public_id });
        } catch {
          reject(new Error("Invalid response from Cloudinary."));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error?: { message?: string } };
          reject(new Error(err?.error?.message ?? `Upload failed with status ${xhr.status}.`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}.`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));
    xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled.")));

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`
    );
    xhr.send(formData);
  });
}

// ─── Component ────────────────────────────────────────────────────────────

export function ProductImageManager({
  productId,
  initialImages,
  isNewProduct = false,
  onImagesChange,
}: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState("");

  const [isSavingAlt, startSavingAlt] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isReordering, startReordering] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Feedback helpers ───────────────────────────────────────────────────

  const showSuccess = (msg: string) => {
    setGlobalSuccess(msg);
    setGlobalError(null);
    setTimeout(() => setGlobalSuccess(null), 4000);
  };

  const showError = (msg: string) => {
    setGlobalError(msg);
    setGlobalSuccess(null);
  };

  // ── Upload flow ────────────────────────────────────────────────────────

  const uploadSingleFile = async (file: File) => {
    const uploadId = `upload-${Date.now()}-${Math.random()}`;

    // Register as uploading
    setUploading((prev) => [
      ...prev,
      { id: uploadId, name: file.name, progress: 0 },
    ]);

    const updateProgress = (progress: number) => {
      setUploading((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
      );
    };

    const setUploadError = (error: string) => {
      setUploading((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, error, progress: 0 } : u))
      );
      // Auto-dismiss error after 6s
      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.id !== uploadId));
      }, 6000);
    };

    try {
      // 1. Get signed upload params from server
      const sigResult = await getUploadSignatureAction(productId);
      if (!sigResult.success || !sigResult.signature) {
        setUploadError(sigResult.message ?? "Failed to get upload authorization.");
        return;
      }

      // 2. Upload directly to Cloudinary from the browser
      const { secureUrl, publicId } = await uploadToCloudinary(
        file,
        {
          timestamp: sigResult.timestamp!,
          signature: sigResult.signature,
          cloudName: sigResult.cloudName!,
          apiKey: sigResult.apiKey!,
          folder: sigResult.folder!,
          allowedFormats: sigResult.allowedFormats!,
        },
        updateProgress
      );

      // 3. Save metadata
      if (!isNewProduct) {
        // Persist directly to DB when editing an existing product
        const nextSortOrder = images.length;
        const saveResult = await saveProductImageAction(productId, {
          url: secureUrl,
          cloudinaryPublicId: publicId,
          alt: file.name.replace(/\.[^/.]+$/, ""), // strip extension as default alt
          sortOrder: nextSortOrder,
        });

        if (!saveResult.success || !saveResult.image) {
          setUploadError(saveResult.message ?? "Upload succeeded but failed to save image.");
          return;
        }

        setImages((prev) => [...prev, saveResult.image!]);
        onImagesChange?.([...images, saveResult.image!]);
      } else {
        // In creation mode, collect images to be saved with the product
        const newImg: ProductImage = {
          id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: secureUrl,
          cloudinaryPublicId: publicId,
          alt: file.name.replace(/\.[^/.]+$/, ""),
          sortOrder: images.length,
        };

        const nextImages = [...images, newImg];
        setImages(nextImages);
        onImagesChange?.(nextImages);
      }

      setUploading((prev) => prev.filter((u) => u.id !== uploadId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setUploadError(msg);
    }
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setGlobalError(null);
      setGlobalSuccess(null);

      const fileArray = Array.from(files);

      // Client-side validation
      const validFiles: File[] = [];
      for (const file of fileArray) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          showError(`"${file.name}" is not a supported format. Use JPEG, PNG, WebP, or AVIF.`);
          return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          showError(`"${file.name}" exceeds the 8MB size limit.`);
          return;
        }
        validFiles.push(file);
      }

      if (images.length + uploading.length + validFiles.length > MAX_IMAGES) {
        showError(
          `You can only have ${MAX_IMAGES} images per product. Currently have ${images.length}.`
        );
        return;
      }

      for (const file of validFiles) {
        await uploadSingleFile(file);
      }
    },
    [images.length, uploading.length, productId, isNewProduct] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Drag-and-drop ──────────────────────────────────────────────────────

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // ── Alt text editing ───────────────────────────────────────────────────

  const startEditingAlt = (image: ProductImage) => {
    setEditingAltId(image.id);
    setAltDraft(image.alt);
  };

  const saveAlt = (imageId: string) => {
    if (isNewProduct) {
      setImages((prev) => {
        const next = prev.map((img) => (img.id === imageId ? { ...img, alt: altDraft } : img));
        onImagesChange?.(next);
        return next;
      });
      setEditingAltId(null);
      return;
    }

    startSavingAlt(async () => {
      const result = await updateProductImageAltAction(imageId, productId, altDraft);
      if (result.success) {
        setImages((prev) => {
          const next = prev.map((img) => (img.id === imageId ? { ...img, alt: altDraft } : img));
          onImagesChange?.(next);
          return next;
        });
        setEditingAltId(null);
      } else {
        showError(result.message ?? "Failed to update alt text.");
      }
    });
  };

  // ── Reordering ─────────────────────────────────────────────────────────

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

    const ordered = newImages.map((img, idx) => ({ ...img, sortOrder: idx }));
    setImages(ordered);
    onImagesChange?.(ordered);

    if (!isNewProduct) {
      startReordering(async () => {
        const result = await reorderProductImagesAction(
          productId,
          ordered.map((img) => img.id)
        );
        if (!result.success) {
          // Revert on failure
          setImages(images);
          onImagesChange?.(images);
          showError(result.message ?? "Failed to update image order.");
        }
      });
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────

  const handleDelete = (imageId: string) => {
    if (isNewProduct) {
      setImages((prev) => {
        const next = prev.filter((img) => img.id !== imageId);
        onImagesChange?.(next);
        return next;
      });
      showSuccess("Image removed.");
      return;
    }

    startDeleting(async () => {
      const result = await deleteProductImageAction(imageId, productId);
      if (result.success) {
        setImages((prev) => {
          const next = prev.filter((img) => img.id !== imageId);
          onImagesChange?.(next);
          return next;
        });
        showSuccess(result.message ?? "Image deleted.");
      } else {
        showError(result.message ?? "Failed to delete image.");
      }
    });
  };

  // ── Render ────────────────────────────────────────────────────────────

  const canUploadMore = images.length + uploading.filter((u) => !u.error).length < MAX_IMAGES;

  return (
    <div className="space-y-4">

      {/* Global feedback */}
      {globalError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span>{globalError}</span>
        </div>
      )}

      {globalSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-300"
        >
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <span>{globalSuccess}</span>
        </div>
      )}

      {/* Upload dropzone */}
      {canUploadMore ? (
        <div
          id="image-drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
          role="button"
          tabIndex={0}
          aria-label="Upload product images — click or drag and drop"
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
        >
          <svg
            className="h-8 w-8 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Click to upload, or drag &amp; drop
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              JPEG, PNG, WebP, AVIF · Max 8MB per image · Up to {MAX_IMAGES} images
            </p>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {images.length}/{MAX_IMAGES} images
          </p>
          <input
            ref={fileInputRef}
            id="image-file-input"
            type="file"
            accept={ALLOWED_EXTENSIONS}
            multiple
            className="sr-only"
            onChange={(e) => handleFileSelect(e.target.files)}
            aria-label="Select image files to upload"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Maximum of {MAX_IMAGES} images reached.
          </p>
          <span className="text-xs text-zinc-400">{images.length}/{MAX_IMAGES}</span>
        </div>
      )}

      {/* Active uploads */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((upload) => (
            <div
              key={upload.id}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[70%]">
                  {upload.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2 shrink-0">
                  {upload.error ? "Failed" : upload.progress === 100 ? "Saving…" : `${upload.progress}%`}
                </span>
              </div>
              {upload.error ? (
                <p className="text-xs text-red-600 dark:text-red-400">{upload.error}</p>
              ) : (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-all duration-200 dark:bg-zinc-100"
                    style={{ width: `${upload.progress}%` }}
                    role="progressbar"
                    aria-valuenow={upload.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Uploading ${upload.name}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            Product Images
          </p>
          <ul className="space-y-2" aria-label="Product images">
            {images.map((image, index) => (
              <li
                key={image.id}
                className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                  <Image
                    src={image.url}
                    alt={image.alt || `Product image ${index + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized={false}
                  />
                </div>

                {/* Info & controls */}
                <div className="min-w-0 flex-1 space-y-2">
                  {/* Alt text */}
                  {editingAltId === image.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        id={`alt-input-${image.id}`}
                        type="text"
                        value={altDraft}
                        onChange={(e) => setAltDraft(e.target.value)}
                        maxLength={255}
                        placeholder="Describe this image for accessibility…"
                        className="flex h-8 min-w-0 flex-1 rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveAlt(image.id);
                          if (e.key === "Escape") setEditingAltId(null);
                        }}
                        autoFocus
                        aria-label={`Alt text for image ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => saveAlt(image.id)}
                        disabled={isSavingAlt}
                        className="shrink-0 rounded bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        {isSavingAlt ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAltId(null)}
                        className="shrink-0 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditingAlt(image)}
                      className="group flex items-center gap-1.5 text-left"
                      aria-label={`Edit alt text for image ${index + 1}`}
                    >
                      <span className="truncate text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                        {image.alt || (
                          <span className="italic text-zinc-400 dark:text-zinc-500">
                            No alt text — click to add
                          </span>
                        )}
                      </span>
                      <svg
                        className="h-3 w-3 shrink-0 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                      </svg>
                    </button>
                  )}

                  {/* Position label */}
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    Position {index + 1} of {images.length}
                    {index === 0 && (
                      <span className="ml-1.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        Cover
                      </span>
                    )}
                  </p>
                </div>

                {/* Reorder + delete */}
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, "up")}
                    disabled={index === 0 || isReordering || isDeleting}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={`Move image ${index + 1} up`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => moveImage(index, "down")}
                    disabled={index === images.length - 1 || isReordering || isDeleting}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    aria-label={`Move image ${index + 1} down`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    disabled={isDeleting || isReordering}
                    className="mt-1 rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-red-950/20 dark:hover:text-red-400"
                    aria-label={`Delete image ${index + 1}`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && uploading.length === 0 && (
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 py-2">
          No images yet. Upload images above.
        </p>
      )}
    </div>
  );
}
