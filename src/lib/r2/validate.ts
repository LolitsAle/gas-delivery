// lib/r2/validate.ts
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const MAX_SIZE_MB = 5;

export function validateUpload(file: { mimeType: string; size: number }) {
  if (!ALLOWED_MIME.includes(file.mimeType)) {
    throw new Error("Định dạng ảnh không được hỗ trợ");
  }

  const maxBytes = MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Ảnh vượt quá dung lượng cho phép");
  }
}
