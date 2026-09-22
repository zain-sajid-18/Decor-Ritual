/**
 * Cloudinary Integration — ZF Store
 *
 * Isolated server-side module. Never imported from client components.
 * Provides signed upload parameter generation and asset deletion.
 *
 * Upload folder structure: zf-store/products/{productId}/
 *
 * Security boundary:
 *   CLOUDINARY_API_SECRET is never sent to the browser.
 *   The browser receives only the signature + upload parameters.
 */

import { v2 as cloudinaryV2, type UploadApiResponse } from "cloudinary";

// ─── Configuration ─────────────────────────────────────────────────────────

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Returns Cloudinary configuration from environment variables.
 * Throws a clear, safe error if any required variable is missing.
 * Never leaks secrets in the error message.
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const missing: string[] = [];
  if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `Cloudinary configuration is incomplete. Missing environment variables: ${missing.join(", ")}. ` +
        `Configure these in your .env.local file. See .env.example for the required format.`
    );
  }

  return { cloudName: cloudName!, apiKey: apiKey!, apiSecret: apiSecret! };
}

/**
 * Whether Cloudinary is configured in the current environment.
 * Safe to call without throwing.
 */
export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

// ─── Client Instance ────────────────────────────────────────────────────────

let _client: typeof cloudinaryV2 | null = null;

/**
 * Returns a configured Cloudinary v2 client.
 * Throws if environment variables are not configured.
 * Reuses the same instance across calls (singleton within the module).
 */
export function getCloudinaryClient(): typeof cloudinaryV2 {
  if (!_client) {
    const config = getCloudinaryConfig();
    cloudinaryV2.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    _client = cloudinaryV2;
  }
  return _client;
}

// ─── Upload Folder ──────────────────────────────────────────────────────────

/**
 * Returns the Cloudinary folder path for a given product.
 * Organizes uploads predictably: zf-store/products/{productId}/
 */
export function getProductUploadFolder(productId: string): string {
  return `zf-store/products/${productId}`;
}

// ─── Signed Upload Parameters ───────────────────────────────────────────────

export interface UploadSignatureParams {
  /** Unix timestamp used in signature generation */
  timestamp: number;
  /** Cloudinary signature to authorize the upload */
  signature: string;
  /** Cloudinary cloud name — safe to send to client */
  cloudName: string;
  /** Cloudinary API key — safe to send to client (not a secret) */
  apiKey: string;
  /** Target folder in Cloudinary */
  folder: string;
  /** Allowed formats constraint passed to Cloudinary */
  allowedFormats: string;
  /** Maximum file size in bytes */
  maxFileSize: number;
}

/**
 * Generates signed upload parameters for direct browser → Cloudinary uploads.
 *
 * The API secret is used server-side to generate the signature and is NEVER
 * included in the returned params object sent to the browser.
 *
 * Upload constraints:
 * - Allowed formats: jpg, jpeg, png, webp, avif
 * - Max file size: 8MB (enforced by Cloudinary)
 * - Folder: zf-store/products/{productId}/
 */
export async function generateUploadSignature(
  productId: string
): Promise<UploadSignatureParams> {
  const config = getCloudinaryConfig();
  const folder = getProductUploadFolder(productId);
  const timestamp = Math.round(Date.now() / 1000);
  const allowedFormats = "jpg,jpeg,png,webp,avif";

  // Parameters to sign — must match what the browser sends to Cloudinary
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
    allowed_formats: allowedFormats,
  };

  const signature = cloudinaryV2.utils.api_sign_request(
    paramsToSign,
    config.apiSecret
  );

  return {
    timestamp,
    signature,
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder,
    allowedFormats,
    // 8MB in bytes — communicated to the browser for client-side pre-validation
    maxFileSize: 8 * 1024 * 1024,
  };
}

// ─── Asset Deletion ─────────────────────────────────────────────────────────

export interface DeletionResult {
  publicId: string;
  success: boolean;
  error?: string;
}

/**
 * Deletes a single Cloudinary asset by its public identifier.
 * Returns success/failure without throwing to allow partial cleanup handling.
 */
export async function deleteCloudinaryAsset(
  publicId: string
): Promise<DeletionResult> {
  try {
    const client = getCloudinaryClient();
    const result = await client.uploader.destroy(publicId);
    // Cloudinary returns { result: 'ok' } on success, { result: 'not found' } otherwise
    const success = result.result === "ok" || result.result === "not found";
    return {
      publicId,
      success,
      error: success ? undefined : `Cloudinary returned: ${result.result}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Cloudinary] Failed to delete asset ${publicId}:`, message);
    return { publicId, success: false, error: message };
  }
}

/**
 * Deletes multiple Cloudinary assets in parallel.
 * Returns results per asset — partial failures are reported but do not throw.
 *
 * Callers must inspect the results and decide how to handle partial failures.
 */
export async function deleteCloudinaryAssets(
  publicIds: string[]
): Promise<DeletionResult[]> {
  if (publicIds.length === 0) return [];
  return Promise.all(publicIds.map(deleteCloudinaryAsset));
}

/**
 * Type guard for successful Cloudinary upload responses.
 */
export function isSuccessfulUpload(
  response: unknown
): response is UploadApiResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "secure_url" in response &&
    "public_id" in response
  );
}
