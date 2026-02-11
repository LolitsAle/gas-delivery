export function r2Url(key: string | null) {
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/${key}`;
}
