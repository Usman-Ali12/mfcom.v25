"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useToast } from "@/lib/toast-context";

export default function ToastFromQuery() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("toast");
    if (!message) return;
    const type = (searchParams.get("toastType") as "success" | "error" | "info") || "success";
    toast(decodeURIComponent(message), type);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    params.delete("toastType");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
