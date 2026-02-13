export function r2Url(key: string | null) {
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL}/${key}`;
}
export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);

  const time = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const day = date.toLocaleDateString("vi-VN");

  return `${time}, ${day}`;
};
