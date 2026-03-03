// src/lib/r2/client.ts
import { S3Client } from "@aws-sdk/client-s3";

const accessKeyIdRaw =
  process.env.R2_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY ?? "";
const secretRaw =
  process.env.R2_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_KEY ?? "";

console.log("[R2_CREDS_DEBUG]", {
  accessLen: accessKeyIdRaw.length,
  secretLen: secretRaw.length,
  accessHasNewline: /[\r\n]/.test(accessKeyIdRaw),
  secretHasNewline: /[\r\n]/.test(secretRaw),
  accessHasQuote: /["']/.test(accessKeyIdRaw),
  secretHasQuote: /["']/.test(secretRaw),
  accessTrimLen: accessKeyIdRaw.trim().length,
  secretTrimLen: secretRaw.trim().length,
});

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },

  // ✅ FIX 403 do checksum headers/query
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",

  // optional (hay dùng với R2):
  forcePathStyle: false,
});
