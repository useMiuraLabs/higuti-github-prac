import type { Shop } from "@higuti/schema";
import { toast } from "@higuti/ui/components/Toast";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { deleteShop } from "../api/shops";

export function useDeleteShop(shop: Shop) {
  const router = useRouter();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    try {
      await deleteShop(shop.id);
      await router.invalidate();
      await navigate({ to: "/" });
    } catch {
      toast.error("削除できませんでした。もう一度お試しください");
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return { open, setOpen, pending, confirm };
}
