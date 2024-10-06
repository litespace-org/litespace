import { Toast, ToastProps } from "@/components/Toast/Toast";
import { toast, type Id, ToastOptions, UpdateOptions } from "react-toastify";

const toaster = (props: ToastProps, options?: ToastOptions): Id =>
  toast(<Toast {...props} />, { ...options });

toaster.success = (props: ToastProps, options?: ToastOptions): Id =>
  toast.success(<Toast {...props} />, { ...options });

toaster.info = (props: ToastProps, options?: ToastOptions): Id =>
  toast.info(<Toast {...props} />, { ...options });

toaster.warning = (props: ToastProps, options?: ToastOptions): Id =>
  toast.warning(<Toast {...props} />, { ...options });

toaster.error = (props: ToastProps, options?: ToastOptions): Id =>
  toast.error(<Toast {...props} />, { ...options });

toaster.loading = (props: ToastProps, options?: ToastOptions): Id =>
  toast.loading(<Toast {...props} />, { ...options });

toaster.update = (
  toastId: Id,
  props: ToastProps,
  options?: UpdateOptions
): void => toast.update(toastId, { render: <Toast {...props} />, ...options });

toaster.dismiss = (toastId?: Id): void => toast.dismiss(toastId);

export { toaster };
