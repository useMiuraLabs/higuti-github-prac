import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

// アプリのルートに 1 つだけ置く
export function Toaster() {
  return <SonnerToaster position="top-center" richColors />;
}

// 通信・サーバーの失敗など、画面の中に出す場所がないメッセージに使う
export const toast = {
  error: (message: string) => sonnerToast.error(message),
  success: (message: string) => sonnerToast.success(message),
};
