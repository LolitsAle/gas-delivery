import { toast, ExternalToast } from "sonner";

export function showToastSuccess(
  title: string,
  opts?: ExternalToast & { description?: string },
) {
  return toast.success(title, opts);
}

export function showToastError(
  title: string,
  opts?: ExternalToast & { description?: string },
) {
  return toast.error(title, opts);
}

export function showToastInfo(
  title: string,
  opts?: ExternalToast & { description?: string },
) {
  return toast(title, opts);
}

export function showToastLoading(
  title: string,
  opts?: ExternalToast & { description?: string },
) {
  return toast.loading(title, opts);
}

export function dismissToast(id?: string | number) {
  toast.dismiss(id);
}

export function updateToastSuccess(
  id: string | number,
  title: string,
  opts?: ExternalToast & { description?: string },
) {
  toast.success(title, { id, ...opts });
}

export function updateToastError(
  id: string | number,
  title: string,
  opts?: ExternalToast & { description?: string },
) {
  toast.error(title, { id, ...opts });
}

export function updateToastInfo(
  id: string | number,
  title: string,
  opts?: ExternalToast & { description?: string },
) {
  toast(title, { id, ...opts });
}
